import { useCallback } from "react";
import { usePokemonStore } from "@/store/app/pokemonStore";

interface LevelUpResult {
  leveled: boolean;
  newLevel: number;
  remainingExp: number;
}

export const usePokemonLevel = () => {
  const { updatePokemon, getPokemonByNickname } = usePokemonStore();

  const getExpForNextLevel = useCallback((level: number): number => {
    return level * 100;
  }, []);

  const addExp = useCallback(
    (nickname: string, expGained: number): LevelUpResult => {
      const pokemon = getPokemonByNickname(nickname);

      if (!pokemon) {
        return { leveled: false, newLevel: 0, remainingExp: 0 };
      }

      let currentExp = pokemon.battle_state.experience + expGained;
      let currentLevel = pokemon.battle_state.level;

      let leveled = false;

      while (currentExp >= getExpForNextLevel(currentLevel)) {
        currentExp -= getExpForNextLevel(currentLevel);
        currentLevel += 1;
        leveled = true;
      }

      updatePokemon(nickname, {
        battle_state: {
          level: currentLevel,
          experience: currentExp,
        },
      });

      return {
        leveled,
        newLevel: currentLevel,
        remainingExp: currentExp,
      };
    },
    [getPokemonByNickname, updatePokemon, getExpForNextLevel],
  );

  const getExpProgress = useCallback(
    (
      nickname: string,
    ): { current: number; needed: number; percentage: number } => {
      const pokemon = getPokemonByNickname(nickname);
      if (!pokemon) {
        return { current: 0, needed: 100, percentage: 0 };
      }

      const needed = getExpForNextLevel(pokemon.battle_state.level);
      const percentage = (pokemon.battle_state.experience / needed) * 100;

      return {
        current: pokemon.battle_state.experience,
        needed,
        percentage: Math.min(percentage, 100),
      };
    },
    [getPokemonByNickname, getExpForNextLevel],
  );

  return {
    addExp,
    getExpProgress,
    getExpForNextLevel,
  };
};
