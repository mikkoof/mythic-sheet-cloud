This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local development

Copy `.env.example` to `.env.local`, fill in the Postgres and `AUTH_SECRET` keys, then:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed      # creates gm@localhost.test, player1@localhost.test, player2@localhost.test
ALLOW_DEV_AUTH=true pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). You will see a red "DEV AUTH ACTIVE" banner on `/signin` with buttons to sign in as the seeded users — no Google OAuth round-trip needed.

`ALLOW_DEV_AUTH` is gated to non-production builds: `auth.ts` throws at import time if `NODE_ENV=production` and the flag is set, and the dev provider is only registered when both conditions hold. **Never set this flag on production or preview deployments.**

## Running tests

```bash
pnpm test       # vitest run
pnpm typecheck
pnpm lint
```

Tests that need an authenticated session use the helper in `test/auth.ts`:

```ts
import { mockAuth, devSession } from "@/test/auth";
mockAuth(devSession({ name: "Dev Player 1" }));
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
