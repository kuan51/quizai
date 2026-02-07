/**
 * Resolve auth URL by deployment environment.
 * Must be imported before NextAuth() is called.
 *
 * Priority:
 * 1. On Vercel: hardcoded domains by VERCEL_ENV
 * 2. Off Vercel: NEXTAUTH_URL from .env.local, fallback localhost
 */
function resolveAuthUrl(): string {
  if (!process.env.VERCEL) {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
  switch (process.env.VERCEL_ENV) {
    case "production":
      return "https://quiz-ai.org";
    case "preview":
      return "https://preview.quiz-ai.org";
    default:
      return `https://${process.env.VERCEL_URL || "localhost:3000"}`;
  }
}

process.env.NEXTAUTH_URL = resolveAuthUrl();
