/**
 * Drizzle + Supabase (PostgreSQL) database connection.
 *
 * - Uses the postgres.js driver for optimal performance with Supabase.
 * - Compatible with serverless environments.
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

const connectionString = env.DATABASE_URL

// Connection pool configuration optimized for serverless
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // required for pgbouncer transaction mode
})

export const db = drizzle(sql)
