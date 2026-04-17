import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findUniqueMock = vi.fn();
const knightFindUniqueMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    campaignMember: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
    knight: {
      findUnique: (...args: unknown[]) => knightFindUniqueMock(...args),
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

import {
  requireCampaignAccess,
  requireCurrentUser,
  requireKnightAccess,
  requireKnightWriteAccess,
} from "./auth-guards";

beforeEach(() => {
  authMock.mockReset();
  findUniqueMock.mockReset();
  knightFindUniqueMock.mockReset();
});

describe("requireCurrentUser", () => {
  it("redirects to /signin when there is no session", async () => {
    authMock.mockResolvedValueOnce(null);
    await expect(requireCurrentUser()).rejects.toThrow("REDIRECT:/signin");
  });

  it("returns the user when authenticated", async () => {
    authMock.mockResolvedValueOnce({
      user: { id: "u1", name: "Mikko", email: "m@example.com" },
    });
    await expect(requireCurrentUser()).resolves.toMatchObject({ id: "u1" });
  });
});

describe("requireCampaignAccess", () => {
  it("404s for non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce(null);
    await expect(requireCampaignAccess("c1")).rejects.toThrow("NOT_FOUND");
  });

  it("returns isGm: false for a player member under default check", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "player",
      campaign: { id: "c1", name: "Fens" },
    });
    const result = await requireCampaignAccess("c1");
    expect(result.isGm).toBe(false);
    expect(result.campaign.id).toBe("c1");
  });

  it("404s when a player asks for gm-only access", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "player",
      campaign: { id: "c1", name: "Fens" },
    });
    await expect(requireCampaignAccess("c1", "gm")).rejects.toThrow("NOT_FOUND");
  });

  it("returns isGm: true when the GM asks for gm-only access", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "gm",
      campaign: { id: "c1", name: "Fens" },
    });
    const result = await requireCampaignAccess("c1", "gm");
    expect(result.isGm).toBe(true);
  });
});

describe("requireKnightAccess", () => {
  it("404s when the knight does not exist", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    knightFindUniqueMock.mockResolvedValueOnce(null);
    await expect(requireKnightAccess("k1")).rejects.toThrow("NOT_FOUND");
  });

  it("404s when the user is not a campaign member", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u2",
    });
    findUniqueMock.mockResolvedValueOnce(null);
    await expect(requireKnightAccess("k1")).rejects.toThrow("NOT_FOUND");
  });

  it("returns isOwner:true when the viewer is the knight's player", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u1",
    });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "player",
    });
    const result = await requireKnightAccess("k1");
    expect(result.isOwner).toBe(true);
    expect(result.isGm).toBe(false);
  });

  it("returns isGm:true when the viewer is the campaign GM (not owner)", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u2",
    });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
    });
    const result = await requireKnightAccess("k1");
    expect(result.isGm).toBe(true);
    expect(result.isOwner).toBe(false);
  });
});

describe("requireKnightWriteAccess", () => {
  it("404s for a non-owner, non-GM member", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u2",
    });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "player",
    });
    await expect(requireKnightWriteAccess("k1")).rejects.toThrow("NOT_FOUND");
  });

  it("allows the owning player to write", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "u1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u1",
    });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "u1",
      role: "player",
    });
    await expect(requireKnightWriteAccess("k1")).resolves.toMatchObject({
      isOwner: true,
    });
  });

  it("allows the GM to write another player's knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "u2",
    });
    findUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
    });
    await expect(requireKnightWriteAccess("k1")).resolves.toMatchObject({
      isGm: true,
    });
  });
});
