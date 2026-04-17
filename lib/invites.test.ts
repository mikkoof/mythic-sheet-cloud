import { beforeEach, describe, expect, it, vi } from "vitest";

const findManyMock = vi.fn();
const memberUpsertMock = vi.fn();
const inviteDeleteMock = vi.fn();
const txMock = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    campaignInvite: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      delete: (...args: unknown[]) => inviteDeleteMock(...args),
    },
    campaignMember: {
      upsert: (...args: unknown[]) => memberUpsertMock(...args),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => txMock(fn),
  },
}));

import { convertPendingInvites } from "./invites";

beforeEach(() => {
  findManyMock.mockReset();
  memberUpsertMock.mockReset();
  inviteDeleteMock.mockReset();
  txMock.mockReset();
  txMock.mockImplementation(async (fn) =>
    fn({
      campaignMember: {
        upsert: (...args: unknown[]) => memberUpsertMock(...args),
      },
      campaignInvite: {
        delete: (...args: unknown[]) => inviteDeleteMock(...args),
      },
    }),
  );
});

describe("convertPendingInvites", () => {
  it("is a no-op when email is missing", async () => {
    const result = await convertPendingInvites("u1", null);
    expect(result.converted).toBe(0);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("is a no-op when email is empty", async () => {
    const result = await convertPendingInvites("u1", "   ");
    expect(result.converted).toBe(0);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("is a no-op when no pending invites match", async () => {
    findManyMock.mockResolvedValueOnce([]);
    const result = await convertPendingInvites("u1", "foo@example.com");
    expect(result.converted).toBe(0);
    expect(memberUpsertMock).not.toHaveBeenCalled();
    expect(inviteDeleteMock).not.toHaveBeenCalled();
  });

  it("converts a single invite into a membership and deletes the invite", async () => {
    findManyMock.mockResolvedValueOnce([
      { id: "inv1", campaignId: "c1" },
    ]);
    const result = await convertPendingInvites("u1", "Player@Example.com");
    expect(result.converted).toBe(1);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { email: "player@example.com" },
      select: { id: true, campaignId: true },
    });
    expect(memberUpsertMock).toHaveBeenCalledWith({
      where: { campaignId_userId: { campaignId: "c1", userId: "u1" } },
      create: { campaignId: "c1", userId: "u1", role: "player" },
      update: {},
    });
    expect(inviteDeleteMock).toHaveBeenCalledWith({ where: { id: "inv1" } });
  });

  it("converts invites across multiple campaigns", async () => {
    findManyMock.mockResolvedValueOnce([
      { id: "inv1", campaignId: "c1" },
      { id: "inv2", campaignId: "c2" },
    ]);
    const result = await convertPendingInvites("u1", "player@example.com");
    expect(result.converted).toBe(2);
    expect(memberUpsertMock).toHaveBeenCalledTimes(2);
    expect(inviteDeleteMock).toHaveBeenCalledTimes(2);
  });

  it("is idempotent — upsert with update:{} swallows dup member", async () => {
    findManyMock.mockResolvedValueOnce([
      { id: "inv1", campaignId: "c1" },
    ]);
    await convertPendingInvites("u1", "player@example.com");
    const upsertCall = memberUpsertMock.mock.calls[0][0];
    expect(upsertCall.update).toEqual({});
  });
});
