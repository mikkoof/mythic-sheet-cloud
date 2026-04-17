import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const campaignMemberFindUniqueMock = vi.fn();
const campaignMemberUpsertMock = vi.fn();
const campaignMemberDeleteMock = vi.fn();
const userFindUniqueMock = vi.fn();
const inviteUpsertMock = vi.fn();
const inviteFindUniqueMock = vi.fn();
const inviteDeleteMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    campaignMember: {
      findUnique: (...args: unknown[]) => campaignMemberFindUniqueMock(...args),
      upsert: (...args: unknown[]) => campaignMemberUpsertMock(...args),
      delete: (...args: unknown[]) => campaignMemberDeleteMock(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => userFindUniqueMock(...args),
    },
    campaignInvite: {
      upsert: (...args: unknown[]) => inviteUpsertMock(...args),
      findUnique: (...args: unknown[]) => inviteFindUniqueMock(...args),
      delete: (...args: unknown[]) => inviteDeleteMock(...args),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new Error(`REDIRECT:${target}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

import {
  addInviteAction,
  removeMemberAction,
  revokeInviteAction,
} from "./actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

function mockGm(userId = "gm1", campaignId = "c1", gmUserId = "gm1") {
  authMock.mockResolvedValueOnce({ user: { id: userId } });
  campaignMemberFindUniqueMock.mockResolvedValueOnce({
    campaignId,
    userId,
    role: "gm",
    campaign: { id: campaignId, gmUserId },
  });
}

function mockPlayer(userId = "p1", campaignId = "c1") {
  authMock.mockResolvedValueOnce({ user: { id: userId } });
  campaignMemberFindUniqueMock.mockResolvedValueOnce({
    campaignId,
    userId,
    role: "player",
    campaign: { id: campaignId, gmUserId: "gm1" },
  });
}

function mockNonMember(userId = "x1") {
  authMock.mockResolvedValueOnce({ user: { id: userId } });
  campaignMemberFindUniqueMock.mockResolvedValueOnce(null);
}

beforeEach(() => {
  authMock.mockReset();
  campaignMemberFindUniqueMock.mockReset();
  campaignMemberUpsertMock.mockReset();
  campaignMemberDeleteMock.mockReset();
  userFindUniqueMock.mockReset();
  inviteUpsertMock.mockReset();
  inviteFindUniqueMock.mockReset();
  inviteDeleteMock.mockReset();
  revalidatePathMock.mockReset();
});

describe("addInviteAction", () => {
  it("404s when caller is not the GM", async () => {
    mockPlayer();
    await expect(
      addInviteAction("c1", fd({ email: "new@example.com" })),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("404s when caller is not a member", async () => {
    mockNonMember();
    await expect(
      addInviteAction("c1", fd({ email: "new@example.com" })),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("rejects malformed email via Zod", async () => {
    mockGm();
    await expect(
      addInviteAction("c1", fd({ email: "not-an-email" })),
    ).rejects.toThrow();
    expect(userFindUniqueMock).not.toHaveBeenCalled();
  });

  it("adds CampaignMember immediately when email matches a registered user", async () => {
    mockGm();
    userFindUniqueMock.mockResolvedValueOnce({
      id: "existing-user",
      email: "existing@example.com",
    });

    await addInviteAction("c1", fd({ email: "Existing@Example.com" }));

    expect(userFindUniqueMock).toHaveBeenCalledWith({
      where: { email: "existing@example.com" },
    });
    expect(campaignMemberUpsertMock).toHaveBeenCalledWith({
      where: {
        campaignId_userId: { campaignId: "c1", userId: "existing-user" },
      },
      create: { campaignId: "c1", userId: "existing-user", role: "player" },
      update: {},
    });
    expect(inviteUpsertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/campaigns/c1");
  });

  it("creates a CampaignInvite when email is unregistered", async () => {
    mockGm();
    userFindUniqueMock.mockResolvedValueOnce(null);

    await addInviteAction("c1", fd({ email: "New@Example.com" }));

    expect(inviteUpsertMock).toHaveBeenCalledWith({
      where: {
        campaignId_email: { campaignId: "c1", email: "new@example.com" },
      },
      create: {
        campaignId: "c1",
        email: "new@example.com",
        invitedByUserId: "gm1",
      },
      update: {},
    });
    expect(campaignMemberUpsertMock).not.toHaveBeenCalled();
  });

  it("is idempotent for already-member: upsert no-ops", async () => {
    mockGm();
    userFindUniqueMock.mockResolvedValueOnce({
      id: "existing-user",
      email: "existing@example.com",
    });

    await addInviteAction("c1", fd({ email: "existing@example.com" }));

    const upsertArg = campaignMemberUpsertMock.mock.calls[0][0];
    expect(upsertArg.update).toEqual({});
  });
});

describe("revokeInviteAction", () => {
  it("404s when the invite does not exist", async () => {
    inviteFindUniqueMock.mockResolvedValueOnce(null);
    await expect(revokeInviteAction("missing")).rejects.toThrow("NOT_FOUND");
  });

  it("404s when caller is not the GM of the invite's campaign", async () => {
    inviteFindUniqueMock.mockResolvedValueOnce({
      id: "inv1",
      campaignId: "c1",
    });
    mockPlayer();
    await expect(revokeInviteAction("inv1")).rejects.toThrow("NOT_FOUND");
  });

  it("deletes the invite when caller is GM", async () => {
    inviteFindUniqueMock.mockResolvedValueOnce({
      id: "inv1",
      campaignId: "c1",
    });
    mockGm();

    await revokeInviteAction("inv1");

    expect(inviteDeleteMock).toHaveBeenCalledWith({ where: { id: "inv1" } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/campaigns/c1");
  });
});

describe("removeMemberAction", () => {
  it("404s when caller is not the GM", async () => {
    mockPlayer();
    await expect(
      removeMemberAction("c1", fd({ userId: "p2" })),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("404s when attempting to remove the GM themselves", async () => {
    mockGm("gm1", "c1", "gm1");
    await expect(
      removeMemberAction("c1", fd({ userId: "gm1" })),
    ).rejects.toThrow("NOT_FOUND");
    expect(campaignMemberDeleteMock).not.toHaveBeenCalled();
  });

  it("removes a player when caller is GM", async () => {
    mockGm("gm1", "c1", "gm1");

    await removeMemberAction("c1", fd({ userId: "p1" }));

    expect(campaignMemberDeleteMock).toHaveBeenCalledWith({
      where: { campaignId_userId: { campaignId: "c1", userId: "p1" } },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/campaigns/c1");
  });

  it("rejects missing userId via Zod", async () => {
    mockGm("gm1", "c1", "gm1");
    await expect(removeMemberAction("c1", fd({}))).rejects.toThrow();
  });
});
