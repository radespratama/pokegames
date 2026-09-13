import { describe, expect, it } from "vitest";
import {
  LEVEL_CAP,
  applyExp,
  baseStatsFromStats,
  expForNext,
  expGain,
  koExpGrants,
  loseExpGrants,
  statsAtLevel,
} from "./leveling";

const base = {
  hp: 45,
  attack: 49,
  defense: 49,
  special_attack: 65,
  special_defense: 65,
  speed: 45,
};

describe("leveling", () => {
  it("expForNext is (level+1)^3", () => {
    expect(expForNext(1)).toBe(8);
    expect(expForNext(9)).toBe(1000);
  });

  it("expGain scales with level difference, clamped 0.5..1.5", () => {
    expect(expGain(60, 5, 5)).toBe(60);
    expect(expGain(60, 10, 5)).toBe(180);
    expect(expGain(60, 1, 10)).toBe(6);
  });

  it("applyExp can gain several levels at once and caps at 100", () => {
    expect(applyExp(1, 0, 30)).toEqual({
      level: 3,
      experience: 30,
      levelsGained: [2, 3],
    });
    expect(applyExp(LEVEL_CAP, 0, 1e9).level).toBe(LEVEL_CAP);
  });

  it("statsAtLevel adds flat HP bonus and roundtrips through baseStatsFromStats", () => {
    const at7 = statsAtLevel(base, 7);
    expect(at7.hp).toBe(51 + 65);
    const back = baseStatsFromStats(at7, 7);
    for (const key of Object.keys(base) as Array<keyof typeof base>) {
      expect(Math.abs(back[key] - base[key])).toBeLessThanOrEqual(1);
    }
  });

  it("koExpGrants: active 100%, alive bench 50%, fainted 0", () => {
    const team = [
      { nickname: "A", level: 1, fainted: false, participated: true },
      { nickname: "B", level: 1, fainted: false, participated: false },
      { nickname: "C", level: 1, fainted: true, participated: true },
    ];
    expect(koExpGrants(team, 0, { base_experience: 60, level: 1 })).toEqual([
      { nickname: "A", amount: 12 },
      { nickname: "B", amount: 6 },
    ]);
  });

  it("loseExpGrants: 25% to everyone who participated", () => {
    const team = [
      { nickname: "A", level: 1, fainted: true, participated: true },
      { nickname: "B", level: 1, fainted: false, participated: false },
    ];
    expect(loseExpGrants(team, { base_experience: 60, level: 1 })).toEqual([
      { nickname: "A", amount: 3 },
    ]);
  });
});
