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
const createSqlClient = (): postgres.Sql =>
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // required for pgbouncer transaction mode
  })

// En dev, Next.js recharge ce module à chaud à chaque modification de fichier — sans ce
// cache sur globalThis, chaque rechargement recréerait un nouveau pool de connexions sans
// jamais fermer les précédents, jusqu'à saturer la limite de connexions de Supabase
// (symptôme : requêtes de plus en plus lentes puis échecs intermittents).
const globalForDb = globalThis as unknown as { sqlClient?: postgres.Sql }

const sql = globalForDb.sqlClient ?? createSqlClient()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sqlClient = sql
}

export const db = drizzle(sql)
