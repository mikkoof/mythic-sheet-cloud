import { prisma } from "@/lib/db";

export type ConvertPendingInvitesResult = {
  converted: number;
};

/**
 * Turn every pending CampaignInvite matching the given email into a
 * CampaignMember row and drop the invite. Idempotent: re-running it is a
 * no-op. Called from NextAuth's signIn event on every Google sign-in.
 */
export async function convertPendingInvites(
  userId: string,
  email: string | null | undefined,
): Promise<ConvertPendingInvitesResult> {
  if (!email) return { converted: 0 };
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { converted: 0 };

  const invites = await prisma.campaignInvite.findMany({
    where: { email: normalized },
    select: { id: true, campaignId: true },
  });
  if (invites.length === 0) return { converted: 0 };

  let converted = 0;
  for (const invite of invites) {
    await prisma.$transaction(async (tx) => {
      await tx.campaignMember.upsert({
        where: {
          campaignId_userId: { campaignId: invite.campaignId, userId },
        },
        create: {
          campaignId: invite.campaignId,
          userId,
          role: "player",
        },
        update: {},
      });
      await tx.campaignInvite.delete({ where: { id: invite.id } });
    });
    converted += 1;
  }

  return { converted };
}
