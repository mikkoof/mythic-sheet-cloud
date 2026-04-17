import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";

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
    <main className="flex flex-1 items-center justify-center p-8">
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
    </main>
  );
}
