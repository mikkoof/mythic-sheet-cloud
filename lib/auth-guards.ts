import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function requireCurrentUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) redirect("/signin");
  return user;
}

export type CampaignRoleCheck = "gm" | "member";

export async function requireCampaignAccess(
  campaignId: string,
  minRole: CampaignRoleCheck = "member",
) {
  const user = await requireCurrentUser();
  const membership = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId: user.id } },
    include: { campaign: true },
  });
  if (!membership) notFound();
  const isGm = membership.role === "gm";
  if (minRole === "gm" && !isGm) notFound();
  return { user, campaign: membership.campaign, membership, isGm };
}
