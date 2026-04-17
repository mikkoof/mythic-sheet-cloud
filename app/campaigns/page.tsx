import Link from "next/link";

import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";

export default async function CampaignsPage() {
  const user = await requireCurrentUser();

  const memberships = await prisma.campaignMember.findMany({
    where: { userId: user.id },
    include: { campaign: true },
    orderBy: { campaign: { createdAt: "desc" } },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">
          Your campaigns
        </h1>
        <p className="text-muted-foreground">
          Campaigns you run or belong to. Create a new one to step into the
          mantle of Game Master.
        </p>
      </header>

      <section className="space-y-4">
        {memberships.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl tracking-wide">
                No campaigns yet
              </CardTitle>
              <CardDescription>
                Start one below — you&apos;ll be its Game Master.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {memberships.map(({ campaign, role }) => (
              <li key={campaign.id}>
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="transition group-hover:border-primary/60">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="font-heading text-xl tracking-wide">
                          {campaign.name}
                        </CardTitle>
                        {role === "gm" ? (
                          <span className="rounded-full border border-accent/60 bg-accent/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent-foreground">
                            GM
                          </span>
                        ) : (
                          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Player
                          </span>
                        )}
                      </div>
                      {campaign.description ? (
                        <CardDescription className="line-clamp-3">
                          {campaign.description}
                        </CardDescription>
                      ) : null}
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <CreateCampaignForm />
      </section>
    </main>
  );
}
