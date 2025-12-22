import { useCallback, useEffect, useState } from "react";
import type { IMyPokemon } from "@/services/api/pokemons";
import { usePokemonDetail } from "@/hooks/queries/pokemon";
import { randomNumber } from "@/utils";
import {
  getBaseStat,
  pickRandomMoves,
  powerFromMoveName,
  scaleStat,
} from "@/utils/pokemon-utils";

export const LS_ENEMY_KEY = "pokegames@vs-battle-enemy";

interface IUseSpawnEnemyReturn {
  enemy: IExtendedEnemy | null;
  isLoadingEnemy: boolean;
  clearEnemy: () => void;
  updateEnemyState: (updates: Partial<IExtendedEnemy>) => void;
}

interface ISpawnEnemyProps {
  userPokemon?: {
    level: number;
    experience: number;
  };
}

interface IExtendedEnemy extends IMyPokemon {
  current_hp?: number;
  is_defeated?: boolean;
}

// --- DIFFICULTY ---
const getDifficultyParams = (playerLevel: number) => {
  // Early Game (Level 1 - 9)
  // Fair Fight. Tidak ada buff stat. Level -1 s/d +1.
  if (playerLevel < 10) {
    return {
      statMultiplier: 1.0,
      minLevelAdd: -1,
      maxLevelAdd: 1,
    };
  }

  // Mid Game (Level 10 - 19)
  // Sedikit Elite. Stat +5%. Level setara s/d +2.
  if (playerLevel < 20) {
    return {
      statMultiplier: 1.05,
      minLevelAdd: 0,
      maxLevelAdd: 2,
    };
  }

  // Late Game (Level 20 - 39)
  // Menantang. Stat +10%. Level +1 s/d +3.
  if (playerLevel < 40) {
    return {
      statMultiplier: 1.1,
      minLevelAdd: 1,
      maxLevelAdd: 3,
    };
  }

  // End Game / Boss (Level 40++)
  // Boss. Stat +20%. Level +2 s/d +4.
  return {
    statMultiplier: 1.2,
    minLevelAdd: 2,
    maxLevelAdd: 4,
  };
};

export const useSpawnEnemy = ({
  userPokemon = { level: 1, experience: 0 },
}: ISpawnEnemyProps): IUseSpawnEnemyReturn => {
  const getSavedEnemy = (): IExtendedEnemy | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(LS_ENEMY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [enemy, setEnemy] = useState<IExtendedEnemy | null>(getSavedEnemy);

  const [enemyId] = useState(() =>
    enemy ? enemy.name.toLowerCase() : randomNumber(),
  );

  const shouldFetch = !enemy;

  const difficulty = getDifficultyParams(userPokemon.level);

  const [enemyLevel] = useState(() => {
    if (enemy) return enemy.battle_state.level;

    const min = Math.max(1, userPokemon.level + difficulty.minLevelAdd);
    const max = userPokemon.level + difficulty.maxLevelAdd;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  });

  const { data: enemyData, isFetching: isLoadingEnemyData } = usePokemonDetail({
    pokemonName: enemyId,
    isEnabled: shouldFetch,
  });

  useEffect(() => {
    if (!shouldFetch) return;
    if (!enemyData || isLoadingEnemyData) return;

    const baseHp = getBaseStat(enemyData, "hp");
    const baseAttack = getBaseStat(enemyData, "attack");
    const baseDefense = getBaseStat(enemyData, "defense");
    const baseSpAttack = getBaseStat(enemyData, "special-attack");
    const baseSpDefense = getBaseStat(enemyData, "special-defense");
    const baseSpeed = getBaseStat(enemyData, "speed");

    const applyDifficultyBoost = (val: number, level: number) => {
      const normalStat = scaleStat(val, level);
      return Math.floor(normalStat * difficulty.statMultiplier);
    };

    const scaledStats = {
      hp: applyDifficultyBoost(baseHp, enemyLevel),
      attack: applyDifficultyBoost(
        getBaseStat(enemyData, "attack"),
        enemyLevel,
      ),
      defense: applyDifficultyBoost(
        getBaseStat(enemyData, "defense"),
        enemyLevel,
      ),
      special_attack: applyDifficultyBoost(
        getBaseStat(enemyData, "special-attack"),
        enemyLevel,
      ),
      special_defense: applyDifficultyBoost(
        getBaseStat(enemyData, "special-defense"),
        enemyLevel,
      ),
      speed: applyDifficultyBoost(getBaseStat(enemyData, "speed"), enemyLevel),
    };

    const typesBuild = enemyData.types.map((t: any) => t.type.name || "");
    const pickedMoves = pickRandomMoves(enemyData.moves, 4).map((m: any) => ({
      name: m.move?.name || "unknown",
      power: powerFromMoveName(m.move?.name),
    }));

    const spritedFront =
      enemyData.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;
    const spritedBack =
      enemyData.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.back_default;

    const newEnemy: IExtendedEnemy = {
      name: enemyData.name,
      nickname: enemyData.name.toUpperCase(),
      sprite: spritedFront || enemyData.sprites.front_default || "",
      sprite_back: spritedBack || enemyData.sprites.back_default || "",
      base_experience: enemyData.base_experience || 0,
      battle_state: { level: enemyLevel, experience: 0 },
      base_stats: {
        hp: baseHp,
        attack: baseAttack,
        defense: baseDefense,
        special_attack: baseSpAttack,
        special_defense: baseSpDefense,
        speed: baseSpeed,
      },
      stats: scaledStats,
      types: typesBuild,
      moves: pickedMoves,

      current_hp: scaledStats.hp,
      is_defeated: false,
    };

    setEnemy(newEnemy);
    localStorage.setItem(LS_ENEMY_KEY, JSON.stringify(newEnemy));
  }, [enemyData, isLoadingEnemyData, shouldFetch, enemyLevel]);

  const updateEnemyState = useCallback((updates: Partial<IExtendedEnemy>) => {
    setEnemy((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(LS_ENEMY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearEnemy = useCallback(() => {
    localStorage.removeItem(LS_ENEMY_KEY);
    setEnemy(null);
  }, []);

  return {
    enemy,
    isLoadingEnemy: shouldFetch ? isLoadingEnemyData : false,
    clearEnemy,
    updateEnemyState,
  };
};
