"use client";

import { CircleCheckbox } from "@/components/knights/sheet/circle-checkbox";
import { SheetSection } from "@/components/knights/sheet/sheet-section";

export const CONDITION_TEXT = {
  exhausted: "Cannot Attack if you have moved this turn",
  exposed: "Treated as having 0 Guard",
  impaired: "All Attacks made with a single D4 only",
} as const;

type ConditionKey = keyof typeof CONDITION_TEXT;

type ConditionsCardProps = {
  exposed: boolean;
  exhausted: boolean;
  impaired: boolean;
  onChange: (patch: Partial<Record<ConditionKey, boolean>>) => void;
  canEdit: boolean;
};

const ORDER: ConditionKey[] = ["exhausted", "exposed", "impaired"];
const LABELS: Record<ConditionKey, string> = {
  exhausted: "Exhausted",
  exposed: "Exposed",
  impaired: "Impaired",
};

export function ConditionsCard({
  exposed,
  exhausted,
  impaired,
  onChange,
  canEdit,
}: ConditionsCardProps) {
  const values: Record<ConditionKey, boolean> = {
    exhausted,
    exposed,
    impaired,
  };

  return (
    <SheetSection title="Conditions">
      <div className="space-y-3">
        {ORDER.map((key) => {
          const id = `condition-${key}`;
          const checked = values[key];
          return (
            <div key={key} className="flex items-start gap-3">
              <div className="pt-0.5">
                <CircleCheckbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(v) => onChange({ [key]: v } as Partial<Record<ConditionKey, boolean>>)}
                  disabled={!canEdit}
                  aria-label={LABELS[key]}
                />
              </div>
              <input
                type="hidden"
                name={key}
                value={checked ? "on" : ""}
                readOnly
              />
              <div className="flex-1">
                <label
                  htmlFor={id}
                  className="font-heading text-sm uppercase tracking-wider"
                >
                  {LABELS[key]}
                </label>
                <p className="text-xs leading-snug text-muted-foreground">
                  {CONDITION_TEXT[key]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SheetSection>
  );
}
