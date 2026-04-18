import { z } from "zod";

import { KNIGHT_AGES } from "@/lib/validators/knight";

const trimmed = (max: number) => z.string().trim().max(max);

const companionStatPair = z.object({
  remaining: z.coerce.number().int().min(0).max(99),
  max: z.coerce.number().int().min(0).max(99),
});

export const createCompanionSchema = z.object({
  name: trimmed(80).default(""),
});

export const updateCompanionSchema = z.object({
  name: trimmed(80),
  age: z.enum(KNIGHT_AGES),

  vig: companionStatPair,
  cla: companionStatPair,
  spi: companionStatPair,
  guard: companionStatPair,

  property: z.array(trimmed(120)).max(40),
});

export type CompanionKind = "steed" | "squire";

export type CreateCompanionInput = z.infer<typeof createCompanionSchema>;
export type UpdateCompanionInput = z.infer<typeof updateCompanionSchema>;

export type CompanionDraft = UpdateCompanionInput & {
  id: string;
};
