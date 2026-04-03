import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApprovalStatus } from "@prisma/client";

/**
 * GET /api/admin/media
 * Get pending media for approval (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      db.media.findMany({
        where: { approvalStatus: status as ApprovalStatus },
        include: {
          profile: {
            select: {
              name: true,
              user: {
                select: { email: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.media.count({ where: { approvalStatus: status as ApprovalStatus } }),
    ]);

    return NextResponse.json({
      media: media.map((m) => ({
        id: m.id,
        url: m.url,
        mediaType: m.mediaType,
        isPrimary: m.isPrimary,
        approvalStatus: m.approvalStatus,
        createdAt: m.createdAt,
        profile: m.profile,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get media error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/media
 * Approve or reject media (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { mediaId, approvalStatus, reason } = body;

    if (!mediaId || !approvalStatus) {
      return NextResponse.json({ error: "Media ID and approval status are required" }, { status: 400 });
    }

    const media = await db.media.update({
      where: { id: mediaId },
      data: { approvalStatus: approvalStatus as ApprovalStatus },
    });

    // Log admin action
    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: approvalStatus === "APPROVED" ? "APPROVE_MEDIA" : "REJECT_MEDIA",
        targetType: "Media",
        targetId: mediaId,
        details: JSON.stringify({ approvalStatus, reason }),
      },
    });

    // Create notification for user
    await db.notification.create({
      data: {
        userId: media.profileId,
        type: "SYSTEM",
        title: approvalStatus === "APPROVED" ? "Photo Approved" : "Photo Rejected",
        message: approvalStatus === "APPROVED"
          ? "Your photo has been approved and is now visible to other users."
          : `Your photo was rejected. Reason: ${reason || "Not specified"}`,
      },
    });

    return NextResponse.json({
      message: `Media ${approvalStatus.toLowerCase()} successfully`,
      media,
    });
  } catch (error) {
    console.error("Admin update media error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
