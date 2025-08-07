import dotenv from 'dotenv';
import { z } from 'zod'; // For runtime validation

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Environment validation schema (using Zod for runtime safety)
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default(3000),
    DATABASE_URL: z.string().min(1, 'Database URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT secret is required'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    CORS_ORIGIN: z.string().optional(),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Environment = z.infer<typeof envSchema>;
