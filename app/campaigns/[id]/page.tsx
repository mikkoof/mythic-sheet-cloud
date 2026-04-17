import Link from "next/link";

import { DeleteCampaignButton } from "@/components/campaigns/delete-campaign-button";
import { EditCampaignForm } from "@/components/campaigns/edit-campaign-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCampaignAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  const { id } = await params;
  const { campaign, isGm } = await requireCampaignAccess(id);

  const members = await prisma.campaignMember.findMany({
    where: { campaignId: campaign.id },
    include: { user: true },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/campaigns">← All campaigns</Link>
        </Button>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-wide text-foreground">
          {campaign.name}
        </h1>
        {campaign.description ? (
          <p className="max-w-2xl text-muted-foreground">{campaign.description}</p>
        ) : (
          <p className="text-muted-foreground italic">No description yet.</p>
        )}
      </header>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl tracking-wide">
              Members
            </CardTitle>
            <CardDescription>
              {isGm
                ? "Invites and player-facing roles will land with v1."
                : "Only the Game Master can change this roster."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="text-foreground">
                      {member.user.name ?? member.user.email ?? "Unnamed knight"}
                    </span>
                    {member.user.name && member.user.email ? (
                      <span className="text-xs text-muted-foreground">
                        {member.user.email}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={
                      member.role === "gm"
                        ? "rounded-full border border-accent/60 bg-accent/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent-foreground"
                        : "rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    }
                  >
                    {member.role === "gm" ? "Game Master" : "Player"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {isGm ? (
        <>
          <section>
            <EditCampaignForm
              id={campaign.id}
              name={campaign.name}
              description={campaign.description}
            />
          </section>

          <section className="flex justify-end">
            <DeleteCampaignButton id={campaign.id} name={campaign.name} />
          </section>
        </>
      ) : null}
    </main>
  );
}
