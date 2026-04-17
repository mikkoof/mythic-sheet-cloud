export const RANKS = [
  "Knight Errant",
  "Knight Gallant",
  "Knight Tenant",
  "Knight Dominant",
  "Knight Radiant",
] as const;

export type Rank = (typeof RANKS)[number];

export function rankFromGlory(glory: number): Rank {
  const index = Math.min(Math.floor(glory / 3), RANKS.length - 1);
  return RANKS[index];
}
