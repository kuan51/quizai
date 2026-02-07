> [<< Documentation Index](./README.md)

# QuizAI Security

This document describes the security architecture and protections implemented in QuizAI.

## Security Overview

QuizAI is designed with defense-in-depth. All authentication is delegated to OAuth providers (no password storage), all API inputs are validated at runtime with Zod schemas, AI-facing inputs are sanitized against prompt injection, rate limiting protects expensive endpoints, and security-relevant events are logged with structured logging. Security headers (CSP, HSTS, X-Frame-Options) are applied to all responses.

## OWASP Top 10 Alignment

| # | Category | Status | Implementation |
|---|----------|--------|----------------|
| A01:2021 | Broken Access Control | Implemented | OAuth-only auth, JWT middleware, userId ownership checks on all resources |
| A02:2021 | Cryptographic Failures | Implemented | No password storage; OAuth tokens managed by NextAuth; HTTPS enforced |
| A03:2021 | Injection | Implemented | Input sanitization (`src/lib/sanitize.ts`), Zod validation, Drizzle ORM (parameterized queries) |
| A04:2021 | Insecure Design | Implemented | Rate limiting on all API tiers, defensive AI prompts with XML-tagged user content |
| A05:2021 | Security Misconfiguration | Implemented | Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) in `src/next.config.ts` |
| A06:2021 | Vulnerable Components | Mitigated | Regular dependency updates; minimal dependency surface |
| A07:2021 | Identification and Authentication Failures | Implemented | OAuth-only via NextAuth v5; JWT sessions with 7-day expiry, 24-hour refresh |
| A08:2021 | Software and Data Integrity Failures | Mitigated | All AI responses validated against schemas before persistence |
| A09:2021 | Security Logging and Monitoring Failures | Implemented | Pino structured logging with security event categories and field redaction |
| A10:2021 | Server-Side Request Forgery | Low Risk | No user-controlled URL fetching; AI calls use hardcoded provider endpoints |

## Authentication Security

QuizAI uses **OAuth-only authentication** via NextAuth v5 (Auth.js). No passwords are stored or processed.

- **Providers**: Google, GitHub, Discord
- **Session strategy**: JWT tokens (not database sessions)
- **Token lifecycle**: 7-day expiry, 24-hour automatic refresh
- **Route protection**: Middleware (`src/middleware.ts`) validates JWT on all protected routes
- **CSRF protection**: Built-in via NextAuth

All API endpoints except `/api/health` and `/api/auth/*` require a valid session.

## Input Sanitization

Study material submitted for AI quiz generation passes through the input sanitizer (`src/lib/sanitize.ts`) before reaching any AI provider.

**Detection categories**:
- Instruction override attempts (`ignore previous instructions`, `disregard above`)
- System/role manipulation (`you are now a`, `pretend to be`)
- Direct injection markers (`[system]`, `<instruction>`)
- Output manipulation (`output only`, `return this exact json`)
- Escape sequences (null bytes, zero-width characters, bidirectional controls)

**Actions**: Detected patterns are replaced with `[blocked]`, escape sequences are stripped, whitespace is normalized, and all events are logged.

## Rate Limiting

An in-memory sliding window rate limiter (`src/lib/rate-limit.ts`) protects all API endpoints. Limits are enforced per-user for API routes and per-IP for auth routes.

| Endpoint Category | Limit | Window | Identifier |
|-------------------|-------|--------|------------|
| AI Quiz Generation | 5 requests | 1 minute | User ID |
| AI Grading | 20 requests | 1 minute | User ID |
| General API | 60 requests | 1 minute | User ID |
| Auth Endpoints | 30 requests | 5 minutes | IP Address |

When a rate limit is exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.

## Request Validation

All API request payloads are validated at runtime using Zod schemas (`src/lib/validations.ts`). This complements TypeScript compile-time checking with runtime guarantees at the API boundary.

| Schema | Endpoint | Key Constraints |
|--------|----------|----------------|
| `GenerateQuizRequestSchema` | `POST /api/quizzes/generate` | Title 1-200 chars, material 50-100k chars, count 5-50 |
| `CreateQuizRequestSchema` | `POST /api/quizzes` | Title 1-200 chars, at least one question type |
| `GradeRequestSchema` | `POST /api/ai` | Question/answer required, type must be essay or short_answer |

Invalid requests receive a `400 Bad Request` response with a descriptive error message.

## Security Headers

Security headers are configured in `src/next.config.ts` and applied to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Restrictive policy with nonce-based scripts | Prevents XSS and unwanted resource loading |
| X-Frame-Options | DENY | Prevents clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME-type sniffing |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Enforces HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Limits referrer information leakage |
| Permissions-Policy | Restrictive | Disables unnecessary browser APIs |

## Security Logging

QuizAI uses Pino (`src/lib/logger.ts`) for structured JSON logging in production. Security-relevant events are logged with dedicated categories for monitoring and alerting.

**Logged events include**:
- Authentication successes and failures
- Rate limit violations
- Input sanitization triggers (prompt injection attempts)
- API validation failures
- Unauthorized access attempts

**Field redaction**: Sensitive fields (API keys, tokens, passwords, authorization headers) are automatically redacted from log output.

## Known Limitations

- **In-memory rate limiter**: Rate limit state is stored in process memory. In a multi-instance deployment, each instance maintains its own counters. For horizontal scaling, replace with a Redis-backed rate limiter.
- **No field-level encryption**: Database fields are stored in plaintext. Study material and quiz content are not encrypted at rest beyond filesystem-level protections.
- **Single-instance SQLite**: The SQLite database does not support concurrent writes from multiple application instances.

## History

The security hardening described in this document was implemented in February 2026 following a comprehensive OWASP Top 10 audit and code review. The original review documents, findings, and implementation plan are preserved in [docs/archive/](./archive/archive-README.md) for historical reference.

---

**Next**: [Contributing](./CONTRIBUTING.md)
