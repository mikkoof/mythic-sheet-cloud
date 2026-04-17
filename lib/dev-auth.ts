if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_DEV_AUTH === "true"
) {
  throw new Error(
    "ALLOW_DEV_AUTH must not be set in production. Unset this env var on production / preview deployments.",
  );
}

export const DEV_AUTH_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_DEV_AUTH === "true";

export const DEV_USERS = [
  { email: "gm@localhost.test", name: "Dev GM", label: "GM" },
  { email: "player1@localhost.test", name: "Dev Player 1", label: "Player 1" },
  { email: "player2@localhost.test", name: "Dev Player 2", label: "Player 2" },
] as const;

export type DevUser = (typeof DEV_USERS)[number];

export function isDevUserEmail(email: string): boolean {
  return DEV_USERS.some((u) => u.email === email);
}
