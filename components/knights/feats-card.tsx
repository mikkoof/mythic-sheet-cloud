"use client";

import { CircleCheckbox } from "@/components/knights/sheet/circle-checkbox";
import {
  SheetSection,
  SheetSubheading,
} from "@/components/knights/sheet/sheet-section";

const FEATS: { name: string; lines: string[] }[] = [
  {
    name: "Smite!",
    lines: [
      "Use before attacking",
      "+D12 or Blast",
      "VIG save or become Fatigued",
    ],
  },
  {
    name: "Focus!",
    lines: [
      "Use after attacking",
      "Use a Gambit without a die",
      "CLA save or become Fatigued",
    ],
  },
  {
    name: "Deny!",
    lines: [
      "Use against an attack in reach",
      "Discard one die from the roll",
      "SPI save or become Fatigued",
    ],
  },
];

type FeatsCardProps = {
  fatigued: boolean;
  onChange: (patch: { fatigued: boolean }) => void;
  canEdit: boolean;
};

export function FeatsCard({ fatigued, onChange, canEdit }: FeatsCardProps) {
  return (
    <SheetSection title="Feats">
      <div className="space-y-3">
        {FEATS.map((feat) => (
          <div
            key={feat.name}
            className="rounded-sm border border-foreground/30 bg-muted/30 px-3 py-2"
          >
            <SheetSubheading className="text-center text-lg">
              {feat.name}
            </SheetSubheading>
            <ul className="mt-1 space-y-0.5 text-center text-xs uppercase tracking-wide text-muted-foreground">
              {feat.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <CircleCheckbox
            id="feat-fatigued"
            checked={fatigued}
            onCheckedChange={(v) => onChange({ fatigued: v })}
            disabled={!canEdit}
            aria-label="Fatigued"
          />
          <label
            htmlFor="feat-fatigued"
            className="font-heading text-sm uppercase tracking-wider"
          >
            Fatigued
          </label>
          <input
            type="hidden"
            name="fatigued"
            value={fatigued ? "on" : ""}
            readOnly
          />
        </div>
      </div>
    </SheetSection>
  );
}
