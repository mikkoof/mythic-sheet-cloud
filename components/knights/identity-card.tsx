import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type IdentityCardProps = {
  name: string;
  epithet: string;
  ultimateFate: string;
  onChange: (patch: {
    name?: string;
    epithet?: string;
    ultimateFate?: string;
  }) => void;
  canEdit: boolean;
};

export function IdentityCard({
  name,
  epithet,
  ultimateFate,
  onChange,
  canEdit,
}: IdentityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="knight-name">Name</Label>
            <Input
              id="knight-name"
              name="name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => onChange({ name: e.target.value })}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knight-epithet">Epithet (The ___ Knight)</Label>
            <Input
              id="knight-epithet"
              name="epithet"
              maxLength={60}
              value={epithet}
              onChange={(e) => onChange({ epithet: e.target.value })}
              disabled={!canEdit}
              placeholder="Cold"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="knight-ultimate-fate">Ultimate Fate</Label>
          <Textarea
            id="knight-ultimate-fate"
            name="ultimateFate"
            maxLength={500}
            rows={2}
            value={ultimateFate}
            onChange={(e) => onChange({ ultimateFate: e.target.value })}
            disabled={!canEdit}
            placeholder="The fate your Knight seeks or fears."
          />
        </div>
      </CardContent>
    </Card>
  );
}
