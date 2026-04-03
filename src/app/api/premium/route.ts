import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlanType, PaymentStatus } from "@prisma/client";

/**
 * GET /api/premium
 * Get premium plans and current subscription status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        isPremium: true,
        premiumExpiry: true,
        payments: {
          where: { status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Available plans
    const plans = [
      {
        id: "basic",
        name: "Basic",
        price: 999,
        currency: "INR",
        duration: 30,
        features: [
          "View contact details of 5 profiles",
          "Send 20 interests per day",
          "Basic search filters",
          "Chat with accepted matches",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: 2499,
        currency: "INR",
        duration: 90,
        popular: true,
        features: [
          "View contact details of all profiles",
          "Unlimited interests",
          "Advanced search filters",
          "Priority in search results",
          "Chat with accepted matches",
          "Profile boost once a month",
        ],
      },
      {
        id: "vip",
        name: "VIP",
        price: 4999,
        currency: "INR",
        duration: 180,
        features: [
          "All Premium features",
          "Dedicated relationship manager",
          "Profile verification badge",
          "Unlimited profile boosts",
          "Priority customer support",
          "Video call feature",
        ],
      },
    ];

    return NextResponse.json({
      isPremium: user?.isPremium || false,
      premiumExpiry: user?.premiumExpiry,
      currentPlan: user?.payments[0]?.planType || null,
      plans,
    });
  } catch (error) {
    console.error("Get premium info error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/premium
 * Subscribe to a premium plan
 * 
 * In production, this would create a Stripe checkout session.
 * For development, we simulate the payment flow.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    // Plan pricing
    const planConfig: Record<string, { price: number; duration: number; planType: PlanType }> = {
      basic: { price: 999, duration: 30, planType: "BASIC" },
      premium: { price: 2499, duration: 90, planType: "PREMIUM" },
      vip: { price: 4999, duration: 180, planType: "VIP" },
    };

    const selectedPlan = planConfig[planId];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount: selectedPlan.price,
        currency: "INR",
        planType: selectedPlan.planType,
        planDuration: selectedPlan.duration,
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000),
        status: PaymentStatus.PENDING,
      },
    });

    // In production, return Stripe checkout URL
    // For development, simulate immediate success
    if (process.env.NODE_ENV === "development") {
      // Simulate payment success
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: `TXN_${Date.now()}`,
        },
      });

      // Update user premium status
      await db.user.update({
        where: { id: session.user.id },
        data: {
          isPremium: true,
          premiumExpiry: payment.endDate,
        },
      });

      return NextResponse.json({
        message: "Premium subscription activated successfully!",
        payment: {
          id: payment.id,
          planType: payment.planType,
          endDate: payment.endDate,
        },
        devMode: true,
      });
    }

    // Production: Return Stripe checkout session URL
    return NextResponse.json({
      checkoutUrl: `https://checkout.stripe.com/pay/${payment.id}`,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Premium subscription error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
