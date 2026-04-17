import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONDITION_TEXT, ConditionsCard } from "./conditions-card";

function renderCard(override: Partial<Parameters<typeof ConditionsCard>[0]> = {}) {
  const props = {
    fatigued: false,
    exhausted: false,
    exposed: false,
    impaired: false,
    onChange: vi.fn(),
    canEdit: true,
    ...override,
  };
  return render(<ConditionsCard {...props} />);
}

describe("ConditionsCard", () => {
  it("renders every condition with its rule text", () => {
    renderCard();
    expect(screen.getByText("Fatigued")).toBeInTheDocument();
    expect(screen.getByText("Exhausted")).toBeInTheDocument();
    expect(screen.getByText("Exposed")).toBeInTheDocument();
    expect(screen.getByText("Impaired")).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.fatigued)).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.exhausted)).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.exposed)).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.impaired)).toBeInTheDocument();
  });

  it("hidden input carries 'on' when checked and '' when unchecked", () => {
    const { container } = renderCard({
      fatigued: true,
      exhausted: false,
    });
    const fatigued = container.querySelector(
      "input[name='fatigued']",
    ) as HTMLInputElement | null;
    const exhausted = container.querySelector(
      "input[name='exhausted']",
    ) as HTMLInputElement | null;
    expect(fatigued?.value).toBe("on");
    expect(exhausted?.value).toBe("");
  });
});
