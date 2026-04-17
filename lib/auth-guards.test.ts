import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findUniqueMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    campaignMember: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
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

import { requireCampaignAccess, requireCurrentUser } from "./auth-guards";

beforeEach(() => {
  authMock.mockReset();
  findUniqueMock.mockReset();
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
