import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Step into your hall — pick up a campaign you run or one you belong to.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg">
            <Link href="/campaigns">Your campaigns</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
