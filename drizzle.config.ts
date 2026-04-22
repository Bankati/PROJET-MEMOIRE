/**
 * Drizzle Kit configuration for LBS Call Center.
 * Used by `drizzle-kit` to generate migrations and run Drizzle Studio.
 * Database: Supabase (PostgreSQL)
 */
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so we explicitly load env files.
// Prefer `.env.local` (developer machine), fallback to `.env`.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});

