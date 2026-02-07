import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

async function runMigrations() {
  console.log("=== Database Migration Runner ===");

  let connection: postgres.Sql | undefined;

  try {
    // Validate DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error("ERROR: DATABASE_URL environment variable is not set");
      process.exit(1);
    }

    // Check migrations directory exists
    const migrationsPath = path.join(process.cwd(), "lib/db/migrations");
    if (!fs.existsSync(migrationsPath)) {
      console.error(`ERROR: Migrations directory not found at ${migrationsPath}`);
      process.exit(1);
    }

    // Check for migration files
    const files = fs.readdirSync(migrationsPath);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));

    if (sqlFiles.length === 0) {
      console.warn("WARNING: No migration files found");
      console.log("Run 'bun run db:generate' to create migrations");
      process.exit(0);
    }

    console.log(`Found ${sqlFiles.length} migration file(s)`);

    // Create PostgreSQL connection
    console.log("Testing database connection...");
    connection = postgres(process.env.DATABASE_URL, { max: 1 });

    // Test connection
    await connection`SELECT 1`;
    console.log("Database connection successful");

    // Create Drizzle instance
    const db = drizzle(connection);

    // Run migrations
    console.log("Applying migrations...");
    const startTime = Date.now();

    await migrate(db, {
      migrationsFolder: "./lib/db/migrations"
    });

    const duration = Date.now() - startTime;
    console.log(`Migrations completed successfully in ${duration}ms`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);

    // Helpful error context
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("Database connection refused. Check that PostgreSQL is running.");
      } else if (error.message.includes("authentication failed")) {
        console.error("Database authentication failed. Check DATABASE_URL credentials.");
      }
    }

    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

runMigrations();
