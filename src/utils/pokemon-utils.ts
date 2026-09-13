import type {
  IBattleMove,
  IPokemonDetailResponse,
  ISkill,
} from "@/services/api/pokemons";
import { RULES } from "@/features/vs-battle/engine/rules";

function generateEnemyLevel(userLevel: number) {
  const variance = Math.floor(Math.random() * 3) - 1;
  return Math.max(1, userLevel + variance);
}

function scaleStat(base: number, level: number) {
  return Math.floor(base * (1 + level * 0.02)); // Up 2% per level
}

function pickRandomMoves(allMoves: IPokemonDetailResponse["moves"], count = 6) {
  const arr = [...allMoves];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, Math.min(count, arr.length));
}

function powerFromMoveName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }

  return 30 + (hash % 36);
}

/** Pick `count` random moves and hash each into a 30..65 power. */
function buildMovePool(
  allMoves: IPokemonDetailResponse["moves"],
  count = 6,
): Array<{ name: string; power: number }> {
  return pickRandomMoves(allMoves, count).map((m) => {
    const name = m.move?.name || "struggle";
    return { name, power: powerFromMoveName(name) };
  });
}

/** Nickname → URL slug: lower-case, first space becomes a dash. The one definition. */
export const toSlug = (nickname: string) =>
  nickname.toLowerCase().replace(" ", "-");

function getBaseStat(enemyData: IPokemonDetailResponse, statName: string) {
  return enemyData.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;
}

function baseStatTotal(stats: IPokemonDetailResponse["stats"]) {
  return stats.reduce((total, stat) => total + (stat.base_stat || 0), 0);
}

/** Weakest species sit near 195 BST, box legendaries near 720. */
const WEAK_BST = 200;
const STRONG_BST = 720;
const MAX_CHANCE = 0.75;
const MIN_CHANCE = 0.1;

/**
 * Stronger species resist the ball. Linear in base stat total so a Caterpie is
 * a near-sure thing and a Mewtwo almost never stays in.
 */
function catchChance(bst: number) {
  const span = (bst - WEAK_BST) / (STRONG_BST - WEAK_BST);
  const chance = MAX_CHANCE - span * (MAX_CHANCE - MIN_CHANCE);

  return Math.min(MAX_CHANCE, Math.max(MIN_CHANCE, chance));
}

/**
 * Per-wobble odds whose product over `shakes` equals the overall chance, so the
 * drawn-out animation adds tension without changing the real difficulty.
 */
function shakeChance(chance: number, shakes: number) {
  return Math.pow(chance, 1 / shakes);
}

export const PLACEHOLDER_SKILL_NAMES = ["Quick Strike", "Power Blast"] as const;

const SKILL_RANGES: [[number, number], [number, number]] = [
  [40, 50],
  [60, 70],
];

/** Squeeze powerFromMoveName's 30..65 into the slot's band so balance holds. */
const fitPower = (power: number, [lo, hi]: [number, number]) =>
  Math.round(lo + ((power - 30) / 35) * (hi - lo));

function toV2BattleMove(
  move: { name: string; power: number; type?: string | null },
  fallbackType = "normal",
): IBattleMove {
  return {
    name: move.name,
    power: move.power,
    type: move.type || fallbackType,
    damageClass: "physical",
    accuracy: 100,
    priority: 0,
  };
}

/**
 * Skill 1 uses types[0], Skill 2 uses types[1] (or types[0]).
 * Pool entries beyond two are ignored; missing entries become placeholders.
 */
type LegacyMove = { name: string; power: number; type?: string | null };

function buildSkills(
  pool: Array<IBattleMove | LegacyMove>,
  types: Array<string> = [],
): [ISkill, ISkill] {
  const t0 = types[0] || "normal";
  const t1 = types[1] || t0;
  const cds = [RULES.SKILL1.cooldown, RULES.SKILL2.cooldown];
  const fallbackPower = [45, 65];

  const slot = (i: 0 | 1, type: string): ISkill => {
    const m = pool.at(i);
    return m
      ? {
          ...("damageClass" in m ? m : toV2BattleMove(m, type)),
          power: fitPower(m.power, SKILL_RANGES[i]),
          cooldown: cds[i],
        }
      : {
          ...toV2BattleMove(
            { name: PLACEHOLDER_SKILL_NAMES[i], power: fallbackPower[i] },
            type,
          ),
          cooldown: cds[i],
        };
  };

  return [slot(0, t0), slot(1, t1)];
}

export {
  baseStatTotal,
  buildMovePool,
  buildSkills,
  toV2BattleMove,
  catchChance,
  shakeChance,
  generateEnemyLevel,
  scaleStat,
  pickRandomMoves,
  powerFromMoveName,
  getBaseStat,
};
