/**
 * Chat Service - Real-time messaging using Socket.io
 * 
 * This service handles:
 * - User authentication via JWT
 * - Real-time message delivery
 * - Typing indicators
 * - Online status
 * - Message read receipts
 * 
 * Port: 3003
 */

import { createServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

// Server configuration
const PORT = 3003;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Types
interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
}

interface OnlineUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

// Store online users
const onlineUsers = new Map<string, OnlineUser>();

// Create HTTP server and Socket.io
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://chat.z.ai"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Authentication middleware
io.use(async (socket: UserSocket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: { select: { name: true } } },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.userName = user.profile?.name || user.email;
    
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Invalid token"));
  }
});

// Connection handler
io.on("connection", async (socket: UserSocket) => {
  if (!socket.userId) {
    socket.disconnect();
    return;
  }

  console.log(`[Chat] User connected: ${socket.userName} (${socket.userId})`);

  // Add to online users
  onlineUsers.set(socket.userId, {
    userId: socket.userId,
    socketId: socket.id,
    connectedAt: new Date(),
  });

  // Join user's personal room for direct messages
  socket.join(`user:${socket.userId}`);

  // Notify contacts that user is online
  socket.broadcast.emit("user:online", { userId: socket.userId });

  // Send online users list
  socket.emit("users:online", Array.from(onlineUsers.values()));

  // ===============================
  // MESSAGE HANDLERS
  // ===============================

  // Handle sending message
  socket.on("message:send", async (data: { receiverId: string; content: string }) => {
    try {
      const { receiverId, content } = data;

      // Check if users can message each other (accepted interest)
      const interaction = await prisma.interaction.findFirst({
        where: {
          OR: [
            { senderId: socket.userId, receiverId },
            { senderId: receiverId, receiverId: socket.userId },
          ],
          status: "ACCEPTED",
        },
      });

      if (!interaction) {
        socket.emit("error", { message: "You can only message accepted matches" });
        return;
      }

      // Save message to database
      const message = await prisma.message.create({
        data: {
          senderId: socket.userId!,
          receiverId,
          content,
          messageType: "TEXT",
        },
        include: {
          sender: {
            include: { profile: { select: { name: true } } },
          },
        },
      });

      const messageData = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        createdAt: message.createdAt,
        senderName: message.sender.profile?.name,
      };

      // Send to receiver
      io.to(`user:${receiverId}`).emit("message:receive", messageData);

      // Confirm to sender
      socket.emit("message:sent", messageData);

      console.log(`[Chat] Message: ${socket.userName} -> ${receiverId}`);
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing:start", (data: { receiverId: string }) => {
    socket.to(`user:${data.receiverId}`).emit("typing:started", {
      userId: socket.userId,
      userName: socket.userName,
    });
  });

  socket.on("typing:stop", (data: { receiverId: string }) => {
    socket.to(`user:${data.receiverId}`).emit("typing:stopped", {
      userId: socket.userId,
    });
  });

  // Handle message read
  socket.on("message:read", async (data: { senderId: string }) => {
    try {
      // Mark all messages from sender as read
      await prisma.message.updateMany({
        where: {
          senderId: data.senderId,
          receiverId: socket.userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Notify sender that messages were read
      socket.to(`user:${data.senderId}`).emit("messages:read", {
        byUserId: socket.userId,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Mark read error:", error);
    }
  });

  // ===============================
  // INTERACTION HANDLERS
  // ===============================

  // Handle interest accepted notification
  socket.on("interest:accepted", async (data: { userId: string }) => {
    try {
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: socket.userId },
        include: { profile: { select: { name: true } } },
      });

      // Notify the user who sent the interest
      io.to(`user:${data.userId}`).emit("notification", {
        type: "INTEREST_ACCEPTED",
        title: "Interest Accepted!",
        message: `${user?.profile?.name || "Someone"} accepted your interest!`,
        data: { userId: socket.userId },
      });
    } catch (error) {
      console.error("Interest notification error:", error);
    }
  });

  // ===============================
  // VIDEO CALL SIGNALING (Future)
  // ===============================

  // WebRTC signaling for video calls
  socket.on("call:offer", (data: { receiverId: string; offer: any }) => {
    socket.to(`user:${data.receiverId}`).emit("call:offer", {
      callerId: socket.userId,
      callerName: socket.userName,
      offer: data.offer,
    });
  });

  socket.on("call:answer", (data: { callerId: string; answer: any }) => {
    socket.to(`user:${data.callerId}`).emit("call:answer", {
      answererId: socket.userId,
      answer: data.answer,
    });
  });

  socket.on("call:ice-candidate", (data: { receiverId: string; candidate: any }) => {
    socket.to(`user:${data.receiverId}`).emit("call:ice-candidate", {
      senderId: socket.userId,
      candidate: data.candidate,
    });
  });

  socket.on("call:end", (data: { receiverId: string }) => {
    socket.to(`user:${data.receiverId}`).emit("call:ended", {
      endedBy: socket.userId,
    });
  });

  // ===============================
  // DISCONNECT HANDLER
  // ===============================

  socket.on("disconnect", () => {
    console.log(`[Chat] User disconnected: ${socket.userName} (${socket.userId})`);
    
    // Remove from online users
    onlineUsers.delete(socket.userId!);
    
    // Notify contacts that user is offline
    socket.broadcast.emit("user:offline", { userId: socket.userId });
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Chat Service] Running on port ${PORT}`);
  console.log(`[Chat Service] WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Chat Service] Shutting down...");
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log("[Chat Service] Server closed");
    process.exit(0);
  });
});
