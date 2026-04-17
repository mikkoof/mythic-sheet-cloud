"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requireCampaignAccess,
  requireCurrentUser,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { campaignInputSchema } from "@/lib/validators/campaign";

function parseInput(formData: FormData) {
  return campaignInputSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
}

export async function createCampaignAction(formData: FormData) {
  const user = await requireCurrentUser();
  const input = parseInput(formData);

  const campaign = await prisma.$transaction(async (tx) => {
    const created = await tx.campaign.create({
      data: {
        name: input.name,
        description: input.description,
        gmUserId: user.id,
      },
    });
    await tx.campaignMember.create({
      data: { campaignId: created.id, userId: user.id, role: "gm" },
    });
    return created;
  });

  revalidatePath("/campaigns");
  redirect(`/campaigns/${campaign.id}`);
}

export async function updateCampaignAction(id: string, formData: FormData) {
  await requireCampaignAccess(id, "gm");
  const input = parseInput(formData);

  await prisma.campaign.update({
    where: { id },
    data: { name: input.name, description: input.description },
  });

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
}

export async function deleteCampaignAction(id: string) {
  await requireCampaignAccess(id, "gm");
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/campaigns");
  redirect("/campaigns");
}
