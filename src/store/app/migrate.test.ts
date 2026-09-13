import { describe, expect, it } from "vitest";
import { migratePokemon, migrateStore } from "./migrate";

const legacy = {
  name: "PIKACHU",
  nickname: "ZAP",
  battle_state: { level: 3, experience: 40 },
  stats: {
    hp: 92,
    attack: 58,
    defense: 42,
    special_attack: 53,
    special_defense: 53,
    speed: 95,
  },
  types: ["electric"],
  moves: [{ name: "thunder", power: 60, type: "electric" }],
};

describe("migratePokemon", () => {
  it("adds placeholder skills and reconstructs base_stats", () => {
    const p = migratePokemon(legacy);
    expect(p.skills[0]).toMatchObject({
      name: "Quick Strike",
      type: "electric",
      cooldown: 2,
    });
    expect(p.skills[1]).toMatchObject({
      name: "Power Blast",
      type: "electric",
      cooldown: 3,
    });
    expect(p.base_stats).toEqual({
      hp: 44,
      attack: 55,
      defense: 40,
      special_attack: 50,
      special_defense: 50,
      speed: 90,
    });
  });

  it("keeps existing skills and base_stats", () => {
    const p = migratePokemon({
      ...legacy,
      base_stats: {
        hp: 1,
        attack: 1,
        defense: 1,
        special_attack: 1,
        special_defense: 1,
        speed: 1,
      },
      skills: [
        { name: "a", power: 1, type: "x", cooldown: 2 },
        { name: "b", power: 1, type: "x", cooldown: 3 },
      ],
    });
    expect(p.skills[0].name).toBe("a");
    expect(p.base_stats?.hp).toBe(1);
  });

  it("migrateStore maps the pokemons array", () => {
    const out = migrateStore({ pokemons: [legacy] }, 0) as {
      pokemons: Array<{ skills: unknown }>;
    };
    expect(out.pokemons[0].skills).toHaveLength(2);
  });
});
