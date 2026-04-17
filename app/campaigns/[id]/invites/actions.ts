"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireCampaignAccess } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import {
  inviteInputSchema,
  removeMemberInputSchema,
} from "@/lib/validators/invite";

export async function addInviteAction(campaignId: string, formData: FormData) {
  const { user } = await requireCampaignAccess(campaignId, "gm");
  const { email } = inviteInputSchema.parse({ email: formData.get("email") });

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    await prisma.campaignMember.upsert({
      where: {
        campaignId_userId: { campaignId, userId: existingUser.id },
      },
      create: { campaignId, userId: existingUser.id, role: "player" },
      update: {},
    });
  } else {
    await prisma.campaignInvite.upsert({
      where: { campaignId_email: { campaignId, email } },
      create: {
        campaignId,
        email,
        invitedByUserId: user.id,
      },
      update: {},
    });
  }

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function revokeInviteAction(inviteId: string) {
  const invite = await prisma.campaignInvite.findUnique({
    where: { id: inviteId },
    select: { id: true, campaignId: true },
  });
  if (!invite) notFound();

  await requireCampaignAccess(invite.campaignId, "gm");

  await prisma.campaignInvite.delete({ where: { id: invite.id } });
  revalidatePath(`/campaigns/${invite.campaignId}`);
}

export async function removeMemberAction(
  campaignId: string,
  formData: FormData,
) {
  const { campaign } = await requireCampaignAccess(campaignId, "gm");
  const { userId } = removeMemberInputSchema.parse({
    userId: formData.get("userId"),
  });

  if (userId === campaign.gmUserId) {
    notFound();
  }

  await prisma.campaignMember.delete({
    where: { campaignId_userId: { campaignId, userId } },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}
