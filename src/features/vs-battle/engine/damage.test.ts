import { describe, expect, it, vi } from "vitest";
import { calculateDamage, estimateDamage } from "./damage";
import { pokemonFixture, sequenceRng } from "./testFixtures";
import type { DamageInput } from "./damage";

const physical: DamageInput = {
  power: 60,
  type: "psychic",
  damageClass: "physical",
  accuracy: 100,
  critChance: 0,
};

describe("calculateDamage", () => {
  it("uses special attack and special defense for a special move", () => {
    const attacker = pokemonFixture({ attack: 20, special_attack: 120 });
    const defender = pokemonFixture({ defense: 120, special_defense: 20 });
    const result = calculateDamage(
      attacker,
      defender,
      { ...physical, damageClass: "special" },
      sequenceRng([0.5]),
    );
    expect(result.damage).toBe(70);
  });

  it("uses attack and defense for a physical move", () => {
    expect(
      calculateDamage(
        pokemonFixture({ attack: 20, special_attack: 120 }),
        pokemonFixture({ defense: 120, special_defense: 20 }),
        physical,
        sequenceRng([0.5]),
      ).damage,
    ).toBe(6);
  });

  it.each([
    { accuracy: 80, roll: 0.9, isMiss: true },
    { accuracy: 80, roll: 0.8, isMiss: true },
    { accuracy: 80, roll: 0.799, isMiss: false },
    { accuracy: 100, roll: 0.999, isMiss: false },
    { accuracy: 0, roll: 0, isMiss: true },
  ])(
    "accuracy $accuracy with roll $roll: miss=$isMiss",
    ({ accuracy, roll, isMiss }) => {
      const result = calculateDamage(
        pokemonFixture(),
        pokemonFixture(),
        { ...physical, accuracy },
        sequenceRng([roll, 0.5, 0.5]),
      );
      expect(result.isMiss).toBe(isMiss);
      expect(result.damage).toBe(isMiss ? 0 : 29);
    },
  );

  it("uses injected rolls in accuracy, critical, variance order", () => {
    expect(
      calculateDamage(
        pokemonFixture(),
        pokemonFixture(),
        { ...physical, accuracy: 80, critChance: 0.2 },
        sequenceRng([0.7, 0.1, 0]),
      ),
    ).toMatchObject({ damage: 39, isCritical: true, isMiss: false });
  });

  it("applies STAB, effectiveness, chain and overcharge multipliers", () => {
    const attacker = pokemonFixture({ special_attack: 85 });
    attacker.types = ["fire"];
    const defender = pokemonFixture({ special_defense: 100 });
    defender.types = ["grass"];
    expect(
      calculateDamage(
        attacker,
        defender,
        {
          ...physical,
          power: 50,
          type: "fire",
          damageClass: "special",
          chainMul: 1.5,
          overchargeMul: 2,
        },
        sequenceRng([0.5]),
      ),
    ).toMatchObject({ damage: 180, effectiveness: 2 });
  });

  it("keeps type immunity at zero damage and nonimmune weak hits at one", () => {
    const defender = pokemonFixture();
    defender.types = ["ghost"];
    expect(
      calculateDamage(
        pokemonFixture(),
        defender,
        { ...physical, type: "normal" },
        sequenceRng([0.5]),
      ).damage,
    ).toBe(0);
    expect(
      calculateDamage(
        pokemonFixture({ attack: 1 }),
        defender,
        { ...physical, power: 1 },
        sequenceRng([0.5]),
      ).damage,
    ).toBe(1);
  });

  it("makes an untyped basic attack ignore STAB and immunity", () => {
    const defender = pokemonFixture();
    defender.types = ["ghost"];
    expect(
      calculateDamage(
        pokemonFixture(),
        defender,
        { ...physical, power: 20, type: null },
        sequenceRng([0.5]),
      ),
    ).toMatchObject({ damage: 9, effectiveness: 1 });
  });
});

describe("estimateDamage", () => {
  it("weights special damage by accuracy and expected critical multiplier without RNG", () => {
    const attacker = pokemonFixture({ attack: 1, special_attack: 85 });
    attacker.types = ["fire"];
    const defender = pokemonFixture({ defense: 1, special_defense: 100 });
    defender.types = ["grass"];
    const random = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Estimate must not consume RNG");
    });
    try {
      const input: DamageInput = {
        ...physical,
        power: 50,
        type: "fire",
        damageClass: "special",
        accuracy: 80,
        critChance: 0.2,
        chainMul: 1.5,
        overchargeMul: 2,
      };
      expect(estimateDamage(attacker, defender, input)).toBe(158);
      expect(estimateDamage(attacker, defender, input)).toBe(158);
    } finally {
      random.mockRestore();
    }
  });

  it("estimates physical damage using physical stats", () => {
    expect(
      estimateDamage(
        pokemonFixture({ attack: 20, special_attack: 120 }),
        pokemonFixture({ defense: 120, special_defense: 20 }),
        physical,
      ),
    ).toBe(6);
  });

  it("returns zero for immunity and zero accuracy", () => {
    const defender = pokemonFixture();
    defender.types = ["ghost"];
    expect(
      estimateDamage(pokemonFixture(), defender, {
        ...physical,
        type: "normal",
      }),
    ).toBe(0);
    expect(
      estimateDamage(pokemonFixture(), defender, { ...physical, accuracy: 0 }),
    ).toBe(0);
  });
});
