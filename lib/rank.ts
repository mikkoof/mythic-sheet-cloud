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

export function rankFromGlory(glory: number): RankInfo {
  const clamped = Math.max(0, Math.min(12, Math.floor(glory)));
  const index = Math.min(Math.floor(clamped / 3), RANKS.length - 1);
  const name = RANKS[index];
  return { name, worthyTo: WORTHY_TO[name] };
}
