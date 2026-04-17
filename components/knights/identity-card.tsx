"use client";

import { SheetSection } from "@/components/knights/sheet/sheet-section";

type IdentityCardProps = {
  name: string;
  epithet: string;
  ultimateFate: string;
  onChange: (patch: {
    name?: string;
    epithet?: string;
    ultimateFate?: string;
  }) => void;
  canEdit: boolean;
};

export function IdentityCard({
  name,
  epithet,
  ultimateFate,
  onChange,
  canEdit,
}: IdentityCardProps) {
  return (
    <SheetSection title="Tale of">
      <div className="space-y-4">
        <input
          id="knight-name"
          name="name"
          required
          maxLength={80}
          value={name}
          onChange={(e) => onChange({ name: e.target.value })}
          disabled={!canEdit}
          placeholder="Name"
          aria-label="Name"
          className="sheet-lined-input font-heading text-xl tracking-wide"
        />
        <div className="flex items-center gap-3">
          <label
            htmlFor="knight-epithet"
            className="font-heading text-sm tracking-wide whitespace-nowrap"
          >
            Called the
          </label>
          <input
            id="knight-epithet"
            name="epithet"
            maxLength={60}
            value={epithet}
            onChange={(e) => onChange({ epithet: e.target.value })}
            disabled={!canEdit}
            placeholder="Cold"
            className="sheet-lined-input"
          />
          <span className="font-heading text-sm text-muted-foreground whitespace-nowrap">
            Knight
          </span>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="knight-ultimate-fate"
            className="font-heading text-xs uppercase tracking-widest text-muted-foreground"
          >
            Ultimate Fate
          </label>
          <textarea
            id="knight-ultimate-fate"
            name="ultimateFate"
            maxLength={500}
            rows={2}
            value={ultimateFate}
            onChange={(e) => onChange({ ultimateFate: e.target.value })}
            disabled={!canEdit}
            placeholder="How this Knight met their end."
            className="sheet-lined-textarea"
          />
        </div>
      </div>
    </SheetSection>
  );
}
