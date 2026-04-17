import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/db";
import { DEV_AUTH_ENABLED, isDevUserEmail } from "@/lib/dev-auth";
import { convertPendingInvites } from "@/lib/invites";

const providers: NextAuthConfig["providers"] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
];

if (DEV_AUTH_ENABLED) {
  providers.push(
    Credentials({
      id: "dev",
      name: "Dev",
      credentials: { email: {} },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string" ? credentials.email : null;
        if (!email || !isDevUserEmail(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT strategy. In dev we allow JWT; in prod
  // (Google only) we keep the database-backed strategy the spec specifies.
  session: { strategy: DEV_AUTH_ENABLED ? "jwt" : "database" },
  providers,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session({ session, user, token }) {
      const id = user?.id ?? (token?.sub as string | undefined);
      if (id) session.user.id = id;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user?.id || !user.email) return;
      try {
        await convertPendingInvites(user.id, user.email);
      } catch (err) {
        console.error("convertPendingInvites failed", err);
      }
    },
  },
});
