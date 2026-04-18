import Link from "next/link";
import { notFound } from "next/navigation";

import { createKnightAction } from "@/app/campaigns/[id]/knights/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireCampaignAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";

type NewKnightPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ predecessor?: string }>;
};

export default async function NewKnightPage({
  params,
  searchParams,
}: NewKnightPageProps) {
  const { id } = await params;
  const { predecessor: predecessorId } = await searchParams;
  const { campaign, user, isGm } = await requireCampaignAccess(id);
  const createForThisCampaign = createKnightAction.bind(null, id);

  let predecessor:
    | { id: string; name: string; epithet: string; playerUserId: string }
    | null = null;
  if (predecessorId) {
    const row = await prisma.knight.findUnique({
      where: { id: predecessorId },
      select: {
        id: true,
        name: true,
        epithet: true,
        campaignId: true,
        playerUserId: true,
      },
    });
    if (!row || row.campaignId !== id) notFound();
    if (!isGm && row.playerUserId !== user.id) notFound();
    predecessor = {
      id: row.id,
      name: row.name,
      epithet: row.epithet,
      playerUserId: row.playerUserId,
    };
  }

  const headingSuffix = predecessor ? "Successor" : "New knight";
  const descriptor = predecessor
    ? `Creating a successor to ${predecessor.name || "an unnamed Knight"}${
        predecessor.epithet ? `, the ${predecessor.epithet} Knight` : ""
      }.`
    : "Name your Knight — you can edit every other detail on the sheet.";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href={`/campaigns/${id}`}>← {campaign.name}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-wide">
            {headingSuffix}
          </CardTitle>
          <CardDescription>{descriptor}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createForThisCampaign} className="space-y-4">
            {predecessor ? (
              <input
                type="hidden"
                name="predecessorKnightId"
                value={predecessor.id}
              />
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="new-knight-name">Name</Label>
              <Input
                id="new-knight-name"
                name="name"
                required
                maxLength={80}
                placeholder="Sir Galeran"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-knight-epithet">
                Epithet (The ___ Knight)
              </Label>
              <Input
                id="new-knight-epithet"
                name="epithet"
                maxLength={60}
                placeholder="Cold"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                {predecessor ? "Create successor" : "Create knight"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
