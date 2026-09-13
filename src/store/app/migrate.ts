import type { IBattleMove, IMyPokemon, ISkill } from "@/services/api/pokemons";
import { baseStatsFromStats } from "@/utils/leveling";
import { buildSkills } from "@/utils/pokemon-utils";

const migrateMove = <
  T extends { name: string; power: number; type?: string | null },
>(
  move: T,
): T & IBattleMove => ({
  ...move,
  type: move.type || "normal",
  damageClass:
    "damageClass" in move && move.damageClass === "special"
      ? "special"
      : "physical",
  accuracy:
    "accuracy" in move && typeof move.accuracy === "number"
      ? move.accuracy
      : 100,
  priority:
    "priority" in move && typeof move.priority === "number" ? move.priority : 0,
});

export function migratePokemon(raw: unknown): IMyPokemon {
  const p = raw as Partial<IMyPokemon> &
    Pick<IMyPokemon, "name" | "nickname" | "stats" | "battle_state">;
  const types = p.types?.length ? p.types : ["normal"];
  return {
    ...p,
    types,
    moveDataVersion: p.moveDataVersion === 3 ? 3 : 2,
    moves: (p.moves ?? []).map(migrateMove),
    base_stats:
      p.base_stats ?? baseStatsFromStats(p.stats, p.battle_state.level),
    skills: (p.skills ?? buildSkills([], types)).map(migrateMove) as [
      ISkill,
      ISkill,
    ],
  };
}

export function migrateStore(persisted: unknown, _version: number) {
  const state = persisted as { pokemons?: Array<unknown> };
  return { ...state, pokemons: (state.pokemons ?? []).map(migratePokemon) };
}
