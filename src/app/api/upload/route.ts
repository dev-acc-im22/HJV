import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * POST /api/upload
 * Upload a profile photo
 * 
 * In production, this would upload to AWS S3. For development,
 * we store files locally in the public/uploads directory.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the profile
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profiles");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${profile.id}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Public URL
    const publicUrl = `/uploads/profiles/${fileName}`;

    // If this is the primary photo, unset other primary photos
    if (isPrimary) {
      await db.media.updateMany({
        where: { profileId: profile.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Save to database
    const media = await db.media.create({
      data: {
        profileId: profile.id,
        url: publicUrl,
        isPrimary,
        mediaType: "PHOTO",
        privacyLevel: "PUBLIC",
        approvalStatus: "PENDING", // Needs admin approval
      },
    });

    return NextResponse.json({
      message: "Photo uploaded successfully",
      media: {
        id: media.id,
        url: media.url,
        isPrimary: media.isPrimary,
        approvalStatus: media.approvalStatus,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An error occurred during upload" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete a profile photo
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    // Get the media and verify ownership
    const media = await db.media.findUnique({
      where: { id: mediaId },
      include: {
        profile: {
          select: { userId: true },
        },
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own photos" }, { status: 403 });
    }

    // Delete from database
    await db.media.delete({
      where: { id: mediaId },
    });

    // In production, also delete from S3
    // await s3Client.deleteObject(...)

    return NextResponse.json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting photo" },
      { status: 500 }
    );
  }
}
