"use client";

import { DiamondCheckbox } from "@/components/knights/sheet/diamond-checkbox";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import type { KnightAge } from "@/lib/validators/knight";

type AgeSelectorProps = {
  age: KnightAge;
  onChange: (age: KnightAge) => void;
  canEdit: boolean;
};

const OPTIONS: { value: KnightAge; label: string }[] = [
  { value: "young", label: "Young" },
  { value: "mature", label: "Mature" },
  { value: "old", label: "Old" },
];

export function AgeSelector({ age, onChange, canEdit }: AgeSelectorProps) {
  return (
    <SheetSection title="Age">
      <div role="radiogroup" aria-label="Age" className="space-y-2">
        {OPTIONS.map(({ value, label }) => {
          const id = `age-${value}`;
          const selected = age === value;
          return (
            <div key={value} className="flex items-center gap-3">
              <DiamondCheckbox
                id={id}
                checked={selected}
                disabled={!canEdit}
                onCheckedChange={(next) => {
                  if (!canEdit) return;
                  if (next || !selected) onChange(value);
                }}
                aria-label={label}
              />
              <label
                htmlFor={id}
                className="font-heading text-base tracking-wide"
              >
                {label}
              </label>
            </div>
          );
        })}
      </div>
      <input type="hidden" name="age" value={age} readOnly />
    </SheetSection>
  );
}
