> [<< Documentation Index](./README.md)

# QuizAI API Reference

This document describes the REST API endpoints available in QuizAI.

## Authentication

All API endpoints (except `/api/health` and `/api/auth/*`) require authentication via NextAuth.js session cookies.

## Endpoints

### Health Check

```
GET /api/health
```

Returns the health status of the application.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

### Authentication

```
GET/POST /api/auth/*
```

NextAuth.js authentication routes. See [NextAuth.js documentation](https://authjs.dev/) for details.

---

### List Quizzes

```
GET /api/quizzes
```

Returns all quizzes for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Biology Chapter 5",
    "description": "AI-generated quiz",
    "questionCount": 10,
    "difficulty": "mental_warfare",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Create Quiz (Manual)

```
POST /api/quizzes
```

Creates a new empty quiz without AI generation.

**Request Body:**
```json
{
  "title": "My Quiz",
  "description": "Optional description",
  "difficulty": "mercy_mode",
  "questionTypes": ["multiple_choice", "true_false"]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "My Quiz",
  "description": "Optional description",
  "questionCount": 0,
  "difficulty": "mercy_mode",
  "questionTypes": ["multiple_choice", "true_false"],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Generate Quiz (AI)

```
POST /api/quizzes/generate
```

Generates a quiz using AI based on study material.

**Request Body:**
```json
{
  "title": "Biology Chapter 5 Review",
  "studyMaterial": "Your study notes or textbook content...",
  "questionCount": 10,
  "difficulty": "mental_warfare",
  "questionTypes": ["multiple_choice", "short_answer"]
}
```

**Parameters:**
- `title` (required): Quiz title
- `studyMaterial` (required): Study content for quiz generation (min 50 characters)
- `questionCount` (required): Number of questions (5-50)
- `difficulty` (required): `mercy_mode` | `mental_warfare` | `abandon_all_hope`
- `questionTypes` (required): Array of question types to include

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Biology Chapter 5 Review",
  "questionCount": 10,
  "difficulty": "mental_warfare"
}
```

---

### Get Quiz Details

```
GET /api/quizzes/:id
```

Returns a quiz with all its questions.

**Response:**
```json
{
  "id": "uuid",
  "title": "Biology Chapter 5",
  "description": "AI-generated quiz",
  "questionCount": 10,
  "difficulty": "mental_warfare",
  "questionTypes": ["multiple_choice", "short_answer"],
  "questions": [
    {
      "id": "uuid",
      "type": "multiple_choice",
      "content": "What is the powerhouse of the cell?",
      "options": ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Golgi apparatus"],
      "correctAnswer": "B",
      "explanation": "Mitochondria are known as the powerhouse...",
      "difficulty": 0.5,
      "order": 1
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Delete Quiz

```
DELETE /api/quizzes/:id
```

Deletes a quiz and all its questions.

**Response:**
```json
{
  "success": true
}
```

---

### AI Grading

```
POST /api/ai
```

Grades essay or short answer questions using AI.

**Request Body:**
```json
{
  "question": "Explain the process of photosynthesis.",
  "correctAnswer": "Key points about photosynthesis...",
  "userAnswer": "Student's answer...",
  "questionType": "essay",
  "provider": "anthropic"
}
```

**Parameters:**
- `question` (required): The question text
- `correctAnswer` (required): Expected answer or key points
- `userAnswer` (required): Student's answer to grade
- `questionType` (required): `essay` | `short_answer`
- `provider` (optional): `openai` | `anthropic` (defaults to DEFAULT_AI_PROVIDER)

**Response:**
```json
{
  "score": 85,
  "isCorrect": true,
  "feedback": "Your answer correctly identified the main stages..."
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded; includes `Retry-After` header)
- `500` - Internal Server Error

---

## Question Types

| Type | Description | Options | Correct Answer Format |
|------|-------------|---------|----------------------|
| `multiple_choice` | Single correct answer | Array of 4 options | Letter (A, B, C, or D) |
| `true_false` | Binary choice | `["True", "False"]` | `"true"` or `"false"` |
| `short_answer` | Brief text response | `null` | Expected answer text |
| `essay` | Detailed text response | `null` | Key points/rubric |
| `select_all` | Multiple correct answers | Array of 4-6 options | JSON array: `["A", "C"]` |

---

## Difficulty Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| `mercy_mode` | 0.1 - 0.5 | Beginner-friendly with hints |
| `mental_warfare` | 0.4 - 0.8 | Challenging, requires deep understanding |
| `abandon_all_hope` | 0.7 - 1.0 | Expert-level, edge cases, no mercy |

---

## Rate Limits

All API endpoints are rate limited using an in-memory sliding window algorithm. Limits are enforced per-user for API routes and per-IP for authentication routes.

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| AI Quiz Generation (`POST /api/quizzes/generate`) | 5 requests | 1 minute |
| AI Grading (`POST /api/ai`) | 20 requests | 1 minute |
| General API (all other `/api/*`) | 60 requests | 1 minute |
| Auth Endpoints (`/api/auth/*`) | 30 requests | 5 minutes |

When a rate limit is exceeded, the API returns:

```
HTTP/1.1 429 Too Many Requests
Retry-After: <seconds>
```

```json
{
  "error": "Rate limit exceeded. Try again later."
}
```

For full security details, see [Security](./SECURITY.md).

---

**Next**: [Deployment](./DEPLOYMENT.md)
