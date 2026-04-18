import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const campaignMemberFindUniqueMock = vi.fn();
const knightFindUniqueMock = vi.fn();
const knightCreateMock = vi.fn();
const knightUpdateMock = vi.fn();
const knightDeleteMock = vi.fn();
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
      delete: (...args: unknown[]) => knightDeleteMock(...args),
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
  createKnightAction,
  deleteKnightAction,
  updateKnightAction,
  updateKnightStatusAction,
} from "./actions";

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
  knightDeleteMock.mockReset();
  revalidatePathMock.mockReset();
  knightCreateMock.mockResolvedValue({ id: "k-new" });
  knightUpdateMock.mockResolvedValue({});
  knightDeleteMock.mockResolvedValue({});
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
        predecessorKnightId: null,
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

describe("createKnightAction successor branch", () => {
  it("copies predecessor's playerUserId so player retains ownership", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
      campaign: { id: "c1" },
    });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "cprev00000000000",
      campaignId: "c1",
      playerUserId: "p1",
    });

    await expect(
      createKnightAction(
        "c1",
        fd({ name: "Heir", epithet: "", predecessorKnightId: "cprev00000000000" }),
      ),
    ).rejects.toThrow(/REDIRECT/);

    expect(knightCreateMock).toHaveBeenCalledWith({
      data: {
        campaignId: "c1",
        playerUserId: "p1",
        name: "Heir",
        epithet: "",
        predecessorKnightId: "cprev00000000000",
      },
    });
  });

  it("404s if the predecessor belongs to a different campaign", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "gm1",
      role: "gm",
      campaign: { id: "c1" },
    });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "prev",
      campaignId: "other",
      playerUserId: "p1",
    });

    await expect(
      createKnightAction(
        "c1",
        fd({ name: "Heir", epithet: "", predecessorKnightId: "cprev00000000000" }),
      ),
    ).rejects.toThrow(/NOT_FOUND/);
    expect(knightCreateMock).not.toHaveBeenCalled();
  });

  it("404s if a non-GM player tries to succeed someone else's knight", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "p2" } });
    campaignMemberFindUniqueMock.mockResolvedValueOnce({
      campaignId: "c1",
      userId: "p2",
      role: "player",
      campaign: { id: "c1" },
    });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "cprev00000000000",
      campaignId: "c1",
      playerUserId: "p1",
    });

    await expect(
      createKnightAction(
        "c1",
        fd({ name: "Heir", epithet: "", predecessorKnightId: "cprev00000000000" }),
      ),
    ).rejects.toThrow(/NOT_FOUND/);
    expect(knightCreateMock).not.toHaveBeenCalled();
  });
});

describe("updateKnightStatusAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      updateKnightStatusAction("k1", "dead"),
    ).rejects.toThrow("NOT_FOUND");
    expect(knightUpdateMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to update status", async () => {
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

    await updateKnightStatusAction("k1", "retired");
    expect(knightUpdateMock).toHaveBeenCalledWith({
      where: { id: "k1" },
      data: { status: "retired" },
    });
  });

  it("rejects an invalid status value", async () => {
    await expect(
      updateKnightStatusAction("k1", "banished"),
    ).rejects.toThrow();
    expect(knightUpdateMock).not.toHaveBeenCalled();
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

describe("deleteKnightAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(deleteKnightAction("k1")).rejects.toThrow("NOT_FOUND");
    expect(knightDeleteMock).not.toHaveBeenCalled();
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

    await expect(deleteKnightAction("k1")).rejects.toThrow("NOT_FOUND");
    expect(knightDeleteMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to delete their knight", async () => {
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

    await deleteKnightAction("k1");
    expect(knightDeleteMock).toHaveBeenCalledWith({ where: { id: "k1" } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/campaigns/c1");
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/campaigns/c1/knights/k1",
    );
  });

  it("allows the GM to delete another player's knight", async () => {
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

    await deleteKnightAction("k1");
    expect(knightDeleteMock).toHaveBeenCalledWith({ where: { id: "k1" } });
  });

  it("404s when the knight does not exist", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "gm1" } });
    knightFindUniqueMock.mockResolvedValueOnce(null);

    await expect(deleteKnightAction("missing")).rejects.toThrow("NOT_FOUND");
    expect(knightDeleteMock).not.toHaveBeenCalled();
  });
});
