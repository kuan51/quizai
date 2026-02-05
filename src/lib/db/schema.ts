import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  questionCount: integer("question_count").notNull(),
  difficulty: text("difficulty", {
    enum: ["mercy_mode", "mental_warfare", "abandon_all_hope"],
  }).notNull(),
  questionTypes: text("question_types").notNull(), // JSON array
  studyMaterial: text("study_material"),
  currentDifficultyScore: real("current_difficulty_score").default(0.5),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type", {
    enum: ["multiple_choice", "essay", "short_answer", "true_false", "select_all"],
  }).notNull(),
  content: text("content").notNull(),
  options: text("options"), // JSON array for choice-based questions
  correctAnswer: text("correct_answer").notNull(), // JSON for select_all
  explanation: text("explanation"),
  difficulty: real("difficulty").default(0.5),
  order: integer("order").notNull(),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  score: real("score"),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .references(() => attempts.id, { onDelete: "cascade" })
    .notNull(),
  questionId: text("question_id")
    .references(() => questions.id)
    .notNull(),
  userAnswer: text("user_answer"),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  aiGradingFeedback: text("ai_grading_feedback"), // For essay/short answer
  answeredAt: integer("answered_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
