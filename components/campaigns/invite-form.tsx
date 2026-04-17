"use client";

import { useRef, useTransition } from "react";

import { addInviteAction } from "@/app/campaigns/[id]/invites/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InviteFormProps = {
  campaignId: string;
};

export function InviteForm({ campaignId }: InviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          await addInviteAction(campaignId, formData);
          formRef.current?.reset();
        })
      }
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor={`invite-email-${campaignId}`}>Invite a player</Label>
        <Input
          id={`invite-email-${campaignId}`}
          name="email"
          type="email"
          placeholder="player@example.com"
          required
          maxLength={254}
          disabled={isPending}
          autoComplete="email"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Inviting…" : "Send invite"}
      </Button>
    </form>
  );
}
