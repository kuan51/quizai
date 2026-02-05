# QuizAI Architecture

This document describes the system architecture, design patterns, and technical decisions in QuizAI.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Landing    │  │   Login     │  │      Dashboard          │ │
│  │   Page      │  │   Page      │  │  (Quiz List, New Quiz)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js App Router                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  API Routes │  │ Server      │  │     Middleware          │ │
│  │  /api/*     │  │ Components  │  │  (Auth Protection)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   NextAuth    │  │   AI Providers  │  │    Database     │
│   (OAuth)     │  │ OpenAI/Anthropic│  │    (SQLite)     │
└───────────────┘  └─────────────────┘  └─────────────────┘
```

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   └── login/         # Login page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── page.tsx       # Dashboard home
│   │   └── quiz/          # Quiz routes
│   └── api/               # API routes
│       ├── auth/          # NextAuth endpoints
│       ├── quizzes/       # Quiz CRUD + generation
│       └── ai/            # AI grading endpoint
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── quiz/             # Quiz-specific components
│   ├── dashboard/        # Dashboard components
│   └── auth/             # Auth components
├── lib/                  # Core libraries
│   ├── db/              # Database (Drizzle ORM)
│   ├── ai/              # AI provider integrations
│   ├── auth.ts          # NextAuth configuration
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
└── middleware.ts        # Auth middleware
```

## Database Schema

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   users     │      │   quizzes   │      │  questions  │
├─────────────┤      ├─────────────┤      ├─────────────┤
│ id (PK)     │◄─────│ user_id (FK)│      │ id (PK)     │
│ email       │      │ id (PK)     │◄─────│ quiz_id (FK)│
│ name        │      │ title       │      │ type        │
│ image       │      │ description │      │ content     │
│ created_at  │      │ difficulty  │      │ options     │
└─────────────┘      │ question_   │      │ correct_    │
                     │   types     │      │   answer    │
┌─────────────┐      │ study_      │      │ explanation │
│  accounts   │      │   material  │      │ difficulty  │
├─────────────┤      │ created_at  │      │ order       │
│ id (PK)     │      └─────────────┘      └─────────────┘
│ user_id(FK) │
│ provider    │      ┌─────────────┐      ┌─────────────┐
│ provider_   │      │  attempts   │      │  responses  │
│   account_id│      ├─────────────┤      ├─────────────┤
└─────────────┘      │ id (PK)     │      │ id (PK)     │
                     │ quiz_id(FK) │◄─────│ attempt_id  │
                     │ user_id(FK) │      │   (FK)      │
                     │ score       │      │ question_id │
                     │ started_at  │      │   (FK)      │
                     │ completed_at│      │ user_answer │
                     └─────────────┘      │ is_correct  │
                                          └─────────────┘
```

## Authentication Flow

```
┌────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────┐
│ Client │───▶│   Login     │───▶│   OAuth     │───▶│ Provider│
│        │    │   Page      │    │   Redirect  │    │ (Google)│
└────────┘    └─────────────┘    └─────────────┘    └─────────┘
     ▲                                                    │
     │                                                    │
     │        ┌─────────────┐    ┌─────────────┐         │
     │◀───────│  Dashboard  │◀───│  NextAuth   │◀────────┘
              │             │    │  Callback   │
              └─────────────┘    └─────────────┘
```

1. User clicks OAuth provider button
2. Redirected to provider's login
3. Provider authenticates and redirects back
4. NextAuth creates/updates user in database
5. Session cookie set, user redirected to dashboard

## AI Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                  AI Provider Router                  │
│                   (lib/ai/index.ts)                 │
└─────────────────────────┬───────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│   OpenAI    │  │  Anthropic  │  │  Claude Code    │
│ (API Call)  │  │ (API Call)  │  │ (CLI Execution) │
└─────────────┘  └─────────────┘  └─────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  Response Parser    │
              │  (JSON Validation)  │
              └─────────────────────┘
```

### Quiz Generation Flow

1. User submits study material
2. AI provider router selects appropriate provider
3. Prompt constructed with difficulty and question types
4. AI generates JSON response with questions
5. Response parsed and validated
6. Questions stored in database
7. Quiz ID returned to client

### Adaptive Difficulty Algorithm

```
calculateNextDifficulty(baseDifficulty, answerHistory):
  1. Get base difficulty bounds
     - mercy_mode: 0.1 - 0.5
     - mental_warfare: 0.4 - 0.8
     - abandon_all_hope: 0.7 - 1.0

  2. Weight recent answers (exponential decay)
     weight = 1.5^index (more recent = higher weight)

  3. Calculate performance ratio
     ratio = weighted_correct / total_weight

  4. Apply adjustment
     - ratio > 0.7: increase difficulty
     - ratio < 0.3: decrease difficulty

  5. Clamp to difficulty bounds
```

## Component Architecture

### Component Hierarchy

```
RootLayout
├── SessionProvider
├── Landing Page (/)
│   └── Marketing content
├── Auth Layout (/login)
│   └── OAuthButtons
└── Dashboard Layout (protected)
    ├── Sidebar
    │   └── QuizList (mini)
    ├── Header
    └── Main Content
        ├── Dashboard Page
        │   └── QuizList (full)
        ├── New Quiz Page
        │   └── QuizForm
        └── Quiz Page
            ├── Progress
            ├── QuestionRenderer
            └── Results
```

### State Management

- **Server State**: React Server Components for initial data
- **Client State**: React useState for UI interactions
- **Session State**: NextAuth useSession hook
- **Form State**: Controlled components with useState

## API Design

### RESTful Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/quizzes | List user's quizzes |
| POST | /api/quizzes | Create manual quiz |
| POST | /api/quizzes/generate | AI-generate quiz |
| GET | /api/quizzes/:id | Get quiz with questions |
| DELETE | /api/quizzes/:id | Delete quiz |
| POST | /api/ai | Grade essay/short answer |
| GET | /api/health | Health check |

### Error Handling

```typescript
// Consistent error response format
{
  "error": "Error message"
}

// Status codes
400 - Bad Request (validation errors)
401 - Unauthorized (not authenticated)
404 - Not Found (resource doesn't exist)
500 - Internal Server Error
```

## Security Considerations

### Authentication Security

- OAuth-only (no password storage)
- Session tokens with secure cookies
- CSRF protection via NextAuth

### Data Security

- User data isolation (userId checks)
- Input validation on all endpoints
- SQL injection prevention (Drizzle ORM)

### API Security

- Protected routes via middleware
- Rate limiting (recommended for production)
- API key security (server-side only)

## Performance Optimizations

### Server Components

- Static pages where possible
- Streaming for dynamic content
- Parallel data fetching

### Client Optimizations

- Code splitting per route
- Lazy loading components
- Optimistic UI updates

### Database

- Indexed queries
- Connection pooling (via better-sqlite3)
- WAL mode for better concurrency

## Scalability Considerations

### Horizontal Scaling

For multiple instances:
- Replace SQLite with PostgreSQL
- Add Redis for sessions
- Use CDN for static assets

### Caching Strategy

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │────▶│  CDN    │────▶│  Edge   │
│  Cache  │     │ (Static)│     │ (API)   │
└─────────┘     └─────────┘     └─────────┘
```

## Technology Choices

| Choice | Reasoning |
|--------|-----------|
| Next.js 16 | App Router, Server Components, API routes |
| TypeScript | Type safety, better DX |
| Tailwind CSS v4 | Utility-first, great DX |
| SQLite | Simple, no setup, good for MVP |
| Drizzle ORM | Type-safe, lightweight, good DX |
| NextAuth v5 | Industry standard, OAuth support |
| Lucide | Consistent icons, tree-shakeable |
