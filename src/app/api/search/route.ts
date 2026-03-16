import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * GET /api/search
 * Search profiles with faceted filtering and pagination
 * 
 * Query parameters:
 * - gender: string (MALE | FEMALE)
 * - minAge: number
 * - maxAge: number
 * - minHeight: number
 * - maxHeight: number
 * - maritalStatus: string
 * - religion: string
 * - caste: string
 * - country: string
 * - state: string
 * - city: string
 * - education: string
 * - occupation: string
 * - minIncome: number
 * - maxIncome: number
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProfileWhereInput = {
      // Exclude current user's profile
      NOT: { userId: session.user.id },
      // Only show verified and active profiles
      user: {
        isVerified: true,
        accountStatus: "ACTIVE",
      },
    };

    // Gender filter
    const gender = searchParams.get("gender");
    if (gender && (gender === "MALE" || gender === "FEMALE")) {
      where.gender = gender;
    }

    // Age filter (calculated from dateOfBirth)
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    if (minAge || maxAge) {
      const now = new Date();
      const dateOfBirthFilters: Prisma.DateTimeFilter = {};
      
      if (minAge) {
        // Max birth date for minimum age
        const maxBirthDate = new Date(now.getFullYear() - parseInt(minAge), now.getMonth(), now.getDate());
        dateOfBirthFilters.lte = maxBirthDate;
      }
      
      if (maxAge) {
        // Min birth date for maximum age
        const minBirthDate = new Date(now.getFullYear() - parseInt(maxAge) - 1, now.getMonth(), now.getDate());
        dateOfBirthFilters.gte = minBirthDate;
      }
      
      where.dateOfBirth = dateOfBirthFilters;
    }

    // Height filter
    const minHeight = searchParams.get("minHeight");
    const maxHeight = searchParams.get("maxHeight");
    if (minHeight || maxHeight) {
      const heightFilters: Prisma.IntFilter = {};
      if (minHeight) heightFilters.gte = parseInt(minHeight);
      if (maxHeight) heightFilters.lte = parseInt(maxHeight);
      where.height = heightFilters;
    }

    // Marital status filter
    const maritalStatus = searchParams.get("maritalStatus");
    if (maritalStatus) {
      where.maritalStatus = maritalStatus as any;
    }

    // Religion filter
    const religion = searchParams.get("religion");
    if (religion) {
      where.religion = religion;
    }

    // Caste filter
    const caste = searchParams.get("caste");
    if (caste) {
      where.caste = caste;
    }

    // Location filters
    const country = searchParams.get("country");
    if (country) where.country = country;

    const state = searchParams.get("state");
    if (state) where.state = state;

    const city = searchParams.get("city");
    if (city) where.city = city;

    // Education & Career filters
    const education = searchParams.get("education");
    const occupation = searchParams.get("occupation");
    const minIncome = searchParams.get("minIncome");
    const maxIncome = searchParams.get("maxIncome");

    if (education || occupation || minIncome || maxIncome) {
      const eduCareerFilters: Prisma.EducationCareerWhereInput = {};
      
      if (education) eduCareerFilters.highestDegree = education;
      if (occupation) eduCareerFilters.occupation = occupation;
      
      if (minIncome || maxIncome) {
        const incomeFilters: Prisma.IntFilter = {};
        if (minIncome) incomeFilters.gte = parseInt(minIncome);
        if (maxIncome) incomeFilters.lte = parseInt(maxIncome);
        eduCareerFilters.annualIncome = incomeFilters;
      }

      where.educationCareer = eduCareerFilters;
    }

    // Execute search with pagination
    const [profiles, totalCount] = await Promise.all([
      db.profile.findMany({
        where,
        include: {
          educationCareer: true,
          media: {
            where: {
              isPrimary: true,
              approvalStatus: "APPROVED",
            },
            take: 1,
          },
          user: {
            select: {
              id: true,
              isPremium: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { profileCompletion: "desc" },
          { createdAt: "desc" },
        ],
      }),
      db.profile.count({ where }),
    ]);

    // Calculate age for each profile
    const profilesWAge = profiles.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      gender: profile.gender,
      age: calculateAge(new Date(profile.dateOfBirth)),
      height: profile.height,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      religion: profile.religion,
      caste: profile.caste,
      maritalStatus: profile.maritalStatus,
      education: profile.educationCareer?.highestDegree,
      occupation: profile.educationCareer?.occupation,
      annualIncome: profile.educationCareer?.annualIncome,
      profileCompletion: profile.profileCompletion,
      photo: profile.media[0]?.url || null,
      photoPrivacy: profile.media[0]?.privacyLevel || null,
      isPremium: profile.user.isPremium,
    }));

    // Get available facets for filtering
    const facets = await getSearchFacets();

    return NextResponse.json({
      profiles: profilesWAge,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount,
      },
      facets,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred during search" },
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

/**
 * Get available facets for filtering
 */
async function getSearchFacets() {
  const [religions, countries, cities, education, occupations] = await Promise.all([
    // Distinct religions
    db.profile.findMany({
      where: { religion: { not: null } },
      select: { religion: true },
      distinct: ["religion"],
    }),
    // Distinct countries
    db.profile.findMany({
      select: { country: true },
      distinct: ["country"],
    }),
    // Distinct cities
    db.profile.findMany({
      select: { city: true, state: true },
      distinct: ["city"],
      take: 50,
    }),
    // Distinct education
    db.educationCareer.findMany({
      where: { highestDegree: { not: null } },
      select: { highestDegree: true },
      distinct: ["highestDegree"],
    }),
    // Distinct occupations
    db.educationCareer.findMany({
      where: { occupation: { not: null } },
      select: { occupation: true },
      distinct: ["occupation"],
    }),
  ]);

  return {
    religions: religions.map((r) => r.religion).filter(Boolean),
    countries: countries.map((c) => c.country),
    cities: cities.map((c) => ({ city: c.city, state: c.state })),
    education: education.map((e) => e.highestDegree).filter(Boolean),
    occupations: occupations.map((o) => o.occupation).filter(Boolean),
  };
}
