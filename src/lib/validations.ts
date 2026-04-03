import { z } from "zod";

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// ============================================================================
// PROFILE VALIDATION SCHEMAS
// ============================================================================

export const basicInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Please select your gender",
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    return date <= minAge;
  }, "You must be at least 18 years old"),
  profileCreatedFor: z.enum(["SELF", "SON", "DAUGHTER", "BROTHER", "SISTER", "FRIEND", "RELATIVE"]).optional(),
});

export const physicalInfoSchema = z.object({
  height: z.number().min(100, "Height must be at least 100 cm").max(250, "Height cannot exceed 250 cm"),
  bodyType: z.string().optional(),
  complexion: z.string().optional(),
  physicalStatus: z.enum(["NORMAL", "PHYSICALLY_CHALLENGED"]).default("NORMAL"),
});

export const personalInfoSchema = z.object({
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"], {
    required_error: "Please select your marital status",
  }),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().optional(),
  motherTongue: z.string().min(1, "Mother tongue is required"),
});

export const locationInfoSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
});

export const bioSchema = z.object({
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional(),
});

// ============================================================================
// EDUCATION & CAREER VALIDATION
// ============================================================================

export const educationCareerSchema = z.object({
  highestDegree: z.string().optional(),
  college: z.string().optional(),
  educationField: z.string().optional(),
  employedIn: z.enum(["GOVERNMENT", "PRIVATE", "BUSINESS", "DEFENSE", "SELF_EMPLOYED", "NOT_WORKING", "STUDENT"]).optional(),
  occupation: z.string().optional(),
  organization: z.string().optional(),
  annualIncome: z.number().min(0).optional(),
  workCountry: z.string().optional(),
  workState: z.string().optional(),
  workCity: z.string().optional(),
});

// ============================================================================
// FAMILY DETAILS VALIDATION
// ============================================================================

export const familyDetailsSchema = z.object({
  familyType: z.enum(["JOINT", "NUCLEAR"]).optional(),
  familyStatus: z.enum(["RICH", "UPPER_MIDDLE", "MIDDLE", "LOWER_MIDDLE"]).optional(),
  familyValues: z.enum(["TRADITIONAL", "MODERATE", "LIBERAL", "ORTHODOX"]).optional(),
  fatherOccupation: z.string().optional(),
  motherOccupation: z.string().optional(),
  brothersCount: z.number().min(0).default(0),
  brothersMarried: z.number().min(0).default(0),
  sistersCount: z.number().min(0).default(0),
  sistersMarried: z.number().min(0).default(0),
  familyLocation: z.string().optional(),
  aboutFamily: z.string().max(1000).optional(),
});

// ============================================================================
// PARTNER PREFERENCE VALIDATION
// ============================================================================

export const partnerPreferenceSchema = z.object({
  minAge: z.number().min(18).max(70).default(21),
  maxAge: z.number().min(18).max(70).default(40),
  minHeight: z.number().min(100).max(250).default(140),
  maxHeight: z.number().min(100).max(250).default(200),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  minIncome: z.number().min(0).optional(),
  maxIncome: z.number().min(0).optional(),
  employedIn: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  motherTongue: z.string().optional(),
  complexion: z.string().optional(),
  bodyType: z.string().optional(),
  aboutPartner: z.string().max(1000).optional(),
});

// ============================================================================
// COMPLETE PROFILE SCHEMA
// ============================================================================

export const completeProfileSchema = z.object({
  // Basic Info
  name: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string(),
  profileCreatedFor: z.enum(["SELF", "SON", "DAUGHTER", "BROTHER", "SISTER", "FRIEND", "RELATIVE"]).optional(),
  
  // Physical Info
  height: z.number().min(100).max(250),
  bodyType: z.string().optional(),
  complexion: z.string().optional(),
  physicalStatus: z.enum(["NORMAL", "PHYSICALLY_CHALLENGED"]).default("NORMAL"),
  
  // Personal Info
  maritalStatus: z.enum(["NEVER_MARRIED", "DIVORCED", "WIDOWED", "AWAITING_DIVORCE"]),
  religion: z.string(),
  caste: z.string().optional(),
  motherTongue: z.string(),
  
  // Location
  country: z.string(),
  state: z.string(),
  city: z.string(),
  
  // Bio
  bio: z.string().max(2000).optional(),
});

// ============================================================================
// SEARCH/FILTER VALIDATION
// ============================================================================

export const searchSchema = z.object({
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  minAge: z.number().min(18).max(70).optional(),
  maxAge: z.number().min(18).max(70).optional(),
  minHeight: z.number().min(100).max(250).optional(),
  maxHeight: z.number().min(100).max(250).optional(),
  maritalStatus: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  minIncome: z.number().min(0).optional(),
  maxIncome: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// ============================================================================
// INTERACTION VALIDATION
// ============================================================================

export const sendInterestSchema = z.object({
  receiverId: z.string().cuid(),
  message: z.string().max(500).optional(),
});

export const updateInteractionSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

export const sendMessageSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  messageType: z.enum(["TEXT", "IMAGE", "AUDIO", "VIDEO"]).default("TEXT"),
  mediaUrl: z.string().url().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type PhysicalInfoInput = z.infer<typeof physicalInfoSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type LocationInfoInput = z.infer<typeof locationInfoSchema>;
export type BioInput = z.infer<typeof bioSchema>;
export type EducationCareerInput = z.infer<typeof educationCareerSchema>;
export type FamilyDetailsInput = z.infer<typeof familyDetailsSchema>;
export type PartnerPreferenceInput = z.infer<typeof partnerPreferenceSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type SendInterestInput = z.infer<typeof sendInterestSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
