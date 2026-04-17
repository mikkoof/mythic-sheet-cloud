"use client";

import { useTransition } from "react";

import { revokeInviteAction } from "@/app/campaigns/[id]/invites/actions";
import { Button } from "@/components/ui/button";

type PendingInvite = {
  id: string;
  email: string;
  createdAt: Date;
};

type InviteListProps = {
  invites: PendingInvite[];
};

export function InviteList({ invites }: InviteListProps) {
  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
        Pending invites
      </h3>
      <ul className="divide-y divide-border rounded-md border border-border bg-muted/40">
        {invites.map((invite) => (
          <InviteRow key={invite.id} invite={invite} />
        ))}
      </ul>
    </div>
  );
}

function InviteRow({ invite }: { invite: PendingInvite }) {
  const [isPending, startTransition] = useTransition();
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-foreground">{invite.email}</span>
        <span className="text-xs text-muted-foreground">
          Invited {invite.createdAt.toLocaleDateString()}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await revokeInviteAction(invite.id);
          })
        }
      >
        {isPending ? "Revoking…" : "Revoke"}
      </Button>
    </li>
  );
}
