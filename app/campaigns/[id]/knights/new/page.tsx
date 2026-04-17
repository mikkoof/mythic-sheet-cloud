import Link from "next/link";

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

type NewKnightPageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewKnightPage({ params }: NewKnightPageProps) {
  const { id } = await params;
  const { campaign } = await requireCampaignAccess(id);
  const createForThisCampaign = createKnightAction.bind(null, id);

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
            New knight
          </CardTitle>
          <CardDescription>
            Name your Knight — you can edit every other detail on the sheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createForThisCampaign} className="space-y-4">
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
              <Button type="submit">Create knight</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
