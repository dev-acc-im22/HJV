import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMessageSchema } from "@/lib/validations";

/**
 * GET /api/messages
 * Get messages between two users
 * 
 * Query parameters:
 * - userId: string (required - the other user in the conversation)
 * - page: number
 * - limit: number
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    if (!otherUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if users can message each other (must have accepted interest)
    const interaction = await db.interaction.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
        status: "ACCEPTED",
      },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "You can only message profiles that have accepted your interest" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Mark messages as read
    await db.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Reverse messages for chronological order
    const orderedMessages = messages.reverse();

    return NextResponse.json({
      messages: orderedMessages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Send a message to another user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = sendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { receiverId, content, messageType, mediaUrl } = validationResult.data;

    // Check if users can message each other (must have accepted interest)
    const interaction = await db.interaction.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
        status: "ACCEPTED",
      },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "You can only message profiles that have accepted your interest" },
        { status: 403 }
      );
    }

    // Create message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        messageType: messageType || "TEXT",
        mediaUrl,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: "New Message",
        message: "You have a new message",
        data: JSON.stringify({ messageId: message.id, senderId: session.user.id }),
      },
    });

    return NextResponse.json({
      message: "Message sent successfully",
      data: message,
    }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/conversations
 * Get all conversations for the current user
 */
export async function getConversations(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all accepted interactions
    const interactions = await db.interaction.findMany({
      where: {
        OR: [
          { senderId: session.user.id, status: "ACCEPTED" },
          { receiverId: session.user.id, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          include: {
            profile: {
              include: { media: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        receiver: {
          include: {
            profile: {
              include: { media: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    // Get last message for each conversation
    const conversations = await Promise.all(
      interactions.map(async (interaction) => {
        const otherUser = interaction.senderId === session.user.id 
          ? interaction.receiver 
          : interaction.sender;
        
        const lastMessage = await db.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        // Count unread messages
        const unreadCount = await db.message.count({
          where: {
            senderId: otherUser.id,
            receiverId: session.user.id,
            isRead: false,
          },
        });

        return {
          user: {
            id: otherUser.id,
            name: otherUser.profile?.name,
            photo: otherUser.profile?.media[0]?.url,
          },
          lastMessage,
          unreadCount,
          interactionId: interaction.id,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching conversations" },
      { status: 500 }
    );
  }
}
