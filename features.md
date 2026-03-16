# Shaadi - Matrimony Platform Features

## 📋 Overview

Shaadi is a production-ready matrimony platform built with modern web technologies, featuring AI-powered matchmaking, real-time communication, and a comprehensive profile system.

---

## 🎯 Core Features

### 1. User Authentication & Onboarding

#### Registration
- **Multi-step Registration Wizard** (3 steps)
  - Step 1: Email/Phone + Password creation
  - Step 2: OTP Verification (Email/Phone)
  - Step 3: Profile completion with basic details
- **Social Login** (Planned: Google, Facebook)
- **Phone-based Registration** with OTP verification
- **Email Verification** with 6-digit OTP
- **Dev Mode OTP Display** for testing

#### Authentication
- **NextAuth.js Integration** with Credentials Provider
- **JWT-based Sessions** with configurable expiry
- **Secure Password Hashing** (bcryptjs)
- **Remember Me** functionality
- **Password Reset** via OTP
- **Session Management** with active session tracking

#### User Roles
- **USER** - Standard platform users
- **ADMIN** - Full administrative access
- **MODERATOR** - Content moderation capabilities

---

### 2. Profile Management

#### Basic Profile
- Personal information (Name, Gender, DOB, Height)
- Marital status (Never Married, Divorced, Widowed)
- Religion & Caste information
- Mother tongue
- Location (Country, State, City)
- Bio/About section
- Profile photo with multiple uploads

#### Extended Profile Sections

##### Education & Career
- Highest degree/education
- College/University
- Field of study
- Employment type (Government, Private, Business, etc.)
- Occupation
- Organization name
- Annual income
- Work location

##### Family Details
- Family type (Joint/Nuclear)
- Family status (Rich, Upper Middle, Middle, etc.)
- Family values (Traditional, Moderate, Liberal)
- Father's occupation
- Mother's occupation
- Siblings information
- Family location
- About family

##### Horoscope
- Rashi (Moon Sign)
- Nakshatra
- Manglik status
- Birth time & place
- Horoscope document upload

#### Profile Completion
- **Progress Tracking** with percentage completion
- **Guided Completion** with suggestions
- **Badge System** for completed profiles

---

### 3. Partner Preferences

#### Preference Settings
- **Age Range** (Min/Max)
- **Height Range** (Min/Max in cm)
- **Marital Status Preferences**
- **Religion & Caste Preferences**
- **Education Requirements**
- **Occupation Preferences**
- **Income Range**
- **Location Preferences**
- **Physical Attributes**
- **Partner Description** (Free text)

---

### 4. Search & Discovery

#### Advanced Search
- **Faceted Search** with multiple filters:
  - Gender
  - Age Range
  - Religion
  - Location (City)
  - Marital Status
- **Pagination** support
- **Grid/List View** toggle
- **Real-time Results** count

#### Search Filters
- Gender (Bride/Groom)
- Age range filtering
- Religion-based filtering
- City/location search
- Saved searches (Premium)

---

### 5. AI-Powered Matchmaking

#### Two-Way Match Algorithm
- **Compatibility Score** (0-100%)
- **Bidirectional Preference Matching**
  - User's preferences vs. Profile attributes
  - Profile's preferences vs. User's attributes
- **Weighted Scoring System**
  - Age compatibility
  - Height match
  - Location proximity
  - Education alignment
  - Income compatibility
  - Religion/Caste match

#### Match Features
- Minimum compatibility score filter
- Match recommendations
- Daily match updates
- Mutual match highlights

---

### 6. Interactions System

#### Interest Management
- **Send Interest** with optional message
- **Accept/Decline** received interests
- **Interest Status Tracking**:
  - Pending
  - Accepted
  - Declined
  - Shortlisted

#### Shortlist Feature
- Add profiles to shortlist
- Quick access to saved profiles
- Shortlist management

#### Block Users
- Block/unblock profiles
- Hidden from search results when blocked

---

### 7. Real-Time Messaging

#### Chat System
- **Socket.io Integration** (Port 3003)
- **Real-time Message Delivery**
- **Message Status**:
  - Sent
  - Delivered
  - Read
- **Typing Indicators**
- **Online Status**

#### Chat Features
- Chat only with **accepted matches**
- Message history
- Unread message count
- Conversation list

---

### 8. Media Management

#### Photo Upload
- Multiple photo uploads
- Primary photo selection
- Photo blurring option
- Privacy levels:
  - Public
  - Registered Users
  - Paid Members
  - Accepted Matches
  - Private

#### Media Approval
- Admin approval workflow
- Approval status tracking
- Rejection with reasons

---

### 9. Premium Membership

#### Subscription Plans
| Plan | Duration | Features |
|------|----------|----------|
| FREE | - | Basic search, Limited interests |
| BASIC | 1 Month | Extended search, More interests |
| PREMIUM | 3 Months | Full access, Priority support |
| VIP | 6 Months | All features, Verified badge |

#### Premium Features
- Unlimited profile views
- Priority in search results
- Advanced filters
- See who viewed your profile
- Contact details visibility
- Verified badge

---

### 10. Notification System

#### Notification Types
- New interest received
- Interest accepted/declined
- New messages
- Profile views
- Photo requests
- Premium expiring
- System notifications

#### Notification Management
- Real-time notifications
- Mark as read
- Notification badge count
- Email notifications (Planned)

---

### 11. Admin Dashboard

#### User Management
- View all users
- User status management
- Account suspension/ban
- Profile verification

#### Media Moderation
- Pending media queue
- Approve/Reject photos
- Bulk actions

#### Reports Management
- User reports review
- Action taking
- Resolution tracking

---

### 12. Ghost Mode (Testing)

#### Admin Testing Features
- **Bypass Authentication** for testing
- Full dashboard access without login
- Test all features as "Ghost User"
- Toggle from navbar

---

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Maroon gradient theme
  - Primary: `#880E4F` → `#AD1457` → `#C2185B`
  - Accent: Baby Pink (`#FCE4EC`, `#F8BBD9`)
- **Typography**: Montserrat font family
- **Components**: shadcn/ui (New York style)

### Responsive Design
- Mobile-first approach
- Tablet & Desktop optimized
- Touch-friendly interactions

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

### Animations
- Smooth page transitions
- Hover effects
- Loading states
- Success/error feedback

---

## 🔒 Security Features

### Data Protection
- Password hashing (bcrypt)
- JWT token authentication
- Session management
- CSRF protection

### Privacy Controls
- Photo privacy levels
- Contact info visibility
- Profile visibility settings
- Block functionality

### Verification
- Email verification
- Phone verification (OTP)
- Profile photo verification
- Admin verification badges

---

## 📊 Analytics & Tracking

### User Metrics
- Profile views
- Search appearances
- Interest received/sent
- Match statistics

### Platform Analytics
- Active users
- Successful matches
- Premium conversions
- Report statistics

---

## 🚀 Upcoming Features

### Phase 2
- [ ] Video profiles
- [ ] Voice introductions
- [ ] Horoscope matching algorithm
- [ ] Video calling
- [ ] Success stories submission

### Phase 3
- [ ] Mobile app (React Native)
- [ ] AI chatbot assistance
- [ ] Matchmaking events
- [ ] Verified profile badges
- [ ] Background verification

---

## 📅 Last Updated

**Date**: March 2024  
**Version**: 0.2.0  
**Status**: Active Development

---

## 📝 Changelog

### v0.2.0 (Current)
- ✅ Maroon gradient icon system
- ✅ Lucide React icons integration
- ✅ Enhanced UI components
- ✅ Ghost mode for testing

### v0.1.0
- ✅ Initial release
- ✅ Core authentication
- ✅ Profile management
- ✅ Search functionality
- ✅ Match algorithm
- ✅ Real-time chat
