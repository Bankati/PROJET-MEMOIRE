/**
 * Typed runtime environment access for LBS Call Center.
 * Centralizes required env vars and ensures fast failure in dev.
 * Set SKIP_ENV_VALIDATION=1 in Vercel build settings to bypass at build time.
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
  AUTH_SECRET: z.string().min(1).optional(),
  SUPABASE_URL: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  COHERE_API_KEY: z.string().min(1).optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

const buildEnv = () => {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL ?? "placeholder",
      AUTH_SECRET: parseOptionalEnvString({ value: process.env.AUTH_SECRET }),
      SUPABASE_URL: parseOptionalEnvString({ value: process.env.SUPABASE_URL }),
      SUPABASE_SERVICE_ROLE_KEY: parseOptionalEnvString({ value: process.env.SUPABASE_SERVICE_ROLE_KEY }),
      COHERE_API_KEY: parseOptionalEnvString({ value: process.env.COHERE_API_KEY }),
      GOOGLE_GENERATIVE_AI_API_KEY: parseOptionalEnvString({ value: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
      OPENAI_API_KEY: parseOptionalEnvString({ value: process.env.OPENAI_API_KEY }),
    });
  }
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: parseOptionalEnvString({ value: process.env.AUTH_SECRET }),
    SUPABASE_URL: parseOptionalEnvString({ value: process.env.SUPABASE_URL }),
    SUPABASE_SERVICE_ROLE_KEY: parseOptionalEnvString({ value: process.env.SUPABASE_SERVICE_ROLE_KEY }),
    COHERE_API_KEY: parseOptionalEnvString({ value: process.env.COHERE_API_KEY }),
    GOOGLE_GENERATIVE_AI_API_KEY: parseOptionalEnvString({ value: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
    OPENAI_API_KEY: parseOptionalEnvString({ value: process.env.OPENAI_API_KEY }),
  });
};

export const env = buildEnv();
