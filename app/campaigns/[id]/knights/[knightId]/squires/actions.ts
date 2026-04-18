"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { requireKnightWriteAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  createCompanionSchema,
  updateCompanionSchema,
} from "@/lib/validators/companion";

function parseJson(raw: FormDataEntryValue | null, fallback: unknown) {
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function revalidateSheet(campaignId: string, knightId: string) {
  revalidatePath(`/campaigns/${campaignId}/knights/${knightId}`);
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function createSquireAction(knightId: string, formData: FormData) {
  const { knight } = await requireKnightWriteAccess(knightId);
  const input = createCompanionSchema.parse({
    name: formData.get("name") ?? "",
  });

  await prisma.squire.create({
    data: {
      knightId: knight.id,
      name: input.name,
    },
  });

  revalidateSheet(knight.campaignId, knight.id);
}

export async function updateSquireAction(squireId: string, formData: FormData) {
  const squire = await prisma.squire.findUnique({ where: { id: squireId } });
  if (!squire) notFound();
  const { knight } = await requireKnightWriteAccess(squire.knightId);

  const parsed = updateCompanionSchema.parse({
    name: formData.get("name") ?? "",
    age: formData.get("age"),
    vig: {
      remaining: formData.get("vigRemaining"),
      max: formData.get("vigMax"),
    },
    cla: {
      remaining: formData.get("claRemaining"),
      max: formData.get("claMax"),
    },
    spi: {
      remaining: formData.get("spiRemaining"),
      max: formData.get("spiMax"),
    },
    guard: {
      remaining: formData.get("guardRemaining"),
      max: formData.get("guardMax"),
    },
    property: parseJson(formData.get("property"), []),
  });

  await prisma.squire.update({
    where: { id: squireId },
    data: {
      name: parsed.name,
      age: parsed.age,
      vigRemaining: parsed.vig.remaining,
      vigMax: parsed.vig.max,
      claRemaining: parsed.cla.remaining,
      claMax: parsed.cla.max,
      spiRemaining: parsed.spi.remaining,
      spiMax: parsed.spi.max,
      guardRemaining: parsed.guard.remaining,
      guardMax: parsed.guard.max,
      property: parsed.property,
    },
  });

  revalidateSheet(knight.campaignId, knight.id);
}

export async function deleteSquireAction(squireId: string) {
  const squire = await prisma.squire.findUnique({ where: { id: squireId } });
  if (!squire) notFound();
  const { knight } = await requireKnightWriteAccess(squire.knightId);

  await prisma.squire.delete({ where: { id: squireId } });

  revalidateSheet(knight.campaignId, knight.id);
}
