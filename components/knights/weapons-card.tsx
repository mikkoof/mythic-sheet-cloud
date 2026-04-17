import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Weapon } from "@/lib/validators/knight";

type WeaponsCardProps = {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  canEdit: boolean;
};

const BLANK: Weapon = {
  name: "",
  attackDice: "",
  hefty: false,
  long: false,
  slow: false,
  notes: "",
};

export function WeaponsCard({ weapons, onChange, canEdit }: WeaponsCardProps) {
  const add = () => onChange([...weapons, { ...BLANK }]);
  const remove = (i: number) =>
    onChange(weapons.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<Weapon>) =>
    onChange(weapons.map((w, idx) => (idx === i ? { ...w, ...p } : w)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl tracking-wide">
          Weapons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {weapons.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No weapons yet.
          </p>
        ) : (
          weapons.map((w, i) => {
            const idPrefix = `weapon-${i}`;
            return (
              <div
                key={i}
                className="space-y-3 rounded-md border border-border bg-muted/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3 sm:grid-cols-[2fr_1fr]">
                    <div className="space-y-1">
                      <Label htmlFor={`${idPrefix}-name`}>Name</Label>
                      <Input
                        id={`${idPrefix}-name`}
                        value={w.name}
                        maxLength={60}
                        onChange={(e) => patch(i, { name: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${idPrefix}-dice`}>Attack dice</Label>
                      <Input
                        id={`${idPrefix}-dice`}
                        value={w.attackDice}
                        maxLength={40}
                        onChange={(e) =>
                          patch(i, { attackDice: e.target.value })
                        }
                        disabled={!canEdit}
                        placeholder="d8 / d10 / d12"
                      />
                    </div>
                  </div>
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(i)}
                      aria-label={`Remove weapon ${i + 1}`}
                    >
                      ×
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {(["hefty", "long", "slow"] as const).map((flag) => {
                    const id = `${idPrefix}-${flag}`;
                    return (
                      <label
                        key={flag}
                        htmlFor={id}
                        className="inline-flex items-center gap-2 capitalize"
                      >
                        <Checkbox
                          id={id}
                          checked={w[flag]}
                          onCheckedChange={(v) =>
                            patch(i, { [flag]: v === true })
                          }
                          disabled={!canEdit}
                        />
                        {flag}
                      </label>
                    );
                  })}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
                  <Textarea
                    id={`${idPrefix}-notes`}
                    rows={2}
                    maxLength={300}
                    value={w.notes}
                    onChange={(e) => patch(i, { notes: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            );
          })
        )}
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={weapons.length >= 12}
          >
            + Add weapon
          </Button>
        ) : null}
        <input
          type="hidden"
          name="weapons"
          value={JSON.stringify(weapons)}
          readOnly
        />
      </CardContent>
    </Card>
  );
}
