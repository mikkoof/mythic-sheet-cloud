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

export const protectiveArticlesSchema = z.object({
  shield: z.coerce.boolean().default(true),
  coat: z.coerce.boolean().default(true),
  helm: z.coerce.boolean().default(true),
  plate: z.coerce.boolean().default(true),
  extra: z.coerce.number().int().default(0),
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
export type ProtectiveArticles = z.infer<typeof protectiveArticlesSchema>;
export type CreateKnightInput = z.infer<typeof createKnightSchema>;
export type UpdateKnightInput = z.infer<typeof updateKnightSchema>;
export type KnightDraft = UpdateKnightInput;
