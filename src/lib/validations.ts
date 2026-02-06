import { z } from "zod";

/**
 * Zod schemas for runtime validation of API requests
 * Provides type-safe validation at runtime, complementing TypeScript's compile-time checks
 */

// Valid enum values
export const DifficultySchema = z.enum([
  "mercy_mode",
  "mental_warfare",
  "abandon_all_hope",
]);

export const QuestionTypeSchema = z.enum([
  "multiple_choice",
  "essay",
  "short_answer",
  "true_false",
  "select_all",
]);

export const AIProviderSchema = z.enum(["openai", "anthropic", "claude-code"]);

/**
 * Schema for quiz generation requests
 * POST /api/quizzes/generate
 */
export const GenerateQuizRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  studyMaterial: z
    .string()
    .min(50, "Study material must be at least 50 characters")
    .max(100000, "Study material exceeds maximum length of 100,000 characters"),
  questionCount: z
    .number()
    .int("Question count must be an integer")
    .min(5, "Minimum 5 questions required")
    .max(50, "Maximum 50 questions allowed"),
  difficulty: DifficultySchema,
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, "At least one question type must be selected"),
});

export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;

/**
 * Schema for manual quiz creation
 * POST /api/quizzes
 */
export const CreateQuizRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  difficulty: DifficultySchema,
  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, "At least one question type must be selected"),
});

export type CreateQuizRequest = z.infer<typeof CreateQuizRequestSchema>;

/**
 * Schema for AI grading requests
 * POST /api/ai
 */
export const GradeRequestSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(5000, "Question exceeds maximum length"),
  correctAnswer: z
    .string()
    .min(1, "Correct answer is required")
    .max(10000, "Correct answer exceeds maximum length"),
  userAnswer: z
    .string()
    .min(1, "User answer is required")
    .max(10000, "Answer exceeds maximum length"),
  questionType: z.enum(["essay", "short_answer"]),
  provider: AIProviderSchema.optional(),
});

export type GradeRequest = z.infer<typeof GradeRequestSchema>;

/**
 * Helper to format Zod errors for API responses
 */
function formatZodErrors(error: z.ZodError): string {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}

/**
 * Helper to safely parse request body with Zod schema
 * Returns either validated data or error response details
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; issues: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: formatZodErrors(result.error),
    issues: result.error.issues,
  };
}
