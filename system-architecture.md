# Shaadi - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js 16 App Router (SSR/CSR)                   │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │  Home   │  │ Search  │  │ Matches │  │  Chat   │  │ Profile │    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js API Routes (REST)                         │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │  /auth   │ │ /profile │ │ /search  │ │ /matches │ │/interact │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │    │
│  │  │/messages │ │ /upload  │ │ /premium │ │  /admin  │               │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌─────────────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│     DATA LAYER          │ │  AUTH LAYER     │ │   REAL-TIME LAYER       │
│  ┌─────────────────┐    │ │ ┌─────────────┐ │ │  ┌─────────────────┐    │
│  │   Prisma ORM    │    │ │ │ NextAuth.js │ │ │  │   Socket.io     │    │
│  │  ┌───────────┐  │    │ │ │  (JWT)      │ │ │  │   (Port 3003)   │    │
│  │  │  SQLite   │  │    │ │ └─────────────┘ │ │  │  ┌───────────┐  │    │
│  │  │ Database  │  │    │ │                 │ │  │  │  Chat     │  │    │
│  │  └───────────┘  │    │ │ ┌─────────────┐ │ │  │  │  Service  │  │    │
│  └─────────────────┘    │ │ │  bcryptjs   │ │ │  │  └───────────┘  │    │
└─────────────────────────┘ │ └─────────────┘ │ │  └─────────────────┘    │
                            └─────────────────┘ └─────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component library |
| Lucide React | 0.525.x | Icon library |
| Framer Motion | 12.x | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 16.1.x | REST API endpoints |
| Prisma ORM | 6.11.x | Database ORM |
| NextAuth.js | 4.24.x | Authentication |
| Socket.io | 4.8.x | Real-time communication |
| Zod | 4.x | Input validation |
| bcryptjs | 3.x | Password hashing |
| jsonwebtoken | 9.x | JWT tokens |

### Database
| Technology | Purpose |
|------------|---------|
| SQLite | Development database |
| Prisma Client | Database client |

### Development Tools
| Tool | Purpose |
|------|---------|
| Bun | Runtime & package manager |
| ESLint | Code linting |
| TypeScript | Static typing |

---

## 📁 Project Structure

```
my-project/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── verify-otp/route.ts
│   │   │   │   ├── resend-otp/route.ts
│   │   │   │   └── token/route.ts
│   │   │   ├── profile/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── matches/route.ts
│   │   │   ├── interactions/route.ts
│   │   │   ├── messages/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── premium/route.ts
│   │   │   └── admin/
│   │   │       ├── users/route.ts
│   │   │       ├── media/route.ts
│   │   │       └── reports/route.ts
│   │   ├── globals.css        # Global styles
│   │   └── page.tsx           # Main SPA page
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client
│       ├── validations.ts     # Zod schemas
│       ├── jwt.ts             # JWT utilities
│       └── mock-data.ts       # Mock data for development
├── mini-services/
│   └── chat-service/
│       └── index.ts           # Socket.io server (Port 3003)
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User   │     │  Frontend   │     │  API Route  │     │  Database   │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                    │                   │
     │  1. Register    │                    │                   │
     │────────────────>│                    │                   │
     │                 │  POST /api/auth/register              │
     │                 │──────────────────>│                   │
     │                 │                    │  Create User      │
     │                 │                    │──────────────────>│
     │                 │                    │  Generate OTP     │
     │                 │                    │<──────────────────│
     │                 │  { devOtp }        │                   │
     │                 │<──────────────────│                   │
     │                 │                    │                   │
     │  2. Enter OTP   │                    │                   │
     │────────────────>│                    │                   │
     │                 │  POST /api/auth/verify-otp            │
     │                 │──────────────────>│                   │
     │                 │                    │  Verify OTP       │
     │                 │                    │──────────────────>│
     │                 │                    │  Update isVerified│
     │                 │                    │──────────────────>│
     │                 │  { success }       │                   │
     │                 │<──────────────────│                   │
     │                 │                    │                   │
     │  3. Login       │                    │                   │
     │────────────────>│                    │                   │
     │                 │  signIn('credentials')                │
     │                 │──────────────────>│                   │
     │                 │                    │  Verify password  │
     │                 │                    │──────────────────>│
     │                 │                    │  Generate JWT     │
     │                 │  Session cookie    │                   │
     │                 │<──────────────────│                   │
     │  Authenticated  │                    │                   │
     │<────────────────│                    │                   │
```

---

## 🔄 Data Flow

### Profile Management Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                      PROFILE DATA FLOW                                 │
└───────────────────────────────────────────────────────────────────────┘

User Action ──> Frontend Component ──> API Route ──> Prisma Client ──> Database
                    │                       │              │
                    │                       │              │
                    ▼                       ▼              ▼
              State Update            Validation      Query Execution
              (React State)          (Zod Schema)    (SQL/SQLite)
                    │                       │              │
                    └───────────────────────┴──────────────┘
                                            │
                                            ▼
                                      Response to Client
```

### Match Algorithm Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                      MATCHING ALGORITHM                                 │
└───────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   User Profile      │
                    │   + Preferences     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Fetch Potential   │
                    │   Matches from DB   │
                    └──────────┬──────────┘
                               │
                               ▼
            ┌─────────────────────────────────────┐
            │      For Each Potential Match       │
            │  ┌───────────────────────────────┐  │
            │  │  1. Check User → Target       │  │
            │  │     Preference Compatibility  │  │
            │  │                               │  │
            │  │  2. Check Target → User       │  │
            │  │     Preference Compatibility  │  │
            │  │                               │  │
            │  │  3. Calculate Score           │  │
            │  │     Score = (Step1 + Step2)/2 │  │
            │  └───────────────────────────────┘  │
            └─────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Filter by Min     │
                    │   Compatibility %   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Sort by Score     │
                    │   Return Results    │
                    └─────────────────────┘
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/resend-otp` | Resend OTP |
| GET | `/api/auth/session` | Get session info |
| GET | `/api/auth/token` | Get JWT token |
| POST | `/api/auth/signin` | Sign in |
| POST | `/api/auth/signout` | Sign out |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| POST | `/api/profile` | Create/Update profile |
| PUT | `/api/profile` | Update profile sections |

### Search & Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Search profiles with filters |
| GET | `/api/matches` | Get AI-powered matches |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interactions` | Get interactions |
| POST | `/api/interactions` | Send interest/shortlist |
| PUT | `/api/interactions` | Accept/Decline interest |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get messages |
| POST | `/api/messages` | Send message |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/media` | Get pending media |
| GET | `/api/admin/reports` | Get reports |

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│    User     │──1:1──│   Profile   │──1:1──│ EducationCareer │
└──────┬──────┘       └──────┬──────┘       └─────────────────┘
       │                     │
       │                     ├──1:1──┌─────────────────┐
       │                     │       │ PartnerPreference│
       │                     │       └─────────────────┘
       │                     │
       │                     ├──1:1──┌─────────────┐
       │                     │       │FamilyDetails│
       │                     │       └─────────────┘
       │                     │
       │                     ├──1:N──┌─────────┐
       │                     │       │  Media  │
       │                     │       └─────────┘
       │                     │
       │                     └──1:1──┌───────────┐
       │                             │ Horoscope │
       │                             └───────────┘
       │
       ├──1:N──┌─────────────┐
       │       │ Interaction │ (Sent/Received)
       │       └─────────────┘
       │
       ├──1:N──┌─────────┐
       │       │ Message │ (Sent/Received)
       │       └─────────┘
       │
       ├──1:N──┌───────────────┐
       │       │ Notification  │
       │       └───────────────┘
       │
       ├──1:N──┌─────────┐
       │       │ Payment │
       │       └─────────┘
       │
       ├──1:N──┌───────────────┐
       │       │ Report        │ (Reporter/Reported)
       │       └───────────────┘
       │
       └──1:N──┌──────────────┐
               │ UserSession  │
               └──────────────┘
```

### Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| User | Account & authentication | email, phone, role, isPremium |
| Profile | User profile data | name, gender, dob, location |
| EducationCareer | Career information | degree, occupation, income |
| FamilyDetails | Family information | familyType, siblings |
| PartnerPreference | Match preferences | age range, height, location |
| Interaction | Interests & shortlists | status, type, message |
| Message | Chat messages | content, isRead |
| Media | Photos & documents | url, type, privacyLevel |
| Payment | Subscriptions | planType, amount, status |

---

## 🔌 Socket.io Events

### Server Events
| Event | Description | Payload |
|-------|-------------|---------|
| `connection` | Client connected | socket.id |
| `disconnect` | Client disconnected | - |
| `message:receive` | New message | `{ senderId, content }` |
| `typing:start` | User typing | `{ userId }` |
| `typing:stop` | Stopped typing | `{ userId }` |

### Client Events
| Event | Description | Payload |
|-------|-------------|---------|
| `message:send` | Send message | `{ receiverId, content }` |
| `message:read` | Mark as read | `{ messageId }` |
| `typing:start` | Start typing | `{ receiverId }` |
| `typing:stop` | Stop typing | `{ receiverId }` |

---

## 🚀 Deployment Architecture

### Current (Development)
```
┌─────────────────────────────────────────┐
│           Single Server                  │
│  ┌───────────────────────────────────┐  │
│  │  Next.js Dev Server (Port 3000)   │  │
│  │  - SSR Pages                      │  │
│  │  - API Routes                     │  │
│  │  - Static Files                   │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Socket.io Server (Port 3003)     │  │
│  │  - Real-time Chat                 │  │
│  │  - Typing Indicators              │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  SQLite Database                  │  │
│  │  - File-based                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Production (Recommended)
```
                    ┌─────────────────┐
                    │   CDN/Edge      │
                    │   (Static)      │
                    └────────┬────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                      Load Balancer                       │
└────────────────────────────┬────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Next.js       │ │   Next.js       │ │   Next.js       │
│   Instance 1    │ │   Instance 2    │ │   Instance N    │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Redis         │ │   PostgreSQL    │ │   Cloud Storage │
│   (Cache/Socket)│ │   (Database)    │ │   (Media)       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔒 Security Implementation

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: HS256 signed tokens
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in NextAuth.js

### API Security
- **Input Validation**: Zod schemas
- **Rate Limiting**: Planned implementation
- **CORS**: Configured for production
- **Authentication Middleware**: Session verification

### Data Security
- **SQL Injection**: Prisma parameterized queries
- **XSS Prevention**: React auto-escaping
- **File Upload**: Type validation, size limits
- **Sensitive Data**: Environment variables

---

## 📈 Performance Considerations

### Frontend Optimization
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports
- **Caching**: React Query for server state

### Backend Optimization
- **Database Indexing**: Prisma indexes on key fields
- **Connection Pooling**: Prisma connection pool
- **API Response**: Pagination for large datasets
- **Computed Values**: Database-level calculations

### Real-Time Optimization
- **Socket Rooms**: Per-conversation rooms
- **Connection Management**: Auto-reconnect logic
- **Event Batching**: Typing indicator debouncing

---

## 🧪 Testing Strategy

### Unit Tests (Planned)
- Component testing with React Testing Library
- API route testing with Jest
- Utility function testing

### Integration Tests (Planned)
- API integration tests
- Database operations tests
- Authentication flow tests

### E2E Tests (Planned)
- Critical user journeys
- Payment flows
- Registration completion

---

## 📊 Monitoring & Logging

### Application Logging
- Console logging in development
- Structured logging for production (Planned)
- Error tracking integration (Planned)

### Performance Monitoring
- Next.js built-in analytics
- API response time tracking
- Database query performance

---

## 📅 Last Updated

**Date**: March 2024  
**Version**: 0.2.0  
**Status**: Active Development

---

## 🔄 Recent Changes

### v0.2.0
- Added Lucide React icons with maroon gradient
- Enhanced CSS styling system
- Improved component structure

### v0.1.0
- Initial architecture setup
- Core API implementation
- Database schema design
- Socket.io chat service
