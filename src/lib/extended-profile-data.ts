// Extended Profile Data for Detailed Profile View
// Contains additional fields for astrology, family, lifestyle, personality

export interface ExtendedProfileData {
  // Lifestyle
  weight?: number;
  diet: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Eggetarian';
  drinking: 'Never' | 'Occasionally' | 'Socially';
  smoking: 'Never' | 'Occasionally' | 'Regularly';
  bloodGroup?: string;
  
  // Astrology (Indian)
  gothra?: string;
  rashi?: string;
  nakshatra?: string;
  manglik: 'Yes' | 'No' | 'Anshik' | 'Dont Know';
  birthTime?: string;
  birthPlace?: string;
  
  // Family
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: { brothers: number; sisters: number; marriedBrothers: number; marriedSisters: number };
  familyType: 'Nuclear' | 'Joint';
  familyValues: 'Traditional' | 'Moderate' | 'Liberal';
  familyStatus: 'Middle Class' | 'Upper Middle' | 'Rich' | 'Affluent';
  
  // Career
  college?: string;
  company?: string;
  
  // Personality & Interests
  personalityType?: string; // MBTI
  loveLanguage?: string;
  hobbies?: string[];
  interests?: string[];
  
  // Voice Note
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  
  // Partner Preferences
  partnerPreferences: {
    minAge: number;
    maxAge: number;
    minHeight: number;
    maxHeight: number;
    religions: string[];
    education: string[];
    minIncome: number;
    locations: string[];
    maritalStatus: string[];
    diet?: string[];
    manglik?: string;
  };
  
  // Verifications
  verifications: {
    aadhaar: boolean;
    linkedin: boolean;
    selfieVideo: boolean;
    phone: boolean;
    email: boolean;
    income: boolean;
  };
}

// Generate extended data for a profile based on userId
export function getExtendedProfileData(userId: string): ExtendedProfileData {
  const extendedDataMap: Record<string, ExtendedProfileData> = {
    // Female profiles
    'user-1': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'O+',
      gothra: 'Kashyap',
      rashi: 'Makar (Capricorn)',
      nakshatra: 'Uttarashada',
      manglik: 'No',
      birthTime: '10:30 AM',
      birthPlace: 'Mumbai',
      fatherOccupation: 'Retired Government Officer',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 1, sisters: 0, marriedBrothers: 0, marriedSisters: 0 },
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      familyStatus: 'Upper Middle',
      college: 'IIM Bangalore',
      company: 'Google India',
      personalityType: 'ENFJ',
      loveLanguage: 'Quality Time',
      hobbies: ['Reading', 'Traveling', 'Cooking', 'Yoga'],
      interests: ['Photography', 'Music', 'Fitness'],
      partnerPreferences: {
        minAge: 27, maxAge: 32, minHeight: 170, maxHeight: 185,
        religions: ['Hindu'], education: ['MBA', 'B.Tech', 'CA', 'MBBS'],
        minIncome: 1500000, locations: ['Mumbai', 'Pune', 'Bangalore'],
        maritalStatus: ['NEVER_MARRIED'], diet: ['Vegetarian']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-2': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'B+',
      gothra: 'Patel',
      rashi: 'Kanya (Virgo)',
      nakshatra: 'Hasta',
      manglik: 'No',
      birthTime: '3:45 PM',
      birthPlace: 'Delhi',
      fatherOccupation: 'Business Owner',
      motherOccupation: 'Teacher',
      siblings: { brothers: 0, sisters: 1, marriedBrothers: 0, marriedSisters: 0 },
      familyType: 'Joint',
      familyValues: 'Traditional',
      familyStatus: 'Rich',
      college: 'IIT Delhi',
      company: 'Microsoft',
      personalityType: 'INTJ',
      loveLanguage: 'Words of Affirmation',
      hobbies: ['Coding', 'Dancing', 'Reading'],
      interests: ['Technology', 'Finance', 'Startups'],
      partnerPreferences: {
        minAge: 25, maxAge: 30, minHeight: 168, maxHeight: 182,
        religions: ['Hindu'], education: ['B.Tech', 'MBA', 'MS'],
        minIncome: 1200000, locations: ['Delhi', 'Bangalore', 'Mumbai'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: false, phone: true, email: true, income: false }
    },
    
    'user-3': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'A+',
      gothra: 'Aggarwal',
      rashi: 'Vrishabh (Taurus)',
      nakshatra: 'Rohini',
      manglik: 'No',
      birthTime: '7:00 AM',
      birthPlace: 'Bangalore',
      fatherOccupation: 'Doctor',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 1, sisters: 1, marriedBrothers: 1, marriedSisters: 0 },
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      familyStatus: 'Upper Middle',
      college: 'AIIMS Delhi',
      company: 'Apollo Hospital',
      personalityType: 'INFJ',
      loveLanguage: 'Acts of Service',
      hobbies: ['Dancing', 'Reading', 'Cooking'],
      interests: ['Healthcare', 'Music', 'Travel'],
      partnerPreferences: {
        minAge: 28, maxAge: 34, minHeight: 170, maxHeight: 185,
        religions: ['Hindu'], education: ['MBBS', 'MD', 'MS', 'MBA'],
        minIncome: 2000000, locations: ['Bangalore', 'Mumbai', 'Delhi'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-4': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'AB+',
      gothra: 'Iyer',
      rashi: 'Mithuna (Gemini)',
      nakshatra: 'Mrigashira',
      manglik: 'No',
      birthTime: '11:15 AM',
      birthPlace: 'Chennai',
      fatherOccupation: 'Bank Manager',
      motherOccupation: 'School Principal',
      siblings: { brothers: 0, sisters: 1, marriedBrothers: 0, marriedSisters: 1 },
      familyType: 'Nuclear',
      familyValues: 'Traditional',
      familyStatus: 'Middle Class',
      college: 'SRCC Delhi',
      company: 'Deloitte',
      personalityType: 'ISTJ',
      loveLanguage: 'Quality Time',
      hobbies: ['Carnatic Music', 'Reading', 'Yoga'],
      interests: ['Finance', 'Classical Arts'],
      partnerPreferences: {
        minAge: 26, maxAge: 32, minHeight: 168, maxHeight: 180,
        religions: ['Hindu'], education: ['CA', 'MBA', 'B.Tech'],
        minIncome: 1000000, locations: ['Chennai', 'Bangalore'],
        maritalStatus: ['NEVER_MARRIED'], manglik: 'No'
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-5': {
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Never',
      bloodGroup: 'O+',
      gothra: 'Maratha',
      rashi: 'Simha (Leo)',
      nakshatra: 'Magha',
      manglik: 'Anshik',
      birthTime: '2:30 PM',
      birthPlace: 'Pune',
      fatherOccupation: 'Business Owner',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 2, sisters: 0, marriedBrothers: 1, marriedSisters: 0 },
      familyType: 'Joint',
      familyValues: 'Moderate',
      familyStatus: 'Upper Middle',
      college: 'Symbiosis Pune',
      company: 'Infosys',
      personalityType: 'ESFJ',
      loveLanguage: 'Gifts',
      hobbies: ['Cooking', 'Traveling', 'Photography'],
      interests: ['Art', 'Culture', 'Food'],
      partnerPreferences: {
        minAge: 27, maxAge: 32, minHeight: 170, maxHeight: 185,
        religions: ['Hindu'], education: ['MBA', 'B.Tech', 'MBBS'],
        minIncome: 1200000, locations: ['Pune', 'Mumbai'],
        maritalStatus: ['NEVER_MARRIED', 'DIVORCED']
      },
      verifications: { aadhaar: true, linkedin: false, selfieVideo: false, phone: true, email: true, income: false }
    },
    
    'user-6': {
      diet: 'Non-Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'B+',
      rashi: 'Karka (Cancer)',
      nakshatra: 'Pushya',
      manglik: 'No',
      birthTime: '6:00 AM',
      birthPlace: 'Hyderabad',
      fatherOccupation: 'Government Employee',
      motherOccupation: 'Teacher',
      siblings: { brothers: 2, sisters: 1, marriedBrothers: 1, marriedSisters: 1 },
      familyType: 'Joint',
      familyValues: 'Traditional',
      familyStatus: 'Middle Class',
      college: 'Deccan College Hyderabad',
      company: 'Private Dental Clinic',
      personalityType: 'ISFJ',
      loveLanguage: 'Acts of Service',
      hobbies: ['Poetry', 'Painting', 'Reading'],
      interests: ['Art', 'Literature', 'Social Work'],
      partnerPreferences: {
        minAge: 26, maxAge: 32, minHeight: 165, maxHeight: 180,
        religions: ['Muslim'], education: ['MBBS', 'BDS', 'B.Tech', 'MBA'],
        minIncome: 1000000, locations: ['Hyderabad', 'Bangalore'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    // Male profiles
    'user-16': {
      diet: 'Vegetarian',
      drinking: 'Socially',
      smoking: 'Never',
      bloodGroup: 'O+',
      gothra: 'Kashyap',
      rashi: 'Dhanu (Sagittarius)',
      nakshatra: 'Uttarashada',
      manglik: 'No',
      birthTime: '9:00 PM',
      birthPlace: 'Mumbai',
      fatherOccupation: 'Business Owner',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 0, sisters: 1, marriedBrothers: 0, marriedSisters: 1 },
      familyType: 'Nuclear',
      familyValues: 'Liberal',
      familyStatus: 'Rich',
      college: 'IIM Ahmedabad',
      company: 'Goldman Sachs',
      personalityType: 'ENTJ',
      loveLanguage: 'Quality Time',
      hobbies: ['Sports', 'Music', 'Traveling'],
      interests: ['Finance', 'Startups', 'Golf'],
      partnerPreferences: {
        minAge: 24, maxAge: 28, minHeight: 155, maxHeight: 170,
        religions: ['Hindu'], education: ['MBA', 'MBBS', 'B.Tech', 'CA'],
        minIncome: 0, locations: ['Mumbai', 'Delhi', 'Bangalore'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-17': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'B+',
      gothra: 'Sidhu',
      rashi: 'Makar (Capricorn)',
      nakshatra: 'Shravana',
      manglik: 'No',
      birthTime: '4:30 AM',
      birthPlace: 'Amritsar',
      fatherOccupation: 'Retired Army Officer',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 1, sisters: 0, marriedBrothers: 0, marriedSisters: 0 },
      familyType: 'Nuclear',
      familyValues: 'Traditional',
      familyStatus: 'Upper Middle',
      college: 'IIT Delhi',
      company: 'Google',
      personalityType: 'INTP',
      loveLanguage: 'Words of Affirmation',
      hobbies: ['Cricket', 'Reading', 'Coding'],
      interests: ['Technology', 'AI', 'Startups'],
      partnerPreferences: {
        minAge: 25, maxAge: 30, minHeight: 158, maxHeight: 170,
        religions: ['Sikh', 'Hindu'], education: ['B.Tech', 'MBA', 'MBBS'],
        minIncome: 500000, locations: ['Delhi', 'Bangalore', 'Mumbai'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: false, phone: true, email: true, income: true }
    },
    
    'user-18': {
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Occasionally',
      bloodGroup: 'A+',
      gothra: 'Reddy',
      rashi: 'Vrishchika (Scorpio)',
      nakshatra: 'Anuradha',
      manglik: 'No',
      birthTime: '8:15 PM',
      birthPlace: 'Hyderabad',
      fatherOccupation: 'Doctor',
      motherOccupation: 'Professor',
      siblings: { brothers: 1, sisters: 0, marriedBrothers: 0, marriedSisters: 0 },
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      familyStatus: 'Affluent',
      college: 'Stanford University (MS)',
      company: 'Amazon',
      personalityType: 'ENTP',
      loveLanguage: 'Physical Touch',
      hobbies: ['Movies', 'Cricket', 'Traveling'],
      interests: ['Data Science', 'Photography', 'Travel'],
      partnerPreferences: {
        minAge: 24, maxAge: 28, minHeight: 155, maxHeight: 168,
        religions: ['Hindu'], education: ['B.Tech', 'MBA', 'MS', 'MBBS'],
        minIncome: 0, locations: ['Hyderabad', 'Bangalore', 'USA'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-19': {
      diet: 'Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'O-',
      gothra: 'Bharadwaj',
      rashi: 'Kumbha (Aquarius)',
      nakshatra: 'Dhanishta',
      manglik: 'No',
      birthTime: '12:45 PM',
      birthPlace: 'Mumbai',
      fatherOccupation: 'CA',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 0, sisters: 2, marriedBrothers: 0, marriedSisters: 2 },
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      familyStatus: 'Upper Middle',
      college: 'KEM Hospital Mumbai',
      company: 'Fortis Hospital',
      personalityType: 'ISFJ',
      loveLanguage: 'Acts of Service',
      hobbies: ['Music', 'Reading', 'Meditation'],
      interests: ['Healthcare', 'Music', 'Spirituality'],
      partnerPreferences: {
        minAge: 25, maxAge: 30, minHeight: 155, maxHeight: 168,
        religions: ['Hindu'], education: ['MBBS', 'BDS', 'MBA', 'CA'],
        minIncome: 0, locations: ['Mumbai', 'Pune'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
    
    'user-21': {
      diet: 'Non-Vegetarian',
      drinking: 'Never',
      smoking: 'Never',
      bloodGroup: 'B+',
      rashi: 'Meena (Pisces)',
      nakshatra: 'Revati',
      manglik: 'No',
      birthTime: '5:30 AM',
      birthPlace: 'Hyderabad',
      fatherOccupation: 'Business Owner',
      motherOccupation: 'Homemaker',
      siblings: { brothers: 0, sisters: 2, marriedBrothers: 0, marriedSisters: 2 },
      familyType: 'Joint',
      familyValues: 'Traditional',
      familyStatus: 'Rich',
      college: 'Osmania Medical College',
      company: 'Sunshine Hospital',
      personalityType: 'ENFP',
      loveLanguage: 'Quality Time',
      hobbies: ['Cricket', 'Reading', 'Social Work'],
      interests: ['Child Healthcare', 'Community Service'],
      partnerPreferences: {
        minAge: 24, maxAge: 29, minHeight: 155, maxHeight: 165,
        religions: ['Muslim'], education: ['MBBS', 'BDS', 'B.Tech', 'MBA'],
        minIncome: 0, locations: ['Hyderabad', 'Bangalore'],
        maritalStatus: ['NEVER_MARRIED']
      },
      verifications: { aadhaar: true, linkedin: true, selfieVideo: true, phone: true, email: true, income: true }
    },
  };
  
  // Return extended data or generate default
  return extendedDataMap[userId] || generateDefaultExtendedData(userId);
}

function generateDefaultExtendedData(userId: string): ExtendedProfileData {
  const diets: ExtendedProfileData['diet'][] = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian'];
  const familyTypes: ExtendedProfileData['familyType'][] = ['Nuclear', 'Joint'];
  const familyValues: ExtendedProfileData['familyValues'][] = ['Traditional', 'Moderate', 'Liberal'];
  const manglikOptions: ExtendedProfileData['manglik'][] = ['Yes', 'No', 'Anshik', 'Dont Know'];
  const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
  const loveLanguages = ['Quality Time', 'Words of Affirmation', 'Acts of Service', 'Gifts', 'Physical Touch'];
  const rashis = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
  
  const seed = parseInt(userId.replace('user-', '')) || 1;
  
  return {
    diet: diets[seed % diets.length],
    drinking: seed % 3 === 0 ? 'Socially' : 'Never',
    smoking: 'Never',
    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'][seed % 7],
    rashi: rashis[seed % 12],
    nakshatra: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira'][seed % 5],
    manglik: manglikOptions[seed % 4],
    fatherOccupation: ['Business Owner', 'Government Employee', 'Private Sector', 'Professional'][seed % 4],
    motherOccupation: ['Homemaker', 'Teacher', 'Government Employee', 'Professional'][seed % 4],
    siblings: { brothers: seed % 3, sisters: seed % 2, marriedBrothers: 0, marriedSisters: 0 },
    familyType: familyTypes[seed % 2],
    familyValues: familyValues[seed % 3],
    familyStatus: 'Upper Middle',
    personalityType: mbtiTypes[seed % 16],
    loveLanguage: loveLanguages[seed % 5],
    hobbies: ['Reading', 'Traveling', 'Music', 'Cooking', 'Sports'].slice(0, 3),
    interests: ['Technology', 'Finance', 'Arts', 'Sports', 'Travel'].slice(0, 2),
    partnerPreferences: {
      minAge: 24, maxAge: 32, minHeight: 155, maxHeight: 180,
      religions: ['Hindu', 'Muslim', 'Christian', 'Sikh'],
      education: ['B.Tech', 'MBA', 'MBBS', 'CA'],
      minIncome: 500000,
      locations: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
      maritalStatus: ['NEVER_MARRIED']
    },
    verifications: {
      aadhaar: seed % 2 === 0,
      linkedin: seed % 3 === 0,
      selfieVideo: seed % 4 === 0,
      phone: true,
      email: true,
      income: seed % 2 === 0
    }
  };
}

// Icebreaker prompts generator
export function generateIcebreakers(name: string, profile: { occupation?: string; city?: string; education?: string; hobbies?: string[] }): string[] {
  const prompts: string[] = [];
  
  if (profile.occupation) {
    prompts.push(`Ask ${name} about their experience as a ${profile.occupation}`);
  }
  if (profile.city) {
    prompts.push(`Find out what ${name} loves most about ${profile.city}`);
  }
  if (profile.education) {
    prompts.push(`Ask ${name} about their ${profile.education} journey`);
  }
  if (profile.hobbies && profile.hobbies.length > 0) {
    prompts.push(`Discover ${name}'s passion for ${profile.hobbies[0]}`);
  }
  
  prompts.push(`Ask ${name} about their favorite travel destination`);
  prompts.push(`Find out what ${name} does on weekends`);
  
  return prompts;
}
