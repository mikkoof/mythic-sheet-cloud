"use client";

import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { Button } from "@/components/ui/button";

type PropertyListProps = {
  property: string[];
  onChange: (property: string[]) => void;
  canEdit: boolean;
};

export function PropertyList({
  property,
  onChange,
  canEdit,
}: PropertyListProps) {
  const add = () => onChange([...property, ""]);
  const remove = (i: number) =>
    onChange(property.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) =>
    onChange(property.map((row, idx) => (idx === i ? value : row)));

  return (
    <SheetSection title="Property">
      <div className="space-y-2">
        {property.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No property carried.
          </p>
        ) : (
          property.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-right font-heading text-sm text-muted-foreground">
                {i + 1}.
              </span>
              <input
                type="text"
                maxLength={120}
                value={row}
                onChange={(e) => update(i, e.target.value)}
                disabled={!canEdit}
                aria-label={`Property item ${i + 1}`}
                className="sheet-lined-input"
              />
              {canEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => remove(i)}
                  aria-label={`Remove property ${i + 1}`}
                >
                  ×
                </Button>
              ) : null}
            </div>
          ))
        )}
        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={property.length >= 40}
          >
            + Add item
          </Button>
        ) : null}
      </div>
      <input
        type="hidden"
        name="property"
        value={JSON.stringify(property)}
        readOnly
      />
    </SheetSection>
  );
}
