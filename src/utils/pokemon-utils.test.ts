import { describe, expect, it } from "vitest";
import { buildSkills } from "./pokemon-utils";

describe("buildSkills", () => {
  it("maps two pool moves into skill 1 (40-50) and skill 2 (60-70) with type per slot", () => {
    const [s1, s2] = buildSkills(
      [
        { name: "tackle", power: 30 },
        { name: "ember", power: 65 },
      ],
      ["fire", "flying"],
    );
    expect(s1).toEqual({
      name: "tackle",
      power: 40,
      type: "fire",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
      cooldown: 2,
    });
    expect(s2).toEqual({
      name: "ember",
      power: 70,
      type: "flying",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
      cooldown: 3,
    });
  });

  it("falls back to placeholders and types[0] when the pool is short", () => {
    const [s1, s2] = buildSkills([], ["water"]);
    expect(s1).toMatchObject({
      name: "Quick Strike",
      power: 45,
      type: "water",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
    expect(s2).toMatchObject({
      name: "Power Blast",
      power: 65,
      type: "water",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
  });
});
