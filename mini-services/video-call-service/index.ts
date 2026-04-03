/**
 * Video Call Service - WebRTC Signaling using Socket.IO
 * 
 * This service handles:
 * - WebRTC signaling (offer, answer, ICE candidates)
 * - Room-based calls (each conversation is a room)
 * - Call state management (calling, connecting, connected, ended)
 * - Call tracking and history
 * - Premium paywall triggers (3-minute free limit)
 * 
 * Port: 3004
 */

import { createServer } from "http";
import { Server, Socket } from "socket.io";

// Server configuration
const PORT = 3004;

// Types
interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
}

interface CallRoom {
  id: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: 'calling' | 'connecting' | 'connected' | 'ended' | 'declined' | 'missed' | 'timeout';
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
}

interface ActiveCall {
  roomId: string;
  callerId: string;
  receiverId: string;
  callerSocketId: string;
  receiverSocketId?: string;
  status: CallRoom['status'];
  startedAt: Date;
  connectedAt?: Date;
}

interface CallHistory {
  id: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  type: 'incoming' | 'outgoing';
  status: CallRoom['status'];
  duration?: number;
  timestamp: Date;
}

// Store online users (userId -> socketId)
const onlineUsers = new Map<string, string>();

// Store active calls (roomId -> ActiveCall)
const activeCalls = new Map<string, ActiveCall>();

// Store call history (userId -> CallHistory[])
const callHistory = new Map<string, CallHistory[]>();

// Store pending call timeouts
const callTimeouts = new Map<string, NodeJS.Timeout>();

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

// Authentication middleware (simplified for demo)
io.use(async (socket: UserSocket, next) => {
  try {
    // For demo purposes, accept any connection with userId in auth
    const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
    const userName = socket.handshake.auth.userName || socket.handshake.query.userName || 'User';
    
    if (!userId) {
      return next(new Error("User ID required"));
    }

    socket.userId = userId as string;
    socket.userName = userName as string;
    
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
});

// Helper function to add call history
function addCallHistory(userId: string, call: CallHistory) {
  const history = callHistory.get(userId) || [];
  history.unshift(call); // Add to beginning
  callHistory.set(userId, history.slice(0, 50)); // Keep last 50 calls
}

// Helper function to get call history
function getCallHistory(userId: string): CallHistory[] {
  return callHistory.get(userId) || [];
}

// Connection handler
io.on("connection", async (socket: UserSocket) => {
  if (!socket.userId) {
    socket.disconnect();
    return;
  }

  console.log(`[Video Call] User connected: ${socket.userName} (${socket.userId})`);

  // Add to online users
  onlineUsers.set(socket.userId, socket.id);

  // Join user's personal room
  socket.join(`user:${socket.userId}`);

  // Notify user's contacts that they're online
  socket.broadcast.emit("user:online", { userId: socket.userId, userName: socket.userName });

  // Send online users list
  socket.emit("users:online", Array.from(onlineUsers.keys()));

  // Send call history
  socket.emit("call:history", getCallHistory(socket.userId));

  // ===============================
  // CALL INITIATION HANDLERS
  // ===============================

  // Handle call initiation
  socket.on("call:start", (data: { receiverId: string; receiverName: string }) => {
    const { receiverId, receiverName } = data;
    const callerId = socket.userId!;
    const callerName = socket.userName!;

    // Check if receiver is online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (!receiverSocketId) {
      socket.emit("call:error", { 
        message: "User is offline", 
        code: "USER_OFFLINE" 
      });
      return;
    }

    // Check if receiver is already in a call
    const existingCall = Array.from(activeCalls.values()).find(
      call => (call.callerId === receiverId || call.receiverId === receiverId) && 
              call.status !== 'ended' && call.status !== 'declined' && call.status !== 'missed'
    );
    
    if (existingCall) {
      socket.emit("call:error", { 
        message: "User is already in another call", 
        code: "USER_BUSY" 
      });
      return;
    }

    // Create room ID (consistent format for both users)
    const roomId = [callerId, receiverId].sort().join('-call-');

    // Create new call
    const newCall: ActiveCall = {
      roomId,
      callerId,
      receiverId,
      callerSocketId: socket.id,
      receiverSocketId,
      status: 'calling',
      startedAt: new Date(),
    };

    activeCalls.set(roomId, newCall);

    // Join the call room
    socket.join(`call:${roomId}`);

    // Notify receiver of incoming call
    io.to(`user:${receiverId}`).emit("call:incoming", {
      roomId,
      callerId,
      callerName,
      callerPhoto: null, // Could be passed from frontend
    });

    // Set call timeout (30 seconds for answer)
    const timeout = setTimeout(() => {
      const call = activeCalls.get(roomId);
      if (call && call.status === 'calling') {
        // Mark as missed
        call.status = 'missed';
        call.endedAt = new Date();
        
        // Notify caller
        socket.emit("call:missed", { 
          roomId, 
          reason: "No answer",
          userId: receiverId 
        });

        // Notify receiver (they missed it)
        io.to(`user:${receiverId}`).emit("call:missed", {
          roomId,
          reason: "Call timeout",
          userId: callerId
        });

        // Add to history
        addCallHistory(callerId, {
          id: `call-${Date.now()}`,
          userId: callerId,
          partnerId: receiverId,
          partnerName: receiverName,
          type: 'outgoing',
          status: 'missed',
          timestamp: new Date(),
        });

        addCallHistory(receiverId, {
          id: `call-${Date.now()}`,
          userId: receiverId,
          partnerId: callerId,
          partnerName: callerName,
          type: 'incoming',
          status: 'missed',
          timestamp: new Date(),
        });

        // Clean up
        activeCalls.delete(roomId);
        callTimeouts.delete(roomId);
      }
    }, 30000); // 30 second timeout

    callTimeouts.set(roomId, timeout);

    console.log(`[Video Call] Call started: ${callerName} -> ${receiverName}`);
  });

  // Handle call answer (accept)
  socket.on("call:accept", (data: { roomId: string }) => {
    const { roomId } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Clear the call timeout
    const timeout = callTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      callTimeouts.delete(roomId);
    }

    // Update call status
    call.status = 'connecting';
    call.receiverSocketId = socket.id;
    call.connectedAt = new Date();

    // Join the call room
    socket.join(`call:${roomId}`);

    // Notify caller that call was accepted
    io.to(`user:${call.callerId}`).emit("call:accepted", {
      roomId,
      receiverId: socket.userId,
      receiverName: socket.userName,
    });

    // Notify both users to start WebRTC connection
    io.to(`call:${roomId}`).emit("call:connecting", { roomId });

    console.log(`[Video Call] Call accepted: ${roomId}`);
  });

  // Handle call decline
  socket.on("call:decline", (data: { roomId: string }) => {
    const { roomId } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Clear the call timeout
    const timeout = callTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      callTimeouts.delete(roomId);
    }

    // Update call status
    call.status = 'declined';
    call.endedAt = new Date();

    // Notify caller that call was declined
    io.to(`user:${call.callerId}`).emit("call:declined", {
      roomId,
      declinedBy: socket.userId,
    });

    // Add to history for both users
    addCallHistory(call.callerId, {
      id: `call-${Date.now()}`,
      userId: call.callerId,
      partnerId: call.receiverId,
      partnerName: call.receiverName || 'User',
      type: 'outgoing',
      status: 'declined',
      timestamp: new Date(),
    });

    addCallHistory(socket.userId!, {
      id: `call-${Date.now()}`,
      userId: socket.userId!,
      partnerId: call.callerId,
      partnerName: call.callerName || 'User',
      type: 'incoming',
      status: 'declined',
      timestamp: new Date(),
    });

    // Clean up
    activeCalls.delete(roomId);

    console.log(`[Video Call] Call declined: ${roomId}`);
  });

  // Handle call cancel (caller cancels before answer)
  socket.on("call:cancel", (data: { roomId: string }) => {
    const { roomId } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Clear the call timeout
    const timeout = callTimeouts.get(roomId);
    if (timeout) {
      clearTimeout(timeout);
      callTimeouts.delete(roomId);
    }

    // Update call status
    call.status = 'ended';
    call.endedAt = new Date();

    // Notify receiver that call was cancelled
    io.to(`user:${call.receiverId}`).emit("call:cancelled", {
      roomId,
      cancelledBy: socket.userId,
    });

    // Clean up
    activeCalls.delete(roomId);

    console.log(`[Video Call] Call cancelled: ${roomId}`);
  });

  // ===============================
  // WEBRTC SIGNALING HANDLERS
  // ===============================

  // Handle WebRTC offer
  socket.on("call:offer", (data: { roomId: string; offer: RTCSessionDescriptionInit }) => {
    const { roomId, offer } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Update call status to connected
    call.status = 'connected';
    call.connectedAt = call.connectedAt || new Date();

    // Forward offer to other participant
    socket.to(`call:${roomId}`).emit("call:offer", {
      offer,
      fromUserId: socket.userId,
    });

    console.log(`[Video Call] Offer exchanged: ${roomId}`);
  });

  // Handle WebRTC answer
  socket.on("call:answer", (data: { roomId: string; answer: RTCSessionDescriptionInit }) => {
    const { roomId, answer } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Forward answer to other participant
    socket.to(`call:${roomId}`).emit("call:answer", {
      answer,
      fromUserId: socket.userId,
    });

    console.log(`[Video Call] Answer exchanged: ${roomId}`);
  });

  // Handle ICE candidates
  socket.on("call:ice-candidate", (data: { roomId: string; candidate: RTCIceCandidateInit }) => {
    const { roomId, candidate } = data;

    // Forward ICE candidate to other participant
    socket.to(`call:${roomId}`).emit("call:ice-candidate", {
      candidate,
      fromUserId: socket.userId,
    });
  });

  // ===============================
  // CALL CONTROL HANDLERS
  // ===============================

  // Handle mute/unmute
  socket.on("call:mute", (data: { roomId: string; muted: boolean }) => {
    const { roomId, muted } = data;

    socket.to(`call:${roomId}`).emit("call:remote-muted", {
      userId: socket.userId,
      muted,
    });
  });

  // Handle video on/off
  socket.on("call:video-off", (data: { roomId: string; videoOff: boolean }) => {
    const { roomId, videoOff } = data;

    socket.to(`call:${roomId}`).emit("call:remote-video-off", {
      userId: socket.userId,
      videoOff,
    });
  });

  // Handle end call
  socket.on("call:end", (data: { roomId: string }) => {
    const { roomId } = data;
    const call = activeCalls.get(roomId);

    if (!call) {
      socket.emit("call:error", { message: "Call not found", code: "CALL_NOT_FOUND" });
      return;
    }

    // Calculate duration if call was connected
    let duration: number | undefined;
    if (call.connectedAt) {
      duration = Math.floor((Date.now() - call.connectedAt.getTime()) / 1000);
    }

    // Update call status
    call.status = 'ended';
    call.endedAt = new Date();
    call.duration = duration;

    // Notify all participants
    io.to(`call:${roomId}`).emit("call:ended", {
      roomId,
      endedBy: socket.userId,
      duration,
    });

    // Add to history for both users
    if (duration !== undefined) {
      addCallHistory(call.callerId, {
        id: `call-${Date.now()}`,
        userId: call.callerId,
        partnerId: call.receiverId,
        partnerName: call.receiverName || 'User',
        type: 'outgoing',
        status: 'ended',
        duration,
        timestamp: new Date(),
      });

      addCallHistory(call.receiverId, {
        id: `call-${Date.now()}`,
        userId: call.receiverId,
        partnerId: call.callerId,
        partnerName: call.callerName || 'User',
        type: 'incoming',
        status: 'ended',
        duration,
        timestamp: new Date(),
      });
    }

    // Make users leave the call room
    io.socketsLeave(`call:${roomId}`);

    // Clean up
    activeCalls.delete(roomId);

    console.log(`[Video Call] Call ended: ${roomId}, duration: ${duration}s`);
  });

  // ===============================
  // CALL QUALITY & STATS
  // ===============================

  // Handle quality reports
  socket.on("call:quality-report", (data: { roomId: string; quality: 'excellent' | 'good' | 'poor'; bitrate?: number }) => {
    const { roomId, quality } = data;

    // Broadcast quality indicator to other participant
    socket.to(`call:${roomId}`).emit("call:quality-update", {
      quality,
      fromUserId: socket.userId,
    });
  });

  // Handle premium paywall trigger (3-minute limit)
  socket.on("call:premium-required", (data: { roomId: string }) => {
    const { roomId } = data;
    const call = activeCalls.get(roomId);

    if (!call) return;

    // Notify the user who needs premium
    const targetUserId = socket.userId === call.callerId ? call.receiverId : call.callerId;
    
    io.to(`user:${targetUserId}`).emit("call:premium-required", {
      roomId,
      message: "Upgrade to Premium for unlimited video calls",
    });
  });

  // ===============================
  // GET CALL HISTORY
  // ===============================

  socket.on("call:get-history", () => {
    socket.emit("call:history", getCallHistory(socket.userId!));
  });

  // ===============================
  // DISCONNECT HANDLER
  // ===============================

  socket.on("disconnect", () => {
    console.log(`[Video Call] User disconnected: ${socket.userName} (${socket.userId})`);
    
    // Remove from online users
    onlineUsers.delete(socket.userId!);
    
    // End any active calls
    for (const [roomId, call] of activeCalls.entries()) {
      if (call.callerId === socket.userId || call.receiverId === socket.userId) {
        // Calculate duration if call was connected
        let duration: number | undefined;
        if (call.connectedAt) {
          duration = Math.floor((Date.now() - call.connectedAt.getTime()) / 1000);
        }

        // Notify other participant
        const otherUserId = call.callerId === socket.userId ? call.receiverId : call.callerId;
        io.to(`user:${otherUserId}`).emit("call:ended", {
          roomId,
          endedBy: socket.userId,
          reason: "User disconnected",
          duration,
        });

        // Add to history
        if (duration !== undefined) {
          addCallHistory(otherUserId, {
            id: `call-${Date.now()}`,
            userId: otherUserId,
            partnerId: socket.userId!,
            partnerName: socket.userName || 'User',
            type: call.callerId === otherUserId ? 'outgoing' : 'incoming',
            status: 'ended',
            duration,
            timestamp: new Date(),
          });
        }

        // Clean up
        activeCalls.delete(roomId);
        
        // Clear any pending timeouts
        const timeout = callTimeouts.get(roomId);
        if (timeout) {
          clearTimeout(timeout);
          callTimeouts.delete(roomId);
        }
      }
    }

    // Notify contacts that user is offline
    socket.broadcast.emit("user:offline", { userId: socket.userId });
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[Video Call Service] Running on port ${PORT}`);
  console.log(`[Video Call Service] WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Video Call Service] Shutting down...");
  httpServer.close(() => {
    console.log("[Video Call Service] Server closed");
    process.exit(0);
  });
});
