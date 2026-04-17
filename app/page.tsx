import { auth } from "@/auth";

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
          Your campaigns and knights will appear here soon.
        </p>
      </div>
    </main>
  );
}
