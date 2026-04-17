"use client";

import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { ShieldTracker } from "@/components/knights/sheet/shield-tracker";

type StatPair = { remaining: number; max: number };

type GuardCardProps = {
  guard: StatPair;
  onChange: (guard: StatPair) => void;
  canEdit: boolean;
};

export function GuardCard({ guard, onChange, canEdit }: GuardCardProps) {
  return (
    <SheetSection title="Guard">
      <div className="flex justify-center py-2">
        <ShieldTracker
          variant="pair"
          idPrefix="stat-guard"
          ariaLabel="Guard"
          remaining={guard.remaining}
          max={guard.max}
          onChange={onChange}
          disabled={!canEdit}
          min={0}
          maxValue={99}
        />
      </div>
      <input
        type="hidden"
        name="guardRemaining"
        value={guard.remaining}
        readOnly
      />
      <input type="hidden" name="guardMax" value={guard.max} readOnly />
    </SheetSection>
  );
}
