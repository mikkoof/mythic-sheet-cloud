"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import { DiamondTracker } from "@/components/knights/sheet/diamond-tracker";
import { ShieldTracker } from "@/components/knights/sheet/shield-tracker";
import { DiamondCheckbox } from "@/components/knights/sheet/diamond-checkbox";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type {
  CompanionDraft,
  CompanionKind,
} from "@/lib/validators/companion";
import type { KnightAge } from "@/lib/validators/knight";

const AGE_OPTIONS: { value: KnightAge; label: string }[] = [
  { value: "young", label: "Young" },
  { value: "mature", label: "Mature" },
  { value: "old", label: "Old" },
];

const STAT_MIN = 0;
const STAT_MAX = 18;

type CompanionCardProps = {
  kind: CompanionKind;
  initial: CompanionDraft;
  canEdit: boolean;
  updateAction: (id: string, formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
};

export function CompanionCard({
  kind,
  initial,
  canEdit,
  updateAction,
  deleteAction,
}: CompanionCardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialKey = useMemo(() => JSON.stringify(initial), [initial]);
  const [draft, setDraft] = useState<CompanionDraft>(initial);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const isDirty = JSON.stringify(draft) !== initialKey;
  const kindLabel = kind === "steed" ? "Steed" : "Squire";

  const onSave = updateAction.bind(null, draft.id);
  const onDelete = () =>
    startDelete(async () => {
      await deleteAction(draft.id);
    });

  return (
    <SheetSection
      title={draft.name.trim().length > 0 ? draft.name : `Unnamed ${kindLabel}`}
      eyebrow={kindLabel}
    >
      <form ref={formRef} action={onSave} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor={`${kind}-${draft.id}-name`}
            className="font-heading text-xs uppercase tracking-widest text-muted-foreground"
          >
            Name
          </label>
          <input
            id={`${kind}-${draft.id}-name`}
            name="name"
            maxLength={80}
            value={draft.name}
            disabled={!canEdit}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder={kind === "steed" ? "Old Bess" : "Young Tam"}
            className="sheet-lined-input font-heading text-lg tracking-wide"
          />
        </div>

        <div>
          <span className="mb-1 block font-heading text-xs uppercase tracking-widest text-muted-foreground">
            Age
          </span>
          <div
            role="radiogroup"
            aria-label="Age"
            className="flex flex-wrap gap-3"
          >
            {AGE_OPTIONS.map(({ value, label }) => {
              const id = `${kind}-${draft.id}-age-${value}`;
              const selected = draft.age === value;
              return (
                <div key={value} className="flex items-center gap-1.5">
                  <DiamondCheckbox
                    id={id}
                    checked={selected}
                    disabled={!canEdit}
                    onCheckedChange={(next) => {
                      if (!canEdit) return;
                      if (next || !selected)
                        setDraft((d) => ({ ...d, age: value }));
                    }}
                    aria-label={label}
                  />
                  <label
                    htmlFor={id}
                    className="font-heading text-sm tracking-wide"
                  >
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
          <input type="hidden" name="age" value={draft.age} readOnly />
        </div>

        <div className="flex flex-wrap items-end justify-around gap-x-6 gap-y-4 pt-3">
          {(["vig", "cla", "spi"] as const).map((k) => {
            const label =
              k === "vig" ? "Vigour" : k === "cla" ? "Clarity" : "Spirit";
            return (
              <div key={k} className="flex flex-col items-center gap-3">
                <span className="font-heading text-sm tracking-wide">
                  {label}
                </span>
                <DiamondTracker
                  idPrefix={`${kind}-${draft.id}-${k}`}
                  ariaLabel={label}
                  remaining={draft[k].remaining}
                  max={draft[k].max}
                  onChange={(next) => setDraft((d) => ({ ...d, [k]: next }))}
                  disabled={!canEdit}
                  min={STAT_MIN}
                  maxValue={STAT_MAX}
                />
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-3">
            <span className="font-heading text-sm tracking-wide">Guard</span>
            <ShieldTracker
              variant="pair"
              size="md"
              idPrefix={`${kind}-${draft.id}-guard`}
              ariaLabel="Guard"
              remaining={draft.guard.remaining}
              max={draft.guard.max}
              onChange={(guard) => setDraft((d) => ({ ...d, guard }))}
              disabled={!canEdit}
              min={0}
              maxValue={99}
            />
          </div>
        </div>

        <div>
          <span className="mb-1 block font-heading text-xs uppercase tracking-widest text-muted-foreground">
            Property
          </span>
          <div className="space-y-2">
            {draft.property.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">
                No property carried.
              </p>
            ) : (
              draft.property.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-right font-heading text-sm text-muted-foreground">
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    maxLength={120}
                    value={row}
                    onChange={(e) => {
                      const next = [...draft.property];
                      next[i] = e.target.value;
                      setDraft((d) => ({ ...d, property: next }));
                    }}
                    disabled={!canEdit}
                    aria-label={`${kindLabel} property ${i + 1}`}
                    className="sheet-lined-input"
                  />
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove property ${i + 1}`}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          property: d.property.filter((_, idx) => idx !== i),
                        }))
                      }
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
                disabled={draft.property.length >= 40}
                onClick={() =>
                  setDraft((d) => ({ ...d, property: [...d.property, ""] }))
                }
              >
                + Add item
              </Button>
            ) : null}
          </div>
          <input
            type="hidden"
            name="property"
            value={JSON.stringify(draft.property)}
            readOnly
          />
        </div>

        <input
          type="hidden"
          name="vigRemaining"
          value={draft.vig.remaining}
          readOnly
        />
        <input type="hidden" name="vigMax" value={draft.vig.max} readOnly />
        <input
          type="hidden"
          name="claRemaining"
          value={draft.cla.remaining}
          readOnly
        />
        <input type="hidden" name="claMax" value={draft.cla.max} readOnly />
        <input
          type="hidden"
          name="spiRemaining"
          value={draft.spi.remaining}
          readOnly
        />
        <input type="hidden" name="spiMax" value={draft.spi.max} readOnly />
        <input
          type="hidden"
          name="guardRemaining"
          value={draft.guard.remaining}
          readOnly
        />
        <input
          type="hidden"
          name="guardMax"
          value={draft.guard.max}
          readOnly
        />

        {canEdit ? (
          <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => setConfirmOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              Remove {kindLabel}
            </Button>
            <Button type="submit" size="sm" disabled={!isDirty}>
              {isDirty ? `Save ${kindLabel}` : "Saved"}
            </Button>
          </div>
        ) : null}
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {kindLabel.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              {draft.name.trim().length > 0
                ? `"${draft.name}" will be removed from this Knight's sheet.`
                : `This ${kindLabel.toLowerCase()} will be removed from this Knight's sheet.`}{" "}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onDelete();
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SheetSection>
  );
}
