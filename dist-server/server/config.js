import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    APP_ORIGIN: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
    TRUST_PROXY: z.enum(["true", "false"]).default("false")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid server configuration:");
    for (const issue of parsed.error.issues) {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Server configuration validation failed");
}
export const config = {
    ...parsed.data,
    TRUST_PROXY: parsed.data.TRUST_PROXY === "true"
};
