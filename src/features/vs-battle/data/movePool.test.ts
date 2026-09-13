import { describe, expect, it, vi } from "vitest";
import {
  assignBattleSlots,
  createSeededRng,
  loadBattleMovePool,
  normalizePower,
} from "./movePool";

const refs = ["psybeam", "tackle", "growl"].map((name) => ({
  move: { name },
}));
const detail = (
  name: string,
  damageClass: "physical" | "special" | "status",
  power: number | null,
) => ({
  name,
  power,
  accuracy: 90,
  priority: name === "tackle" ? 1 : 0,
  type: { name: name === "psybeam" ? "psychic" : "normal" },
  damage_class: { name: damageClass },
});

describe("loadBattleMovePool", () => {
  it("normalizes damaging moves and excludes known status moves", async () => {
    const load = vi.fn((name: string) =>
      Promise.resolve(
        name === "psybeam"
          ? detail(name, "special", 65)
          : name === "tackle"
            ? detail(name, "physical", 40)
            : detail(name, "status", null),
      ),
    );
    const pool = await loadBattleMovePool(refs, 2, () => 0.999, load);
    expect(pool).toEqual([
      {
        name: "psybeam",
        power: normalizePower(65),
        type: "psychic",
        damageClass: "special",
        accuracy: 90,
        priority: 0,
      },
      {
        name: "tackle",
        power: normalizePower(40),
        type: "normal",
        damageClass: "physical",
        accuracy: 90,
        priority: 1,
      },
    ]);
  });

  it("uses deterministic physical fallback after total failure", async () => {
    const load = vi.fn(() => Promise.reject(new Error("offline")));
    const pool = await loadBattleMovePool(refs, 2, () => 0.999, load);
    expect(pool).toHaveLength(2);
    expect(pool[0]).toMatchObject({
      name: "psybeam",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
      type: "normal",
    });
  });

  it("keeps candidate ordering when move requests complete out of order", async () => {
    const pool = await loadBattleMovePool(
      refs.slice(0, 2),
      2,
      () => 0.999,
      async (name) => {
        await new Promise((resolve) =>
          setTimeout(resolve, name === "psybeam" ? 10 : 0),
        );
        return detail(name, name === "psybeam" ? "special" : "physical", 50);
      },
    );

    expect(pool.map((move) => move.name)).toEqual(["psybeam", "tackle"]);
  });

  it("uses a repeatable seeded selection", async () => {
    const load = (name: string) =>
      Promise.resolve(detail(name, "physical", 50));
    const first = await loadBattleMovePool(refs, 2, createSeededRng(42), load);
    const second = await loadBattleMovePool(refs, 2, createSeededRng(42), load);

    expect(first).toEqual(second);
  });
});

describe("assignBattleSlots", () => {
  it("keeps enriched ultimate and skill metadata", () => {
    const pool = [
      {
        name: "psybeam",
        power: 50,
        type: "psychic",
        damageClass: "special" as const,
        accuracy: 85,
        priority: 1,
      },
      {
        name: "tackle",
        power: 40,
        type: "normal",
        damageClass: "physical" as const,
        accuracy: 95,
        priority: 0,
      },
      {
        name: "swift",
        power: 60,
        type: "normal",
        damageClass: "special" as const,
        accuracy: 100,
        priority: 2,
      },
    ];

    expect(assignBattleSlots(pool, 1)).toEqual({
      moves: [pool[0]],
      skills: [
        { ...pool[1], power: 43, cooldown: 2 },
        { ...pool[2], power: 69, cooldown: 3 },
      ],
    });
  });
});
