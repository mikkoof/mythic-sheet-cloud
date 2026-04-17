import { createCampaignAction } from "@/app/campaigns/actions";
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
import { Textarea } from "@/components/ui/textarea";

export function CreateCampaignForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-wide">
          New campaign
        </CardTitle>
        <CardDescription>
          Start a fresh campaign — you become its Game Master.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createCampaignAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Name</Label>
            <Input
              id="campaign-name"
              name="name"
              required
              maxLength={80}
              placeholder="The Hollow Marches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description</Label>
            <Textarea
              id="campaign-description"
              name="description"
              maxLength={500}
              rows={3}
              placeholder="A hex crawl through the broken fens, hunting for the Lost Knight."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create campaign</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
