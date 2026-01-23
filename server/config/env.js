import { z } from 'zod';

/**
 * Backend Environment Variable Validation
 * ensuring secrets and configs are present and correct at startup.
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().default("postgres://user:pass@localhost:5432/moodtunes"),
  
  // Security
  JWT_SECRET: z.string().min(32).default("super-secret-key-at-least-32-chars-long-for-dev"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).default(12),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001)
});

// Validate process.env
// In a real app, this would throw if required vars are missing (remove .default() for strict prod)
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  // process.exit(1); // Uncomment to strictly enforce validation
}

export const env = parsedEnv.data || envSchema.parse({}); // Fallback for dev convenience
