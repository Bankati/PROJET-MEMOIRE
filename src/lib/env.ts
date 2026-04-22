/**
 * Typed runtime environment access for LBS Call Center.
 * Centralizes required env vars and ensures fast failure in dev.
 */
import { z } from "zod";

const parseOptionalEnvString = ({
  value,
}: Readonly<{
  value: string | undefined;
}>): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const trimmedValue: string = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  // Auth.js secret for JWT signing
  AUTH_SECRET: z.string().min(1).optional(),
  // Supabase configuration
  SUPABASE_URL: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Other services
  UPSTASH_REDIS_REST_URL: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: parseOptionalEnvString({ value: process.env.AUTH_SECRET }),
  SUPABASE_URL: parseOptionalEnvString({ value: process.env.SUPABASE_URL }),
  SUPABASE_SERVICE_ROLE_KEY: parseOptionalEnvString({ value: process.env.SUPABASE_SERVICE_ROLE_KEY }),
  UPSTASH_REDIS_REST_URL: parseOptionalEnvString({
    value: process.env.UPSTASH_REDIS_REST_URL,
  }),
  UPSTASH_REDIS_REST_TOKEN: parseOptionalEnvString({
    value: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  TWILIO_ACCOUNT_SID: parseOptionalEnvString({ value: process.env.TWILIO_ACCOUNT_SID }),
  TWILIO_AUTH_TOKEN: parseOptionalEnvString({ value: process.env.TWILIO_AUTH_TOKEN }),
  OPENAI_API_KEY: parseOptionalEnvString({ value: process.env.OPENAI_API_KEY }),
});

