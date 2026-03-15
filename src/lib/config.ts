import "dotenv/config";
import { z } from "zod";

const optionalUrl = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : val))
  .pipe(z.string().url().optional())
  .optional();

const optionalString = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : val))
  .optional();

const envSchema = z.object({
  SLACK_WEBHOOK_URL: optionalUrl,
  SEARCH_API_KEY: optionalString,
  SEARCH_ENGINE_ID: optionalString,
  DATABASE_URL: z.string().min(1),
  DISCOVERY_CRON: z.string().default("0 8 * * *"),
  DEFAULT_POLL_INTERVAL_MIN: z.coerce.number().int().positive().default(60),
  CHANGE_THRESHOLD_PCT: z.coerce.number().positive().default(5),
  PLAYWRIGHT_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  PORT: z.coerce.number().int().positive().default(3000),
  DIFF_VIEWER_BASE_URL: optionalUrl,
});

export const env = envSchema.parse(process.env);
