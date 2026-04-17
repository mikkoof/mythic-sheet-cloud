"use client";

import { DiamondTracker } from "@/components/knights/sheet/diamond-tracker";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { cn } from "@/lib/utils";

type StatPair = { remaining: number; max: number };
type TraitTriplet = [string, string, string] | string[];

type StatKind = "vig" | "cla" | "spi";

type StatSectionProps = {
  kind: StatKind;
  value: StatPair;
  traits: TraitTriplet;
  onChangeValue: (value: StatPair) => void;
  onChangeTraits: (traits: string[]) => void;
  canEdit: boolean;
};

const META: Record<
  StatKind,
  { title: string; placeholders: readonly [string, string, string] }
> = {
  vig: {
    title: "Vigour",
    placeholders: ["Strong Limbs", "Firm Hands", "Powerful Lungs"],
  },
  cla: {
    title: "Clarity",
    placeholders: ["Keen Instinct", "Lucid Mind", "Shrewd Eyes"],
  },
  spi: {
    title: "Spirit",
    placeholders: ["Charming Tongue", "Iron Will", "Fierce Heart"],
  },
};

const STAT_MIN = 2;
const STAT_MAX = 18;

const TRAIT_NAMES: Record<StatKind, string> = {
  vig: "vigTraits",
  cla: "claTraits",
  spi: "spiTraits",
};

export function StatSection({
  kind,
  value,
  traits,
  onChangeValue,
  onChangeTraits,
  canEdit,
}: StatSectionProps) {
  const meta = META[kind];
  const list = [0, 1, 2].map((i) => traits[i] ?? "");

  const updateTrait = (i: number, v: string) => {
    const next = [...list];
    next[i] = v;
    onChangeTraits(next);
  };

  return (
    <SheetSection title={meta.title}>
      <div className="flex items-center gap-4">
        <DiamondTracker
          idPrefix={`stat-${kind}`}
          ariaLabel={meta.title}
          remaining={value.remaining}
          max={value.max}
          onChange={onChangeValue}
          disabled={!canEdit}
          min={STAT_MIN}
          maxValue={STAT_MAX}
        />
        <div className="flex flex-1 flex-col gap-1.5">
          {meta.placeholders.map((placeholder, i) => (
            <input
              key={i}
              type="text"
              value={list[i]}
              maxLength={60}
              onChange={(e) => updateTrait(i, e.target.value)}
              disabled={!canEdit}
              placeholder={placeholder}
              aria-label={`${meta.title} trait ${i + 1}`}
              className={cn(
                "sheet-lined-input font-heading text-sm tracking-wide",
              )}
            />
          ))}
        </div>
      </div>
      <input
        type="hidden"
        name={`${kind}Remaining`}
        value={value.remaining}
        readOnly
      />
      <input
        type="hidden"
        name={`${kind}Max`}
        value={value.max}
        readOnly
      />
      <input
        type="hidden"
        name={TRAIT_NAMES[kind]}
        value={JSON.stringify(list)}
        readOnly
      />
    </SheetSection>
  );
}
