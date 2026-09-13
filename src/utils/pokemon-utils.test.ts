import { describe, expect, it } from "vitest";
import { buildSkills } from "./pokemon-utils";

describe("buildSkills", () => {
  it("preserves enriched move metadata while fitting each skill power band", () => {
    const [s1, s2] = buildSkills([
      {
        name: "tackle",
        power: 30,
        type: "normal",
        damageClass: "physical",
        accuracy: 95,
        priority: 1,
      },
      {
        name: "ember",
        power: 65,
        type: "fire",
        damageClass: "special",
        accuracy: 80,
        priority: 0,
      },
    ]);
    expect(s1).toEqual({
      name: "tackle",
      power: 40,
      type: "normal",
      damageClass: "physical",
      accuracy: 95,
      priority: 1,
      cooldown: 2,
    });
    expect(s2).toEqual({
      name: "ember",
      power: 70,
      type: "fire",
      damageClass: "special",
      accuracy: 80,
      priority: 0,
      cooldown: 3,
    });
  });

  it("falls back to normal physical placeholders when the pool is short", () => {
    const [s1, s2] = buildSkills([]);
    expect(s1).toMatchObject({
      name: "Quick Strike",
      power: 45,
      type: "normal",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
    expect(s2).toMatchObject({
      name: "Power Blast",
      power: 65,
      type: "normal",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
  });
});
