import { updateCampaignAction } from "@/app/campaigns/actions";
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

type EditCampaignFormProps = {
  id: string;
  name: string;
  description: string | null;
};

export function EditCampaignForm({ id, name, description }: EditCampaignFormProps) {
  const updateThisCampaign = updateCampaignAction.bind(null, id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Campaign details
        </CardTitle>
        <CardDescription>Only the Game Master can edit these.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateThisCampaign} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-name-${id}`}>Name</Label>
            <Input
              id={`edit-name-${id}`}
              name="name"
              required
              maxLength={80}
              defaultValue={name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-description-${id}`}>Description</Label>
            <Textarea
              id={`edit-description-${id}`}
              name="description"
              maxLength={500}
              rows={3}
              defaultValue={description ?? ""}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
