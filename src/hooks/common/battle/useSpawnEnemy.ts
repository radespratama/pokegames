import { useEffect, useState } from "react";
import type { IMyPokemon } from "@/services/api/pokemons";
import { usePokemonDetail } from "@/hooks/queries/pokemon";
import { randomNumber } from "@/utils";
import {
  generateEnemyLevel,
  getBaseStat,
  pickRandomMoves,
  powerFromMoveName,
  scaleStat,
} from "@/utils/pokemon-utils";

const LS_ENEMY_KEY = "pokegames_current_enemy";

interface IUseSpawnEnemyReturn {
  enemy: IMyPokemon | null;
  isLoadingEnemy: boolean;
  clearEnemy: () => void;
}

interface ISpawnEnemyProps {
  userPokemon?: {
    level: number;
    experience: number;
  };
}

export const useSpawnEnemy = ({
  userPokemon = { level: 1, experience: 0 },
}: ISpawnEnemyProps): IUseSpawnEnemyReturn => {
  const getSavedEnemy = (): IMyPokemon | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(LS_ENEMY_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return parsed;
      } catch (e) {
        return null;
      }
    }

    return null;
  };

  const [enemy, setEnemy] = useState<IMyPokemon | null>(getSavedEnemy);

  const shouldFetch = !enemy;

  const [enemyId] = useState(() => randomNumber());
  const enemyLevel = generateEnemyLevel(userPokemon.level);

  const { data: enemyData, isFetching: isLoadingEnemyData } = usePokemonDetail({
    pokemonName: enemyId,
    isEnabled: shouldFetch,
  });

  useEffect(() => {
    if (!shouldFetch) return;

    if (!enemyData || isLoadingEnemyData) return;

    const baseHp = getBaseStat(enemyData, "hp");
    const baseAtk = getBaseStat(enemyData, "attack");
    const baseDef = getBaseStat(enemyData, "defense");
    const baseSpA = getBaseStat(enemyData, "special-attack");
    const baseSpD = getBaseStat(enemyData, "special-defense");
    const baseSpeed = getBaseStat(enemyData, "speed");

    const scaledStats = {
      hp: scaleStat(baseHp, enemyLevel),
      attack: scaleStat(baseAtk, enemyLevel),
      defense: scaleStat(baseDef, enemyLevel),
      special_attack: scaleStat(baseSpA, enemyLevel),
      special_defense: scaleStat(baseSpD, enemyLevel),
      speed: scaleStat(baseSpeed, enemyLevel),
    };

    const typesBuild = enemyData.types.map((t: any) => t.type.name || "");

    const pickedMoves = pickRandomMoves(enemyData.moves, 4).map((m: any) => {
      const moveName = m.move?.name || "unknown-move";
      return {
        name: moveName,
        power: powerFromMoveName(moveName),
      };
    });

    const spritedFront =
      enemyData.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;

    const spritedBack =
      enemyData.sprites.versions?.["generation-v"]?.["black-white"]?.animated
        ?.back_default;

    const newEnemy: IMyPokemon = {
      name: enemyData.name,
      nickname: enemyData.name.toUpperCase(),
      sprite: spritedFront || enemyData.sprites.front_default || "",
      sprite_back: spritedBack || enemyData.sprites.back_default || "",
      base_experience: enemyData.base_experience || 0,
      battle_state: {
        level: enemyLevel,
        experience: 0,
      },
      stats: scaledStats,
      types: typesBuild,
      moves: pickedMoves,
    };

    setEnemy(newEnemy);
    localStorage.setItem(LS_ENEMY_KEY, JSON.stringify(newEnemy));
  }, [enemyData, isLoadingEnemyData, shouldFetch, enemyLevel]);

  const clearEnemy = () => {
    localStorage.removeItem(LS_ENEMY_KEY);
    setEnemy(null);
  };

  return {
    enemy,
    isLoadingEnemy: shouldFetch ? isLoadingEnemyData : false,
    clearEnemy,
  };
};
