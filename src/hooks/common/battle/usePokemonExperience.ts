import { useCallback } from "react";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { scaleStat } from "@/utils/pokemon-utils";

export const usePokemonExperience = () => {
  const { updatePokemon, getPokemonByNickname } = usePokemonStore();

  const getExpForNextLevel = useCallback((level: number): number => {
    return Math.pow(level + 1, 3);
  }, []);

  const calculateExpGain = useCallback(
    (enemyLevel: number, enemyBaseExp = 60) => {
      return Math.floor((enemyBaseExp * enemyLevel) / 5);
    },
    [],
  );

  const addExp = useCallback(
    (nickname: string, expGained: number) => {
      const pokemon = getPokemonByNickname(nickname);

      if (!pokemon) {
        return { leveled: false, newLevel: 0, expGained: 0 };
      }

      const currentExp = pokemon.battle_state.experience + expGained;
      let currentLevel = pokemon.battle_state.level;
      let leveled = false;

      while (currentExp >= getExpForNextLevel(currentLevel)) {
        currentLevel += 1;
        leveled = true;
      }

      let newStats = { ...pokemon.stats };

      if (leveled && pokemon.base_stats) {
        const scaledHP = scaleStat(pokemon.base_stats.hp, currentLevel);
        const bonusHP = currentLevel * 5 + 30;

        newStats = {
          hp: scaledHP + bonusHP,
          attack: scaleStat(pokemon.base_stats.attack, currentLevel),
          defense: scaleStat(pokemon.base_stats.defense, currentLevel),
          special_attack: scaleStat(
            pokemon.base_stats.special_attack,
            currentLevel,
          ),
          special_defense: scaleStat(
            pokemon.base_stats.special_defense,
            currentLevel,
          ),
          speed: scaleStat(pokemon.base_stats.speed, currentLevel),
        };
      } else if (leveled) {
        const ratio =
          (1 + currentLevel * 0.02) / (1 + (currentLevel - 1) * 0.02);

        newStats = {
          hp: Math.floor(pokemon.stats.hp * ratio),
          attack: Math.floor(pokemon.stats.attack * ratio),
          defense: Math.floor(pokemon.stats.defense * ratio),
          special_attack: Math.floor(pokemon.stats.special_attack * ratio),
          special_defense: Math.floor(pokemon.stats.special_defense * ratio),
          speed: Math.floor(pokemon.stats.speed * ratio),
        };
      }

      updatePokemon(nickname, {
        battle_state: {
          level: currentLevel,
          experience: currentExp,
        },
        ...(leveled && { stats: newStats }),
      });

      return {
        leveled,
        newLevel: currentLevel,
        expGained,
        statsIncreased: leveled,
      };
    },
    [getPokemonByNickname, updatePokemon, getExpForNextLevel],
  );

  const getExpProgress = useCallback(
    (nickname: string) => {
      const pokemon = getPokemonByNickname(nickname);

      if (!pokemon) {
        return {
          current: 0,
          needed: 100,
          percentage: 0,
          minExpForCurrentLevel: 0,
        };
      }

      const level = pokemon.battle_state.level;
      const minExp = Math.pow(level, 3);
      const nextExp = getExpForNextLevel(level);
      const currentExp = pokemon.battle_state.experience;
      const progress = currentExp - minExp;
      const range = nextExp - minExp;
      const percentage = range === 0 ? 0 : (progress / range) * 100;

      return {
        current: currentExp,
        needed: nextExp,
        minExpForCurrentLevel: minExp,
        percentage: Math.min(Math.max(percentage, 0), 100),
      };
    },
    [getPokemonByNickname, getExpForNextLevel],
  );

  return { addExp, calculateExpGain, getExpProgress, getExpForNextLevel };
};
