import type { IMyPokemon } from "@/services/api/pokemons";
import { baseStatsFromStats } from "@/utils/leveling";
import { buildSkills } from "@/utils/pokemon-utils";

/**
 * Store v1 → v2: Pokemon caught before skills existed get placeholder skills
 * (backfilled from PokeAPI later by MyPokemon) and base_stats derived from stats.
 */
export function migratePokemon(raw: unknown): IMyPokemon {
  const p = raw as Partial<IMyPokemon> &
    Pick<IMyPokemon, "name" | "nickname" | "stats" | "battle_state">;
  const types = p.types?.length ? p.types : ["normal"];
  return {
    ...p,
    types,
    moves: p.moves ?? [],
    base_stats:
      p.base_stats ?? baseStatsFromStats(p.stats, p.battle_state.level),
    skills: p.skills ?? buildSkills([], types),
  };
}

export function migrateStore(persisted: unknown, _version: number) {
  const state = persisted as { pokemons?: Array<unknown> };
  return { ...state, pokemons: (state.pokemons ?? []).map(migratePokemon) };
}
