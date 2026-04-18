import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const campaignMemberFindUniqueMock = vi.fn();
const knightFindUniqueMock = vi.fn();
const steedFindUniqueMock = vi.fn();
const steedCreateMock = vi.fn();
const steedUpdateMock = vi.fn();
const steedDeleteMock = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    campaignMember: {
      findUnique: (...args: unknown[]) => campaignMemberFindUniqueMock(...args),
    },
    knight: {
      findUnique: (...args: unknown[]) => knightFindUniqueMock(...args),
    },
    steed: {
      findUnique: (...args: unknown[]) => steedFindUniqueMock(...args),
      create: (...args: unknown[]) => steedCreateMock(...args),
      update: (...args: unknown[]) => steedUpdateMock(...args),
      delete: (...args: unknown[]) => steedDeleteMock(...args),
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
  createSteedAction,
  deleteSteedAction,
  updateSteedAction,
} from "./actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

function validUpdateForm(name = "Old Bess"): FormData {
  return fd({
    name,
    age: "mature",
    vigRemaining: "5",
    vigMax: "8",
    claRemaining: "3",
    claMax: "6",
    spiRemaining: "2",
    spiMax: "4",
    guardRemaining: "1",
    guardMax: "2",
    property: JSON.stringify(["Saddle", "Bridle"]),
  });
}

beforeEach(() => {
  authMock.mockReset();
  campaignMemberFindUniqueMock.mockReset();
  knightFindUniqueMock.mockReset();
  steedFindUniqueMock.mockReset();
  steedCreateMock.mockReset();
  steedUpdateMock.mockReset();
  steedDeleteMock.mockReset();
  revalidatePathMock.mockReset();
  steedCreateMock.mockResolvedValue({ id: "s-new" });
  steedUpdateMock.mockResolvedValue({});
  steedDeleteMock.mockResolvedValue({});
});

describe("createSteedAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      createSteedAction("k1", fd({ name: "Old Bess" })),
    ).rejects.toThrow("NOT_FOUND");
    expect(steedCreateMock).not.toHaveBeenCalled();
  });

  it("404s a player who does not own the knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "p2" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p2",
      role: "player",
    });

    await expect(
      createSteedAction("k1", fd({ name: "" })),
    ).rejects.toThrow("NOT_FOUND");
    expect(steedCreateMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to create a steed", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "p1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p1",
      role: "player",
    });

    await createSteedAction("k1", fd({ name: "Old Bess" }));
    expect(steedCreateMock).toHaveBeenCalledWith({
      data: { knightId: "k1", name: "Old Bess" },
    });
  });

  it("allows the GM to create a steed on another player's knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
    });

    await createSteedAction("k1", fd({ name: "" }));
    expect(steedCreateMock).toHaveBeenCalled();
  });
});

describe("updateSteedAction access matrix", () => {
  it("404s if the steed does not exist", async () => {
    steedFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      updateSteedAction("s1", validUpdateForm()),
    ).rejects.toThrow("NOT_FOUND");
    expect(steedUpdateMock).not.toHaveBeenCalled();
  });

  it("404s a player who does not own the parent knight", async () => {
    steedFindUniqueMock.mockResolvedValueOnce({ id: "s1", knightId: "k1" });
    authMock.mockResolvedValueOnce({ user: { id: "p2" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p2",
      role: "player",
    });

    await expect(
      updateSteedAction("s1", validUpdateForm()),
    ).rejects.toThrow("NOT_FOUND");
    expect(steedUpdateMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to update", async () => {
    steedFindUniqueMock.mockResolvedValueOnce({ id: "s1", knightId: "k1" });
    authMock.mockResolvedValueOnce({ user: { id: "p1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p1",
      role: "player",
    });

    await updateSteedAction("s1", validUpdateForm());
    expect(steedUpdateMock).toHaveBeenCalled();
    const data = steedUpdateMock.mock.calls[0][0].data;
    expect(data.name).toBe("Old Bess");
    expect(data.age).toBe("mature");
    expect(data.vigRemaining).toBe(5);
    expect(data.property).toEqual(["Saddle", "Bridle"]);
  });
});

describe("deleteSteedAction access matrix", () => {
  it("404s non-owner player", async () => {
    steedFindUniqueMock.mockResolvedValueOnce({ id: "s1", knightId: "k1" });
    authMock.mockResolvedValueOnce({ user: { id: "p2" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p2",
      role: "player",
    });

    await expect(deleteSteedAction("s1")).rejects.toThrow("NOT_FOUND");
    expect(steedDeleteMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to delete", async () => {
    steedFindUniqueMock.mockResolvedValueOnce({ id: "s1", knightId: "k1" });
    authMock.mockResolvedValueOnce({ user: { id: "p1" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p1",
      role: "player",
    });

    await deleteSteedAction("s1");
    expect(steedDeleteMock).toHaveBeenCalledWith({ where: { id: "s1" } });
  });
});
