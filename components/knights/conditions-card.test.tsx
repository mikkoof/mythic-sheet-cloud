import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONDITION_TEXT, ConditionsCard } from "./conditions-card";

function renderCard(override: Partial<Parameters<typeof ConditionsCard>[0]> = {}) {
  const props = {
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
    expect(screen.getByText("Exhausted")).toBeInTheDocument();
    expect(screen.getByText("Exposed")).toBeInTheDocument();
    expect(screen.getByText("Impaired")).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.exhausted)).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.exposed)).toBeInTheDocument();
    expect(screen.getByText(CONDITION_TEXT.impaired)).toBeInTheDocument();
  });

  it("hidden input carries 'on' when checked and '' when unchecked", () => {
    const { container } = renderCard({
      exhausted: true,
      exposed: false,
    });
    const exhausted = container.querySelector(
      "input[name='exhausted']",
    ) as HTMLInputElement | null;
    const exposed = container.querySelector(
      "input[name='exposed']",
    ) as HTMLInputElement | null;
    expect(exhausted?.value).toBe("on");
    expect(exposed?.value).toBe("");
  });
});
