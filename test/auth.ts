import type { Session } from "next-auth";
import { vi } from "vitest";

export function mockAuth(session: Session | null) {
  // `doMock` (not `mock`) so this runs at call time. Callers must dynamic-import
  // the module under test AFTER calling mockAuth, so the mock is in place.
  vi.doMock("@/auth", () => ({
    auth: vi.fn(async () => session),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  }));
}

export function devSession(
  overrides: Partial<Session["user"]> = {},
): Session {
  return {
    user: {
      id: "test-user",
      email: "gm@localhost.test",
      name: "Dev GM",
      ...overrides,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
