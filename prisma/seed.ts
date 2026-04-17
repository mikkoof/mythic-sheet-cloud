import { loadEnvFile } from "node:process";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../lib/generated/prisma/client";
import { DEV_USERS } from "../lib/dev-auth";

try {
  loadEnvFile(".env.local");
} catch {
  // optional; CI / Vercel envs are injected directly
}

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.POSTGRES_PRISMA_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const user of DEV_USERS) {
      const row = await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name },
        create: { email: user.email, name: user.name },
      });
      console.log(`seeded user ${row.email} (${row.id})`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
