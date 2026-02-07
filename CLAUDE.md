# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `src/` directory using Bun:

```bash
bun run dev          # Dev server on port 3000
bun run build        # Production build (standalone output)
bun run lint         # ESLint
bun run lint:fix     # ESLint with auto-fix
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:push      # Push schema changes (dev only)
bun run db:studio    # Drizzle Studio GUI
```

Always run `bun run build` to verify changes before committing.

## Architecture

**QuizAI** is a Next.js 16 App Router application (React 19, TypeScript strict) that generates adaptive study quizzes from user notes using AI. Uses Bun as the package manager.

### Key Layers

- **Auth**: NextAuth v5 (beta.30) with OAuth-only (Google/GitHub/Discord), JWT sessions, email whitelist via `AUTHORIZED_EMAILS` env var. Config in `src/lib/auth.ts`, middleware enforcement in `src/middleware.ts`.
- **Database**: SQLite via better-sqlite3 + Drizzle ORM. Schema in `src/lib/db/schema.ts`, instance in `src/lib/db/index.ts`. DB file at `src/data/quiz.db`.
- **AI Integration**: Provider router in `src/lib/ai/index.ts` dispatches to Anthropic (`anthropic.ts`), OpenAI (`openai.ts`), or Claude Code CLI (`claude-code.ts`). Adaptive difficulty algorithm in `adaptive.ts`. All user content is sanitized (`src/lib/sanitize.ts`) before AI calls.
- **File Processing**: Strategy pattern in `src/lib/file-extraction/` handles PDF (unpdf), DOCX (mammoth), images (vision models), and plain text for quiz generation from uploads.
- **Security**: Rate limiting (`src/lib/rate-limit.ts`, in-memory), input sanitization with prompt injection detection, Zod validation (`src/lib/validations.ts`), CSP/HSTS security headers in `src/next.config.ts`, structured Pino logging with field redaction.

### Component Conventions

- Server Components by default; `"use client"` only when necessary
- Absolute imports via `@/` path alias (maps to `src/`)
- State managed through React contexts: `QuizDataContext` and `ThemeContext`
- Custom hooks: `useAI` (provider selection), `useQuiz` (quiz management)
- 15 theme variants (5 categories x 3 modes: light/dark/neon) defined in `src/lib/theme-config.ts` and `src/app/globals.css`

### API Routes

- `src/app/api/quizzes/generate/route.ts` - AI quiz generation from text
- `src/app/api/quizzes/generate-from-files/route.ts` - AI quiz generation from file uploads
- `src/app/api/ai/route.ts` - AI grading of responses
- `src/app/api/quizzes/[id]/route.ts` - Quiz CRUD

### Environment Setup

Copy `src/.env.example` to `src/.env.local`. Requires at minimum: one OAuth provider (Google/GitHub/Discord), one AI provider key (Anthropic or OpenAI), and `NEXTAUTH_SECRET`. Set `AUTHORIZED_EMAILS="*"` for development.

Docker templates in `docker/.env.development.template` and `docker/.env.production.template`.

## Rate Limits

AI Generation: 5/min, AI Grading: 20/min, General API: 60/min, Auth: 30/5min per IP.
