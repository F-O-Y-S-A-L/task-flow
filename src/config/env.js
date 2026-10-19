const { z } = require("zod");
require("dotenv").config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/taskflow"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(""),
  JWT_ACCESS_SECRET: z.string().min(32).default("development-access-secret-change-me-123456"),
  JWT_REFRESH_SECRET: z.string().min(32).default("development-refresh-secret-change-me-123456"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  LOG_LEVEL: z.string().default("info"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("no-reply@example.com")
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
module.exports = parsed.data;
