import { describe, expect, it } from "vitest";
import { buildEnemy } from "./useSpawnEnemies";
import type { IPokemonDetailResponse } from "@/services/api/pokemons";

const detail = {
  id: 150,
  name: "mewtwo",
  base_experience: 306,
  abilities: [],
  moves: [
    { move: { name: "psychic" } },
    { move: { name: "swift" } },
    { move: { name: "recover" } },
  ],
  types: [{ slot: 1, type: { name: "psychic", url: "" } }],
  sprites: { front_default: "f.png", back_default: "b.png" },
  stats: [
    { base_stat: 106, stat: { name: "hp", url: "" } },
    { base_stat: 110, stat: { name: "attack", url: "" } },
    { base_stat: 90, stat: { name: "defense", url: "" } },
    { base_stat: 154, stat: { name: "special-attack", url: "" } },
    { base_stat: 90, stat: { name: "special-defense", url: "" } },
    { base_stat: 130, stat: { name: "speed", url: "" } },
  ],
} as unknown as IPokemonDetailResponse;

describe("buildEnemy", () => {
  it("clamps BST to 320 below player level 12 and sets level within ±1", () => {
    const e = buildEnemy(detail, 5, () => 0.5);
    const bst = Object.values(e.base_stats!).reduce((a, b) => a + b, 0);
    expect(bst).toBeLessThanOrEqual(320);
    expect(e.battle_state.level).toBe(5);
    expect(e.skills).toHaveLength(2);
    expect(e.moves.length).toBeGreaterThan(0);
    expect(e.moveDataVersion).toBe(2);
    expect(e.moves[0]).toMatchObject({
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
    expect(e.skills[0]).toMatchObject({
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
    });
    expect(e.types).toEqual(["psychic"]);
    expect(e.stats.hp).toBe(Math.floor(e.base_stats!.hp * 1.1) + 55);
  });

  it("does not clamp at level 12+ and applies the stat multiplier", () => {
    const e = buildEnemy(detail, 12, () => 0.5);
    expect(e.base_stats!.hp).toBe(106);
    expect(e.battle_state.level).toBe(13); // rng 0.5 → middle of 12..14
    expect(e.stats.attack).toBe(Math.floor(Math.floor(110 * 1.26) * 1.05));
  });
});
