"use client";

import { useTransition } from "react";

import { removeMemberAction } from "@/app/campaigns/[id]/invites/actions";
import { Button } from "@/components/ui/button";

type MemberUser = {
  name: string | null;
  email: string | null;
};

type Member = {
  userId: string;
  role: "gm" | "player";
  user: MemberUser;
};

type MemberListProps = {
  members: Member[];
  gmUserId: string;
  isGm: boolean;
  campaignId: string;
};

export function MemberList({
  members,
  gmUserId,
  isGm,
  campaignId,
}: MemberListProps) {
  return (
    <ul className="divide-y divide-border">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
        >
          <div className="flex flex-col">
            <span className="text-foreground">
              {member.user.name ?? member.user.email ?? "Unnamed knight"}
            </span>
            {member.user.name && member.user.email ? (
              <span className="text-xs text-muted-foreground">
                {member.user.email}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                member.role === "gm"
                  ? "rounded-full border border-accent/60 bg-accent/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent-foreground"
                  : "rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              }
            >
              {member.role === "gm" ? "Game Master" : "Player"}
            </span>
            {isGm && member.userId !== gmUserId ? (
              <RemoveMemberButton
                campaignId={campaignId}
                userId={member.userId}
                label={member.user.name ?? member.user.email ?? "this player"}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function RemoveMemberButton({
  campaignId,
  userId,
  label,
}: {
  campaignId: string;
  userId: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      aria-label={`Remove ${label}`}
      onClick={() =>
        startTransition(async () => {
          const fd = new FormData();
          fd.set("userId", userId);
          await removeMemberAction(campaignId, fd);
        })
      }
    >
      {isPending ? "Removing…" : "Remove"}
    </Button>
  );
}
