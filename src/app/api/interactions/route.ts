import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendInterestSchema, updateInteractionSchema } from "@/lib/validations";
import { InteractionStatus, NotificationType } from "@prisma/client";

/**
 * GET /api/interactions
 * Get user's interactions (sent/received interests, shortlisted)
 * 
 * Query parameters:
 * - type: string (sent | received | shortlisted | accepted | all)
 * - status: string (PENDING | ACCEPTED | DECLINED | SHORTLISTED)
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
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Build where clause based on type
    let where: any = {};

    switch (type) {
      case "sent":
        where = { senderId: session.user.id };
        break;
      case "received":
        where = { receiverId: session.user.id };
        break;
      case "shortlisted":
        where = { senderId: session.user.id, status: "SHORTLISTED" };
        break;
      case "accepted":
        where = {
          OR: [
            { senderId: session.user.id, status: "ACCEPTED" },
            { receiverId: session.user.id, status: "ACCEPTED" },
          ],
        };
        break;
      default:
        where = {
          OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        };
    }

    // Add status filter if provided
    if (status) {
      if (where.OR) {
        where = {
          OR: where.OR.map((condition: any) => ({
            ...condition,
            status,
          })),
        };
      } else {
        where.status = status;
      }
    }

    // Get interactions with profile details
    const [interactions, totalCount] = await Promise.all([
      db.interaction.findMany({
        where,
        include: {
          sender: {
            include: {
              profile: {
                include: {
                  media: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          receiver: {
            include: {
              profile: {
                include: {
                  media: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.interaction.count({ where }),
    ]);

    // Format response
    const formattedInteractions = interactions.map((interaction) => {
      const isSender = interaction.senderId === session.user.id;
      const otherUser = isSender ? interaction.receiver : interaction.sender;
      const otherProfile = otherUser.profile;

      return {
        id: interaction.id,
        status: interaction.status,
        type: interaction.type,
        message: interaction.message,
        viewedAt: interaction.viewedAt,
        respondedAt: interaction.respondedAt,
        createdAt: interaction.createdAt,
        isSender,
        user: otherProfile
          ? {
              id: otherUser.id,
              profileId: otherProfile.id,
              name: otherProfile.name,
              age: calculateAge(new Date(otherProfile.dateOfBirth)),
              city: otherProfile.city,
              state: otherProfile.state,
              religion: otherProfile.religion,
              education: null, // Would need to fetch
              photo: otherProfile.media[0]?.url || null,
            }
          : null,
      };
    });

    return NextResponse.json({
      interactions: formattedInteractions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Get interactions error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching interactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interactions
 * Send interest or shortlist a profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = sendInterestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { receiverId, message } = validationResult.data;

    // Check if receiver exists and is active
    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      include: { profile: true },
    });

    if (!receiver || !receiver.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (receiver.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "This profile is not available" }, { status: 400 });
    }

    // Check if interaction already exists
    const existingInteraction = await db.interaction.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId,
        },
      },
    });

    if (existingInteraction) {
      return NextResponse.json(
        { error: "You have already interacted with this profile", interaction: existingInteraction },
        { status: 400 }
      );
    }

    // Create interaction
    const interaction = await db.interaction.create({
      data: {
        senderId: session.user.id,
        receiverId,
        status: InteractionStatus.PENDING,
        type: "INTEREST",
        message,
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: NotificationType.NEW_INTEREST,
        title: "New Interest Received",
        message: `Someone has sent you an interest!`,
        data: JSON.stringify({ interactionId: interaction.id, senderId: session.user.id }),
      },
    });

    return NextResponse.json({
      message: "Interest sent successfully",
      interaction,
    }, { status: 201 });
  } catch (error) {
    console.error("Send interest error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending interest" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/interactions
 * Update interaction status (accept/decline)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interactionId, status } = body;

    if (!interactionId) {
      return NextResponse.json({ error: "Interaction ID is required" }, { status: 400 });
    }

    // Validate status
    const validationResult = updateInteractionSchema.safeParse({ status });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Find interaction
    const interaction = await db.interaction.findUnique({
      where: { id: interactionId },
      include: { sender: { include: { profile: true } } },
    });

    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    // Only receiver can accept/decline
    if (interaction.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond to interests sent to you" },
        { status: 403 }
      );
    }

    // Can only update pending interests
    if (interaction.status !== InteractionStatus.PENDING) {
      return NextResponse.json(
        { error: "This interest has already been responded to" },
        { status: 400 }
      );
    }

    // Update interaction
    const updatedInteraction = await db.interaction.update({
      where: { id: interactionId },
      data: {
        status: status as InteractionStatus,
        respondedAt: new Date(),
      },
    });

    // Create notification for sender
    await db.notification.create({
      data: {
        userId: interaction.senderId,
        type: status === "ACCEPTED" 
          ? NotificationType.INTEREST_ACCEPTED 
          : NotificationType.INTEREST_DECLINED,
        title: status === "ACCEPTED" ? "Interest Accepted!" : "Interest Declined",
        message: status === "ACCEPTED"
          ? "Your interest has been accepted! You can now start messaging."
          : "Your interest was declined.",
        data: JSON.stringify({ interactionId, receiverId: session.user.id }),
      },
    });

    return NextResponse.json({
      message: status === "ACCEPTED" ? "Interest accepted successfully" : "Interest declined",
      interaction: updatedInteraction,
    });
  } catch (error) {
    console.error("Update interaction error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating interaction" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/interactions
 * Withdraw/cancel an interest
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interactionId = searchParams.get("id");

    if (!interactionId) {
      return NextResponse.json({ error: "Interaction ID is required" }, { status: 400 });
    }

    // Find interaction
    const interaction = await db.interaction.findUnique({
      where: { id: interactionId },
    });

    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 });
    }

    // Only sender can withdraw
    if (interaction.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only withdraw your own interests" },
        { status: 403 }
      );
    }

    // Delete interaction
    await db.interaction.delete({
      where: { id: interactionId },
    });

    return NextResponse.json({ message: "Interest withdrawn successfully" });
  } catch (error) {
    console.error("Delete interaction error:", error);
    return NextResponse.json(
      { error: "An error occurred while withdrawing interest" },
      { status: 500 }
    );
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}
