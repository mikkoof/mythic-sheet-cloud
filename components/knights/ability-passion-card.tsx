"use client";

import { SheetSection } from "@/components/knights/sheet/sheet-section";

type AbilityCardProps = {
  ability: string;
  onChange: (patch: { ability?: string }) => void;
  canEdit: boolean;
};

export function AbilityCard({ ability, onChange, canEdit }: AbilityCardProps) {
  return (
    <SheetSection title="Ability">
      <textarea
        id="knight-ability"
        name="ability"
        maxLength={1000}
        rows={4}
        value={ability}
        onChange={(e) => onChange({ ability: e.target.value })}
        disabled={!canEdit}
        placeholder="Your Knight's signature ability."
        className="sheet-lined-textarea"
        aria-label="Ability"
      />
    </SheetSection>
  );
}

type PassionCardProps = {
  passion: string;
  onChange: (patch: { passion?: string }) => void;
  canEdit: boolean;
};

export function PassionCard({ passion, onChange, canEdit }: PassionCardProps) {
  return (
    <SheetSection title="Passion">
      <label
        htmlFor="knight-passion"
        className="mb-1 block font-heading text-xs uppercase tracking-widest text-muted-foreground"
      >
        Restore SPI when:
      </label>
      <textarea
        id="knight-passion"
        name="passion"
        maxLength={500}
        rows={3}
        value={passion}
        onChange={(e) => onChange({ passion: e.target.value })}
        disabled={!canEdit}
        placeholder="The thing that stirs your Knight's spirit."
        className="sheet-lined-textarea"
      />
    </SheetSection>
  );
}
