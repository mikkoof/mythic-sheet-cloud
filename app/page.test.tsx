import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { devSession, mockAuth } from "@/test/auth";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/auth");
});

describe("Home page", () => {
  it("greets the signed-in user by first name", async () => {
    mockAuth(devSession({ name: "Dev GM" }));
    const { default: Home } = await import("./page");

    render(await Home());

    expect(
      screen.getByRole("heading", { name: /Welcome, Dev/ }),
    ).toBeInTheDocument();
  });

  it("renders generic welcome when there is no session", async () => {
    mockAuth(null);
    const { default: Home } = await import("./page");

    render(await Home());

    expect(screen.getByRole("heading", { name: /^Welcome$/ })).toBeInTheDocument();
  });
});
