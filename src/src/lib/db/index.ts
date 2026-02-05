import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as schema from "./schema";

// Database file path - uses environment variable or default
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/quiz.db";
const dbPath = DATABASE_URL.replace("file:", "");

// Completely lazy database initialization
// Only creates connection when actually used at runtime
let _db: ReturnType<typeof drizzle> | null = null;
let _sqlite: Database.Database | null = null;
let _initialized = false;

function ensureDataDir() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

function initializeTables(sqlite: Database.Database) {
  if (_initialized) return;
  _initialized = true;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      session_token TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      question_count INTEGER NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('mercy_mode', 'mental_warfare', 'abandon_all_hope')),
      question_types TEXT NOT NULL,
      study_material TEXT,
      current_difficulty_score REAL DEFAULT 0.5,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'essay', 'short_answer', 'true_false', 'select_all')),
      content TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty REAL DEFAULT 0.5,
      "order" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      score REAL,
      total_questions INTEGER,
      correct_answers INTEGER,
      started_at INTEGER NOT NULL DEFAULT (unixepoch()),
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id TEXT NOT NULL REFERENCES questions(id),
      user_answer TEXT,
      is_correct INTEGER,
      ai_grading_feedback TEXT,
      answered_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
    CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON attempts(quiz_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_responses_attempt_id ON responses(attempt_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `);
}

function createConnection() {
  if (!_db) {
    ensureDataDir();
    _sqlite = new Database(dbPath);
    _sqlite.pragma("busy_timeout = 10000");
    _sqlite.pragma("journal_mode = WAL");
    _db = drizzle(_sqlite, { schema });
    initializeTables(_sqlite);
  }
  return _db;
}

// Export a getter function - database is only created when db() is called
export function db() {
  return createConnection();
}

export const getDb = createConnection;

export { schema };
