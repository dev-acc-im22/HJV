// Shared Types for Happy Jodi Vibes

// Page type for navigation
export type Page = 
  | "home" 
  | "login" 
  | "register" 
  | "dashboard" 
  | "search" 
  | "matches" 
  | "messages" 
  | "interests" 
  | "profile" 
  | "settings"
  | "profile-view";

// Success Story type
export interface SuccessStory {
  id: number;
  names: string;
  location: string;
  story: string;
  married: string;
}

// Trust Badge type
export interface TrustBadge {
  icon: React.ElementType;
  title: string;
  desc: string;
}

// Search Form type
export interface SearchForm {
  profileFor: string;
  gender: string;
  age: string;
  city: string;
  religion: string;
  motherTongue: string;
}
