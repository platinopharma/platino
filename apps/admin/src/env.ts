import { z } from "zod";

const serverSchema = z.object({
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid URL"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required for email delivery"),
  RESEND_FROM: z.string().min(1, "RESEND_FROM is required (e.g. 'Company <noreply@company.com>')"),
  ADMIN_SECRET: z.string().min(1, "ADMIN_SECRET is required for secured endpoints"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Since Next.js doesn't support full process.env destructuring safely due to webpack,
// we build the processEnv object explicitly for server-side vars.
const processEnv = {
  MONGODB_URI: process.env.MONGODB_URI,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = serverSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4)
  );
  process.exit(1);
}

export const env = parsed.data;
