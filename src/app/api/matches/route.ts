import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/matches
 * Get compatible matches using two-way matching algorithm
 * 
 * The TwoWayMatch algorithm:
 * 1. Compare User A's Profile against User B's PartnerPreference
 * 2. Compare User B's Profile against User A's PartnerPreference
 * 3. Return a compatibility percentage score
 * 
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - minScore: number (default: 50, minimum compatibility score 0-100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const minScore = Math.min(100, Math.max(0, parseInt(searchParams.get("minScore") || "50")));
    const skip = (page - 1) * limit;

    // Get current user's profile and partner preferences
    const currentUserProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        partnerPreference: true,
        educationCareer: true,
        media: {
          where: { isPrimary: true, approvalStatus: "APPROVED" },
          take: 1,
        },
      },
    });

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: "Please complete your profile to see matches" },
        { status: 400 }
      );
    }

    // Get current user's gender to find opposite gender
    const targetGender = currentUserProfile.gender === "MALE" ? "FEMALE" : "MALE";

    // Get potential matches (opposite gender, verified, active)
    const potentialMatches = await db.profile.findMany({
      where: {
        gender: targetGender,
        NOT: { userId: session.user.id },
        user: {
          isVerified: true,
          accountStatus: "ACTIVE",
        },
      },
      include: {
        partnerPreference: true,
        educationCareer: true,
        media: {
          where: { isPrimary: true, approvalStatus: "APPROVED" },
          take: 1,
        },
        user: {
          select: { id: true, isPremium: true },
        },
      },
    });

    // Calculate compatibility scores for each potential match
    const scoredMatches = potentialMatches
      .map((match) => {
        const score = calculateTwoWayCompatibility(
          currentUserProfile,
          match,
          currentUserProfile.partnerPreference,
          match.partnerPreference
        );

        return {
          profile: {
            id: match.id,
            userId: match.userId,
            name: match.name,
            gender: match.gender,
            age: calculateAge(new Date(match.dateOfBirth)),
            height: match.height,
            city: match.city,
            state: match.state,
            country: match.country,
            religion: match.religion,
            caste: match.caste,
            maritalStatus: match.maritalStatus,
            education: match.educationCareer?.highestDegree,
            occupation: match.educationCareer?.occupation,
            annualIncome: match.educationCareer?.annualIncome,
            photo: match.media[0]?.url || null,
            photoPrivacy: match.media[0]?.privacyLevel || null,
            isPremium: match.user.isPremium,
            profileCompletion: match.profileCompletion,
          },
          compatibilityScore: score,
          matchDetails: score.details,
        };
      })
      .filter((match) => match.compatibilityScore.total >= minScore)
      .sort((a, b) => b.compatibilityScore.total - a.compatibilityScore.total);

    // Paginate results
    const paginatedMatches = scoredMatches.slice(skip, skip + limit);

    return NextResponse.json({
      matches: paginatedMatches,
      pagination: {
        page,
        limit,
        total: scoredMatches.length,
        totalPages: Math.ceil(scoredMatches.length / limit),
        hasMore: skip + limit < scoredMatches.length,
      },
      currentUserPreferences: currentUserProfile.partnerPreference,
    });
  } catch (error) {
    console.error("Matches error:", error);
    return NextResponse.json(
      { error: "An error occurred while finding matches" },
      { status: 500 }
    );
  }
}

/**
 * Calculate two-way compatibility score
 */
function calculateTwoWayCompatibility(
  userProfileA: any,
  userProfileB: any,
  preferencesA: any,
  preferencesB: any
): { total: number; details: MatchDetails } {
  // Score how well Profile A matches Preferences B (B wants A)
  const scoreAtoB = calculateProfileToPreferenceScore(userProfileA, preferencesB);
  
  // Score how well Profile B matches Preferences A (A wants B)
  const scoreBtoA = calculateProfileToPreferenceScore(userProfileB, preferencesA);

  // Weighted average (can be adjusted)
  // Both directions are equally important for a successful match
  const totalScore = Math.round((scoreAtoB.score + scoreBtoA.score) / 2);

  return {
    total: totalScore,
    details: {
      profileMatchesPreferences: scoreBtoA,
      preferencesMatchProfile: scoreAtoB,
    },
  };
}

interface MatchDetails {
  profileMatchesPreferences: { score: number; breakdown: Record<string, number> };
  preferencesMatchProfile: { score: number; breakdown: Record<string, number> };
}

/**
 * Calculate how well a profile matches a set of preferences
 */
function calculateProfileToPreferenceScore(
  profile: any,
  preferences: any
): { score: number; breakdown: Record<string, number> } {
  if (!preferences) {
    return { score: 50, breakdown: {} }; // No preferences = neutral score
  }

  const breakdown: Record<string, number> = {};
  let totalWeight = 0;
  let weightedScore = 0;

  // Age matching (weight: 20%)
  const age = calculateAge(new Date(profile.dateOfBirth));
  const ageScore = calculateRangeScore(age, preferences.minAge, preferences.maxAge, 5);
  breakdown.age = ageScore;
  weightedScore += ageScore * 20;
  totalWeight += 20;

  // Height matching (weight: 15%)
  const heightScore = calculateRangeScore(
    profile.height,
    preferences.minHeight,
    preferences.maxHeight,
    5
  );
  breakdown.height = heightScore;
  weightedScore += heightScore * 15;
  totalWeight += 15;

  // Religion matching (weight: 20%)
  const religionScore = preferences.religion
    ? profile.religion === preferences.religion ? 100 : 0
    : 50;
  breakdown.religion = religionScore;
  weightedScore += religionScore * 20;
  totalWeight += 20;

  // Caste matching (weight: 10%)
  const casteScore = preferences.caste
    ? profile.caste === preferences.caste ? 100 : 50 // Partial match if different caste
    : 50;
  breakdown.caste = casteScore;
  weightedScore += casteScore * 10;
  totalWeight += 10;

  // Location matching (weight: 15%)
  let locationScore = 50;
  if (preferences.city && profile.city === preferences.city) {
    locationScore = 100;
  } else if (preferences.state && profile.state === preferences.state) {
    locationScore = 75;
  } else if (preferences.country && profile.country === preferences.country) {
    locationScore = 50;
  }
  breakdown.location = locationScore;
  weightedScore += locationScore * 15;
  totalWeight += 15;

  // Education matching (weight: 10%)
  let educationScore = 50;
  if (preferences.education && profile.educationCareer?.highestDegree) {
    educationScore = profile.educationCareer.highestDegree === preferences.education ? 100 : 50;
  }
  breakdown.education = educationScore;
  weightedScore += educationScore * 10;
  totalWeight += 10;

  // Income matching (weight: 10%)
  let incomeScore = 50;
  if (profile.educationCareer?.annualIncome !== null && profile.educationCareer?.annualIncome !== undefined) {
    incomeScore = calculateRangeScore(
      profile.educationCareer.annualIncome,
      preferences.minIncome,
      preferences.maxIncome,
      100
    );
  }
  breakdown.income = incomeScore;
  weightedScore += incomeScore * 10;
  totalWeight += 10;

  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

  return {
    score: finalScore,
    breakdown,
  };
}

/**
 * Calculate score for a value within a range
 * Returns 100 if within range, decreasing score outside range
 */
function calculateRangeScore(
  value: number,
  minPref: number | null | undefined,
  maxPref: number | null | undefined,
  tolerance: number
): number {
  if (!minPref && !maxPref) return 50; // No preference = neutral

  const min = minPref || 0;
  const max = maxPref || value * 2;

  if (value >= min && value <= max) {
    return 100; // Perfect match
  }

  if (value < min) {
    // Below range - calculate penalty
    const diff = min - value;
    const penalty = Math.min(100, (diff / tolerance) * 20);
    return Math.max(0, 100 - penalty);
  }

  if (value > max) {
    // Above range - calculate penalty
    const diff = value - max;
    const penalty = Math.min(100, (diff / tolerance) * 20);
    return Math.max(0, 100 - penalty);
  }

  return 50;
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
