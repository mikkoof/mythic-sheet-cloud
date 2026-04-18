import Link from "next/link";

import { DeleteCampaignButton } from "@/components/campaigns/delete-campaign-button";
import { EditCampaignForm } from "@/components/campaigns/edit-campaign-form";
import { InviteForm } from "@/components/campaigns/invite-form";
import { InviteList } from "@/components/campaigns/invite-list";
import { MemberList } from "@/components/campaigns/member-list";
import { DeleteKnightButton } from "@/components/knights/delete-knight-button";
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
import type { KnightStatus } from "@/lib/validators/knight";
import { cn } from "@/lib/utils";

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
      include: {
        player: { select: { name: true, email: true } },
        predecessor: { select: { id: true, name: true } },
      },
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

  const STATUS_ORDER: Record<KnightStatus, number> = {
    active: 0,
    retired: 1,
    dead: 2,
  };
  const sortedKnights = [...knights].sort((a, b) => {
    const aMine = a.playerUserId === user.id ? 0 : 1;
    const bMine = b.playerUserId === user.id ? 0 : 1;
    if (aMine !== bMine) return aMine - bMine;
    const aStatus = STATUS_ORDER[a.status as KnightStatus];
    const bStatus = STATUS_ORDER[b.status as KnightStatus];
    if (aStatus !== bStatus) return aStatus - bStatus;
    return a.createdAt.getTime() - b.createdAt.getTime();
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
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-xl tracking-wide">
                  Knights
                </CardTitle>
                <CardDescription>
                  {sortedKnights.length === 0
                    ? "No knights in this campaign yet."
                    : "Your knights appear first. Retired and fallen knights are dimmed."}
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href={`/campaigns/${campaign.id}/knights/new`}>
                  New knight
                </Link>
              </Button>
            </div>
          </CardHeader>
          {sortedKnights.length > 0 ? (
            <CardContent>
              <ul className="divide-y divide-border">
                {sortedKnights.map((knight) => {
                  const rank = rankFromGlory(knight.glory);
                  const mine = knight.playerUserId === user.id;
                  const playerLabel =
                    knight.player.name ?? knight.player.email ?? "Unknown";
                  const status = knight.status as KnightStatus;
                  const dimmed = status !== "active";
                  const canDelete = isGm || mine;
                  return (
                    <li
                      key={knight.id}
                      className={cn(
                        "flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0",
                        dimmed && "opacity-70",
                      )}
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
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span>{mine ? "You" : playerLabel}</span>
                          {knight.predecessor ? (
                            <span className="italic">
                              ⟵ successor to{" "}
                              {knight.predecessor.name || "Unnamed Knight"}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        {status !== "active" ? (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
                              status === "dead"
                                ? "border-destructive/50 bg-destructive/10 text-destructive"
                                : "border-muted-foreground/40 bg-muted text-muted-foreground",
                            )}
                          >
                            {status}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-accent/60 bg-accent/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent-foreground">
                          {rank.name}
                        </span>
                        {canDelete ? (
                          <DeleteKnightButton
                            knightId={knight.id}
                            knightName={knight.name}
                            knightEpithet={knight.epithet}
                          />
                        ) : null}
                      </div>
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
