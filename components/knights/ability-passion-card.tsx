import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AbilityPassionCardProps = {
  ability: string;
  passion: string;
  onChange: (patch: { ability?: string; passion?: string }) => void;
  canEdit: boolean;
};

export function AbilityPassionCard({
  ability,
  passion,
  onChange,
  canEdit,
}: AbilityPassionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Ability & Passion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="knight-ability">Ability</Label>
          <Textarea
            id="knight-ability"
            name="ability"
            maxLength={1000}
            rows={3}
            value={ability}
            onChange={(e) => onChange({ ability: e.target.value })}
            disabled={!canEdit}
            placeholder="Your Knight's signature ability."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="knight-passion">Restore SPI when:</Label>
          <Textarea
            id="knight-passion"
            name="passion"
            maxLength={500}
            rows={2}
            value={passion}
            onChange={(e) => onChange({ passion: e.target.value })}
            disabled={!canEdit}
            placeholder="The thing that stirs your Knight's spirit."
          />
        </div>
      </CardContent>
    </Card>
  );
}
