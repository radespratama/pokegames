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

// --- DIFFICULTY ADJUSTMENT (Sesuai Request) ---
const getDifficultyParams = (playerLevel: number) => {
  // Level 1 - 11: FAIR FIGHT (No Stat Buff)
  // Tantangan hanya dari level musuh yang bisa +1 dari player
  if (playerLevel < 12) {
    return { statMultiplier: 1.0, minLevelAdd: -1, maxLevelAdd: 1 };
  }

  // Level 12 - 19: START BUFF (+5%)
  if (playerLevel < 20) {
    return { statMultiplier: 1.05, minLevelAdd: 0, maxLevelAdd: 2 };
  }

  // Level 20 - 39: HARD (+8%)
  if (playerLevel < 40) {
    return { statMultiplier: 1.08, minLevelAdd: 1, maxLevelAdd: 3 };
  }

  // Level 40+: BOSS (+15%)
  return { statMultiplier: 1.15, minLevelAdd: 2, maxLevelAdd: 4 };
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

    let rawHp = getBaseStat(enemyData, "hp");
    let rawAtk = getBaseStat(enemyData, "attack");
    let rawDef = getBaseStat(enemyData, "defense");
    let rawSpA = getBaseStat(enemyData, "special-attack");
    let rawSpD = getBaseStat(enemyData, "special-defense");
    let rawSpd = getBaseStat(enemyData, "speed");

    if (userPokemon.level < 12) {
      const MAX_ALLOWED_BST = 320;
      const currentBST = rawHp + rawAtk + rawDef + rawSpA + rawSpD + rawSpd;

      if (currentBST > MAX_ALLOWED_BST) {
        const ratio = MAX_ALLOWED_BST / currentBST;
        rawHp = Math.floor(rawHp * ratio);
        rawAtk = Math.floor(rawAtk * ratio);
        rawDef = Math.floor(rawDef * ratio);
        rawSpA = Math.floor(rawSpA * ratio);
        rawSpD = Math.floor(rawSpD * ratio);
        rawSpd = Math.floor(rawSpd * ratio);
      }
    }

    const applyStats = (base: number, isHp: boolean = false) => {
      let val = scaleStat(base, enemyLevel);

      if (isHp) {
        val += enemyLevel * 5 + 30;
      }

      return Math.floor(val * difficulty.statMultiplier);
    };

    const scaledStats = {
      hp: applyStats(rawHp, true),
      attack: applyStats(rawAtk),
      defense: applyStats(rawDef),
      special_attack: applyStats(rawSpA),
      special_defense: applyStats(rawSpD),
      speed: applyStats(rawSpd),
    };

    const typesBuild = enemyData.types.map((t) => t.type.name || "normal");

    const pickedMoves = pickRandomMoves(enemyData.moves, 4).map(
      (m: any, index: number) => {
        const assignedType = typesBuild[index % typesBuild.length] || "normal";

        return {
          name: m.move?.name || "unknown",
          power: powerFromMoveName(m.move?.name),
          type: assignedType,
        };
      },
    );

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
        hp: rawHp,
        attack: rawAtk,
        defense: rawDef,
        special_attack: rawSpA,
        special_defense: rawSpD,
        speed: rawSpd,
      },
      stats: scaledStats,
      types: typesBuild,
      moves: pickedMoves,
      current_hp: scaledStats.hp,
      is_defeated: false,
    };

    setEnemy(newEnemy);
    localStorage.setItem(LS_ENEMY_KEY, JSON.stringify(newEnemy));
  }, [
    enemyData,
    isLoadingEnemyData,
    shouldFetch,
    enemyLevel,
    userPokemon.level,
  ]);

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
