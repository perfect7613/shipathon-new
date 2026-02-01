import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI APIs
  ANTHROPIC_API_KEY: z.string().min(1),
  GOOGLE_AI_API_KEY: z.string().min(1),

  // ElevenLabs
  ELEVENLABS_API_KEY: z.string().min(1),

  // Apify
  APIFY_TOKEN: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Server
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
