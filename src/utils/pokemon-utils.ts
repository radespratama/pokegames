import type { IPokemonDetailResponse } from "@/services/api/pokemons";

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

function getBaseStat(enemyData: IPokemonDetailResponse, statName: string) {
  return enemyData.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;
}

export {
  generateEnemyLevel,
  scaleStat,
  pickRandomMoves,
  powerFromMoveName,
  getBaseStat,
};
