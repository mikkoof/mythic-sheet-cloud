import { z } from "zod";

export const KNIGHT_AGES = ["young", "mature", "old"] as const;
export type KnightAge = (typeof KNIGHT_AGES)[number];

const trimmed = (max: number) => z.string().trim().max(max);

export const weaponSchema = z.object({
  name: trimmed(60),
  attackDice: trimmed(40),
  hefty: z.coerce.boolean().default(false),
  long: z.coerce.boolean().default(false),
  slow: z.coerce.boolean().default(false),
  notes: trimmed(300).default(""),
});

export const protectiveArticleItemSchema = z.object({
  name: trimmed(60).default(""),
  checked: z.coerce.boolean().default(false),
});

export const protectiveArticlesSchema = z.object({
  items: z.array(protectiveArticleItemSchema).length(4),
  extra: z.coerce.number().int().min(-99).max(99).default(0),
});

const statPair = z.object({
  remaining: z.coerce.number().int().min(0).max(99),
  max: z.coerce.number().int().min(0).max(99),
});

const triplet = z.array(trimmed(60)).length(3);

export const createKnightSchema = z.object({
  name: trimmed(80).min(1, "Name is required"),
  epithet: trimmed(60).default(""),
});

export const updateKnightSchema = z.object({
  name: trimmed(80).min(1, "Name is required"),
  epithet: trimmed(60),
  ultimateFate: trimmed(500),

  vig: statPair,
  cla: statPair,
  spi: statPair,
  guard: statPair,

  vigTraits: triplet,
  claTraits: triplet,
  spiTraits: triplet,

  glory: z.coerce.number().int().min(0).max(12),
  age: z.enum(KNIGHT_AGES),

  fatigued: z.coerce.boolean(),
  exposed: z.coerce.boolean(),
  exhausted: z.coerce.boolean(),
  impaired: z.coerce.boolean(),

  ability: trimmed(1000),
  passion: trimmed(500),

  property: z.array(trimmed(120)).max(40),
  weapons: z.array(weaponSchema).max(12),
  protectiveArticles: protectiveArticlesSchema,
});

export type Weapon = z.infer<typeof weaponSchema>;
export type ProtectiveArticleItem = z.infer<typeof protectiveArticleItemSchema>;
export type ProtectiveArticles = z.infer<typeof protectiveArticlesSchema>;
export type CreateKnightInput = z.infer<typeof createKnightSchema>;
export type UpdateKnightInput = z.infer<typeof updateKnightSchema>;
export type KnightDraft = UpdateKnightInput;

export const EMPTY_PROTECTIVE_ARTICLES: ProtectiveArticles = {
  items: [
    { name: "", checked: false },
    { name: "", checked: false },
    { name: "", checked: false },
    { name: "", checked: false },
  ],
  extra: 0,
};

const LEGACY_SLOT_LABELS: Record<string, string> = {
  shield: "Shield",
  coat: "Coat",
  helm: "Helm",
  plate: "Plate",
};

export function normalizeProtectiveArticles(raw: unknown): ProtectiveArticles {
  const parsed = protectiveArticlesSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const r = raw as Record<string, unknown>;
    const legacyKeys = ["shield", "coat", "helm", "plate"] as const;
    const hasLegacy = legacyKeys.some((k) => k in r);
    if (hasLegacy) {
      const items = legacyKeys.map((k) => ({
        name: LEGACY_SLOT_LABELS[k],
        checked: Boolean(r[k]),
      }));
      const extraRaw = r.extra;
      const extra =
        typeof extraRaw === "number" && Number.isFinite(extraRaw)
          ? Math.trunc(extraRaw)
          : 0;
      return { items, extra };
    }
  }

  return {
    items: EMPTY_PROTECTIVE_ARTICLES.items.map((i) => ({ ...i })),
    extra: 0,
  };
}

export function computeTotalArmour(a: ProtectiveArticles): number {
  const base = a.items.reduce((acc, i) => acc + (i.checked ? 1 : 0), 0);
  return base + a.extra;
}
