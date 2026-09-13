import { scaleStat } from "./pokemon-utils";
import type { IMyPokemon } from "@/services/api/pokemons";

type Stats = IMyPokemon["stats"];

export const LEVEL_CAP = 100;
export const EXP_BENCH_SHARE = 0.5;
export const EXP_LOSE_SHARE = 0.25;
export const HP_BONUS = (level: number) => level * 5 + 30;

export interface ExpGrant {
  nickname: string;
  amount: number;
}

export interface ExpReceiver {
  nickname: string;
  level: number;
  fainted: boolean;
  participated: boolean;
}

export interface ExpGiver {
  base_experience?: number;
  level: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const expForNext = (level: number) => Math.pow(level + 1, 3);

/** Stronger foes pay more, weaker foes pay less. */
export function expGain(
  baseExp: number,
  enemyLevel: number,
  receiverLevel: number,
) {
  const mod = clamp(1 + (enemyLevel - receiverLevel) * 0.1, 0.5, 1.5);
  return Math.floor(Math.floor((baseExp * enemyLevel) / 5) * mod);
}

export function applyExp(level: number, experience: number, gained: number) {
  let lvl = level;
  const exp = experience + gained;
  const levelsGained: Array<number> = [];

  while (lvl < LEVEL_CAP && exp >= expForNext(lvl)) {
    lvl += 1;
    levelsGained.push(lvl);
  }

  return { level: lvl, experience: exp, levelsGained };
}

export function statsAtLevel(base: Stats, level: number): Stats {
  return {
    hp: scaleStat(base.hp, level) + HP_BONUS(level),
    attack: scaleStat(base.attack, level),
    defense: scaleStat(base.defense, level),
    special_attack: scaleStat(base.special_attack, level),
    special_defense: scaleStat(base.special_defense, level),
    speed: scaleStat(base.speed, level),
  };
}

/** Inverse of statsAtLevel, for Pokemon saved before base_stats existed. */
export function baseStatsFromStats(stats: Stats, level: number): Stats {
  const f = 1 + level * 0.02;
  return {
    hp: Math.round((stats.hp - HP_BONUS(level)) / f),
    attack: Math.round(stats.attack / f),
    defense: Math.round(stats.defense / f),
    special_attack: Math.round(stats.special_attack / f),
    special_defense: Math.round(stats.special_defense / f),
    speed: Math.round(stats.speed / f),
  };
}

export function koExpGrants(
  team: Array<ExpReceiver>,
  activeIndex: number,
  enemy: ExpGiver,
): Array<ExpGrant> {
  const baseExp = enemy.base_experience || 60;
  return team.flatMap((p, i) => {
    if (p.fainted) return [];
    const full = expGain(baseExp, enemy.level, p.level);
    const amount =
      i === activeIndex ? full : Math.floor(full * EXP_BENCH_SHARE);
    return [{ nickname: p.nickname, amount }];
  });
}

export function loseExpGrants(
  team: Array<ExpReceiver>,
  enemy: ExpGiver,
): Array<ExpGrant> {
  const baseExp = enemy.base_experience || 60;
  return team
    .filter((p) => p.participated)
    .map((p) => ({
      nickname: p.nickname,
      amount: Math.floor(
        expGain(baseExp, enemy.level, p.level) * EXP_LOSE_SHARE,
      ),
    }));
}
