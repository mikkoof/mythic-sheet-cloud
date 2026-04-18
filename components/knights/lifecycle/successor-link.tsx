import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { KnightStatus } from "@/lib/validators/knight";

type KnightRef = {
  id: string;
  name: string;
  epithet: string;
};

type KnightSuccessorRef = KnightRef & { status: KnightStatus };

type SuccessorLinkProps = {
  campaignId: string;
  knightId: string;
  status: KnightStatus;
  canEdit: boolean;
  predecessor: KnightRef | null;
  successors: KnightSuccessorRef[];
};

function describe(knight: KnightRef): string {
  const name = knight.name.trim().length > 0 ? knight.name : "Unnamed Knight";
  return knight.epithet.trim().length > 0
    ? `${name}, the ${knight.epithet} Knight`
    : name;
}

export function SuccessorLink({
  campaignId,
  knightId,
  status,
  canEdit,
  predecessor,
  successors,
}: SuccessorLinkProps) {
  const hasSuccessor = successors.length > 0;
  const canCreateSuccessor =
    canEdit && !hasSuccessor && status !== "active";

  if (!predecessor && successors.length === 0 && !canCreateSuccessor) {
    return null;
  }

  return (
    <div className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm space-y-1">
      {predecessor ? (
        <div>
          <span className="text-muted-foreground">Successor to </span>
          <Link
            href={`/campaigns/${campaignId}/knights/${predecessor.id}`}
            className="font-heading tracking-wide text-primary hover:underline"
          >
            {describe(predecessor)}
          </Link>
        </div>
      ) : null}

      {successors.length > 0 ? (
        <div>
          <span className="text-muted-foreground">Succeeded by </span>
          {successors.map((s, i) => (
            <span key={s.id}>
              {i > 0 ? ", " : ""}
              <Link
                href={`/campaigns/${campaignId}/knights/${s.id}`}
                className="font-heading tracking-wide text-primary hover:underline"
              >
                {describe(s)}
              </Link>
            </span>
          ))}
        </div>
      ) : null}

      {canCreateSuccessor ? (
        <div className="pt-1">
          <Button asChild size="sm" variant="outline">
            <Link
              href={`/campaigns/${campaignId}/knights/new?predecessor=${knightId}`}
            >
              Create successor
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
