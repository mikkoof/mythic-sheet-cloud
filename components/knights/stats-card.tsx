"use client";

import { DiamondTracker } from "@/components/knights/sheet/diamond-tracker";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { cn } from "@/lib/utils";

type StatPair = { remaining: number; max: number };
type StatKind = "vig" | "cla" | "spi";

type StatConfig = {
  label: string;
  eyebrow: string;
  descriptors: readonly [string, string, string];
};

const CONFIG: Record<StatKind, StatConfig> = {
  vig: {
    label: "VIG",
    eyebrow: "Vigour",
    descriptors: ["Strong Limbs", "Firm Hands", "Powerful Lungs"],
  },
  cla: {
    label: "CLA",
    eyebrow: "Clarity",
    descriptors: ["Keen Instinct", "Lucid Mind", "Shrewd Eyes"],
  },
  spi: {
    label: "SPI",
    eyebrow: "Spirit",
    descriptors: ["Charming Tongue", "Iron Will", "Fierce Heart"],
  },
};

const STAT_MIN = 2;
const STAT_MAX = 18;

type StatSectionProps = {
  kind: StatKind;
  value: StatPair;
  traits: string[];
  onChangeValue: (value: StatPair) => void;
  onChangeTraits: (traits: string[]) => void;
  canEdit: boolean;
  className?: string;
};

export function StatSection({
  kind,
  value,
  traits,
  onChangeValue,
  canEdit,
  className,
}: StatSectionProps) {
  const cfg = CONFIG[kind];

  return (
    <SheetSection
      title={cfg.label}
      eyebrow={cfg.eyebrow}
      className={cn("h-full", className)}
    >
      <div className="flex h-full flex-col items-center justify-between gap-3 py-1">
        <DiamondTracker
          idPrefix={`stat-${kind}`}
          ariaLabel={cfg.label}
          remaining={value.remaining}
          max={value.max}
          onChange={onChangeValue}
          disabled={!canEdit}
          min={STAT_MIN}
          maxValue={STAT_MAX}
        />
        <p className="text-center text-xs italic text-muted-foreground">
          {cfg.descriptors.join(" · ")}
        </p>
      </div>
      <input
        type="hidden"
        name={`${kind}Remaining`}
        value={value.remaining}
        readOnly
      />
      <input type="hidden" name={`${kind}Max`} value={value.max} readOnly />
      <input
        type="hidden"
        name={`${kind}Traits`}
        value={JSON.stringify(traits)}
        readOnly
      />
    </SheetSection>
  );
}
