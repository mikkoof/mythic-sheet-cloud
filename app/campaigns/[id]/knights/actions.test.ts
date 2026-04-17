import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const campaignMemberFindUniqueMock = vi.fn();
const knightFindUniqueMock = vi.fn();
const knightCreateMock = vi.fn();
const knightUpdateMock = vi.fn();
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
      create: (...args: unknown[]) => knightCreateMock(...args),
      update: (...args: unknown[]) => knightUpdateMock(...args),
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

import { createKnightAction, updateKnightAction } from "./actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

function validUpdateForm(name = "Galahad"): FormData {
  return fd({
    name,
    epithet: "True",
    ultimateFate: "",
    vigRemaining: "3",
    vigMax: "5",
    claRemaining: "3",
    claMax: "5",
    spiRemaining: "3",
    spiMax: "5",
    guardRemaining: "1",
    guardMax: "3",
    vigTraits: JSON.stringify(["", "", ""]),
    claTraits: JSON.stringify(["", "", ""]),
    spiTraits: JSON.stringify(["", "", ""]),
    glory: "0",
    age: "young",
    ability: "",
    passion: "",
    property: JSON.stringify([]),
    weapons: JSON.stringify([]),
    protectiveArticles: JSON.stringify({
      items: [
        { name: "", checked: false },
        { name: "", checked: false },
        { name: "", checked: false },
        { name: "", checked: false },
      ],
      extra: 0,
    }),
  });
}

beforeEach(() => {
  authMock.mockReset();
  campaignMemberFindUniqueMock.mockReset();
  knightFindUniqueMock.mockReset();
  knightCreateMock.mockReset();
  knightUpdateMock.mockReset();
  revalidatePathMock.mockReset();
  knightCreateMock.mockResolvedValue({ id: "k-new" });
  knightUpdateMock.mockResolvedValue({});
});

describe("createKnightAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      createKnightAction("c1", fd({ name: "Percival", epithet: "" })),
    ).rejects.toThrow(/NOT_FOUND|REDIRECT/);
    expect(knightCreateMock).not.toHaveBeenCalled();
  });

  it("allows a player to create their own knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "p1" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p1",
      role: "player",
      campaign: { id: "c1" },
    });

    await expect(
      createKnightAction("c1", fd({ name: "Percival", epithet: "" })),
    ).rejects.toThrow(/REDIRECT/); // redirects to new knight page on success
    expect(knightCreateMock).toHaveBeenCalledWith({
      data: {
        campaignId: "c1",
        playerUserId: "p1",
        name: "Percival",
        epithet: "",
      },
    });
  });

  it("allows the GM to create a knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
      campaign: { id: "c1" },
    });

    await expect(
      createKnightAction("c1", fd({ name: "Gawain", epithet: "" })),
    ).rejects.toThrow(/REDIRECT/);
    expect(knightCreateMock).toHaveBeenCalled();
  });
});

describe("updateKnightAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(updateKnightAction("k1", validUpdateForm())).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(knightUpdateMock).not.toHaveBeenCalled();
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

    await expect(updateKnightAction("k1", validUpdateForm())).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(knightUpdateMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to update", async () => {
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

    await updateKnightAction("k1", validUpdateForm());
    expect(knightUpdateMock).toHaveBeenCalled();
  });

  it("allows the GM to update another player's knight", async () => {
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

    await updateKnightAction("k1", validUpdateForm());
    expect(knightUpdateMock).toHaveBeenCalled();
  });
});
