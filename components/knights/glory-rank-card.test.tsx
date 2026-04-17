import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { GloryRankCard } from "./glory-rank-card";

describe("GloryRankCard", () => {
  it("shows the derived rank and worthy-to line", () => {
    render(<GloryRankCard glory={6} onChange={vi.fn()} canEdit />);
    expect(screen.getByText("Knight-Tenant")).toBeInTheDocument();
    expect(screen.getByText("Worthy to Rule a Holding")).toBeInTheDocument();
  });

  it("increments glory up to 12 via the + button", () => {
    const onChange = vi.fn();
    render(<GloryRankCard glory={11} onChange={onChange} canEdit />);
    fireEvent.click(screen.getByLabelText("Increase glory"));
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it("caps glory at 12 — the + button is disabled", () => {
    const onChange = vi.fn();
    render(<GloryRankCard glory={12} onChange={onChange} canEdit />);
    const inc = screen.getByLabelText("Increase glory") as HTMLButtonElement;
    expect(inc.disabled).toBe(true);
  });

  it("disables both buttons when canEdit is false", () => {
    render(<GloryRankCard glory={5} onChange={vi.fn()} canEdit={false} />);
    expect(
      (screen.getByLabelText("Decrease glory") as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByLabelText("Increase glory") as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
