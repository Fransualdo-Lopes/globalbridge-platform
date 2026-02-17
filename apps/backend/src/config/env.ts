
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-prod',
  GOOGLE_CREDENTIALS_PATH: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Validate critical envs
if (!ENV.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET must be defined.");
}
