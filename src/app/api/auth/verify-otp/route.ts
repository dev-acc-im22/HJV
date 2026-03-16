import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { otpSchema } from "@/lib/validations";
import { AccountStatus, OtpPurpose } from "@prisma/client";

/**
 * POST /api/auth/verify-otp
 * Verify OTP for email/phone verification or password reset
 * 
 * Request body:
 * - email: string (optional, required if phone not provided)
 * - phone: string (optional, required if email not provided)
 * - otp: string (required, 6 digits)
 * - purpose: string (required - EMAIL_VERIFICATION, PHONE_VERIFICATION, PASSWORD_RESET, LOGIN)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, otp, purpose } = body;

    // Validate OTP format
    const validationResult = otpSchema.safeParse({ otp });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid OTP format", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter(Boolean),
        otp,
        purpose: purpose as OtpPurpose,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Handle different purposes
    if (purpose === "EMAIL_VERIFICATION" || purpose === "PHONE_VERIFICATION") {
      // Update user verification status
      const user = await db.user.findFirst({
        where: {
          OR: [
            email ? { email } : {},
            phone ? { phone } : {},
          ].filter(Boolean),
        },
      });

      if (user) {
        await db.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
            accountStatus: AccountStatus.ACTIVE,
          },
        });

        return NextResponse.json({
          message: "Verification successful",
          verified: true,
        });
      }
    }

    if (purpose === "PASSWORD_RESET") {
      // Return a token that can be used to reset password
      return NextResponse.json({
        message: "OTP verified. You can now reset your password.",
        verified: true,
        resetToken: otpRecord.id, // In production, use a secure JWT token
      });
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
