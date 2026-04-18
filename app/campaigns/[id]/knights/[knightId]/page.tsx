import { KnightSheet } from "@/components/knights/knight-sheet";
import { requireKnightAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import type { CompanionDraft } from "@/lib/validators/companion";
import {
  normalizeProtectiveArticles,
  type KnightDraft,
  type KnightStatus,
  type Weapon,
} from "@/lib/validators/knight";

type KnightSheetPageProps = {
  params: Promise<{ id: string; knightId: string }>;
};

function padTriplet(input: string[] | null | undefined): string[] {
  const arr = Array.isArray(input) ? input.slice(0, 3) : [];
  while (arr.length < 3) arr.push("");
  return arr;
}

type CompanionRow = {
  id: string;
  name: string;
  age: "young" | "mature" | "old";
  vigRemaining: number;
  vigMax: number;
  claRemaining: number;
  claMax: number;
  spiRemaining: number;
  spiMax: number;
  guardRemaining: number;
  guardMax: number;
  property: string[];
  createdAt: Date;
};

function toCompanionDraft(c: CompanionRow): CompanionDraft {
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    vig: { remaining: c.vigRemaining, max: c.vigMax },
    cla: { remaining: c.claRemaining, max: c.claMax },
    spi: { remaining: c.spiRemaining, max: c.spiMax },
    guard: { remaining: c.guardRemaining, max: c.guardMax },
    property: c.property,
  };
}

export default async function KnightSheetPage({
  params,
}: KnightSheetPageProps) {
  const { id, knightId } = await params;
  const { isGm, isOwner } = await requireKnightAccess(knightId);

  const knight = await prisma.knight.findUnique({
    where: { id: knightId },
    include: {
      steeds: { orderBy: { createdAt: "asc" } },
      squires: { orderBy: { createdAt: "asc" } },
      predecessor: { select: { id: true, name: true, epithet: true } },
      successors: {
        select: { id: true, name: true, epithet: true, status: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!knight) throw new Error("Knight disappeared between access check and fetch");

  const player = await prisma.user.findUnique({
    where: { id: knight.playerUserId },
    select: { name: true, email: true },
  });

  const initialDraft: KnightDraft = {
    name: knight.name,
    epithet: knight.epithet,
    ultimateFate: knight.ultimateFate,
    vig: { remaining: knight.vigRemaining, max: knight.vigMax },
    cla: { remaining: knight.claRemaining, max: knight.claMax },
    spi: { remaining: knight.spiRemaining, max: knight.spiMax },
    guard: { remaining: knight.guardRemaining, max: knight.guardMax },
    vigTraits: padTriplet(knight.vigTraits),
    claTraits: padTriplet(knight.claTraits),
    spiTraits: padTriplet(knight.spiTraits),
    glory: knight.glory,
    age: knight.age,
    fatigued: knight.fatigued,
    exposed: knight.exposed,
    exhausted: knight.exhausted,
    impaired: knight.impaired,
    ability: knight.ability,
    passion: knight.passion,
    property: knight.property,
    weapons: (knight.weapons as unknown as Weapon[]) ?? [],
    protectiveArticles: normalizeProtectiveArticles(knight.protectiveArticles),
  };

  const playerLabel = player?.name ?? player?.email ?? "Unknown player";

  return (
    <KnightSheet
      key={knight.updatedAt.toISOString()}
      campaignId={id}
      knightId={knightId}
      playerLabel={`Played by ${playerLabel}`}
      initialDraft={initialDraft}
      canEdit={isGm || isOwner}
      status={knight.status as KnightStatus}
      predecessor={knight.predecessor}
      successors={knight.successors.map((s) => ({
        ...s,
        status: s.status as KnightStatus,
      }))}
      steeds={knight.steeds.map(toCompanionDraft)}
      squires={knight.squires.map(toCompanionDraft)}
    />
  );
}
