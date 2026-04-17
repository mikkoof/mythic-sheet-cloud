import { describe, it, expect } from "vitest";
import { rankFromGlory } from "./rank";

describe("rankFromGlory", () => {
  it.each([
    [0, "Knight Errant"],
    [1, "Knight Errant"],
    [2, "Knight Errant"],
    [3, "Knight Gallant"],
    [5, "Knight Gallant"],
    [6, "Knight Tenant"],
    [8, "Knight Tenant"],
    [9, "Knight Dominant"],
    [11, "Knight Dominant"],
    [12, "Knight Radiant"],
  ])("glory %i → %s", (glory, expected) => {
    expect(rankFromGlory(glory)).toBe(expected);
  });

  it("clamps above 12 to Knight Radiant", () => {
    expect(rankFromGlory(15)).toBe("Knight Radiant");
  });
});
