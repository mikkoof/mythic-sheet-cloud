"use client";

import { useState, useTransition } from "react";

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
import { cn } from "@/lib/utils";
import { KNIGHT_STATUSES, type KnightStatus } from "@/lib/validators/knight";

type StatusChangerProps = {
  knightId: string;
  status: KnightStatus;
  updateAction: (knightId: string, nextStatus: string) => Promise<void>;
};

const STATUS_LABELS: Record<KnightStatus, string> = {
  active: "Active",
  retired: "Retired",
  dead: "Dead",
};

export function StatusChanger({
  knightId,
  status,
  updateAction,
}: StatusChangerProps) {
  const [pendingDead, setPendingDead] = useState<KnightStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  const apply = (next: KnightStatus) => {
    if (next === status) return;
    if (next === "dead" && status !== "dead") {
      setPendingDead(next);
      return;
    }
    startTransition(async () => {
      await updateAction(knightId, next);
    });
  };

  const confirmDead = () => {
    if (!pendingDead) return;
    const next = pendingDead;
    setPendingDead(null);
    startTransition(async () => {
      await updateAction(knightId, next);
    });
  };

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Knight status"
        className="inline-flex rounded-sm border border-border bg-background p-0.5"
      >
        {KNIGHT_STATUSES.map((s) => {
          const selected = s === status;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isPending}
              onClick={() => apply(s)}
              className={cn(
                "rounded-xs px-3 py-1 font-heading text-xs uppercase tracking-widest transition-colors",
                selected
                  ? s === "dead"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      <AlertDialog
        open={pendingDead !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDead(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark this Knight as dead?</AlertDialogTitle>
            <AlertDialogDescription>
              The sheet will show a Fallen Knight banner. You can still edit the
              ultimate fate afterwards. You can also change the status back if
              this was a mistake.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDead} disabled={isPending}>
              Confirm death
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function StatusDisplay({ status }: { status: KnightStatus }) {
  const tone =
    status === "dead"
      ? "border-destructive/50 bg-destructive/10 text-destructive"
      : status === "retired"
        ? "border-accent/60 bg-accent/15 text-foreground"
        : "border-primary/40 bg-primary/10 text-foreground";
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 font-heading text-xs uppercase tracking-widest",
        tone,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

