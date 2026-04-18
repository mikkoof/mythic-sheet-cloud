"use client";

import { useRef, useState, useTransition } from "react";

import { CompanionCard } from "@/components/knights/companion-card";
import { SheetSection } from "@/components/knights/sheet/sheet-section";
import { Button } from "@/components/ui/button";
import type {
  CompanionDraft,
  CompanionKind,
} from "@/lib/validators/companion";

type CompanionsPanelProps = {
  kind: CompanionKind;
  knightId: string;
  companions: CompanionDraft[];
  canEdit: boolean;
  createAction: (knightId: string, formData: FormData) => Promise<void>;
  updateAction: (id: string, formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
};

export function CompanionsPanel({
  kind,
  knightId,
  companions,
  canEdit,
  createAction,
  updateAction,
  deleteAction,
}: CompanionsPanelProps) {
  const kindLabel = kind === "steed" ? "Steed" : "Squire";
  const addFormRef = useRef<HTMLFormElement>(null);
  const [newName, setNewName] = useState("");
  const [isCreating, startCreate] = useTransition();

  const handleSubmit = (fd: FormData) => {
    startCreate(async () => {
      await createAction(knightId, fd);
      setNewName("");
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl tracking-wide text-foreground">
          {kindLabel}s
        </h2>
        {canEdit ? (
          <form
            ref={addFormRef}
            action={handleSubmit}
            className="flex items-center gap-2"
          >
            <label htmlFor={`new-${kind}-name`} className="sr-only">
              New {kindLabel.toLowerCase()} name
            </label>
            <input
              id={`new-${kind}-name`}
              type="text"
              name="name"
              maxLength={80}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Name (optional)`}
              className="sheet-lined-input text-sm"
              disabled={isCreating}
            />
            <Button type="submit" size="sm" disabled={isCreating}>
              + Add {kindLabel.toLowerCase()}
            </Button>
          </form>
        ) : null}
      </div>

      {companions.length === 0 ? (
        <SheetSection title={`No ${kindLabel}s`}>
          <p className="text-sm italic text-muted-foreground">
            {canEdit
              ? `This Knight has no ${kindLabel.toLowerCase()}s yet. Add one above.`
              : `This Knight has no ${kindLabel.toLowerCase()}s.`}
          </p>
        </SheetSection>
      ) : (
        <div className="space-y-4">
          {companions.map((c) => (
            <CompanionCard
              key={c.id}
              kind={kind}
              initial={c}
              canEdit={canEdit}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          ))}
        </div>
      )}
    </section>
  );
}
