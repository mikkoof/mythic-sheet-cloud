"use client";

import { AttackDiceBox } from "@/components/knights/sheet/attack-dice-box";
import { CircleCheckbox } from "@/components/knights/sheet/circle-checkbox";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { Button } from "@/components/ui/button";

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

const FLAGS = [
  { key: "hefty" as const, label: "H", title: "Hefty" },
  { key: "long" as const, label: "L", title: "Long" },
  { key: "slow" as const, label: "S", title: "Slow" },
];

export function WeaponsCard({ weapons, onChange, canEdit }: WeaponsCardProps) {
  const add = () => onChange([...weapons, { ...BLANK }]);
  const remove = (i: number) =>
    onChange(weapons.filter((_, idx) => idx !== i));
  const patch = (i: number, p: Partial<Weapon>) =>
    onChange(weapons.map((w, idx) => (idx === i ? { ...w, ...p } : w)));

  return (
    <SheetSection title="Weapon">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2">
        <div className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground">
          {/* name column header intentionally blank */}
        </div>
        <div className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground text-center">
          Attack Dice
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {FLAGS.map((f) => (
            <span
              key={f.key}
              title={f.title}
              className="font-heading text-[10px] uppercase tracking-widest text-muted-foreground w-5"
            >
              {f.label}
            </span>
          ))}
        </div>

        {weapons.length === 0 ? (
          <div className="col-span-3 py-2 text-sm italic text-muted-foreground">
            No weapons yet.
          </div>
        ) : (
          weapons.map((w, i) => {
            const idPrefix = `weapon-${i}`;
            return (
              <div key={i} className="contents">
                <div className="flex items-center gap-2">
                  <input
                    id={`${idPrefix}-name`}
                    type="text"
                    value={w.name}
                    maxLength={60}
                    onChange={(e) => patch(i, { name: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Weapon name"
                    aria-label={`Weapon ${i + 1} name`}
                    className="sheet-lined-input font-heading text-sm tracking-wide"
                  />
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(i)}
                      aria-label={`Remove weapon ${i + 1}`}
                    >
                      ×
                    </Button>
                  ) : null}
                </div>
                <AttackDiceBox
                  id={`${idPrefix}-dice`}
                  value={w.attackDice}
                  onChange={(v) => patch(i, { attackDice: v })}
                  disabled={!canEdit}
                  ariaLabel={`Weapon ${i + 1} attack dice`}
                />
                <div className="grid grid-cols-3 gap-2 justify-items-center">
                  {FLAGS.map((f) => (
                    <CircleCheckbox
                      key={f.key}
                      id={`${idPrefix}-${f.key}`}
                      checked={w[f.key]}
                      onCheckedChange={(v) => patch(i, { [f.key]: v })}
                      disabled={!canEdit}
                      aria-label={`${f.title} (weapon ${i + 1})`}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      {canEdit ? (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={weapons.length >= 12}
          >
            + Add weapon
          </Button>
        </div>
      ) : null}
      <div className="mt-4 space-y-1 border-t border-foreground/20 pt-3 text-[11px] leading-snug text-muted-foreground">
        <p>
          <span className="font-heading uppercase">Hefty</span>: One hand. You
          may only use one.
        </p>
        <p>
          <span className="font-heading uppercase">Long</span>: Two hands.{" "}
          <span className="font-heading uppercase">Impaired</span> in confined
          spaces.
        </p>
        <p>
          <span className="font-heading uppercase">Slow</span>: Can&apos;t both
          move and Attack.{" "}
          <span className="font-heading uppercase">Long</span>.
        </p>
      </div>
      <input
        type="hidden"
        name="weapons"
        value={JSON.stringify(weapons)}
        readOnly
      />
    </SheetSection>
  );
}
