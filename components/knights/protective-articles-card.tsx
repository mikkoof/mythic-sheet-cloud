"use client";

import { CircleCheckbox } from "@/components/knights/sheet/circle-checkbox";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { ShieldTracker } from "@/components/knights/sheet/shield-tracker";
import {
  computeTotalArmour,
  type ProtectiveArticles,
} from "@/lib/validators/knight";

type ProtectiveArticlesCardProps = {
  protectiveArticles: ProtectiveArticles;
  onChange: (articles: ProtectiveArticles) => void;
  canEdit: boolean;
};

export function ProtectiveArticlesCard({
  protectiveArticles,
  onChange,
  canEdit,
}: ProtectiveArticlesCardProps) {
  const { items, extra } = protectiveArticles;
  const total = computeTotalArmour(protectiveArticles);

  const updateItem = (
    i: number,
    patch: Partial<{ name: string; checked: boolean }>,
  ) => {
    const nextItems = items.map((item, idx) =>
      idx === i ? { ...item, ...patch } : item,
    );
    onChange({ ...protectiveArticles, items: nextItems });
  };

  const updateExtra = (value: number) =>
    onChange({ ...protectiveArticles, extra: value });

  return (
    <SheetSection title="Protective Articles">
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const id = `article-${i}`;
          return (
            <div key={i} className="flex items-center gap-3">
              <CircleCheckbox
                id={id}
                checked={item.checked}
                onCheckedChange={(v) => updateItem(i, { checked: v })}
                disabled={!canEdit}
                aria-label={`Article ${i + 1}`}
              />
              <input
                type="text"
                value={item.name}
                maxLength={60}
                onChange={(e) => updateItem(i, { name: e.target.value })}
                disabled={!canEdit}
                placeholder={i === 0 ? "Shield" : ""}
                aria-label={`Article ${i + 1} name`}
                className="sheet-lined-input font-heading text-sm tracking-wide"
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <label
          htmlFor="armour-extra"
          className="font-heading text-xs uppercase tracking-wider text-muted-foreground"
        >
          Extra
        </label>
        <input
          id="armour-extra"
          type="number"
          value={extra}
          onChange={(e) => updateExtra(Number(e.target.value) || 0)}
          disabled={!canEdit}
          className="sheet-number h-7 w-16 rounded-sm border border-foreground/60 bg-background px-2 text-center font-heading tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="text-[10px] text-muted-foreground">
          (positive or negative)
        </span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 border-t border-foreground/20 pt-3">
        <span className="font-heading text-lg uppercase tracking-widest">
          Total Armour
        </span>
        <ShieldTracker
          variant="single"
          value={total}
          ariaLabel="Total armour"
        />
      </div>
      <input
        type="hidden"
        name="protectiveArticles"
        value={JSON.stringify(protectiveArticles)}
        readOnly
      />
    </SheetSection>
  );
}
