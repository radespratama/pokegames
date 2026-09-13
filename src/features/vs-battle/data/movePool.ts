import type { Rng } from "@/features/vs-battle/engine/types";
import type {
  IBattleMove,
  IPokemonDetailResponse,
  ISkill,
} from "@/services/api/pokemons";
import type { IPokeMoveDetailResponse } from "@/services/api/moves";
import { buildSkills, powerFromMoveName } from "@/utils/pokemon-utils";

export const MAX_CANDIDATES = 8;

export type MoveDetailLoader = (
  name: string,
) => Promise<IPokeMoveDetailResponse | undefined>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const normalizePower = (power: number) =>
  Math.round(30 + ((clamp(power, 20, 150) - 20) / 130) * 35);

const fallbackMove = (name: string): IBattleMove => ({
  name,
  power: powerFromMoveName(name),
  type: "normal",
  damageClass: "physical",
  accuracy: 100,
  priority: 0,
});

export function createSeededRng(seed: number): Rng {
  let value = seed || 1;
  return () => (value = (value * 1103515245 + 12345) % 2147483648) / 2147483648;
}

function candidateNames(refs: IPokemonDetailResponse["moves"], rng: Rng) {
  const names = Array.from(
    new Set(
      refs
        .map((ref) => ref.move?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  );

  for (let index = names.length - 1; index > 0; index -= 1) {
    const selected = Math.floor(rng() * (index + 1));
    [names[index], names[selected]] = [names[selected], names[index]];
  }

  return names.slice(0, MAX_CANDIDATES);
}

function normalizeMove(
  detail: IPokeMoveDetailResponse,
): IBattleMove | undefined {
  const damageClass = detail.damage_class.name;
  if (
    (damageClass !== "physical" && damageClass !== "special") ||
    !detail.power ||
    detail.power <= 0
  ) {
    return undefined;
  }

  return {
    name: detail.name,
    power: normalizePower(detail.power),
    type: detail.type.name,
    damageClass,
    accuracy: clamp(detail.accuracy ?? 100, 1, 100),
    priority: detail.priority,
  };
}

export async function loadBattleMovePool(
  refs: IPokemonDetailResponse["moves"],
  count: number,
  rng: Rng,
  loadMove: MoveDetailLoader,
): Promise<Array<IBattleMove>> {
  const names = candidateNames(refs, rng);
  const targetCount = Math.min(Math.max(0, count), names.length);
  const results = await Promise.allSettled(names.map(loadMove));
  const enriched = results.map((result) =>
    result.status === "fulfilled" && result.value
      ? normalizeMove(result.value)
      : undefined,
  );
  const pool = enriched.filter((move): move is IBattleMove => Boolean(move));

  for (
    let index = 0;
    pool.length < targetCount && index < names.length;
    index += 1
  ) {
    if (!enriched[index]) pool.push(fallbackMove(names[index]));
  }

  return pool.slice(0, targetCount);
}

export function assignBattleSlots(
  pool: Array<IBattleMove>,
  ultimateCount: number,
): { moves: Array<IBattleMove>; skills: [ISkill, ISkill] } {
  const count = Math.max(1, ultimateCount);
  return {
    moves: pool.slice(0, count),
    skills: buildSkills(pool.slice(count, count + 2)),
  };
}
