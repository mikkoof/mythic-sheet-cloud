import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { DEV_AUTH_ENABLED, DEV_USERS } from "@/lib/dev-auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/";

  if (session?.user) redirect(redirectTo);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      {DEV_AUTH_ENABLED ? (
        <div
          role="status"
          className="w-full max-w-sm rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-widest text-destructive"
        >
          Dev auth active
        </div>
      ) : null}

      <div className="w-full max-w-sm rounded-xl border border-border bg-card px-8 py-10 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-heading text-3xl tracking-wide text-foreground">
            Mythic Sheet
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your knights.
          </p>
        </div>

        <form
          className="mt-8"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <Button type="submit" size="lg" className="w-full">
            Continue with Google
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Access is limited to invited players.
        </p>
      </div>

      {DEV_AUTH_ENABLED ? (
        <div className="w-full max-w-sm rounded-xl border border-destructive/40 bg-card px-8 py-6">
          <p className="text-center text-sm font-semibold text-destructive">
            Dev sign-in
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Seeded users only — no real email delivery.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {DEV_USERS.map((user) => (
              <form
                key={user.email}
                action={async () => {
                  "use server";
                  await signIn("dev", {
                    email: user.email,
                    redirectTo,
                  });
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sign in as {user.label}
                </Button>
              </form>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
