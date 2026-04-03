import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { AccountStatus } from "@prisma/client";

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Request body:
 * - email: string (required)
 * - phone: string (optional)
 * - password: string (required, min 8 chars, must contain uppercase, lowercase, and number)
 * - confirmPassword: string (required, must match password)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, phone, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if phone is already registered
    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: "This phone number is already registered" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        accountStatus: AccountStatus.PENDING,
        isVerified: false,
        isPremium: false,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        accountStatus: true,
        createdAt: true,
      },
    });

    // Generate OTP for email verification
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.otpVerification.create({
      data: {
        email,
        otp,
        purpose: "EMAIL_VERIFICATION",
        expiresAt: otpExpiry,
      },
    });

    // In production, send OTP via email service
    // For development, we'll return it in the response
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        user: {
          id: user.id,
          email: user.email,
        },
        // Remove this in production - only for development
        devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

/**
 * Generate a 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
