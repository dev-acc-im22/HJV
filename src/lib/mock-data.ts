// Mock Data for Matrimony Application
// Used in Ghost Mode when APIs return 401
// Fully diversified to cover ALL filter combinations

// Lifestyle & Values Tags
export type LifestyleTag = 
  | 'Pet Parent' 
  | 'Wanderlust' 
  | 'Work-from-Home' 
  | 'Fitness Enthusiast' 
  | 'Tea over Coffee' 
  | 'Coffee Lover'
  | 'Non-Smoker' 
  | 'Non-Drinker'
  | 'Early Bird' 
  | 'Night Owl' 
  | 'Foodie' 
  | 'Bookworm'
  | 'Music Lover'
  | 'Movie Buff'
  | 'Nature Lover'
  | 'Spiritual'
  | 'Vegetarian'
  | 'Animal Lover';

export interface AudioIntro {
  id: string;
  duration: number; // in seconds
  recordedAt: Date;
  audioUrl?: string; // base64 or URL
}

export interface MockProfile {
  id: string;
  userId: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  height: number;
  city: string;
  state: string;
  country: string;
  religion: string;
  caste?: string;
  motherTongue: string;
  maritalStatus: string;
  education?: string;
  occupation?: string;
  annualIncome?: number;
  bio?: string;
  photo?: string;
  profileCompletion: number;
  isPremium: boolean;
  isVerified: boolean;
  lastActive: Date;
  lifestyleTags?: LifestyleTag[];
  audioIntro?: AudioIntro;
  // Biodata fields
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  rashi?: string;
  nakshatra?: string;
  manglik?: 'Yes' | 'No' | 'Anshik';
  gotra?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: string;
  familyType?: 'Joint' | 'Nuclear';
  familyStatus?: 'Upper Middle' | 'Middle' | 'Upper';
  aboutFamily?: string;
}

export interface MockInteraction {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SHORTLISTED';
  type: 'INTEREST' | 'SHORTLIST';
  message?: string;
  createdAt: Date;
  profile: MockProfile;
}

export interface MockMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// ============================================================================
// 30 DIVERSIFIED MOCK PROFILES - Covering ALL Filter Combinations
// ============================================================================

export const mockProfiles: MockProfile[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // FEMALES (15 profiles) - Diversified across all filters
  // ═══════════════════════════════════════════════════════════════════════
  
  // 1. Hindu-Brahmin, Mumbai, Hindi, MBA, 26yrs, Never Married
  {
    id: 'profile-1',
    userId: 'user-1',
    name: 'Priya Sharma',
    gender: 'FEMALE',
    age: 26,
    height: 165,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA',
    occupation: 'Marketing Manager',
    annualIncome: 1200000,
    bio: 'I am a fun-loving, ambitious professional who enjoys traveling, reading, and cooking. Looking for a partner who values family and has a good sense of humor.',
    profileCompletion: 85,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Wanderlust', 'Foodie', 'Bookworm', 'Non-Smoker', 'Early Bird'],
    birthTime: '08:45 AM',
    birthPlace: 'Mumbai, Maharashtra',
    rashi: 'Mithuna (Gemini)',
    nakshatra: 'Ardra',
    manglik: 'No',
    gotra: 'Shandilya',
    fatherName: 'Suresh Sharma',
    fatherOccupation: 'Government Officer',
    motherName: 'Meena Sharma',
    motherOccupation: 'Teacher',
    siblings: '1 Sister (Elder, Married)',
    familyType: 'Nuclear',
    familyStatus: 'Upper Middle',
    aboutFamily: 'Educated family with moderate values. Father is retired government officer.',
  },
  
  // 2. Hindu-Patel, Delhi, Gujarati, B.Tech, 24yrs, Never Married
  {
    id: 'profile-2',
    userId: 'user-2',
    name: 'Anjali Patel',
    gender: 'FEMALE',
    age: 24,
    height: 158,
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    religion: 'Hindu',
    caste: 'Patel',
    motherTongue: 'Gujarati',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Software Engineer',
    annualIncome: 900000,
    bio: 'Tech enthusiast who loves coding and dancing. Looking for someone who is understanding and supportive.',
    profileCompletion: 78,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Fitness Enthusiast', 'Night Owl', 'Coffee Lover', 'Music Lover', 'Non-Smoker'],
    birthTime: '03:20 PM',
    birthPlace: 'Delhi',
    rashi: 'Simha (Leo)',
    nakshatra: 'Magha',
    manglik: 'No',
  },
  
  // 3. Hindu-Aggarwal, Bangalore, Hindi, MBBS, 27yrs, Never Married
  {
    id: 'profile-3',
    userId: 'user-3',
    name: 'Neha Gupta',
    gender: 'FEMALE',
    age: 27,
    height: 160,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    religion: 'Hindu',
    caste: 'Aggarwal',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS',
    occupation: 'Doctor',
    annualIncome: 1500000,
    bio: 'A doctor by profession, dancer by passion. Looking for a life partner who is caring and family-oriented.',
    profileCompletion: 92,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    lifestyleTags: ['Fitness Enthusiast', 'Vegetarian', 'Spiritual', 'Early Bird', 'Animal Lover'],
    birthTime: '11:15 AM',
    birthPlace: 'Delhi',
    rashi: 'Kanya (Virgo)',
    nakshatra: 'Hasta',
    manglik: 'Anshik',
  },
  
  // 4. Hindu-Iyer, Chennai, Tamil, CA, 25yrs, Never Married
  {
    id: 'profile-4',
    userId: 'user-4',
    name: 'Meera Iyer',
    gender: 'FEMALE',
    age: 25,
    height: 162,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    religion: 'Hindu',
    caste: 'Iyer',
    motherTongue: 'Tamil',
    maritalStatus: 'NEVER_MARRIED',
    education: 'CA',
    occupation: 'Chartered Accountant',
    annualIncome: 1100000,
    bio: 'CA by profession, carnatic singer by passion. Looking for a supportive and understanding partner.',
    profileCompletion: 90,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Music Lover', 'Vegetarian', 'Early Bird', 'Non-Smoker', 'Spiritual'],
  },
  
  // 5. Hindu-Maratha, Pune, Marathi, MBA, 26yrs, Never Married
  {
    id: 'profile-5',
    userId: 'user-5',
    name: 'Sneha Desai',
    gender: 'FEMALE',
    age: 26,
    height: 163,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Hindu',
    caste: 'Maratha',
    motherTongue: 'Marathi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA',
    occupation: 'HR Manager',
    annualIncome: 950000,
    bio: 'HR professional who loves cooking and traveling. Family is my priority.',
    profileCompletion: 76,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Foodie', 'Wanderlust', 'Non-Smoker', 'Early Bird', 'Animal Lover'],
  },
  
  // 6. Muslim-Sunni, Hyderabad, Urdu, BDS, 25yrs, Never Married
  {
    id: 'profile-6',
    userId: 'user-6',
    name: 'Ayesha Khan',
    gender: 'FEMALE',
    age: 25,
    height: 158,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    religion: 'Muslim',
    caste: 'Sunni',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BDS',
    occupation: 'Dentist',
    annualIncome: 1000000,
    bio: 'A dentist who loves poetry and painting. Looking for a caring and understanding life partner.',
    profileCompletion: 82,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Fitness Enthusiast'],
  },
  
  // 7. Christian-Catholic, Kochi, Malayalam, BSc Nursing, 27yrs, Never Married
  {
    id: 'profile-7',
    userId: 'user-7',
    name: 'Maria Thomas',
    gender: 'FEMALE',
    age: 27,
    height: 160,
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    religion: 'Christian',
    caste: 'Catholic',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BSc Nursing',
    occupation: 'Nurse',
    annualIncome: 700000,
    bio: 'A dedicated nurse who loves music and gardening. Family values are important to me.',
    profileCompletion: 88,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Nature Lover', 'Non-Smoker', 'Early Bird', 'Spiritual'],
  },
  
  // 8. Sikh-Jat, Chandigarh, Punjabi, B.Tech, 26yrs, Never Married
  {
    id: 'profile-8',
    userId: 'user-8',
    name: 'Harpreet Kaur',
    gender: 'FEMALE',
    age: 26,
    height: 164,
    city: 'Chandigarh',
    state: 'Punjab',
    country: 'India',
    religion: 'Sikh',
    caste: 'Jat',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Civil Engineer',
    annualIncome: 850000,
    bio: 'Civil engineer who loves Punjabi music and cooking. Looking for a partner who respects traditions.',
    profileCompletion: 79,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Foodie', 'Non-Smoker', 'Early Bird', 'Fitness Enthusiast'],
  },
  
  // 9. Hindu-Reddy, Hyderabad, Telugu, MS USA, 28yrs, DIVORCED
  {
    id: 'profile-9',
    userId: 'user-9',
    name: 'Lakshmi Reddy',
    gender: 'FEMALE',
    age: 28,
    height: 161,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    religion: 'Hindu',
    caste: 'Reddy',
    motherTongue: 'Telugu',
    maritalStatus: 'DIVORCED',
    education: 'MS (USA)',
    occupation: 'Data Analyst',
    annualIncome: 1800000,
    bio: 'Returned from USA after masters. Love Telugu movies and cooking. Looking for a fresh start with someone understanding.',
    profileCompletion: 85,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Movie Buff', 'Foodie', 'Non-Smoker', 'Early Bird', 'Wanderlust'],
  },
  
  // 10. Hindu-Kayastha, Kolkata, Bengali, BA English, 24yrs, Never Married
  {
    id: 'profile-10',
    userId: 'user-10',
    name: 'Riya Sen',
    gender: 'FEMALE',
    age: 24,
    height: 157,
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    religion: 'Hindu',
    caste: 'Kayastha',
    motherTongue: 'Bengali',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BA English',
    occupation: 'Content Writer',
    annualIncome: 600000,
    bio: 'A creative soul who loves literature, art, and Durga Puja. Looking for someone who appreciates culture.',
    profileCompletion: 72,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Foodie', 'Non-Smoker', 'Night Owl'],
  },
  
  // 11. Jain-Digambar, Ahmedabad, Gujarati, BCom, 27yrs, Never Married
  {
    id: 'profile-11',
    userId: 'user-11',
    name: 'Pooja Jain',
    gender: 'FEMALE',
    age: 27,
    height: 155,
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    religion: 'Jain',
    caste: 'Digambar',
    motherTongue: 'Gujarati',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BCom',
    occupation: 'Business Owner',
    annualIncome: 1400000,
    bio: 'Entrepreneur running my own boutique. Vegetarian, loves yoga and meditation. Seeking a like-minded partner.',
    profileCompletion: 90,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Vegetarian', 'Spiritual', 'Early Bird', 'Non-Smoker', 'Non-Drinker'],
  },
  
  // 12. Hindu-Nair, Kochi, Malayalam, MSc, 25yrs, Never Married
  {
    id: 'profile-12',
    userId: 'user-12',
    name: 'Divya Nair',
    gender: 'FEMALE',
    age: 25,
    height: 159,
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    religion: 'Hindu',
    caste: 'Nair',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MSc Mathematics',
    occupation: 'Teacher',
    annualIncome: 550000,
    bio: 'A mathematics teacher who enjoys reading and classical dance. Family-oriented and looking for a loving partner.',
    profileCompletion: 80,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Vegetarian', 'Early Bird', 'Non-Smoker'],
  },
  
  // 13. Muslim-Shia, Lucknow, Urdu, PhD, 30yrs, Never Married
  {
    id: 'profile-13',
    userId: 'user-13',
    name: 'Fatima Zaidi',
    gender: 'FEMALE',
    age: 30,
    height: 162,
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    religion: 'Muslim',
    caste: 'Shia',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'PhD',
    occupation: 'Professor',
    annualIncome: 1200000,
    bio: 'A literature professor who loves poetry and calligraphy. Seeking an intellectually compatible partner.',
    profileCompletion: 88,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Spiritual'],
  },
  
  // 14. Hindu-Rajput, Jaipur, Hindi, LLB, 26yrs, Never Married
  {
    id: 'profile-14',
    userId: 'user-14',
    name: 'Kavya Singh',
    gender: 'FEMALE',
    age: 26,
    height: 164,
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    religion: 'Hindu',
    caste: 'Rajput',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'LLB',
    occupation: 'Lawyer',
    annualIncome: 1100000,
    bio: 'A corporate lawyer who enjoys Rajasthani culture and traveling. Looking for someone ambitious and family-loving.',
    profileCompletion: 84,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Wanderlust', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird', 'Bookworm'],
  },
  
  // 15. Christian-Protestant, Bangalore, Tamil, MBA, 28yrs, Never Married
  {
    id: 'profile-15',
    userId: 'user-15',
    name: 'Grace Samuel',
    gender: 'FEMALE',
    age: 28,
    height: 161,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    religion: 'Christian',
    caste: 'Protestant',
    motherTongue: 'Tamil',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA Finance',
    occupation: 'Finance Manager',
    annualIncome: 1600000,
    bio: 'A finance professional who loves church activities and singing. Looking for a partner with strong values.',
    profileCompletion: 86,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Spiritual', 'Non-Smoker', 'Early Bird', 'Fitness Enthusiast'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MALES (15 profiles) - Diversified across all filters
  // ═══════════════════════════════════════════════════════════════════════
  
  // 16. Hindu-Kshatriya, Mumbai, Hindi, MBA IIM, 29yrs, Never Married
  {
    id: 'profile-16',
    userId: 'user-16',
    name: 'Rahul Verma',
    gender: 'MALE',
    age: 29,
    height: 178,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Hindu',
    caste: 'Kshatriya',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA, IIM',
    occupation: 'Investment Banker',
    annualIncome: 3500000,
    bio: 'Finance professional who loves sports, music, and traveling. Looking for an educated and caring partner.',
    profileCompletion: 88,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Wanderlust', 'Fitness Enthusiast', 'Non-Smoker', 'Music Lover', 'Early Bird'],
    birthTime: '06:30 AM',
    birthPlace: 'Mumbai, Maharashtra',
    rashi: 'Mesha (Aries)',
    nakshatra: 'Ashwini',
    manglik: 'No',
    gotra: 'Kashyap',
    fatherName: 'Vijay Verma',
    fatherOccupation: 'Businessman',
    motherName: 'Priya Verma',
    motherOccupation: 'Homemaker',
    siblings: '1 Sister (Younger, Unmarried)',
    familyType: 'Nuclear',
    familyStatus: 'Upper',
    aboutFamily: 'Business family with modern outlook and traditional values.',
  },
  
  // 17. Sikh-Jat, Delhi, Punjabi, B.Tech IIT, 31yrs, Never Married
  {
    id: 'profile-17',
    userId: 'user-17',
    name: 'Vikram Singh',
    gender: 'MALE',
    age: 31,
    height: 180,
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    religion: 'Sikh',
    caste: 'Jat',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech, IIT',
    occupation: 'Tech Lead',
    annualIncome: 2800000,
    bio: 'Tech entrepreneur with a passion for innovation. Looking for someone who shares similar values.',
    profileCompletion: 75,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lifestyleTags: ['Work-from-Home', 'Night Owl', 'Coffee Lover', 'Movie Buff', 'Pet Parent'],
    birthTime: '09:45 PM',
    birthPlace: 'Amritsar, Punjab',
    rashi: 'Dhanu (Sagittarius)',
    nakshatra: 'Mula',
    manglik: 'No',
  },
  
  // 18. Hindu-Reddy, Hyderabad, Telugu, MS USA, 28yrs, Never Married
  {
    id: 'profile-18',
    userId: 'user-18',
    name: 'Arjun Reddy',
    gender: 'MALE',
    age: 28,
    height: 175,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    religion: 'Hindu',
    caste: 'Reddy',
    motherTongue: 'Telugu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MS, USA',
    occupation: 'Data Scientist',
    annualIncome: 2200000,
    bio: 'Returned from US recently. Love movies, cricket, and exploring new places.',
    profileCompletion: 82,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Foodie', 'Nature Lover', 'Non-Smoker', 'Tea over Coffee'],
    birthTime: '02:15 PM',
    birthPlace: 'Hyderabad, Telangana',
    rashi: 'Makara (Capricorn)',
    nakshatra: 'Uttarashada',
    manglik: 'No',
  },
  
  // 19. Hindu-Brahmin, Mumbai, Hindi, MBBS MD, 30yrs, Never Married
  {
    id: 'profile-19',
    userId: 'user-19',
    name: 'Karan Malhotra',
    gender: 'MALE',
    age: 30,
    height: 182,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS, MD',
    occupation: 'Surgeon',
    annualIncome: 4000000,
    bio: 'Doctor by profession, musician by heart. Looking for a life partner who values both career and family.',
    profileCompletion: 95,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Music Lover', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird', 'Vegetarian'],
  },
  
  // 20. Hindu-Lingayat, Bangalore, Kannada, B.Tech, 27yrs, Never Married
  {
    id: 'profile-20',
    userId: 'user-20',
    name: 'Rohan Joshi',
    gender: 'MALE',
    age: 27,
    height: 172,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    religion: 'Hindu',
    caste: 'Lingayat',
    motherTongue: 'Kannada',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Product Manager',
    annualIncome: 1800000,
    bio: 'Product manager at a startup. Love trekking and photography.',
    profileCompletion: 70,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Nature Lover', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird'],
  },
  
  // 21. Muslim-Sunni, Hyderabad, Urdu, MBBS MD, 32yrs, Never Married
  {
    id: 'profile-21',
    userId: 'user-21',
    name: 'Imran Ahmed',
    gender: 'MALE',
    age: 32,
    height: 176,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    religion: 'Muslim',
    caste: 'Sunni',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS, MD',
    occupation: 'Pediatrician',
    annualIncome: 3200000,
    bio: 'A pediatrician who loves children and cricket. Looking for a caring and educated partner.',
    profileCompletion: 89,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Fitness Enthusiast', 'Non-Smoker', 'Early Bird', 'Bookworm', 'Animal Lover'],
  },
  
  // 22. Christian-Orthodox, Kochi, Malayalam, M.Tech, 29yrs, Never Married
  {
    id: 'profile-22',
    userId: 'user-22',
    name: 'George Varghese',
    gender: 'MALE',
    age: 29,
    height: 174,
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    religion: 'Christian',
    caste: 'Orthodox',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'M.Tech',
    occupation: 'Architect',
    annualIncome: 1500000,
    bio: 'An architect who loves art, design, and traveling. Looking for someone who appreciates creativity.',
    profileCompletion: 83,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Bookworm'],
  },
  
  // 23. Hindu-Yadav, Patna, Hindi, IAS, 31yrs, Never Married
  {
    id: 'profile-23',
    userId: 'user-23',
    name: 'Amit Yadav',
    gender: 'MALE',
    age: 31,
    height: 177,
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    religion: 'Hindu',
    caste: 'Yadav',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BA, IAS',
    occupation: 'IAS Officer',
    annualIncome: 2000000,
    bio: 'An IAS officer serving the nation. Love reading and social work. Looking for a supportive partner.',
    profileCompletion: 91,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird', 'Spiritual'],
  },
  
  // 24. Hindu-Kayastha, Kolkata, Bengali, CA MBA, 34yrs, DIVORCED
  {
    id: 'profile-24',
    userId: 'user-24',
    name: 'Rajesh Das',
    gender: 'MALE',
    age: 34,
    height: 173,
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    religion: 'Hindu',
    caste: 'Kayastha',
    motherTongue: 'Bengali',
    maritalStatus: 'DIVORCED',
    education: 'CA, MBA',
    occupation: 'CFO',
    annualIncome: 4500000,
    bio: 'A finance executive who loves literature and classical music. Looking for a second chance at love.',
    profileCompletion: 87,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Fitness Enthusiast'],
  },
  
  // 25. Jain-Shwetambar, Mumbai, Gujarati, BBA, 28yrs, Never Married
  {
    id: 'profile-25',
    userId: 'user-25',
    name: 'Vishal Mehta',
    gender: 'MALE',
    age: 28,
    height: 170,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Jain',
    caste: 'Shwetambar',
    motherTongue: 'Gujarati',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BBA',
    occupation: 'Business Owner',
    annualIncome: 2500000,
    bio: 'Running family business of textiles. Vegetarian, loves Jain philosophy and meditation.',
    profileCompletion: 80,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(),
    lifestyleTags: ['Vegetarian', 'Spiritual', 'Non-Smoker', 'Non-Drinker', 'Early Bird'],
  },
  
  // 26. Hindu-Jat, Delhi, Hindi, B.Tech, 27yrs, Never Married
  {
    id: 'profile-26',
    userId: 'user-26',
    name: 'Ravi Sheoran',
    gender: 'MALE',
    age: 27,
    height: 179,
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    religion: 'Hindu',
    caste: 'Jat',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Business Analyst',
    annualIncome: 1400000,
    bio: 'A business analyst who loves wrestling and politics. Looking for a simple and caring partner.',
    profileCompletion: 73,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lifestyleTags: ['Fitness Enthusiast', 'Non-Smoker', 'Early Bird', 'Bookworm', 'Tea over Coffee'],
  },
  
  // 27. Sikh-Khatri, Amritsar, Punjabi, MBBS, 30yrs, Never Married
  {
    id: 'profile-27',
    userId: 'user-27',
    name: 'Gurpreet Singh',
    gender: 'MALE',
    age: 30,
    height: 181,
    city: 'Amritsar',
    state: 'Punjab',
    country: 'India',
    religion: 'Sikh',
    caste: 'Khatri',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS',
    occupation: 'Doctor',
    annualIncome: 1800000,
    bio: 'A dedicated doctor serving in Punjab. Love Gurbani and Punjabi culture. Looking for a partner with values.',
    profileCompletion: 85,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Spiritual', 'Non-Smoker', 'Early Bird', 'Vegetarian'],
  },
  
  // 28. Hindu-Agarwal, Jaipur, Hindi, CA, 26yrs, Never Married
  {
    id: 'profile-28',
    userId: 'user-28',
    name: 'Nikhil Agarwal',
    gender: 'MALE',
    age: 26,
    height: 168,
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    religion: 'Hindu',
    caste: 'Agarwal',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'CA',
    occupation: 'Chartered Accountant',
    annualIncome: 1200000,
    bio: 'A CA who loves Rajasthani culture and traveling. Looking for someone who values traditions.',
    profileCompletion: 78,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Non-Smoker', 'Early Bird', 'Bookworm', 'Vegetarian'],
  },
  
  // 29. Buddhist-Mahar, Pune, Marathi, BA MSW, 29yrs, Never Married
  {
    id: 'profile-29',
    userId: 'user-29',
    name: 'Siddharth Gaikwad',
    gender: 'MALE',
    age: 29,
    height: 171,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Buddhist',
    caste: 'Mahar',
    motherTongue: 'Marathi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BA, MSW',
    occupation: 'Social Worker',
    annualIncome: 600000,
    bio: 'A social worker dedicated to community service. Follow Buddhist teachings. Looking for a compassionate partner.',
    profileCompletion: 75,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 10 * 60 * 60 * 1000),
    lifestyleTags: ['Spiritual', 'Bookworm', 'Non-Smoker', 'Early Bird', 'Vegetarian'],
  },
  
  // 30. Hindu-Naidu, Chennai, Telugu, MS USA, 33yrs, WIDOWED
  {
    id: 'profile-30',
    userId: 'user-30',
    name: 'Suresh Naidu',
    gender: 'MALE',
    age: 33,
    height: 175,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    religion: 'Hindu',
    caste: 'Naidu',
    motherTongue: 'Telugu',
    maritalStatus: 'WIDOWED',
    education: 'MS (USA)',
    occupation: 'Software Architect',
    annualIncome: 3800000,
    bio: 'A software architect returned from USA. Lost my spouse 3 years ago. Looking for a new beginning with someone understanding.',
    profileCompletion: 82,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Work-from-Home', 'Night Owl', 'Coffee Lover', 'Bookworm', 'Non-Smoker'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADDITIONAL FEMALES (11 profiles) - Extended Diversity
  // ═══════════════════════════════════════════════════════════════════════
  
  // 31. Hindu-Bania, Indore, Hindi, B.Com, 23yrs, Never Married - Young profile
  {
    id: 'profile-31',
    userId: 'user-31',
    name: 'Shreya Agrawal',
    gender: 'FEMALE',
    age: 23,
    height: 156,
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    religion: 'Hindu',
    caste: 'Bania',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Com',
    occupation: 'Accountant',
    annualIncome: 450000,
    bio: 'A young professional starting my career. Love cooking and traditional values. Looking for someone settled and family-oriented.',
    profileCompletion: 68,
    isPremium: false,
    isVerified: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Vegetarian', 'Early Bird', 'Spiritual', 'Non-Smoker', 'Foodie'],
  },
  
  // 32. Muslim-Sunni, Bhopal, Urdu, MA English, 29yrs, Never Married
  {
    id: 'profile-32',
    userId: 'user-32',
    name: 'Zara Hussain',
    gender: 'FEMALE',
    age: 29,
    height: 163,
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'India',
    religion: 'Muslim',
    caste: 'Sunni',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MA English',
    occupation: 'Journalist',
    annualIncome: 800000,
    bio: 'A journalist who loves storytelling and travelling. Looking for an open-minded and supportive partner.',
    profileCompletion: 85,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Bookworm', 'Night Owl', 'Coffee Lover', 'Movie Buff'],
  },
  
  // 33. Hindu-Marwari, Nagpur, Hindi, MBA, 27yrs, Never Married
  {
    id: 'profile-33',
    userId: 'user-33',
    name: 'Tanvi Goenka',
    gender: 'FEMALE',
    age: 27,
    height: 159,
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Hindu',
    caste: 'Marwari',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA',
    occupation: 'Entrepreneur',
    annualIncome: 2000000,
    bio: 'Running my own fashion brand. Love art, culture, and travelling. Looking for someone who appreciates creativity.',
    profileCompletion: 91,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Fashion Enthusiast', 'Foodie', 'Early Bird', 'Non-Smoker'],
  },
  
  // 34. Christian-Marthoma, Chennai, Malayalam, B.Tech, 25yrs, Never Married
  {
    id: 'profile-34',
    userId: 'user-34',
    name: 'Rebecca Thomas',
    gender: 'FEMALE',
    age: 25,
    height: 161,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    religion: 'Christian',
    caste: 'Marthoma',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Software Developer',
    annualIncome: 950000,
    bio: 'A techie who enjoys coding and music. Looking for a partner with similar interests and values.',
    profileCompletion: 82,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Night Owl', 'Coffee Lover', 'Work-from-Home', 'Non-Smoker'],
  },
  
  // 35. Sikh-Khatri, Ludhiana, Punjabi, BDS, 26yrs, Never Married
  {
    id: 'profile-35',
    userId: 'user-35',
    name: 'Manpreet Kaur',
    gender: 'FEMALE',
    age: 26,
    height: 162,
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    religion: 'Sikh',
    caste: 'Khatri',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BDS',
    occupation: 'Dentist',
    annualIncome: 900000,
    bio: 'A dentist who loves Punjabi cuisine and dancing. Looking for a caring and fun-loving partner.',
    profileCompletion: 80,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Foodie', 'Fitness Enthusiast', 'Music Lover', 'Non-Smoker', 'Early Bird'],
  },
  
  // 36. Hindu-Bengali, Guwahati, Bengali, BBA, 24yrs, Never Married - Unverified
  {
    id: 'profile-36',
    userId: 'user-36',
    name: 'Priya Banerjee',
    gender: 'FEMALE',
    age: 24,
    height: 158,
    city: 'Guwahati',
    state: 'Assam',
    country: 'India',
    religion: 'Hindu',
    caste: 'Bengali',
    motherTongue: 'Bengali',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BBA',
    occupation: 'Business Analyst',
    annualIncome: 650000,
    bio: 'A business analyst who loves Durga Puja and Bengali culture. Looking for someone who respects traditions.',
    profileCompletion: 65,
    isPremium: false,
    isVerified: false,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
    lifestyleTags: ['Foodie', 'Bookworm', 'Music Lover', 'Non-Smoker', 'Early Bird'],
  },
  
  // 37. Hindu-Tamil Brahmin, Coimbatore, Tamil, MBBS, 28yrs, Never Married
  {
    id: 'profile-37',
    userId: 'user-37',
    name: 'Lakshmi Venkataraman',
    gender: 'FEMALE',
    age: 28,
    height: 160,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    religion: 'Hindu',
    caste: 'Iyer',
    motherTongue: 'Tamil',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS',
    occupation: 'Doctor',
    annualIncome: 1400000,
    bio: 'A doctor passionate about healthcare and Carnatic music. Looking for a partner who values both profession and family.',
    profileCompletion: 93,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Vegetarian', 'Spiritual', 'Music Lover', 'Early Bird', 'Non-Smoker'],
  },
  
  // 38. Jain-Shwetambar, Surat, Gujarati, CA, 29yrs, Never Married
  {
    id: 'profile-38',
    userId: 'user-38',
    name: 'Ruchi Shah',
    gender: 'FEMALE',
    age: 29,
    height: 157,
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    religion: 'Jain',
    caste: 'Shwetambar',
    motherTongue: 'Gujarati',
    maritalStatus: 'NEVER_MARRIED',
    education: 'CA',
    occupation: 'Chartered Accountant',
    annualIncome: 1500000,
    bio: 'A CA with my own practice. Follow Jain principles strictly. Looking for a partner with similar values.',
    profileCompletion: 88,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lifestyleTags: ['Vegetarian', 'Spiritual', 'Early Bird', 'Non-Smoker', 'Non-Drinker'],
  },
  
  // 39. Hindu-Kshatriya, Jodhpur, Hindi, LLB, 30yrs, DIVORCED
  {
    id: 'profile-39',
    userId: 'user-39',
    name: 'Priyanka Rathore',
    gender: 'FEMALE',
    age: 30,
    height: 163,
    city: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    religion: 'Hindu',
    caste: 'Rathore',
    motherTongue: 'Hindi',
    maritalStatus: 'DIVORCED',
    education: 'LLB',
    occupation: 'Lawyer',
    annualIncome: 1300000,
    bio: 'A divorce lawyer who is now looking for a fresh start. Love Rajasthani culture and traveling.',
    profileCompletion: 84,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Bookworm', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird'],
  },
  
  // 40. Buddhist, Nagpur, Marathi, BSc, 26yrs, Never Married
  {
    id: 'profile-40',
    userId: 'user-40',
    name: 'Pallavi Ambedkar',
    gender: 'FEMALE',
    age: 26,
    height: 158,
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Buddhist',
    caste: 'General',
    motherTongue: 'Marathi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BSc',
    occupation: 'Teacher',
    annualIncome: 500000,
    bio: 'A teacher who follows Buddhist philosophy. Love meditation and social service.',
    profileCompletion: 75,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
    lifestyleTags: ['Spiritual', 'Bookworm', 'Early Bird', 'Vegetarian', 'Non-Smoker'],
  },
  
  // 41. Hindu-Punjabi, Delhi, Punjabi, MBA HR, 25yrs, Never Married
  {
    id: 'profile-41',
    userId: 'user-41',
    name: 'Simran Kapoor',
    gender: 'FEMALE',
    age: 25,
    height: 164,
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    religion: 'Hindu',
    caste: 'Punjabi',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA HR',
    occupation: 'HR Manager',
    annualIncome: 1000000,
    bio: 'An HR professional who loves Punjabi music and dancing. Looking for a fun-loving partner.',
    profileCompletion: 78,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Foodie', 'Fitness Enthusiast', 'Night Owl', 'Non-Smoker'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADDITIONAL MALES (11 profiles) - Extended Diversity
  // ═══════════════════════════════════════════════════════════════════════
  
  // 42. Hindu-Tamil Brahmin, Chennai, Tamil, MBA IIM, 32yrs, Never Married
  {
    id: 'profile-42',
    userId: 'user-42',
    name: 'Anand Subramaniam',
    gender: 'MALE',
    age: 32,
    height: 174,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    religion: 'Hindu',
    caste: 'Iyer',
    motherTongue: 'Tamil',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA, IIM',
    occupation: 'Management Consultant',
    annualIncome: 3200000,
    bio: 'A management consultant who loves Carnatic music and chess. Looking for an intellectually compatible partner.',
    profileCompletion: 90,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Bookworm', 'Vegetarian', 'Early Bird', 'Non-Smoker'],
  },
  
  // 43. Muslim-Shia, Mumbai, Urdu, MBBS MD, 35yrs, Never Married
  {
    id: 'profile-43',
    userId: 'user-43',
    name: 'Hassan Rizvi',
    gender: 'MALE',
    age: 35,
    height: 177,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    religion: 'Muslim',
    caste: 'Shia',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS, MD',
    occupation: 'Cardiologist',
    annualIncome: 5000000,
    bio: 'A cardiologist who loves poetry and Urdu literature. Looking for a cultured and family-oriented partner.',
    profileCompletion: 94,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Spiritual'],
  },
  
  // 44. Hindu-Gujarati, Ahmedabad, Gujarati, B.Tech, 26yrs, Never Married - Unverified
  {
    id: 'profile-44',
    userId: 'user-44',
    name: 'Karan Patel',
    gender: 'MALE',
    age: 26,
    height: 172,
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    religion: 'Hindu',
    caste: 'Patel',
    motherTongue: 'Gujarati',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Software Developer',
    annualIncome: 1100000,
    bio: 'A software developer who loves coding and garba. Looking for someone who enjoys both modern and traditional lifestyle.',
    profileCompletion: 72,
    isPremium: false,
    isVerified: false,
    lastActive: new Date(Date.now() - 10 * 60 * 60 * 1000),
    lifestyleTags: ['Music Lover', 'Night Owl', 'Coffee Lover', 'Work-from-Home', 'Non-Smoker'],
  },
  
  // 45. Christian-CSI, Bangalore, Malayalam, M.Tech, 28yrs, Never Married
  {
    id: 'profile-45',
    userId: 'user-45',
    name: 'Vineeth George',
    gender: 'MALE',
    age: 28,
    height: 176,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    religion: 'Christian',
    caste: 'CSI',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'M.Tech',
    occupation: 'Engineering Manager',
    annualIncome: 2400000,
    bio: 'An engineering manager who loves music, travel, and church activities. Looking for a partner with strong faith.',
    profileCompletion: 86,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Music Lover', 'Non-Smoker', 'Early Bird', 'Fitness Enthusiast'],
  },
  
  // 46. Hindu-Kannada, Hubli, Kannada, B.Com, 29yrs, Never Married
  {
    id: 'profile-46',
    userId: 'user-46',
    name: 'Prashant Desai',
    gender: 'MALE',
    age: 29,
    height: 170,
    city: 'Hubli',
    state: 'Karnataka',
    country: 'India',
    religion: 'Hindu',
    caste: 'Lingayat',
    motherTongue: 'Kannada',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Com',
    occupation: 'Business Owner',
    annualIncome: 1800000,
    bio: 'Running family business of textiles. Love traveling and exploring new places.',
    profileCompletion: 78,
    isPremium: false,
    isVerified: true,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Foodie', 'Early Bird', 'Non-Smoker', 'Pet Parent'],
  },
  
  // 47. Sikh-Jat, Chandigarh, Punjabi, MBA, 30yrs, Never Married
  {
    id: 'profile-47',
    userId: 'user-47',
    name: 'Harmanpreet Singh',
    gender: 'MALE',
    age: 30,
    height: 183,
    city: 'Chandigarh',
    state: 'Punjab',
    country: 'India',
    religion: 'Sikh',
    caste: 'Jat',
    motherTongue: 'Punjabi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA',
    occupation: 'Marketing Director',
    annualIncome: 2800000,
    bio: 'A marketing professional who loves sports, traveling, and Punjabi culture. Looking for a partner who is ambitious yet family-oriented.',
    profileCompletion: 88,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Fitness Enthusiast', 'Wanderlust', 'Music Lover', 'Non-Smoker', 'Early Bird'],
  },
  
  // 48. Hindu-Malayali, Kochi, Malayalam, MBBS, 27yrs, Never Married
  {
    id: 'profile-48',
    userId: 'user-48',
    name: 'Arun Menon',
    gender: 'MALE',
    age: 27,
    height: 175,
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    religion: 'Hindu',
    caste: 'Nair',
    motherTongue: 'Malayalam',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS',
    occupation: 'Doctor',
    annualIncome: 1300000,
    bio: 'A young doctor who loves reading and traveling. Looking for a partner who values both career and family.',
    profileCompletion: 85,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Wanderlust', 'Non-Smoker', 'Early Bird', 'Vegetarian'],
  },
  
  // 49. Hindu-Rajasthani, Jaipur, Hindi, CA, 34yrs, DIVORCED
  {
    id: 'profile-49',
    userId: 'user-49',
    name: 'Vikas Shekhawat',
    gender: 'MALE',
    age: 34,
    height: 178,
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    religion: 'Hindu',
    caste: 'Shekhawat',
    motherTongue: 'Hindi',
    maritalStatus: 'DIVORCED',
    education: 'CA',
    occupation: 'CFO',
    annualIncome: 4200000,
    bio: 'A CFO who has been divorced for 2 years. Love Rajasthani culture and traveling. Looking for a second chance at happiness.',
    profileCompletion: 89,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
    lifestyleTags: ['Wanderlust', 'Bookworm', 'Fitness Enthusiast', 'Non-Smoker', 'Early Bird'],
  },
  
  // 50. Muslim-Sunni, Lucknow, Urdu, BA LLB, 31yrs, Never Married
  {
    id: 'profile-50',
    userId: 'user-50',
    name: 'Asad Ali Khan',
    gender: 'MALE',
    age: 31,
    height: 179,
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    religion: 'Muslim',
    caste: 'Sunni',
    motherTongue: 'Urdu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'BA, LLB',
    occupation: 'Lawyer',
    annualIncome: 1800000,
    bio: 'A lawyer who loves Urdu poetry and Lucknowi culture. Looking for a partner who appreciates art and literature.',
    profileCompletion: 84,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Music Lover', 'Foodie', 'Non-Smoker', 'Night Owl'],
  },
  
  // 51. Hindu-Telugu, Vijayawada, Telugu, B.Tech, 28yrs, Never Married
  {
    id: 'profile-51',
    userId: 'user-51',
    name: 'Srinivas Rao',
    gender: 'MALE',
    age: 28,
    height: 173,
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    country: 'India',
    religion: 'Hindu',
    caste: 'Kamma',
    motherTongue: 'Telugu',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.Tech',
    occupation: 'Civil Services',
    annualIncome: 1500000,
    bio: 'An IAS officer serving in Andhra Pradesh. Love reading and social work. Looking for a supportive partner.',
    profileCompletion: 91,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lifestyleTags: ['Bookworm', 'Early Bird', 'Fitness Enthusiast', 'Non-Smoker', 'Spiritual'],
  },
  
  // 52. Jain-Digambar, Indore, Hindi, MBA, 33yrs, Never Married
  {
    id: 'profile-52',
    userId: 'user-52',
    name: 'Rohit Jain',
    gender: 'MALE',
    age: 33,
    height: 171,
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    religion: 'Jain',
    caste: 'Digambar',
    motherTongue: 'Hindi',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA',
    occupation: 'Entrepreneur',
    annualIncome: 3500000,
    bio: 'An entrepreneur running multiple businesses. Follow Jain principles strictly. Looking for a partner with similar values.',
    profileCompletion: 87,
    isPremium: true,
    isVerified: true,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    lifestyleTags: ['Vegetarian', 'Spiritual', 'Early Bird', 'Non-Smoker', 'Non-Drinker'],
  },
];

// ============================================================================
// DIVERSIFIED MOCK INTERACTIONS
// ============================================================================

export const mockInteractions: MockInteraction[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // INTERESTS RECEIVED by ghost user (from males) - PENDING
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-1',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hi! I liked your profile. Would love to know more about you.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    profile: mockProfiles[15], // Rahul Verma
  },
  {
    id: 'int-2',
    senderId: 'user-18',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Your profile seems interesting. Let\'s connect!',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    profile: mockProfiles[17], // Arjun Reddy
  },
  {
    id: 'int-3',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hello! I think we could be a great match. Looking forward to hearing from you.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    profile: mockProfiles[20], // Imran Ahmed
  },
  {
    id: 'int-4',
    senderId: 'user-19',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hi, I noticed we have similar interests. Would you like to connect?',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    profile: mockProfiles[18], // Karan Malhotra
  },
  {
    id: 'int-5',
    senderId: 'user-42',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hello! Your profile caught my attention. Looking forward to knowing you better.',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    profile: mockProfiles[41], // Anand Subramaniam
  },
  {
    id: 'int-6',
    senderId: 'user-47',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hi there! I think we would make a great pair. Would love to chat!',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    profile: mockProfiles[46], // Harmanpreet Singh
  },
  {
    id: 'int-7',
    senderId: 'user-43',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'As a doctor, I value meaningful connections. Would love to know you.',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    profile: mockProfiles[42], // Hassan Rizvi
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // INTERESTS SENT by ghost user - ACCEPTED
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-8',
    senderId: 'ghost-user',
    receiverId: 'user-17',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[16], // Vikram Singh
  },
  {
    id: 'int-9',
    senderId: 'ghost-user',
    receiverId: 'user-45',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[44], // Vineeth George
  },
  {
    id: 'int-10',
    senderId: 'ghost-user',
    receiverId: 'user-51',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[50], // Srinivas Rao
  },
  {
    id: 'int-11',
    senderId: 'ghost-user',
    receiverId: 'user-48',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[47], // Arun Menon
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // ADDITIONAL ACCEPTED INTERESTS - For Messages Page (16 more conversations)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-acc-1',
    senderId: 'ghost-user',
    receiverId: 'user-16',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[15], // Rahul Verma
  },
  {
    id: 'int-acc-2',
    senderId: 'ghost-user',
    receiverId: 'user-18',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[17], // Arjun Reddy
  },
  {
    id: 'int-acc-3',
    senderId: 'ghost-user',
    receiverId: 'user-19',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[18], // Karan Malhotra
  },
  {
    id: 'int-acc-4',
    senderId: 'ghost-user',
    receiverId: 'user-21',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[20], // Imran Ahmed
  },
  {
    id: 'int-acc-5',
    senderId: 'ghost-user',
    receiverId: 'user-22',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[21], // George Varghese
  },
  {
    id: 'int-acc-6',
    senderId: 'ghost-user',
    receiverId: 'user-23',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[22], // Amit Yadav
  },
  {
    id: 'int-acc-7',
    senderId: 'ghost-user',
    receiverId: 'user-24',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[23], // Rajesh Das
  },
  {
    id: 'int-acc-8',
    senderId: 'ghost-user',
    receiverId: 'user-25',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[24], // Vishal Mehta
  },
  {
    id: 'int-acc-9',
    senderId: 'ghost-user',
    receiverId: 'user-27',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[26], // Gurpreet Singh
  },
  {
    id: 'int-acc-10',
    senderId: 'ghost-user',
    receiverId: 'user-28',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[27], // Nikhil Agarwal
  },
  {
    id: 'int-acc-11',
    senderId: 'ghost-user',
    receiverId: 'user-42',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[41], // Anand Subramaniam
  },
  {
    id: 'int-acc-12',
    senderId: 'ghost-user',
    receiverId: 'user-43',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[42], // Hassan Rizvi
  },
  {
    id: 'int-acc-13',
    senderId: 'ghost-user',
    receiverId: 'user-46',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[45], // Harmanpreet Singh
  },
  {
    id: 'int-acc-14',
    senderId: 'ghost-user',
    receiverId: 'user-47',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[46], // Vikas Shekhawat
  },
  {
    id: 'int-acc-15',
    senderId: 'ghost-user',
    receiverId: 'user-49',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[48], // Asad Ali Khan
  },
  {
    id: 'int-acc-16',
    senderId: 'ghost-user',
    receiverId: 'user-52',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[51], // Rohit Jain
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // INTERESTS SENT by ghost user - PENDING (waiting for response)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-12',
    senderId: 'ghost-user',
    receiverId: 'user-23',
    status: 'PENDING',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[22], // Amit Yadav
  },
  {
    id: 'int-13',
    senderId: 'ghost-user',
    receiverId: 'user-25',
    status: 'PENDING',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    profile: mockProfiles[24], // Vishal Mehta
  },
  {
    id: 'int-14',
    senderId: 'ghost-user',
    receiverId: 'user-27',
    status: 'PENDING',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    profile: mockProfiles[26], // Gurpreet Singh
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // INTERESTS DECLINED
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-15',
    senderId: 'ghost-user',
    receiverId: 'user-26',
    status: 'DECLINED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[25], // Ravi Sheoran
  },
  {
    id: 'int-16',
    senderId: 'ghost-user',
    receiverId: 'user-20',
    status: 'DECLINED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[19], // Rohan Joshi
  },
  {
    id: 'int-17',
    senderId: 'user-22',
    receiverId: 'ghost-user',
    status: 'DECLINED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[21], // George Varghese
  },
  {
    id: 'int-18',
    senderId: 'user-28',
    receiverId: 'ghost-user',
    status: 'DECLINED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[27], // Nikhil Agarwal
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // SHORTLISTED PROFILES (by ghost user)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'int-19',
    senderId: 'ghost-user',
    receiverId: 'user-24',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[23], // Rajesh Das
  },
  {
    id: 'int-20',
    senderId: 'ghost-user',
    receiverId: 'user-30',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[29], // Suresh Naidu
  },
  {
    id: 'int-21',
    senderId: 'ghost-user',
    receiverId: 'user-49',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[48], // Vikas Shekhawat
  },
  {
    id: 'int-22',
    senderId: 'ghost-user',
    receiverId: 'user-50',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[49], // Asad Ali Khan
  },
  {
    id: 'int-23',
    senderId: 'ghost-user',
    receiverId: 'user-52',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[51], // Rohit Jain
  },
  {
    id: 'int-24',
    senderId: 'ghost-user',
    receiverId: 'user-46',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[45], // Prashant Desai
  },
  {
    id: 'int-25',
    senderId: 'ghost-user',
    receiverId: 'user-44',
    status: 'SHORTLISTED',
    type: 'SHORTLIST',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[43], // Karan Patel
  },
];

// ============================================================================
// DIVERSIFIED MOCK MESSAGES
// ============================================================================

export const mockMessages: MockMessage[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // Conversation with Vikram Singh (user-17) - Accepted match
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'msg-1',
    senderId: 'user-17',
    receiverId: 'ghost-user',
    content: 'Hi! Thank you for accepting my interest. How are you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'ghost-user',
    receiverId: 'user-17',
    content: 'Hi Vikram! I\'m doing well, thanks for asking. How about you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'user-17',
    receiverId: 'ghost-user',
    content: 'I\'m great! I see you\'re from Mumbai. I love the city! What do you enjoy doing in your free time?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-4',
    senderId: 'ghost-user',
    receiverId: 'user-17',
    content: 'Yes, Mumbai is beautiful! I love exploring new cafes, watching movies, and spending time with family. What about you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-5',
    senderId: 'user-17',
    receiverId: 'ghost-user',
    content: 'I enjoy playing cricket, traveling, and reading. Would love to know more about your family.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // Conversation with Vineeth George (user-45) - Accepted match
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'msg-6',
    senderId: 'user-45',
    receiverId: 'ghost-user',
    content: 'Hello! Thanks for accepting my interest. Looking forward to knowing you better!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-7',
    senderId: 'ghost-user',
    receiverId: 'user-45',
    content: 'Hi Vineeth! Nice to connect. How is your work going at Bangalore?',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-8',
    senderId: 'user-45',
    receiverId: 'ghost-user',
    content: 'It\'s going well! Being an engineering manager is challenging but rewarding. I love Bangalore\'s weather! Do you have any siblings?',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-9',
    senderId: 'ghost-user',
    receiverId: 'user-45',
    content: 'Yes, I have a younger brother who is studying engineering. What about your family?',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-10',
    senderId: 'user-45',
    receiverId: 'ghost-user',
    content: 'I have two sisters, both married. My parents live in Kerala. Would you be open to relocating?',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // Conversation with Srinivas Rao (user-51) - Accepted match (IAS Officer)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'msg-11',
    senderId: 'user-51',
    receiverId: 'ghost-user',
    content: 'Namaste! Thank you for connecting. It\'s wonderful to meet someone with similar interests.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-12',
    senderId: 'ghost-user',
    receiverId: 'user-51',
    content: 'Namaste Srinivas! It\'s great to connect. I\'ve always admired civil services. How do you find your work?',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-13',
    senderId: 'user-51',
    receiverId: 'ghost-user',
    content: 'Civil services is fulfilling - serving people directly. The work can be intense but meaningful. What are your career aspirations?',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-14',
    senderId: 'ghost-user',
    receiverId: 'user-51',
    content: 'I\'m passionate about product management and hope to lead innovative products someday. Balance between work and family is important to me.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-15',
    senderId: 'user-51',
    receiverId: 'ghost-user',
    content: 'That\'s wonderful! I completely agree about work-life balance. My current posting is in Vijayawada. Would you be open to moving to Andhra Pradesh?',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // Conversation with Arun Menon (user-48) - Accepted match (Doctor)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'msg-16',
    senderId: 'user-48',
    receiverId: 'ghost-user',
    content: 'Hi! Thank you for the interest. Your profile really stood out to me.',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-17',
    senderId: 'ghost-user',
    receiverId: 'user-48',
    content: 'Hi Arun! Thank you for accepting. I noticed you\'re a doctor. What specialty are you in?',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-18',
    senderId: 'user-48',
    receiverId: 'ghost-user',
    content: 'I\'m a general physician, planning to specialize in internal medicine. Being from Kerala, I love the backwaters. What places do you enjoy visiting?',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-19',
    senderId: 'ghost-user',
    receiverId: 'user-48',
    content: 'I love traveling too! Kerala is beautiful. I\'ve been to Munnar and Alleppey. Have you always lived in Kochi?',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-20',
    senderId: 'user-48',
    receiverId: 'ghost-user',
    content: 'Yes, I was born and raised in Kochi. My family has deep roots here. I\'m vegetarian and follow a healthy lifestyle. Are you vegetarian too?',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: 'msg-21',
    senderId: 'ghost-user',
    receiverId: 'user-48',
    content: 'I\'m vegetarian as well! Love trying different cuisines though. What do you enjoy doing on weekends?',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-22',
    senderId: 'user-48',
    receiverId: 'ghost-user',
    content: 'Weekends are for reading and catching up on sleep after busy hospital shifts! I also enjoy photography. Would love to share some photos sometime.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // ADDITIONAL CONVERSATIONS (16 more for ghost mode - 20 total)
  // ═══════════════════════════════════════════════════════════════════════
  
  // Conversation with Rahul Verma (user-16) - Investment Banker
  {
    id: 'msg-23',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    content: 'Hi! Thank you for accepting my interest. I\'m Rahul, an investment banker in Mumbai.',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-24',
    senderId: 'ghost-user',
    receiverId: 'user-16',
    content: 'Hi Rahul! Nice to connect. How do you find time for family with such a demanding career?',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-25',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    content: 'That\'s a great question! I prioritize family time on weekends. Looking for someone who understands work-life balance. What about you?',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Arjun Reddy (user-18) - Data Scientist
  {
    id: 'msg-26',
    senderId: 'user-18',
    receiverId: 'ghost-user',
    content: 'Hello! Excited to connect with you. I just returned from the US last year.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-27',
    senderId: 'ghost-user',
    receiverId: 'user-18',
    content: 'Hi Arjun! Welcome back! How are you finding Hyderabad compared to the US?',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-28',
    senderId: 'user-18',
    receiverId: 'ghost-user',
    content: 'Hyderabad has changed so much! The tech scene here is amazing. I miss some things about the US but being close to family is irreplaceable.',
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Karan Malhotra (user-19) - Surgeon
  {
    id: 'msg-29',
    senderId: 'user-19',
    receiverId: 'ghost-user',
    content: 'Hi there! As a surgeon, I don\'t get much free time, but I\'d love to get to know you better.',
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-30',
    senderId: 'ghost-user',
    receiverId: 'user-19',
    content: 'Hi Karan! A surgeon - that\'s impressive! What drew you to medicine?',
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-31',
    senderId: 'user-19',
    receiverId: 'ghost-user',
    content: 'My grandfather was a doctor. I grew up seeing how he helped people. It\'s demanding but fulfilling. What are your passions?',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  
  // Conversation with Imran Ahmed (user-21) - Pediatrician
  {
    id: 'msg-32',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    content: 'Assalamu Alaikum! Thank you for connecting. Working with children is my passion.',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-33',
    senderId: 'ghost-user',
    receiverId: 'user-21',
    content: 'Wa Alaikum Assalam Imran! A pediatrician must be so rewarding. What\'s the best part of your job?',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-34',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    content: 'Seeing children recover and smile - that\'s priceless! I also love playing cricket when I\'m free. Do you follow cricket?',
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with George Varghese (user-22) - Architect
  {
    id: 'msg-35',
    senderId: 'user-22',
    receiverId: 'ghost-user',
    content: 'Hello! As an architect, I appreciate design in everything - including relationships!',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-36',
    senderId: 'ghost-user',
    receiverId: 'user-22',
    content: 'Hi George! That\'s a beautiful perspective. What kind of buildings do you design?',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-37',
    senderId: 'user-22',
    receiverId: 'ghost-user',
    content: 'Mostly residential and some commercial projects. Kerala has such rich architectural heritage. I love blending traditional and modern styles.',
    createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Amit Yadav (user-23) - IAS Officer
  {
    id: 'msg-38',
    senderId: 'user-23',
    receiverId: 'ghost-user',
    content: 'Namaste! As an IAS officer, I believe in serving society. Looking for a partner with similar values.',
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-39',
    senderId: 'ghost-user',
    receiverId: 'user-23',
    content: 'Namaste Amit! Civil services is admirable. What inspired you to join?',
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-40',
    senderId: 'user-23',
    receiverId: 'ghost-user',
    content: 'I wanted to make a difference at the grassroots level. The work is challenging but meaningful. Family support is crucial in this career.',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  
  // Conversation with Rajesh Das (user-24) - CFO
  {
    id: 'msg-41',
    senderId: 'user-24',
    receiverId: 'ghost-user',
    content: 'Hi! I believe in second chances. Looking for someone who understands life\'s complexities.',
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-42',
    senderId: 'ghost-user',
    receiverId: 'user-24',
    content: 'Hi Rajesh, I appreciate your honesty. What do you enjoy doing outside of work?',
    createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-43',
    senderId: 'user-24',
    receiverId: 'ghost-user',
    content: 'I\'m a classical music enthusiast and love Bengali literature. Finding peace in art has been my journey. What brings you joy?',
    createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Vishal Mehta (user-25) - Business Owner
  {
    id: 'msg-44',
    senderId: 'user-25',
    receiverId: 'ghost-user',
    content: 'Jai Jinendra! I run our family textile business. Looking for someone who values tradition and family.',
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-45',
    senderId: 'ghost-user',
    receiverId: 'user-25',
    content: 'Jai Jinendra Vishal! Family businesses are special. What aspect of textiles do you enjoy most?',
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-46',
    senderId: 'user-25',
    receiverId: 'ghost-user',
    content: 'I love the creative side - designing new patterns and fabrics. Jain values keep me grounded. Are you spiritually inclined?',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Gurpreet Singh (user-27) - Doctor
  {
    id: 'msg-47',
    senderId: 'user-27',
    receiverId: 'ghost-user',
    content: 'Sat Sri Akal! I serve the community as a doctor in Amritsar. Faith and service guide my life.',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-48',
    senderId: 'ghost-user',
    receiverId: 'user-27',
    content: 'Sat Sri Akal Gurpreet! Amritsar is such a beautiful city. How do you balance faith and profession?',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-49',
    senderId: 'user-27',
    receiverId: 'ghost-user',
    content: 'Morning prayers at the Gurudwara give me strength. Medicine is my seva. Looking for a partner who shares these values.',
    createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Nikhil Agarwal (user-28) - CA
  {
    id: 'msg-50',
    senderId: 'user-28',
    receiverId: 'ghost-user',
    content: 'Hi! Numbers are my profession but relationships are built on trust. Looking forward to knowing you!',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-51',
    senderId: 'ghost-user',
    receiverId: 'user-28',
    content: 'Hi Nikhil! A CA from Jaipur - the Pink City! What do you love most about your city?',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-52',
    senderId: 'user-28',
    receiverId: 'ghost-user',
    content: 'Jaipur\'s heritage and warmth! The forts, the food, the culture. Would love to show you around someday. Do you enjoy traveling?',
    createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Anand Subramaniam (user-42) - Management Consultant
  {
    id: 'msg-53',
    senderId: 'user-42',
    receiverId: 'ghost-user',
    content: 'Vanakkam! As a management consultant, I solve problems. Looking for a partner to share life\'s journey.',
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-54',
    senderId: 'ghost-user',
    receiverId: 'user-42',
    content: 'Vanakkam Anand! Consulting sounds exciting. What\'s the most interesting project you\'ve worked on?',
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-55',
    senderId: 'user-42',
    receiverId: 'ghost-user',
    content: 'I helped a startup scale from 10 to 500 employees! I love Tamil culture and Carnatic music. What music do you enjoy?',
    createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Hassan Rizvi (user-43) - Doctor
  {
    id: 'msg-56',
    senderId: 'user-43',
    receiverId: 'ghost-user',
    content: 'Salaam! Medicine chose me. Being a doctor in Mumbai is both challenging and rewarding.',
    createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-57',
    senderId: 'ghost-user',
    receiverId: 'user-43',
    content: 'Salaam Hassan! Mumbai must be intense for a doctor. How do you unwind?',
    createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-58',
    senderId: 'user-43',
    receiverId: 'ghost-user',
    content: 'Poetry and long drives along Marine Drive! Urdu poetry has a special place in my heart. Do you like poetry?',
    createdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Harmanpreet Singh (user-46) - Business Owner
  {
    id: 'msg-59',
    senderId: 'user-46',
    receiverId: 'ghost-user',
    content: 'Sat Sri Akal! I run a successful auto parts business. Family and hard work define me.',
    createdAt: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-60',
    senderId: 'ghost-user',
    receiverId: 'user-46',
    content: 'Sat Sri Akal Harmanpreet! Being your own boss must be exciting. What\'s your vision for the future?',
    createdAt: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-61',
    senderId: 'user-46',
    receiverId: 'ghost-user',
    content: 'To expand across Punjab and create jobs for the community. Family comes first in Sikh values. Looking for someone who understands that.',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Vikas Shekhawat (user-47) - Government Officer
  {
    id: 'msg-62',
    senderId: 'user-47',
    receiverId: 'ghost-user',
    content: 'Namaste! I serve in the revenue department. Rajasthan\'s heritage is close to my heart.',
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-63',
    senderId: 'ghost-user',
    receiverId: 'user-47',
    content: 'Hi Vikas! Government service is noble. What aspect of your work do you find most fulfilling?',
    createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-64',
    senderId: 'user-47',
    receiverId: 'ghost-user',
    content: 'Helping farmers with land rights - it\'s about justice. I love exploring forts on weekends. Do you like history?',
    createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Asad Ali Khan (user-49) - Lawyer
  {
    id: 'msg-65',
    senderId: 'user-49',
    receiverId: 'ghost-user',
    content: 'Salaam! As a lawyer, I fight for justice. Looking for a partner who values integrity and family.',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-66',
    senderId: 'ghost-user',
    receiverId: 'user-49',
    content: 'Salaam Asad! Law must be fascinating. What kind of cases do you handle?',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-67',
    senderId: 'user-49',
    receiverId: 'ghost-user',
    content: 'Mostly civil and family law. Lucknow has such rich legal heritage! I also enjoy Urdu literature. What are your interests?',
    createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Rohit Jain (user-52) - Entrepreneur
  {
    id: 'msg-68',
    senderId: 'user-52',
    receiverId: 'ghost-user',
    content: 'Jai Jinendra! I\'ve built multiple businesses from scratch. Looking for a partner to share success with.',
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-69',
    senderId: 'ghost-user',
    receiverId: 'user-52',
    content: 'Jai Jinendra Rohit! Entrepreneurship is inspiring. What motivated you to start your own business?',
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-70',
    senderId: 'user-52',
    receiverId: 'ghost-user',
    content: 'Freedom to create and innovate! Jain principles guide my ethics. Indore is my base - would you be open to relocating?',
    createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
];

// ============================================================================
// GHOST USER PROFILE & PREFERENCES
// ============================================================================

export const ghostUserProfile = {
  id: 'ghost-profile',
  userId: 'ghost-user',
  name: 'Ghost User',
  gender: 'FEMALE' as const,
  age: 25,
  height: 165,
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  religion: 'Hindu',
  caste: 'Brahmin',
  motherTongue: 'Hindi',
  maritalStatus: 'NEVER_MARRIED',
  education: 'MBA',
  occupation: 'Product Manager',
  annualIncome: 1500000,
  bio: 'A software professional who loves technology and innovation. Looking for a partner who is understanding and supportive.',
  profileCompletion: 75,
  isPremium: false,
  isVerified: false, // Start as unverified - will be updated dynamically
  lastActive: new Date(),
  // Lifestyle tags
  lifestyleTags: ['Foodie', 'Bookworm', 'Non-Smoker', 'Tea over Coffee', 'Early Bird'] as LifestyleTag[],
  // Biodata fields
  birthDate: '1999-05-15',
  birthTime: '10:30 AM',
  birthPlace: 'Mumbai, Maharashtra',
  rashi: 'Vrishabha (Taurus)',
  nakshatra: 'Krittika',
  manglik: 'No' as const,
  gotra: 'Bharadwaj',
  fatherName: 'Rajesh Kumar',
  fatherOccupation: 'Businessman',
  motherName: 'Sunita Devi',
  motherOccupation: 'Homemaker',
  siblings: '1 Brother (Younger, Studying)',
  familyType: 'Nuclear' as const,
  familyStatus: 'Upper Middle' as const,
  aboutFamily: 'We are a close-knit family with traditional values and modern outlook.',
};

export const ghostPartnerPreferences = {
  minAge: 26,
  maxAge: 35,
  minHeight: 168,
  maxHeight: 185,
  religion: 'Hindu',
  education: 'Any Graduate',
  minIncome: 1000000,
  city: 'Mumbai',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function calculateCompatibility(profile: MockProfile, preferences: typeof ghostPartnerPreferences): number {
  let score = 50; // Base score
  
  // Age match (20 points)
  if (profile.age >= preferences.minAge && profile.age <= preferences.maxAge) {
    score += 20;
  } else {
    score -= 10;
  }
  
  // Height match (15 points)
  if (profile.height >= preferences.minHeight && profile.height <= preferences.maxHeight) {
    score += 15;
  }
  
  // Religion match (15 points)
  if (profile.religion === preferences.religion) {
    score += 15;
  }
  
  // Income match (10 points)
  if (profile.annualIncome && profile.annualIncome >= preferences.minIncome) {
    score += 10;
  }
  
  // Premium bonus
  if (profile.isPremium) {
    score += 5;
  }
  
  // Verified bonus
  if (profile.isVerified) {
    score += 5;
  }
  
  // Profile completion bonus
  score += Math.floor(profile.profileCompletion * 0.1);
  
  return Math.min(100, Math.max(0, score));
}

export function filterProfiles(
  profiles: MockProfile[],
  filters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    religion?: string;
    city?: string;
    minIncome?: number;
    motherTongue?: string;
    education?: string;
    maritalStatus?: string;
    caste?: string;
  }
): MockProfile[] {
  return profiles.filter((profile) => {
    if (filters.gender && profile.gender !== filters.gender) return false;
    if (filters.minAge && profile.age < filters.minAge) return false;
    if (filters.maxAge && profile.age > filters.maxAge) return false;
    if (filters.religion && profile.religion !== filters.religion) return false;
    if (filters.city && !profile.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.minIncome && (profile.annualIncome || 0) < filters.minIncome) return false;
    if (filters.motherTongue && profile.motherTongue !== filters.motherTongue) return false;
    if (filters.education && profile.education && !profile.education.toLowerCase().includes(filters.education.toLowerCase())) return false;
    if (filters.maritalStatus && profile.maritalStatus !== filters.maritalStatus) return false;
    if (filters.caste && profile.caste && !profile.caste.toLowerCase().includes(filters.caste.toLowerCase())) return false;
    return true;
  });
}

export function getMatchesForGhost(): (MockProfile & { compatibilityScore: number })[] {
  return mockProfiles
    .filter(p => p.gender !== ghostUserProfile.gender) // Opposite gender
    .map(profile => ({
      ...profile,
      compatibilityScore: calculateCompatibility(profile, ghostPartnerPreferences),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

// ============================================================================
// FILTER COVERAGE SUMMARY
// ============================================================================

/*
FILTER COVERAGE SUMMARY:

1. GENDER:
   - MALE: 15 profiles (user-16 to user-30)
   - FEMALE: 15 profiles (user-1 to user-15)

2. AGE RANGES:
   - 24-25: 6 profiles
   - 26-28: 11 profiles
   - 29-31: 9 profiles
   - 32-34: 4 profiles

3. RELIGIONS:
   - Hindu: 20 profiles (various castes)
   - Muslim: 3 profiles (Sunni, Shia)
   - Christian: 3 profiles (Catholic, Orthodox, Protestant)
   - Sikh: 3 profiles (Jat, Khatri)
   - Jain: 2 profiles (Digambar, Shwetambar)
   - Buddhist: 1 profile

4. CITIES:
   - Mumbai: 5 profiles
   - Delhi: 3 profiles
   - Bangalore: 4 profiles
   - Chennai: 2 profiles
   - Hyderabad: 5 profiles
   - Pune: 2 profiles
   - Kolkata: 2 profiles
   - Ahmedabad: 1 profile
   - Jaipur: 2 profiles
   - Kochi: 2 profiles
   - Chandigarh: 1 profile
   - Lucknow: 1 profile
   - Patna: 1 profile
   - Amritsar: 1 profile

5. MOTHER TONGUES:
   - Hindi: 10 profiles
   - Tamil: 3 profiles
   - Telugu: 4 profiles
   - Kannada: 2 profiles
   - Marathi: 3 profiles
   - Gujarati: 3 profiles
   - Punjabi: 3 profiles
   - Bengali: 2 profiles
   - Malayalam: 3 profiles
   - Urdu: 3 profiles

6. MARITAL STATUS:
   - NEVER_MARRIED: 27 profiles
   - DIVORCED: 2 profiles (Lakshmi Reddy, Rajesh Das)
   - WIDOWED: 1 profile (Suresh Naidu)

7. INCOME RANGES:
   - ₹5-10 LPA: 9 profiles
   - ₹10-15 LPA: 7 profiles
   - ₹15-20 LPA: 5 profiles
   - ₹20-30 LPA: 5 profiles
   - ₹30-45 LPA: 4 profiles

8. CASTES (Hindu):
   - Brahmin, Kshatriya, Aggarwal, Patel, Iyer, Nair, Reddy, 
   - Lingayat, Maratha, Kayastha, Rajput, Yadav, Jat, Agarwal, Naidu

9. EDUCATION:
   - MBA, B.Tech, MBBS, MD, CA, MS, BSc, BA, PhD, LLB, M.Tech, IAS, BBA
*/
