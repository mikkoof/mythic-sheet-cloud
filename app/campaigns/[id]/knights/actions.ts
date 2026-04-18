"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import {
  requireCampaignAccess,
  requireKnightWriteAccess,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  createKnightSchema,
  knightStatusSchema,
  updateKnightSchema,
} from "@/lib/validators/knight";

function parseJson(raw: FormDataEntryValue | null, fallback: unknown) {
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function createKnightAction(
  campaignId: string,
  formData: FormData,
) {
  const { user, isGm } = await requireCampaignAccess(campaignId);
  const rawPredecessor = formData.get("predecessorKnightId");
  const input = createKnightSchema.parse({
    name: formData.get("name"),
    epithet: formData.get("epithet") ?? "",
    predecessorKnightId:
      typeof rawPredecessor === "string" && rawPredecessor.length > 0
        ? rawPredecessor
        : undefined,
  });

  let playerUserId = user.id;
  let predecessorKnightId: string | null = null;

  if (input.predecessorKnightId) {
    const predecessor = await prisma.knight.findUnique({
      where: { id: input.predecessorKnightId },
      select: { id: true, campaignId: true, playerUserId: true },
    });
    if (!predecessor || predecessor.campaignId !== campaignId) notFound();
    if (!isGm && predecessor.playerUserId !== user.id) notFound();
    predecessorKnightId = predecessor.id;
    playerUserId = predecessor.playerUserId;
  }

  const knight = await prisma.knight.create({
    data: {
      campaignId,
      playerUserId,
      name: input.name,
      epithet: input.epithet,
      predecessorKnightId,
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
  redirect(`/campaigns/${campaignId}/knights/${knight.id}`);
}

export async function updateKnightStatusAction(
  knightId: string,
  nextStatus: string,
) {
  const status = knightStatusSchema.parse(nextStatus);
  const { knight } = await requireKnightWriteAccess(knightId);

  await prisma.knight.update({
    where: { id: knightId },
    data: { status },
  });

  revalidatePath(`/campaigns/${knight.campaignId}`);
  revalidatePath(`/campaigns/${knight.campaignId}/knights/${knightId}`);
}

export async function updateKnightAction(
  knightId: string,
  formData: FormData,
) {
  const { knight } = await requireKnightWriteAccess(knightId);

  const parsed = updateKnightSchema.parse({
    name: formData.get("name"),
    epithet: formData.get("epithet") ?? "",
    ultimateFate: formData.get("ultimateFate") ?? "",

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

    vigTraits: parseJson(formData.get("vigTraits"), ["", "", ""]),
    claTraits: parseJson(formData.get("claTraits"), ["", "", ""]),
    spiTraits: parseJson(formData.get("spiTraits"), ["", "", ""]),

    glory: formData.get("glory"),
    age: formData.get("age"),

    fatigued: formData.get("fatigued") === "on",
    exposed: formData.get("exposed") === "on",
    exhausted: formData.get("exhausted") === "on",
    impaired: formData.get("impaired") === "on",

    ability: formData.get("ability") ?? "",
    passion: formData.get("passion") ?? "",

    property: parseJson(formData.get("property"), []),
    weapons: parseJson(formData.get("weapons"), []),
    protectiveArticles: parseJson(formData.get("protectiveArticles"), {}),
  });

  await prisma.knight.update({
    where: { id: knightId },
    data: {
      name: parsed.name,
      epithet: parsed.epithet,
      ultimateFate: parsed.ultimateFate,
      vigRemaining: parsed.vig.remaining,
      vigMax: parsed.vig.max,
      claRemaining: parsed.cla.remaining,
      claMax: parsed.cla.max,
      spiRemaining: parsed.spi.remaining,
      spiMax: parsed.spi.max,
      guardRemaining: parsed.guard.remaining,
      guardMax: parsed.guard.max,
      vigTraits: parsed.vigTraits,
      claTraits: parsed.claTraits,
      spiTraits: parsed.spiTraits,
      glory: parsed.glory,
      age: parsed.age,
      fatigued: parsed.fatigued,
      exposed: parsed.exposed,
      exhausted: parsed.exhausted,
      impaired: parsed.impaired,
      ability: parsed.ability,
      passion: parsed.passion,
      property: parsed.property,
      weapons: parsed.weapons,
      protectiveArticles: parsed.protectiveArticles,
    },
  });

  revalidatePath(`/campaigns/${knight.campaignId}`);
  revalidatePath(`/campaigns/${knight.campaignId}/knights/${knightId}`);
}

export async function deleteKnightAction(knightId: string) {
  const { knight } = await requireKnightWriteAccess(knightId);

  await prisma.knight.delete({ where: { id: knightId } });

  revalidatePath(`/campaigns/${knight.campaignId}`);
  revalidatePath(`/campaigns/${knight.campaignId}/knights/${knightId}`);
}
