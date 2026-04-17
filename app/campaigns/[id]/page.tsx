import Link from "next/link";

import { DeleteCampaignButton } from "@/components/campaigns/delete-campaign-button";
import { EditCampaignForm } from "@/components/campaigns/edit-campaign-form";
import { InviteForm } from "@/components/campaigns/invite-form";
import { InviteList } from "@/components/campaigns/invite-list";
import { MemberList } from "@/components/campaigns/member-list";
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
import { rankFromGlory } from "@/lib/rank";

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  const { id } = await params;
  const { campaign, isGm, user } = await requireCampaignAccess(id);

  const [members, knights, invites] = await Promise.all([
    prisma.campaignMember.findMany({
      where: { campaignId: campaign.id },
      include: { user: true },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    }),
    prisma.knight.findMany({
      where: { campaignId: campaign.id },
      include: { player: { select: { name: true, email: true } } },
      orderBy: [{ createdAt: "asc" }],
    }),
    isGm
      ? prisma.campaignInvite.findMany({
          where: { campaignId: campaign.id },
          orderBy: [{ createdAt: "asc" }],
          select: { id: true, email: true, createdAt: true },
        })
      : Promise.resolve([]),
  ]);

  const ownKnights = knights.filter((k) => k.playerUserId === user.id);
  const otherKnights = knights.filter((k) => k.playerUserId !== user.id);
  const orderedKnights = [...ownKnights, ...otherKnights];

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
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-xl tracking-wide">
                  Knights
                </CardTitle>
                <CardDescription>
                  {orderedKnights.length === 0
                    ? "No knights in this campaign yet."
                    : "Your knights appear first."}
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/campaigns/${campaign.id}/knights/new`}>
                  New knight
                </Link>
              </Button>
            </div>
          </CardHeader>
          {orderedKnights.length > 0 ? (
            <CardContent>
              <ul className="divide-y divide-border">
                {orderedKnights.map((knight) => {
                  const rank = rankFromGlory(knight.glory);
                  const mine = knight.playerUserId === user.id;
                  const playerLabel =
                    knight.player.name ?? knight.player.email ?? "Unknown";
                  return (
                    <li
                      key={knight.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <Link
                        href={`/campaigns/${campaign.id}/knights/${knight.id}`}
                        className="group flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="font-heading text-lg tracking-wide group-hover:text-primary">
                          {knight.name || "Unnamed Knight"}
                          {knight.epithet ? (
                            <span className="ml-2 font-sans text-sm italic text-muted-foreground">
                              the {knight.epithet} Knight
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mine ? "You" : playerLabel}
                        </div>
                      </Link>
                      <span className="rounded-full border border-accent/60 bg-accent/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent-foreground">
                        {rank.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          ) : null}
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl tracking-wide">
              Members
            </CardTitle>
            <CardDescription>
              {isGm
                ? "Invite players by email. Existing users join immediately; new emails wait for Google sign-in."
                : "Only the Game Master can change this roster."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isGm ? <InviteForm campaignId={campaign.id} /> : null}
            {isGm ? <InviteList invites={invites} /> : null}
            <MemberList
              members={members}
              gmUserId={campaign.gmUserId}
              isGm={isGm}
              campaignId={campaign.id}
            />
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
