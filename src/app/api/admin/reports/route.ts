import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReportStatus, AccountStatus } from "@prisma/client";

/**
 * GET /api/admin/reports
 * Get reports (Admin only)
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

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where: { status: status as ReportStatus },
        include: {
          reporter: {
            include: { profile: { select: { name: true } } },
          },
          reportedUser: {
            include: { profile: { select: { name: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.report.count({ where: { status: status as ReportStatus } }),
    ]);

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        reporter: {
          id: r.reporterId,
          name: r.reporter.profile?.name,
        },
        reportedUser: {
          id: r.reportedUserId,
          name: r.reportedUser.profile?.name,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get reports error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/reports
 * Update report status and take action (Admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { reportId, status, action, adminNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: "Report ID and status are required" }, { status: 400 });
    }

    // Update report
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: status as ReportStatus,
        adminNotes,
        actionTaken: action,
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
      },
    });

    // Take action on user if specified
    if (action === "SUSPEND") {
      await db.user.update({
        where: { id: report.reportedUserId },
        data: { accountStatus: AccountStatus.SUSPENDED },
      });
    } else if (action === "BAN") {
      await db.user.update({
        where: { id: report.reportedUserId },
        data: { accountStatus: AccountStatus.BANNED },
      });
    }

    // Log admin action
    await db.auditLog.create({
      data: {
        adminId: session.user.id,
        action: "RESOLVE_REPORT",
        targetType: "Report",
        targetId: reportId,
        details: JSON.stringify({ status, action, adminNotes }),
      },
    });

    return NextResponse.json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("Admin update report error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
