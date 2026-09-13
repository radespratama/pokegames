import { describe, expect, it } from "vitest";
import { forcedSwitch, playerActsFirst, resolveRound } from "./reducer";
import {
  battleStateFixture,
  combatantFixture,
  moveFixture,
  sequenceRng,
} from "./testFixtures";
import type { BattleAction, BattleState } from "./types";

const basicEnemyState = (): BattleState => {
  const state = battleStateFixture();
  state.enemy.team[0].cooldowns = { skill1: 99, skill2: 99 };
  return state;
};

describe("resolveRound damage inputs", () => {
  it.each(["skill1", "skill2"] as const)(
    "uses the %s move's special stats and accuracy",
    (kind) => {
      const state = basicEnemyState();
      const attacker = state.player.team[0];
      attacker.stats.attack = 20;
      attacker.stats.special_attack = 120;
      attacker.skills[kind === "skill1" ? 0 : 1] = {
        ...moveFixture({
          power: 60,
          type: "psychic",
          damageClass: "special",
          accuracy: 100,
        }),
        cooldown: kind === "skill1" ? 2 : 3,
      };
      state.enemy.team[0].stats.defense = 120;
      state.enemy.team[0].stats.special_defense = 20;

      const next = resolveRound(state, { kind }, sequenceRng([0.5]));
      expect(next.events).toContainEqual(
        expect.objectContaining({
          type: "hit",
          target: "enemy",
          damage: 70,
          isMiss: false,
        }),
      );
    },
  );

  it("a missed skill breaks the chain, starts cooldown, and grants no attack gauge", () => {
    const state = basicEnemyState();
    const attacker = state.player.team[0];
    attacker.chainStep = 1;
    attacker.gauge = 20;
    attacker.skills[0].accuracy = 80;
    const next = resolveRound(
      state,
      { kind: "skill1" },
      sequenceRng([0, 0.8, 0.5]),
    );

    expect(next.events).toContainEqual(
      expect.objectContaining({
        type: "hit",
        target: "enemy",
        damage: 0,
        isMiss: true,
      }),
    );
    expect(next.player.team[0]).toMatchObject({
      chainStep: 0,
      gauge: 30,
      cooldowns: { skill1: 1, skill2: 0 },
    });
    expect(next.enemy.team[0].currentHp).toBe(100);
  });

  it("keeps basic attacks physical, accurate and untyped", () => {
    const state = basicEnemyState();
    state.player.team[0].stats.special_attack = 1000;
    state.enemy.team[0].types = ["ghost"];
    const next = resolveRound(
      state,
      { kind: "basic" },
      sequenceRng([0.999, 0.5]),
    );
    expect(next.events).toContainEqual(
      expect.objectContaining({
        type: "hit",
        target: "enemy",
        damage: 9,
        effectiveness: 1,
        isMiss: false,
      }),
    );
  });

  it("uses the selected ultimate's special stats and overcharge", () => {
    const state = basicEnemyState();
    const attacker = state.player.team[0];
    attacker.gauge = 150;
    attacker.stats.attack = 20;
    attacker.stats.special_attack = 120;
    attacker.moves.push(
      moveFixture({ power: 60, type: "psychic", damageClass: "special" }),
    );
    state.enemy.team[0].stats.special_defense = 20;
    state.enemy.team[0].currentHp = 1000;

    const next = resolveRound(
      state,
      { kind: "ultimate", index: 1 },
      sequenceRng([0.5]),
    );
    expect(next.events).toContainEqual(
      expect.objectContaining({ type: "hit", target: "enemy", damage: 211 }),
    );
    expect(next.player.team[0].gauge).toBe(10);
  });

  it("spends ultimate gauge even when the selected move misses", () => {
    const state = basicEnemyState();
    state.player.team[0].gauge = 150;
    state.player.team[0].moves[0].accuracy = 80;
    const next = resolveRound(
      state,
      { kind: "ultimate", index: 0 },
      sequenceRng([0, 0.9, 0.5]),
    );
    expect(next.events).toContainEqual(
      expect.objectContaining({
        type: "hit",
        target: "enemy",
        damage: 0,
        isMiss: true,
      }),
    );
    expect(next.player.team[0].gauge).toBe(10);
  });
});

describe("battle bookkeeping", () => {
  it("preserves chain multipliers, finisher gauge and own-action cooldowns", () => {
    let state = basicEnemyState();
    const actions: Array<BattleAction> = [
      { kind: "basic" },
      { kind: "skill1" },
      { kind: "skill2" },
    ];
    const expected = [
      {
        damage: 9,
        chainStep: 1,
        gauge: 30,
        cooldowns: { skill1: 0, skill2: 0 },
      },
      {
        damage: 31,
        chainStep: 2,
        gauge: 50,
        cooldowns: { skill1: 1, skill2: 0 },
      },
      {
        damage: 56,
        chainStep: 0,
        gauge: 120,
        cooldowns: { skill1: 0, skill2: 2 },
      },
    ];
    actions.forEach((action, index) => {
      state = resolveRound(state, action, sequenceRng([0.5]));
      const { damage, ...combatant } = expected[index];
      expect(state.events).toContainEqual(
        expect.objectContaining({ type: "hit", target: "enemy", damage }),
      );
      expect(state.player.team[0]).toMatchObject(combatant);
    });
  });

  it("awards KO EXP and cancels the fainted enemy's attack", () => {
    const state = basicEnemyState();
    state.enemy.team[0].currentHp = 1;
    const next = resolveRound(state, { kind: "basic" }, sequenceRng([0.5]));
    expect(next).toMatchObject({ phase: "over", winner: "player" });
    expect(next.events).toContainEqual({
      type: "exp",
      grants: [{ nickname: "TEST", amount: 128 }],
    });
    expect(next.events.filter((event) => event.type === "hit")).toHaveLength(1);
  });

  it("automatically replaces a defeated enemy when its bench is alive", () => {
    const state = battleStateFixture({ mode: "3v3" });
    state.enemy.team[0].currentHp = 1;
    state.enemy.team[0].cooldowns = { skill1: 99, skill2: 99 };
    const next = resolveRound(state, { kind: "basic" }, sequenceRng([0.5]));
    expect(next).toMatchObject({
      phase: "select",
      winner: null,
      enemy: { active: 1 },
    });
    expect(next.events.filter((event) => event.type === "hit")).toHaveLength(1);
  });

  it("requires a player replacement after a faster enemy KO", () => {
    const state = basicEnemyState();
    state.mode = "3v3";
    state.enemy.team[0].stats.speed = 100;
    state.player.team[0].currentHp = 1;
    state.player.team.push(combatantFixture());
    const next = resolveRound(state, { kind: "skill1" }, sequenceRng([0.5]));
    expect(next.phase).toBe("forced-switch");
    expect(next.events.filter((event) => event.type === "hit")).toHaveLength(1);
    expect(forcedSwitch(next, 1)).toMatchObject({
      phase: "select",
      player: { active: 1 },
    });
  });

  it("awards loss EXP when the player has no living replacement", () => {
    const state = basicEnemyState();
    state.enemy.team[0].stats.speed = 100;
    state.player.team[0].currentHp = 1;
    const next = resolveRound(state, { kind: "basic" }, sequenceRng([0.5]));
    expect(next).toMatchObject({ phase: "over", winner: "enemy" });
    expect(next.events).toContainEqual({
      type: "exp",
      grants: [{ nickname: "TEST", amount: 32 }],
    });
  });
});

describe("playerActsFirst", () => {
  it("processes an enemy switch before a faster player attack", () => {
    const state = battleStateFixture({ playerSpeed: 200, enemySpeed: 10 });
    expect(
      playerActsFirst(
        state,
        { kind: "basic" },
        { kind: "switch", to: 1 },
        () => 0,
      ),
    ).toBe(false);
  });

  it("uses move priority before speed", () => {
    const state = battleStateFixture({ playerSpeed: 10, enemySpeed: 200 });
    state.player.team[0].skills[0].priority = 1;
    expect(
      playerActsFirst(state, { kind: "skill1" }, { kind: "basic" }, () => 0.9),
    ).toBe(true);
  });
});
