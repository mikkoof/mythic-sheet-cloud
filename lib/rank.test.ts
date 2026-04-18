import { describe, it, expect } from "vitest";
import { rankFromGlory } from "./rank";

describe("rankFromGlory", () => {
  it.each([
    [0, "Knight Errant", "Worthy to Lead a Warband"],
    [1, "Knight Errant", "Worthy to Lead a Warband"],
    [2, "Knight Errant", "Worthy to Lead a Warband"],
    [3, "Knight Gallant", "Worthy to Serve in Court or Council"],
    [5, "Knight Gallant", "Worthy to Serve in Court or Council"],
    [6, "Knight Tenant", "Worthy to Rule a Holding"],
    [8, "Knight Tenant", "Worthy to Rule a Holding"],
    [9, "Knight Dominant", "Worthy to Rule a Seat of Power"],
    [11, "Knight Dominant", "Worthy to Rule a Seat of Power"],
    [12, "Knight Radiant", "Worthy to Seek the City"],
  ])("glory %i → %s (%s)", (glory, name, worthyTo) => {
    expect(rankFromGlory(glory)).toEqual({ name, worthyTo });
  });

  it("clamps above the cap to Knight Radiant", () => {
    expect(rankFromGlory(15)).toEqual({
      name: "Knight Radiant",
      worthyTo: "Worthy to Seek the City",
    });
  });

  it("clamps below 0 to Knight Errant", () => {
    expect(rankFromGlory(-5)).toEqual({
      name: "Knight Errant",
      worthyTo: "Worthy to Lead a Warband",
    });
  });
});
