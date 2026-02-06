# Code Simplification Review

**Review Date:** 2026-02-05
**Scope:** 39 modified files across security hardening, design system refresh, UI components, API routes, and utilities
**Tool:** 5 parallel code-simplifier agents reviewing logical batches

## Executive Summary

| Metric | Value |
|--------|-------|
| Files reviewed | 37 (excluding package-lock.json, .gitignore) |
| Total findings | 75 |
| Estimated LOC reduction | ~590 lines |
| Risk: High | 1 finding (potential bug) |
| Risk: Medium | 7 findings |
| Risk: Low | 67 findings |

### Findings by Category

| Category | Count |
|----------|-------|
| Dead Code | 32 |
| Duplicate Logic | 20 |
| Over-Complex | 13 |
| Style Inconsistency | 7 |
| Potential Bug | 1 |

---

## High-Priority Findings

### SIMP-414 — Stale State Bug in QuestionRenderer (HIGH RISK)
**File:** `src/components/quiz/QuestionRenderer.tsx:42-45`
**Category:** Potential Bug

`useState` initializers only run on mount. If the parent navigates to the next question by changing the `question` prop without unmounting the component, stale answer state persists.

**Fix:** Add `key={question.id}` on the parent's `<QuestionRenderer>` usage to force remount per question.

---

## Top-Impact Findings (Recommended First)

| ID | File(s) | Category | LOC | Risk |
|----|---------|----------|-----|------|
| SIMP-109 | `lib/crypto.ts` | Dead Code | -61 | Low |
| SIMP-203 | `lib/ai/adaptive.ts` | Dead Code | -158 | Low |
| SIMP-311 | `hooks/useScrollReveal.ts` | Dead Code | -28 | Low |
| SIMP-518 | `components/quiz/DifficultyIndicator.tsx` | Dead Code | -32 | Low |
| SIMP-201 | `lib/ai/openai.ts`, `anthropic.ts`, `claude-code.ts` | Duplicate Logic | -45 | Low |
| SIMP-101-108 | `lib/utils.ts` | Dead Code | -35 | Low |
| SIMP-411+412 | `app/page.tsx` | Duplicate Logic | -50 | Low |
| SIMP-505 | `app/globals.css` | Duplicate Logic | -9 | Low |
| SIMP-506-510 | `app/globals.css` | Dead Code | -24 | Low |
| SIMP-402 | `dashboard/QuizList.tsx`, `Sidebar.tsx` | Duplicate Logic | -20 | Low |

---

## Batch 1: Core Utilities & Libraries (20 findings)

### SIMP-100: Duplicate `safeJsonParse` in utils.ts
**File:** `src/lib/utils.ts:53-59`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -7

The `sanitize.ts` version (lines 220-232) returns `{ data, error }` and is the one actually imported. The `utils.ts` version is never imported. Remove it.

### SIMP-101: Unused `generateId()`
**File:** `src/lib/utils.ts:9-11`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Trivial wrapper around `crypto.randomUUID()`, never imported. Remove.

### SIMP-102: Unused export `formatDate()`
**File:** `src/lib/utils.ts:14-21`
**Category:** Dead Code | **Risk:** Low | **LOC:** 0

Only used internally by `formatRelativeTime`. Remove `export` keyword.

### SIMP-103: Unused `truncate()`
**File:** `src/lib/utils.ts:41-44`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Never called (Tailwind `truncate` class used instead). Remove.

### SIMP-104: Unused `calculatePercentage()`
**File:** `src/lib/utils.ts:47-50`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Never imported. Remove.

### SIMP-105: Unused `delay()`
**File:** `src/lib/utils.ts:62-64`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Never imported. Remove.

### SIMP-106: Unused `isValidEmail()`
**File:** `src/lib/utils.ts:67-70`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Never imported. Zod handles validation. Remove.

### SIMP-107: Unused `shuffleArray()`
**File:** `src/lib/utils.ts:73-80`
**Category:** Dead Code | **Risk:** Low | **LOC:** -8

Never imported. Remove.

### SIMP-108: Unused `clamp()`
**File:** `src/lib/utils.ts:83-85`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Never imported (though SIMP-313 notes Progress.tsx could use it). Remove unless SIMP-313 is applied first.

### SIMP-109: Entire `crypto.ts` is unused
**File:** `src/lib/crypto.ts` (61 lines)
**Category:** Dead Code | **Risk:** Low | **LOC:** -61

Neither `encrypt` nor `decrypt` is imported anywhere. Remove file.

### SIMP-110: Unused `getDb` alias
**File:** `src/lib/db/index.ts:149`
**Category:** Dead Code | **Risk:** Low | **LOC:** -1

All consumers use `db()`. Remove `getDb` export.

### SIMP-111: `db()` wrapper is unnecessary
**File:** `src/lib/db/index.ts:145-149`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -5

`db()` just calls `createConnection()` which already has lazy init. Rename `createConnection` to `db` and export directly.

### SIMP-112: Fragile `.test()` + global regex in sanitize
**File:** `src/lib/sanitize.ts:79-85`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** -2

`.test()` on a global regex advances `lastIndex`. Remove the `.test()` guard; compare `.replace()` result to original instead.

### SIMP-113: Two-pass detect-then-neutralize is overcomplicated
**File:** `src/lib/sanitize.ts:88-109`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** -6

Unconditionally apply neutralization replacements and detect changes by comparing before/after.

### SIMP-114: Most `SecurityEventType` values are unused
**File:** `src/lib/logger.ts:4-18`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** 0

Only `"api.rate_limited"` and `"input.sanitized"` are actually logged. Add comments marking which are active vs. planned.

### SIMP-115: `SanitizationResult` interface export unused
**File:** `src/lib/sanitize.ts:49-53`
**Category:** Dead Code | **Risk:** Low | **LOC:** 0

Remove `export` keyword.

### SIMP-116: `IdentifierType` export unused
**File:** `src/lib/rate-limit.ts:84`
**Category:** Dead Code | **Risk:** Low | **LOC:** 0

Remove `export` keyword. Consider removing `"anonymous"` from union.

### SIMP-117: `formatZodErrors` export unused externally
**File:** `src/lib/validations.ts:98-102`
**Category:** Dead Code | **Risk:** Low | **LOC:** 0

Only called internally. Remove `export` keyword.

### SIMP-118: Duplicate question type lists
**File:** `src/lib/sanitize.ts:178-182` vs `src/lib/validations.ts:15-21`
**Category:** Duplicate Logic | **Risk:** Medium | **LOC:** -5

Import `QuestionTypeSchema.options` from validations.ts instead of maintaining a separate array.

### SIMP-119: Eager DB path validation at import time
**File:** `src/lib/db/index.ts:12-18`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** 0

Move validation inside `createConnection()` so it only runs when DB is accessed.

### SIMP-120: `rateLimitConfigs` export unused externally
**File:** `src/lib/rate-limit.ts:44-53`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** 0

Remove `export` keyword.

---

## Batch 2: AI Integration Layer (10 findings)

### SIMP-200: Triplicated `difficultyInstructions`
**Files:** `lib/ai/openai.ts:18-25`, `anthropic.ts:18-25`, `claude-code.ts:73-80`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -16

Export a single canonical constant from `index.ts`.

### SIMP-201: Duplicate grading prompt and response parsing
**Files:** `lib/ai/openai.ts:58-121`, `anthropic.ts:49-105`, `claude-code.ts:132-166`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -45

Extract shared `buildGradingPrompt()` and `parseGradingResponse()` into `index.ts`.

### SIMP-202: `calculateAdaptiveDifficulty` never called externally
**File:** `src/lib/ai/index.ts:89-106`
**Category:** Dead Code | **Risk:** Low | **LOC:** -18

Vestigial predecessor of the `adaptive.ts` version. Remove.

### SIMP-203: Entire `adaptive.ts` is unreferenced
**File:** `src/lib/ai/adaptive.ts` (158 lines)
**Category:** Dead Code | **Risk:** Low | **LOC:** -158

All 4 exported functions have zero imports. Remove file.

### SIMP-204: `currentPerformance` field never used
**Files:** `lib/ai/index.ts:15`, `types/index.ts:115`
**Category:** Dead Code | **Risk:** Low | **LOC:** -2

Remove from both locations.

### SIMP-205: claude-code.ts bypasses shared `buildQuizPrompt`
**File:** `src/lib/ai/claude-code.ts:106-130`
**Category:** Duplicate Logic | **Risk:** Medium | **LOC:** -25

Has weaker security boundaries and silently truncates to 3000 chars. Should use shared prompt.

### SIMP-206: `gradeWithClaudeCode` never imported
**File:** `src/lib/ai/claude-code.ts:133-166`
**Category:** Dead Code | **Risk:** Low | **LOC:** -34

Grading route only supports OpenAI and Anthropic. Remove.

### SIMP-207: Redundant guard in `calculatePerformanceMetrics`
**File:** `src/lib/ai/adaptive.ts:90`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -2

Early return guarantees length > 0. Remove unnecessary `if` wrapper.

### SIMP-208: OpenAI system message duplicates `buildQuizPrompt`
**File:** `src/lib/ai/openai.ts:39-42`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** 0

Redundant persona/format instructions in system message.

### SIMP-209: Anthropic provider missing `system` parameter
**File:** `src/lib/ai/anthropic.ts:35-39`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** 0

Should use API's native `system` parameter for consistency with OpenAI provider.

---

## Batch 3: UI Component Library (13 findings)

### SIMP-300: Badge has 4 unused variants
**File:** `src/components/ui/Badge.tsx:7,22-27`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

`primary`, `success`, `warning`, `error` variants never used. Only `default`, `mercy`, `warfare`, `abandon` are consumed.

### SIMP-301: Badge `lg` size unused
**File:** `src/components/ui/Badge.tsx:8,36-39`
**Category:** Dead Code | **Risk:** Low | **LOC:** -1

### SIMP-302: Button `secondary` and `danger` variants unused
**File:** `src/components/ui/Button.tsx:8,33,38-39`
**Category:** Dead Code | **Risk:** Low | **LOC:** -2

### SIMP-303: Card `glass` and `feature` variants unused
**File:** `src/components/ui/Card.tsx:7,20-23`
**Category:** Dead Code | **Risk:** Low | **LOC:** -2

### SIMP-304: Card `none` and `sm` padding unused
**File:** `src/components/ui/Card.tsx:8,29-30`
**Category:** Dead Code | **Risk:** Low | **LOC:** -2

### SIMP-305: Input `underlined` variant unused
**File:** `src/components/ui/Input.tsx:11,37-38`
**Category:** Dead Code | **Risk:** Low | **LOC:** -3

Remove `variant` prop entirely — always apply bordered styles.

### SIMP-306: Input and Textarea duplicate className/label/error logic
**Files:** `components/ui/Input.tsx:32-43`, `Textarea.tsx:30-39`
**Category:** Duplicate Logic | **Risk:** Medium | **LOC:** -20

Extract shared `inputBaseClasses` constant and `FieldWrapper` component.

### SIMP-307: Input error ternary returns empty string
**File:** `src/components/ui/Input.tsx:40`
**Category:** Over-Complex | **Risk:** Low | **LOC:** 0

Replace `error ? "..." : ""` with `error && "..."` since `cn()` handles falsy values.

### SIMP-308: Input vs Textarea border color logic inconsistency
**Files:** `Input.tsx:37` vs `Textarea.tsx:35`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** 0

Align both to use the same pattern for default vs. error border colors.

### SIMP-309: Progress `showLabel` prop unused
**File:** `src/components/ui/Progress.tsx:11`
**Category:** Dead Code | **Risk:** Low | **LOC:** -9

Never set to `true`. Remove prop and rendering block.

### SIMP-310: Progress has 4 unused bar variants
**File:** `src/components/ui/Progress.tsx:9,37-43`
**Category:** Dead Code | **Risk:** Low | **LOC:** -4

Only `primary` used. Remove `success`, `warning`, `error`, `accent`.

### SIMP-311: `useScrollReveal.ts` entirely unused
**File:** `src/hooks/useScrollReveal.ts` (28 lines)
**Category:** Dead Code | **Risk:** Low | **LOC:** -28

Zero imports. Delete file.

### SIMP-312: Badge, Card, Progress have unnecessary `"use client"`
**Files:** `Badge.tsx:1`, `Card.tsx:1`, `Progress.tsx:1`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** -3

Pure presentational components with no hooks or handlers. Remove directive.

### SIMP-313: Progress reimplements clamping
**File:** `src/components/ui/Progress.tsx:27`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** 0

Uses `Math.min(100, Math.max(0, ...))` instead of existing `clamp()` from utils.ts.

---

## Batch 4: Feature Components & Pages (15 findings)

### SIMP-401: Duplicate local `Quiz` interface
**Files:** `dashboard/QuizList.tsx:10-17`, `Sidebar.tsx:11-16`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -10

Use `Pick<Quiz, ...>` from shared types instead of local interfaces.

### SIMP-402: Duplicate quiz fetch logic
**Files:** `dashboard/QuizList.tsx:25-40`, `Sidebar.tsx:24-39`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -20

Extract a shared `useQuizzes()` custom hook.

### SIMP-403: Silently swallowed fetch errors
**Files:** `QuizList.tsx:36-37`, `Sidebar.tsx:35-36`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** 0

Empty `catch {}` blocks mask real issues. Add error state or console logging.

### SIMP-404: Repeated difficulty-to-variant mapping
**Files:** `QuizCard.tsx:31-43`, `DifficultyIndicator.tsx:28-48,102-111`, `QuizForm.tsx:130-136`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -25

Create a shared `difficultyStyles` lookup object.

### SIMP-405: Nested ternary operators in QuizCard and QuizForm
**Files:** `QuizCard.tsx:31-36`, `QuizForm.tsx:130-136`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** -5

Replace with lookup objects per project standards.

### SIMP-406: Nested ternary in `canSubmit`
**File:** `src/components/quiz/QuestionRenderer.tsx:138-143`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** 0

Replace with switch statement for readability.

### SIMP-407: Repeated collapsed text pattern in Sidebar
**File:** `src/components/dashboard/Sidebar.tsx:76-80,91-95,152-155`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -8

Extract a helper function for the collapse animation className.

### SIMP-408: OAuthButtons repeats identical button structure 3x
**File:** `src/components/auth/OAuthButtons.tsx:30-83`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -15

Define a providers array and map over it.

### SIMP-409: Unnecessary `"use client"` on DifficultyIndicator
**File:** `src/components/quiz/DifficultyIndicator.tsx:1`
**Category:** Dead Code | **Risk:** Low | **LOC:** -1

Pure presentational component with no hooks.

### SIMP-410: `getSegments()` recreates object on every render
**File:** `src/components/quiz/DifficultyIndicator.tsx:51-58`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -5

Hoist lookup as module-level constant.

### SIMP-411: Repeated feature card pattern on landing page
**File:** `src/app/page.tsx:77-117`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -30

Map over a `features` data array.

### SIMP-412: Repeated difficulty mode card pattern on landing page
**File:** `src/app/page.tsx:126-165`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -20

Map over a `difficultyModes` data array.

### SIMP-413: QuestionRenderer dual state for answers
**File:** `src/components/quiz/QuestionRenderer.tsx:42-45`
**Category:** Over-Complex | **Risk:** Medium | **LOC:** -3

`selectedAnswer` and `textAnswer` are mutually exclusive. Low priority — current approach is readable.

### SIMP-414: QuestionRenderer does not reset state on question change (BUG)
**File:** `src/components/quiz/QuestionRenderer.tsx:42-45`
**Category:** Potential Bug | **Risk:** HIGH | **LOC:** 0

`useState` initializers only run on mount. Fix: add `key={question.id}` on parent.

### SIMP-415: `difficultyNumerals` could be part of shared `difficultyLabels`
**File:** `src/components/quiz/QuizForm.tsx:11-15`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -6

Add `numeral` field to shared `difficultyLabels` in `@/types/index.ts`.

---

## Batch 5: API Routes, Middleware & CSS (17 findings)

### SIMP-501: Duplicate auth + rate-limit preamble
**File:** `src/app/api/quizzes/route.ts:16-26,64-74`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -8

Extract shared `authenticateAndRateLimit()` helper.

### SIMP-502: Duplicate error catch blocks
**File:** `src/app/api/quizzes/route.ts:53-59,119-125`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -6

Extract `handleRouteError(error, message)` utility.

### SIMP-503: Double-nested SessionProvider
**Files:** `app/layout.tsx:3,40`, `app/dashboard/layout.tsx:1-4,19`
**Category:** Duplicate Logic | **Risk:** Medium | **LOC:** -3

Root layout already wraps in SessionProvider. Dashboard nests a second one.

### SIMP-504: Redundant `min-h-screen bg-[var(--background)]` on every page
**Files:** `dashboard/page.tsx:6`, `quiz/new/page.tsx:6`, `quiz/[id]/page.tsx:129+`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -7

Already set by dashboard layout and body CSS. Move `min-h-screen` to layout.

### SIMP-505: Duplicate color tokens (difficulty = semantic)
**File:** `src/app/globals.css:32-59`
**Category:** Duplicate Logic | **Risk:** Low | **LOC:** -9

`mercy`=`success`, `warfare`=`warning`, `abandon`=`error` are byte-for-byte identical. Alias one set to the other.

### SIMP-506: Unused `slide-in-right`/`slide-in-left` animations
**File:** `src/app/globals.css:209-217,237-238`
**Category:** Dead Code | **Risk:** Low | **LOC:** -10

### SIMP-507: Unused `subtle-pulse` animation
**File:** `src/app/globals.css:224-227,240`
**Category:** Dead Code | **Risk:** Low | **LOC:** -5

### SIMP-508: Unused `shadow-editorial-xl`
**File:** `src/app/globals.css:177-183`
**Category:** Dead Code | **Risk:** Low | **LOC:** -7

### SIMP-509: Unused `shadow-editorial-lg`
**File:** `src/app/globals.css:169-175`
**Category:** Dead Code | **Risk:** Low | **LOC:** -7

### SIMP-510: Unused `stagger-7` and `stagger-8`
**File:** `src/app/globals.css:252-253`
**Category:** Dead Code | **Risk:** Low | **LOC:** -2

### SIMP-511: Unused `info` color tokens
**File:** `src/app/globals.css:57-59`
**Category:** Dead Code | **Risk:** Low | **LOC:** -3

### SIMP-512: Unused `accent-600` token
**File:** `src/app/globals.css:28`
**Category:** Dead Code | **Risk:** Low | **LOC:** -1

### SIMP-513: `isPublicRoute` has redundant logic
**File:** `src/middleware.ts:5-11`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -3

`/api/auth` check is redundant (handled earlier). `/api/health` excluded by matcher. Simplify to `publicRoutes.includes()`.

### SIMP-514: Unnecessary `"use client"` on DifficultyIndicator (duplicate of SIMP-409)
**File:** `src/components/quiz/DifficultyIndicator.tsx:1`
**Category:** Style Inconsistency | **Risk:** Low | **LOC:** -1

### SIMP-515: Nested ternaries in QuizCard (duplicate of SIMP-405)
**File:** `src/components/quiz/QuizCard.tsx:31-43`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -4

Replace with lookup object.

### SIMP-516: Duplicate threshold ternaries for score feedback
**File:** `src/app/dashboard/quiz/[id]/page.tsx:202-216`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -4

Extract `getPerformanceFeedback(percentage)` helper.

### SIMP-517: DifficultyIndicator has 3 redundant lookup functions
**File:** `src/components/quiz/DifficultyIndicator.tsx:50-58`
**Category:** Over-Complex | **Risk:** Low | **LOC:** -12

Consolidate `getDifficultyColor()`, `getDifficultyBgColor()`, `getSegments()` into a single module-level config object.

### SIMP-518: `DifficultyBadge` export is dead code
**File:** `src/components/quiz/DifficultyIndicator.tsx:93-124`
**Category:** Dead Code | **Risk:** Low | **LOC:** -32

Never imported by any consumer. Remove.

---

## Implementation Checklist

### Phase 1: Delete Dead Files (3 files, ~247 LOC)
- [ ] SIMP-109: Delete `src/lib/crypto.ts`
- [ ] SIMP-203: Delete `src/lib/ai/adaptive.ts`
- [ ] SIMP-311: Delete `src/hooks/useScrollReveal.ts`

### Phase 2: Remove Dead Code from Existing Files (~140 LOC)
- [ ] SIMP-101-108: Remove 7 dead functions from `utils.ts`
- [ ] SIMP-100: Remove duplicate `safeJsonParse` from `utils.ts`
- [ ] SIMP-110: Remove `getDb` alias from `db/index.ts`
- [ ] SIMP-202: Remove `calculateAdaptiveDifficulty` from `ai/index.ts`
- [ ] SIMP-204: Remove `currentPerformance` field from `ai/index.ts` and `types/index.ts`
- [ ] SIMP-206: Remove `gradeWithClaudeCode` from `claude-code.ts`
- [ ] SIMP-300-305: Remove unused variants from Badge, Button, Card, Input, Progress
- [ ] SIMP-309-310: Remove unused `showLabel` and bar variants from Progress
- [ ] SIMP-409/312: Remove unnecessary `"use client"` directives
- [ ] SIMP-506-512: Remove dead CSS (animations, shadows, colors, staggers)
- [ ] SIMP-518: Remove unused `DifficultyBadge` component

### Phase 3: Fix Bug
- [ ] SIMP-414: Add `key={question.id}` to QuestionRenderer usage

### Phase 4: Consolidate Duplicates (~100 LOC)
- [ ] SIMP-200: Extract shared `difficultyInstructions` to `ai/index.ts`
- [ ] SIMP-201: Extract shared `buildGradingPrompt`/`parseGradingResponse`
- [ ] SIMP-118: Use `QuestionTypeSchema.options` in sanitize.ts
- [ ] SIMP-402/401: Extract `useQuizzes()` hook
- [ ] SIMP-404/415: Create shared difficulty styles lookup
- [ ] SIMP-505: Alias duplicate color tokens in globals.css
- [ ] SIMP-408: Refactor OAuthButtons to map over providers array
- [ ] SIMP-411/412: Refactor landing page to map over data arrays

### Phase 5: Simplify Logic (~40 LOC)
- [ ] SIMP-111: Simplify db export
- [ ] SIMP-112-113: Simplify sanitize pipeline
- [ ] SIMP-205: Use shared `buildQuizPrompt` in claude-code.ts
- [ ] SIMP-405/515: Replace nested ternaries with lookup objects
- [ ] SIMP-501-502: Extract API route helpers
- [ ] SIMP-513: Simplify middleware `isPublicRoute`
- [ ] SIMP-516-517: Extract helper functions

### Phase 6: Verify
- [ ] Run `cd src && npx tsc --noEmit`
- [ ] Run `cd src && npm run build`
- [ ] Spot-check key pages in browser
