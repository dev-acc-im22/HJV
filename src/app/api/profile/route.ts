import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeProfileSchema, educationCareerSchema, familyDetailsSchema, partnerPreferenceSchema } from "@/lib/validations";
import { Gender, MaritalStatus, PhysicalStatus, ProfileCreatedFor } from "@prisma/client";

/**
 * GET /api/profile
 * Get the current user's profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        educationCareer: true,
        familyDetails: true,
        partnerPreference: true,
        horoscope: true,
        media: {
          where: { approvalStatus: "APPROVED" },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found", hasProfile: false },
        { status: 404 }
      );
    }

    // Calculate age from date of birth
    const age = calculateAge(new Date(profile.dateOfBirth));

    return NextResponse.json({
      profile: {
        ...profile,
        age,
      },
      hasProfile: true,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Create a new profile for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if profile already exists
    const existingProfile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = completeProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create profile with related data
    const profile = await db.profile.create({
      data: {
        userId: session.user.id,
        name: data.name,
        gender: data.gender as Gender,
        dateOfBirth: new Date(data.dateOfBirth),
        height: data.height,
        bodyType: data.bodyType || null,
        complexion: data.complexion || null,
        physicalStatus: (data.physicalStatus as PhysicalStatus) || "NORMAL",
        maritalStatus: data.maritalStatus as MaritalStatus,
        religion: data.religion,
        caste: data.caste || null,
        motherTongue: data.motherTongue,
        country: data.country,
        state: data.state,
        city: data.city,
        bio: data.bio || null,
        profileCreatedFor: data.profileCreatedFor as ProfileCreatedFor || null,
        profileCompletion: calculateProfileCompletion(data),
        isProfileComplete: true,
      },
      include: {
        educationCareer: true,
        familyDetails: true,
        partnerPreference: true,
      },
    });

    return NextResponse.json({
      message: "Profile created successfully",
      profile,
    }, { status: 201 });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update the current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { educationCareer, familyDetails, partnerPreference, ...profileData } = body;

    // Start a transaction to update all related data
    const result = await db.$transaction(async (tx) => {
      // Update main profile
      const profile = await tx.profile.update({
        where: { userId: session.user.id },
        data: {
          ...(profileData.name && { name: profileData.name }),
          ...(profileData.gender && { gender: profileData.gender as Gender }),
          ...(profileData.dateOfBirth && { dateOfBirth: new Date(profileData.dateOfBirth) }),
          ...(profileData.height !== undefined && { height: profileData.height }),
          ...(profileData.bodyType !== undefined && { bodyType: profileData.bodyType || null }),
          ...(profileData.complexion !== undefined && { complexion: profileData.complexion || null }),
          ...(profileData.physicalStatus && { physicalStatus: profileData.physicalStatus as PhysicalStatus }),
          ...(profileData.maritalStatus && { maritalStatus: profileData.maritalStatus as MaritalStatus }),
          ...(profileData.religion && { religion: profileData.religion }),
          ...(profileData.caste !== undefined && { caste: profileData.caste || null }),
          ...(profileData.motherTongue && { motherTongue: profileData.motherTongue }),
          ...(profileData.country && { country: profileData.country }),
          ...(profileData.state && { state: profileData.state }),
          ...(profileData.city && { city: profileData.city }),
          ...(profileData.bio !== undefined && { bio: profileData.bio || null }),
          ...(profileData.contactPhone !== undefined && { contactPhone: profileData.contactPhone || null }),
          ...(profileData.contactEmail !== undefined && { contactEmail: profileData.contactEmail || null }),
          ...(profileData.showPhone !== undefined && { showPhone: profileData.showPhone }),
          ...(profileData.showEmail !== undefined && { showEmail: profileData.showEmail }),
        },
      });

      // Update education & career
      if (educationCareer) {
        const validatedEdu = educationCareerSchema.safeParse(educationCareer);
        if (validatedEdu.success) {
          await tx.educationCareer.upsert({
            where: { profileId: profile.id },
            create: {
              profileId: profile.id,
              ...validatedEdu.data,
            },
            update: {
              ...validatedEdu.data,
            },
          });
        }
      }

      // Update family details
      if (familyDetails) {
        const validatedFamily = familyDetailsSchema.safeParse(familyDetails);
        if (validatedFamily.success) {
          await tx.familyDetails.upsert({
            where: { profileId: profile.id },
            create: {
              profileId: profile.id,
              ...validatedFamily.data,
            },
            update: {
              ...validatedFamily.data,
            },
          });
        }
      }

      // Update partner preferences
      if (partnerPreference) {
        const validatedPref = partnerPreferenceSchema.safeParse(partnerPreference);
        if (validatedPref.success) {
          await tx.partnerPreference.upsert({
            where: { profileId: profile.id },
            create: {
              profileId: profile.id,
              ...validatedPref.data,
            },
            update: {
              ...validatedPref.data,
            },
          });
        }
      }

      // Recalculate profile completion
      const updatedProfile = await tx.profile.findUnique({
        where: { userId: session.user.id },
        include: {
          educationCareer: true,
          familyDetails: true,
          partnerPreference: true,
          media: true,
        },
      });

      if (updatedProfile) {
        const completion = calculateFullProfileCompletion(updatedProfile);
        await tx.profile.update({
          where: { id: updatedProfile.id },
          data: { profileCompletion: completion },
        });
      }

      return updatedProfile;
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: result,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
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
 * Calculate profile completion percentage for basic profile
 */
function calculateProfileCompletion(data: any): number {
  const fields = [
    data.name,
    data.gender,
    data.dateOfBirth,
    data.height,
    data.maritalStatus,
    data.religion,
    data.motherTongue,
    data.country,
    data.state,
    data.city,
  ];

  const filledFields = fields.filter(Boolean).length;
  const optionalFields = [data.bio, data.caste, data.bodyType, data.complexion];
  const filledOptional = optionalFields.filter(Boolean).length;

  // Basic fields count 70%, optional fields count 30%
  return Math.min(100, Math.round((filledFields / fields.length) * 70 + (filledOptional / optionalFields.length) * 30));
}

/**
 * Calculate full profile completion including all related data
 */
function calculateFullProfileCompletion(profile: any): number {
  let completion = 50; // Base completion for having a profile

  // Check education & career (20%)
  if (profile.educationCareer) {
    const eduFields = [
      profile.educationCareer.highestDegree,
      profile.educationCareer.occupation,
      profile.educationCareer.annualIncome,
    ];
    completion += (eduFields.filter(Boolean).length / eduFields.length) * 20;
  }

  // Check family details (10%)
  if (profile.familyDetails) {
    const familyFields = [
      profile.familyDetails.familyType,
      profile.familyDetails.fatherOccupation,
      profile.familyDetails.motherOccupation,
    ];
    completion += (familyFields.filter(Boolean).length / familyFields.length) * 10;
  }

  // Check partner preferences (10%)
  if (profile.partnerPreference) {
    const prefFields = [
      profile.partnerPreference.minAge,
      profile.partnerPreference.maxAge,
      profile.partnerPreference.religion,
    ];
    completion += (prefFields.filter(Boolean).length / prefFields.length) * 10;
  }

  // Check photos (10%)
  if (profile.media && profile.media.length > 0) {
    completion += Math.min(10, profile.media.length * 3);
  }

  return Math.min(100, Math.round(completion));
}
