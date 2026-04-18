import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const campaignMemberFindUniqueMock = vi.fn();
const knightFindUniqueMock = vi.fn();
const squireFindUniqueMock = vi.fn();
const squireCreateMock = vi.fn();
const squireUpdateMock = vi.fn();
const squireDeleteMock = vi.fn();
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
    squire: {
      findUnique: (...args: unknown[]) => squireFindUniqueMock(...args),
      create: (...args: unknown[]) => squireCreateMock(...args),
      update: (...args: unknown[]) => squireUpdateMock(...args),
      delete: (...args: unknown[]) => squireDeleteMock(...args),
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
  createSquireAction,
  deleteSquireAction,
  updateSquireAction,
} from "./actions";

function fd(entries: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

function validUpdateForm(name = "Young Tam"): FormData {
  return fd({
    name,
    age: "young",
    vigRemaining: "4",
    vigMax: "6",
    claRemaining: "3",
    claMax: "5",
    spiRemaining: "2",
    spiMax: "4",
    guardRemaining: "1",
    guardMax: "2",
    property: JSON.stringify(["Whetstone"]),
  });
}

beforeEach(() => {
  authMock.mockReset();
  campaignMemberFindUniqueMock.mockReset();
  knightFindUniqueMock.mockReset();
  squireFindUniqueMock.mockReset();
  squireCreateMock.mockReset();
  squireUpdateMock.mockReset();
  squireDeleteMock.mockReset();
  revalidatePathMock.mockReset();
  squireCreateMock.mockResolvedValue({ id: "q-new" });
  squireUpdateMock.mockResolvedValue({});
  squireDeleteMock.mockResolvedValue({});
});

describe("createSquireAction access matrix", () => {
  it("404s non-members", async () => {
    authMock.mockResolvedValueOnce({ user: { id: "stranger" } });
    knightFindUniqueMock.mockResolvedValueOnce({
      id: "k1",
      campaignId: "c1",
      playerUserId: "p1",
    });
    campaignMemberFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      createSquireAction("k1", fd({ name: "Young Tam" })),
    ).rejects.toThrow("NOT_FOUND");
    expect(squireCreateMock).not.toHaveBeenCalled();
  });

  it("allows the owning player to create a squire", async () => {
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

    await createSquireAction("k1", fd({ name: "Young Tam" }));
    expect(squireCreateMock).toHaveBeenCalledWith({
      data: { knightId: "k1", name: "Young Tam" },
    });
  });
});

describe("updateSquireAction access matrix", () => {
  it("404s non-owner players", async () => {
    squireFindUniqueMock.mockResolvedValueOnce({ id: "q1", knightId: "k1" });
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
      updateSquireAction("q1", validUpdateForm()),
    ).rejects.toThrow("NOT_FOUND");
    expect(squireUpdateMock).not.toHaveBeenCalled();
  });

  it("allows the GM to update any squire", async () => {
    squireFindUniqueMock.mockResolvedValueOnce({ id: "q1", knightId: "k1" });
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

    await updateSquireAction("q1", validUpdateForm());
    expect(squireUpdateMock).toHaveBeenCalled();
  });
});

describe("deleteSquireAction", () => {
  it("deletes a squire for the owning player", async () => {
    squireFindUniqueMock.mockResolvedValueOnce({ id: "q1", knightId: "k1" });
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

    await deleteSquireAction("q1");
    expect(squireDeleteMock).toHaveBeenCalledWith({ where: { id: "q1" } });
  });
});
