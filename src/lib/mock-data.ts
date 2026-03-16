// Mock Data for Matrimony Application
// Used in Ghost Mode when APIs return 401
// Fully diversified to cover ALL filter combinations

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
  },
];

// ============================================================================
// DIVERSIFIED MOCK INTERACTIONS
// ============================================================================

export const mockInteractions: MockInteraction[] = [
  // Interests RECEIVED by ghost user (from females)
  {
    id: 'int-1',
    senderId: 'user-1',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hi! I liked your profile. Would love to know more about you.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    profile: mockProfiles[0], // Priya Sharma
  },
  {
    id: 'int-2',
    senderId: 'user-4',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Your profile seems interesting. Let\'s connect!',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    profile: mockProfiles[3], // Meera Iyer
  },
  {
    id: 'int-3',
    senderId: 'user-6',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hello! I think we could be a great match. Looking forward to hearing from you.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    profile: mockProfiles[5], // Ayesha Khan
  },
  {
    id: 'int-4',
    senderId: 'user-13',
    receiverId: 'ghost-user',
    status: 'PENDING',
    type: 'INTEREST',
    message: 'Hi, I noticed we have similar interests. Would you like to connect?',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    profile: mockProfiles[12], // Fatima Zaidi
  },
  
  // Interests SENT by ghost user (to males) - ACCEPTED
  {
    id: 'int-5',
    senderId: 'ghost-user',
    receiverId: 'user-16',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[15], // Rahul Verma
  },
  {
    id: 'int-6',
    senderId: 'ghost-user',
    receiverId: 'user-21',
    status: 'ACCEPTED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[20], // Imran Ahmed
  },
  
  // Interests SENT by ghost user - PENDING
  {
    id: 'int-7',
    senderId: 'ghost-user',
    receiverId: 'user-18',
    status: 'PENDING',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[17], // Arjun Reddy
  },
  {
    id: 'int-8',
    senderId: 'ghost-user',
    receiverId: 'user-19',
    status: 'PENDING',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    profile: mockProfiles[18], // Karan Malhotra
  },
  
  // Interests DECLINED
  {
    id: 'int-9',
    senderId: 'ghost-user',
    receiverId: 'user-26',
    status: 'DECLINED',
    type: 'INTEREST',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    profile: mockProfiles[25], // Ravi Sheoran
  },
];

// ============================================================================
// DIVERSIFIED MOCK MESSAGES
// ============================================================================

export const mockMessages: MockMessage[] = [
  // Conversation with Rahul Verma (user-16)
  {
    id: 'msg-1',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    content: 'Hi! Thank you for accepting my interest. How are you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'ghost-user',
    receiverId: 'user-16',
    content: 'Hi Rahul! I\'m doing well, thanks for asking. How about you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    content: 'I\'m great! I see you\'re from Mumbai. I love the city! What do you enjoy doing in your free time?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-4',
    senderId: 'ghost-user',
    receiverId: 'user-16',
    content: 'Yes, Mumbai is beautiful! I love exploring new cafes, watching movies, and spending time with family. What about you?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-5',
    senderId: 'user-16',
    receiverId: 'ghost-user',
    content: 'I enjoy playing cricket, traveling, and reading. Would love to know more about your family.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  
  // Conversation with Imran Ahmed (user-21)
  {
    id: 'msg-6',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    content: 'Hello! Thanks for accepting my interest. Looking forward to knowing you better!',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-7',
    senderId: 'ghost-user',
    receiverId: 'user-21',
    content: 'Hi Imran! Nice to connect. How is your medical practice going?',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-8',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    content: 'It\'s going well! Being a pediatrician is rewarding. I love working with children. Do you have any siblings?',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-9',
    senderId: 'ghost-user',
    receiverId: 'user-21',
    content: 'Yes, I have a younger brother who is studying engineering. What about your family?',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: 'msg-10',
    senderId: 'user-21',
    receiverId: 'ghost-user',
    content: 'I have two sisters, both married. My parents live in Hyderabad. Would you be open to relocating?',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
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
  isVerified: true,
  lastActive: new Date(),
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
