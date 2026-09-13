import { useCallback } from "react";
import type { ExpGrant } from "@/utils/leveling";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { applyExp, expForNext, statsAtLevel } from "@/utils/leveling";

export const usePokemonExperience = () => {
  const { updatePokemon, getPokemonByNickname } = usePokemonStore();

  /** Applies one grant to the store. Returns the levels gained (possibly several). */
  const grantExp = useCallback(
    ({ nickname, amount }: ExpGrant) => {
      const p = getPokemonByNickname(nickname);
      if (!p) return [];
      const { level, experience, levelsGained } = applyExp(
        p.battle_state.level,
        p.battle_state.experience,
        amount,
      );
      const base = p.base_stats;
      updatePokemon(nickname, {
        battle_state: { level, experience },
        ...(levelsGained.length && base
          ? { stats: statsAtLevel(base, level) }
          : {}),
      });
      return levelsGained;
    },
    [getPokemonByNickname, updatePokemon],
  );

  const getExpProgress = useCallback(
    (nickname: string) => {
      const p = getPokemonByNickname(nickname);
      if (!p)
        return {
          current: 0,
          needed: 100,
          percentage: 0,
          minExpForCurrentLevel: 0,
        };
      const level = p.battle_state.level;
      const minExp = Math.pow(level, 3);
      const nextExp = expForNext(level);
      const pct =
        ((p.battle_state.experience - minExp) / (nextExp - minExp)) * 100;
      return {
        current: p.battle_state.experience,
        needed: nextExp,
        minExpForCurrentLevel: minExp,
        percentage: Math.min(Math.max(pct, 0), 100),
      };
    },
    [getPokemonByNickname],
  );

  return { grantExp, getExpProgress, getExpForNextLevel: expForNext };
};
