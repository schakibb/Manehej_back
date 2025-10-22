import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),

  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET should be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET should be at least 32 characters"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  ACCESS_TOKEN_MAX_AGE: z.string().default("15m"),
  REFRESH_TOKEN_MAX_AGE: z.string().default("7d"),

  PORT: z.coerce.number().positive().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  FRONTEND_URL: z.url("FRONTEND_URL must be a valid URL"),

  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattened = z.flattenError(error);
      console.error("❌ Environment validation failed:\n" + flattened + "\n");
      process.exit(1);
    }

    throw error;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

const ENV: Env = validateEnv();
export default ENV;
