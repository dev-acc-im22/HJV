import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OtpPurpose } from "@prisma/client";

/**
 * POST /api/auth/resend-otp
 * Resend OTP for verification
 * 
 * Request body:
 * - email: string (optional, required if phone not provided)
 * - phone: string (optional, required if email not provided)
 * - purpose: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, purpose } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter(Boolean),
      },
    });

    // For email verification, user should exist
    if (purpose === "EMAIL_VERIFICATION" && !user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs
    await db.otpVerification.updateMany({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter(Boolean),
        purpose: purpose as OtpPurpose,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Create new OTP
    await db.otpVerification.create({
      data: {
        email: email || null,
        phone: phone || null,
        otp,
        purpose: purpose as OtpPurpose,
        expiresAt: otpExpiry,
      },
    });

    // In production, send OTP via email/SMS service
    console.log(`[DEV] New OTP for ${email || phone}: ${otp}`);

    return NextResponse.json({
      message: "OTP sent successfully",
      // Remove this in production
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending OTP" },
      { status: 500 }
    );
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
