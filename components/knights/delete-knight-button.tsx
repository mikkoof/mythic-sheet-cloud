"use client";

import { useState, useTransition } from "react";

import { deleteKnightAction } from "@/app/campaigns/[id]/knights/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteKnightButtonProps = {
  knightId: string;
  knightName: string;
  knightEpithet: string;
};

export function DeleteKnightButton({
  knightId,
  knightName,
  knightEpithet,
}: DeleteKnightButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayName = knightName.trim().length > 0 ? knightName : "this Knight";
  const titleName = knightEpithet.trim().length > 0
    ? `${displayName} the ${knightEpithet} Knight`
    : displayName;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {titleName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the knight and their steeds and squires.
            Any successor knight will remain, but the link back to this
            predecessor will be cleared. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                await deleteKnightAction(knightId);
                setOpen(false);
              });
            }}
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
