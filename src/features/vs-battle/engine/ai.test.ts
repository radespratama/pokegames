import { describe, expect, it } from "vitest";
import { chooseEnemyAction } from "./ai";
import { battleStateFixture } from "./testFixtures";

describe("chooseEnemyAction", () => {
  it("chooses an available move that can KO", () => {
    const state = battleStateFixture();
    state.player.team[0].currentHp = 8;
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill2" });
  });

  it("switches from a bad matchup to a stronger live bench", () => {
    const state = battleStateFixture({ mode: "3v3" });
    state.enemy.team[0].types = ["fire"];
    state.enemy.team[0].skills.forEach((move) => {
      move.type = "fire";
    });
    state.enemy.team[0].currentHp = Math.floor(
      state.enemy.team[0].stats.hp * 0.3,
    );
    state.enemy.team[1].types = ["electric"];
    state.enemy.team[1].skills.forEach((move) => {
      move.type = "electric";
    });
    state.player.team[0].types = ["water"];
    expect(chooseEnemyAction(state, () => 0)).toEqual({
      kind: "switch",
      to: 1,
    });
  });

  it("never switches in 1v1 or to a fainted bench", () => {
    const one = battleStateFixture({ mode: "1v1" });
    expect(chooseEnemyAction(one, () => 0).kind).not.toBe("switch");
    const three = battleStateFixture({ mode: "3v3" });
    three.enemy.team.slice(1).forEach((pokemon) => {
      pokemon.fainted = true;
      pokemon.currentHp = 0;
    });
    expect(chooseEnemyAction(three, () => 0).kind).not.toBe("switch");
  });

  it("targets the weaker special defense when powers match", () => {
    const state = battleStateFixture();
    state.player.team[0].stats.defense = 150;
    state.player.team[0].stats.special_defense = 20;
    state.enemy.team[0].skills[0].power = 60;
    state.enemy.team[0].skills[0].damageClass = "physical";
    state.enemy.team[0].skills[1].power = 60;
    state.enemy.team[0].skills[1].damageClass = "special";
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill2" });
  });

  it("continues a chain when candidate damage is otherwise equal", () => {
    const state = battleStateFixture();
    state.enemy.team[0].chainStep = 1;
    state.enemy.team[0].skills[0].power = 50;
    state.enemy.team[0].skills[1].power = 50;
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill1" });
  });
});
