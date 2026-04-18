export const RANKS = [
  "Knight Errant",
  "Knight Gallant",
  "Knight Tenant",
  "Knight Dominant",
  "Knight Radiant",
] as const;

export type Rank = (typeof RANKS)[number];

export const WORTHY_TO: Record<Rank, string> = {
  "Knight Errant": "Worthy to Lead a Warband",
  "Knight Gallant": "Worthy to Serve in Court or Council",
  "Knight Tenant": "Worthy to Rule a Holding",
  "Knight Dominant": "Worthy to Rule a Seat of Power",
  "Knight Radiant": "Worthy to Seek the City",
};

export type RankInfo = { name: Rank; worthyTo: string };

export const GLORY_MAX = 12;

// Glory value at which each rank's first dot fills. Glory 0 stays Errant
// with no dots colored; glory 12 colors the Radiant diamond.
export const TIER_FIRST_DOT: readonly number[] = [1, 3, 6, 9, 12];

export function rankFromGlory(glory: number): RankInfo {
  const clamped = Math.max(0, Math.min(GLORY_MAX, Math.floor(glory)));
  let index = 0;
  for (let i = TIER_FIRST_DOT.length - 1; i >= 0; i--) {
    if (clamped >= TIER_FIRST_DOT[i]) {
      index = i;
      break;
    }
  }
  const name = RANKS[index];
  return { name, worthyTo: WORTHY_TO[name] };
}
