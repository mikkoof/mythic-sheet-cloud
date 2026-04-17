import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { rankFromGlory } from "@/lib/rank";

type GloryRankCardProps = {
  glory: number;
  onChange: (glory: number) => void;
  canEdit: boolean;
};

export function GloryRankCard({ glory, onChange, canEdit }: GloryRankCardProps) {
  const clamped = Math.max(0, Math.min(12, Math.floor(glory)));
  const { name, worthyTo } = rankFromGlory(clamped);

  const dec = () => onChange(Math.max(0, clamped - 1));
  const inc = () => onChange(Math.min(12, clamped + 1));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Glory & Rank
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-2xl tracking-wide text-accent-foreground">
              {name}
            </p>
            <p className="text-sm italic text-muted-foreground">{worthyTo}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={dec}
              disabled={!canEdit || clamped <= 0}
              aria-label="Decrease glory"
            >
              −
            </Button>
            <div
              className="min-w-14 rounded-md border border-border bg-muted px-4 py-2 text-center font-heading text-2xl"
              aria-live="polite"
            >
              {clamped}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={inc}
              disabled={!canEdit || clamped >= 12}
              aria-label="Increase glory"
            >
              +
            </Button>
          </div>
          <input type="hidden" name="glory" value={clamped} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
