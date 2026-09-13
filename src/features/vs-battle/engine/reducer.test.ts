import { describe, expect, it } from "vitest";
import {
  availableActions,
  createBattle,
  endIntro,
  forcedSwitch,
  resolveRound,
  surrender,
} from "./reducer";
import type { BattleState } from "./types";
import type { IMyPokemon } from "@/services/api/pokemons";

/** 0.5 everywhere: no miss, no crit, variance 1.0, AI takes ultimate at >=100 but never random skills. */
const flat = () => 0.5;

const mk = (nickname: string, over: Partial<IMyPokemon> = {}): IMyPokemon => ({
  name: nickname,
  nickname,
  base_experience: 60,
  battle_state: { level: 1, experience: 0 },
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    special_attack: 1,
    special_defense: 1,
    speed: 20,
  },
  types: ["normal"],
  moves: [{ name: "Ult", power: 20, type: "water" }],
  skills: [
    { name: "S1", power: 45, type: "water", cooldown: 2 },
    { name: "S2", power: 65, type: "water", cooldown: 3 },
  ],
  ...over,
});

const slow = { stats: { ...mk("x").stats, speed: 5 } };

const start = (
  mode: "1v1" | "3v3" = "1v1",
  p = [mk("P")],
  e = [mk("E", slow)],
) => endIntro(createBattle(mode, p, e));

const hits = (s: BattleState) => s.events.filter((ev) => ev.type === "hit");

describe("resolveRound", () => {
  it("player basic then enemy basic, faster side first, gauges and chain update", () => {
    const s = resolveRound(start(), { kind: "basic" }, flat);
    const [first, second] = hits(s);
    expect(first).toMatchObject({ target: "enemy", damage: 7, hpAfter: 93 });
    expect(second).toMatchObject({ target: "player", damage: 7, hpAfter: 93 });
    expect(s.player.team[0]).toMatchObject({ gauge: 30, chainStep: 1 });
    expect(s.enemy.team[0]).toMatchObject({ gauge: 30, chainStep: 1 });
    expect(s.phase).toBe("select");
  });

  it("enemy acts first when faster", () => {
    const s = resolveRound(
      start("1v1", [mk("P", slow)], [mk("E")]),
      { kind: "basic" },
      flat,
    );
    expect(hits(s)[0].target).toBe("player");
  });

  it("full chain: skill1 after basic is boosted, skill2 finisher grants +50 and resets", () => {
    let s = resolveRound(start(), { kind: "basic" }, flat);
    s = resolveRound(s, { kind: "skill1" }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 21 }); // 17 * 1.2
    expect(s.player.team[0].chainStep).toBe(2);
    s = resolveRound(s, { kind: "skill2" }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 38 }); // 25 * 1.5
    expect(s.player.team[0].chainStep).toBe(0);
    expect(s.player.team[0].gauge).toBe(120); // (20+10) + (10+10) + (10+50+10)
    expect(s.log.some((l) => l.includes("COMBO FINISHER"))).toBe(true);
  });

  it("wrong order breaks the chain", () => {
    let s = resolveRound(start(), { kind: "basic" }, flat);
    s = resolveRound(s, { kind: "basic" }, flat);
    expect(s.player.team[0].chainStep).toBe(1);
    expect(s.log.some((l) => l.includes("Combo broken"))).toBe(true);
  });

  it("cooldown blocks the skill next turn and frees it the turn after", () => {
    let s = resolveRound(start(), { kind: "skill1" }, flat);
    expect(s.player.team[0].cooldowns.skill1).toBe(1);
    expect(availableActions(s.player.team[0]).skill1).toBe(false);
    const blocked = resolveRound(s, { kind: "skill1" }, flat);
    expect(blocked).toBe(s); // no-op
    s = resolveRound(s, { kind: "basic" }, flat);
    expect(availableActions(s.player.team[0]).skill1).toBe(true);
  });

  it("ultimate needs 100 gauge, scales with overcharge and empties the gauge", () => {
    const s0 = start();
    expect(resolveRound(s0, { kind: "ultimate", index: 0 }, flat)).toBe(s0);
    const charged: BattleState = {
      ...s0,
      player: { ...s0.player, team: [{ ...s0.player.team[0], gauge: 150 }] },
    };
    const s = resolveRound(charged, { kind: "ultimate", index: 0 }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 23 }); // 7.84 * 3
    expect(s.player.team[0].gauge).toBe(10); // 0 after ult, +10 from being hit
    expect(s.log.some((l) => l.includes("ULTIMATE"))).toBe(true);
  });

  it("enemy uses ultimate at 100 gauge", () => {
    const s0 = start();
    const charged: BattleState = {
      ...s0,
      enemy: { ...s0.enemy, team: [{ ...s0.enemy.team[0], gauge: 100 }] },
    };
    const s = resolveRound(charged, { kind: "basic" }, flat);
    expect(hits(s)[1]).toMatchObject({ target: "player", damage: 17 }); // hit first: gauge 110 → x2.2 → 7.84 * 2.2
    expect(s.enemy.team[0].gauge).toBe(0); // ultimate empties the gauge after being hit
  });

  it("1v1 faint ends the battle and grants exp", () => {
    const s0 = start(
      "1v1",
      [mk("P")],
      [mk("E", { ...slow, stats: { ...slow.stats, hp: 5 } })],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("over");
    expect(s.winner).toBe("player");
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [{ nickname: "P", amount: 12 }],
    });
    expect(hits(s)).toHaveLength(1); // enemy never acted
  });

  it("1v1 player faint → enemy wins, lose exp 25%", () => {
    const s0 = start(
      "1v1",
      [mk("P", { ...slow, stats: { ...slow.stats, hp: 5 } })],
      [mk("E")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s).toMatchObject({ phase: "over", winner: "enemy" });
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [{ nickname: "P", amount: 3 }],
    });
  });

  it("3v3: switch resolves before the enemy acts and breaks the chain", () => {
    const s0 = start(
      "3v3",
      [mk("A"), mk("B", slow), mk("C")],
      [mk("E"), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "switch", to: 1 }, flat);
    expect(s.events[0]).toMatchObject({
      type: "switch",
      side: "player",
      to: 1,
    });
    expect(s.player.active).toBe(1);
    expect(hits(s)[0]).toMatchObject({ target: "player", index: 1 });
    expect(s.player.team[1].participated).toBe(true);
  });

  it("3v3: player active faints → forced-switch, then forcedSwitch resumes", () => {
    const weak = { stats: { ...mk("x").stats, hp: 5, speed: 1 } };
    const s0 = start(
      "3v3",
      [mk("A", weak), mk("B"), mk("C")],
      [mk("E"), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("forced-switch");
    expect(s.player.team[0].fainted).toBe(true);
    expect(hits(s)).toHaveLength(1); // A's own action was cancelled
    const resumed = forcedSwitch(s, 2);
    expect(resumed).toMatchObject({ phase: "select", player: { active: 2 } });
  });

  it("3v3: enemy active faints → auto switch, bench exp 50%, battle continues", () => {
    const weak = { stats: { ...mk("x").stats, hp: 5, speed: 1 } };
    const s0 = start(
      "3v3",
      [mk("A"), mk("B"), mk("C")],
      [mk("E", weak), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("select");
    expect(s.enemy.active).toBe(1);
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [
        { nickname: "A", amount: 12 },
        { nickname: "B", amount: 6 },
        { nickname: "C", amount: 6 },
      ],
    });
  });

  it("surrender ends with enemy as winner and no exp", () => {
    const s = surrender(start());
    expect(s).toMatchObject({ phase: "over", winner: "enemy" });
    expect(s.events.find((e) => e.type === "exp")).toBeUndefined();
  });
});
