import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Create Drizzle instance with Vercel Postgres
// The @vercel/postgres SDK automatically uses POSTGRES_URL from environment
// No manual connection setup needed - Vercel handles connection pooling
const _db = drizzle(sql, { schema });

// Export as a function for compatibility with existing code
export function db() {
  return _db;
}

export { schema };
