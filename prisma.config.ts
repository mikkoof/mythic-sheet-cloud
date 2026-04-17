import { defineConfig } from "prisma/config";

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
