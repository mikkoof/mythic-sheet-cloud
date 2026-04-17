import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

try {
  loadEnvFile(".env.local");
} catch {
  // .env.local is optional (e.g. CI) — fall through to platform-provided env
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Non-pooled URL for CLI operations (migrations, introspection).
    // Runtime PrismaClient uses the pooled URL via lib/db.ts.
    url: process.env["POSTGRES_URL_NON_POOLING"]!,
  },
});
