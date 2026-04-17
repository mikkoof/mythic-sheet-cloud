import { KnightSheet } from "@/components/knights/knight-sheet";
import { requireKnightAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  normalizeProtectiveArticles,
  type KnightDraft,
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

export default async function KnightSheetPage({
  params,
}: KnightSheetPageProps) {
  const { id, knightId } = await params;
  const { knight, isGm, isOwner } = await requireKnightAccess(knightId);
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
    />
  );
}
