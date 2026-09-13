import { describe, expect, it } from "vitest";
import { calculateDamage } from "./damage";
import type { IMyPokemon } from "@/services/api/pokemons";

const seq =
  (...values: Array<number>) =>
  () =>
    values.shift() ?? 0.5;

const mk = (over: Partial<IMyPokemon> = {}): IMyPokemon => ({
  name: "A",
  nickname: "A",
  battle_state: { level: 1, experience: 0 },
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    special_attack: 1,
    special_defense: 1,
    speed: 10,
  },
  types: ["normal"],
  moves: [],
  skills: [
    { name: "S1", power: 45, type: "normal", cooldown: 2 },
    { name: "S2", power: 65, type: "normal", cooldown: 3 },
  ],
  ...over,
});

const basic = { power: 20, type: null, missChance: 0, critChance: 0.12 };

describe("calculateDamage", () => {
  it("basic: attack 50 vs defense 50, power 20, no crit, variance 1.0 → 7", () => {
    const r = calculateDamage(mk(), mk(), basic, seq(0.5, 0.99, 0.5));
    expect(r).toMatchObject({
      damage: 7,
      isCritical: false,
      isMiss: false,
      effectiveness: 1,
    });
  });

  it("crit multiplies by 1.5", () => {
    const r = calculateDamage(mk(), mk(), basic, seq(0.5, 0.0, 0.5));
    expect(r.damage).toBe(11);
    expect(r.desc).toContain("Critical hit!");
  });

  it("miss returns 0 damage and no other rolls", () => {
    const r = calculateDamage(
      mk(),
      mk(),
      { ...basic, missChance: 0.1 },
      seq(0.05),
    );
    expect(r).toMatchObject({ damage: 0, isMiss: true });
  });

  it("typed move uses chart and STAB on any attacker type", () => {
    const atk = mk({ types: ["water", "fire"] });
    const def = mk({ types: ["grass"] });
    const r = calculateDamage(
      atk,
      def,
      { ...basic, type: "fire" },
      seq(0.5, 0.99, 0.5),
    );
    // 7.84 * 2 (fire vs grass) * 1.2 (stab) = 18.8 → 18
    expect(r.damage).toBe(18);
    expect(r.effectiveness).toBe(2);
    expect(r.desc).toContain("It's super effective!");
  });

  it("immune → 0 damage", () => {
    const r = calculateDamage(
      mk(),
      mk({ types: ["ground"] }),
      { ...basic, type: "electric" },
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(0);
    expect(r.desc).toContain("It had no effect...");
  });

  it("chain and overcharge multipliers stack", () => {
    const r = calculateDamage(
      mk(),
      mk(),
      { ...basic, chainMul: 1.5, overchargeMul: 2 },
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(23); // 7.84 * 3 = 23.5
  });

  it("minimum 1 damage when not immune", () => {
    const r = calculateDamage(
      mk({ stats: { ...mk().stats, attack: 1 } }),
      mk({ stats: { ...mk().stats, defense: 999 } }),
      basic,
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(1);
  });
});
