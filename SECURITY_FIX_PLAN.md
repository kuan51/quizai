# Security Fix Implementation Plan

## Critical Priorities (OWASP-Validated)

### 1. Structured Security Logging (A09:2021)

**OWASP Requirement:** "Ensure all login, access control, and server-side input validation failures can be logged with sufficient user context to identify suspicious or malicious accounts."

**Implementation:**
- Add `pino` logger with structured JSON output
- Create logging utility with security event types
- Log authentication events, API access, errors
- Redact sensitive fields (tokens, passwords)

**Files to modify:**
- `package.json` - Add pino dependency
- `src/lib/logger.ts` - New logging utility
- `src/lib/auth.ts` - Add auth event logging
- All API routes - Add request/response logging

---

### 2. Prompt Injection Mitigations (A03:2021)

**OWASP Requirement:** "Use positive server-side input validation. Escape special characters in user input."

**Implementation:**
- Sanitize user input before including in prompts
- Use defensive prompting with clear boundaries
- Validate AI response structure
- Limit input length strictly

**Files to modify:**
- `src/lib/ai/index.ts` - Add sanitization and defensive prompts
- `src/lib/ai/openai.ts` - Update grading prompts
- `src/lib/ai/anthropic.ts` - Update grading prompts

---

### 3. Rate Limiting (A01:2021)

**OWASP Requirement:** "Rate limit API and controller access to minimize the harm from automated attack tooling."

**Implementation:**
- In-memory rate limiter (no external dependencies)
- Per-user and per-IP limits
- Different limits for different endpoints
- Return 429 status with Retry-After header

**Files to modify:**
- `src/lib/rate-limit.ts` - New rate limiting utility
- `src/middleware.ts` - Apply rate limiting
- API routes - Apply endpoint-specific limits

---

### 4. Security Headers (A05:2021)

**OWASP Requirement:** "Set security headers including CSP, X-Content-Type-Options, X-Frame-Options."

**Implementation:**
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy

**Files to modify:**
- `next.config.ts` - Add headers configuration

---

## OWASP Validation Checklist

| Fix | OWASP Control | Validation |
|-----|---------------|------------|
| Logging | A09:2021-1 | Logs include user context, timestamps, event types |
| Logging | A09:2021-2 | Sensitive data redacted from logs |
| Prompt Injection | A03:2021-1 | User input sanitized before use |
| Prompt Injection | A03:2021-3 | Clear boundaries between system and user content |
| Rate Limiting | A01:2021-5 | API access rate limited |
| Rate Limiting | A07:2021-4 | Brute force protection |
| Security Headers | A05:2021-3 | CSP prevents XSS |
| Security Headers | A05:2021-4 | Clickjacking prevention |
