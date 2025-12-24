/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { TYPE_CHART } from "./constant";

export * from "./colors";
export * from "./units";
export * from "./shadow";

export const getPokemonId = (url: string) => {
  const urlSplit = url.split("/");
  if (urlSplit.length) return urlSplit[urlSplit.length - 2];

  return "";
};

export const randomNumber = (min: number = 1, max: number = 999): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getTypeEffectiveness = (
  moveType: string,
  defenderTypes: Array<string>,
): number => {
  let multiplier = 1;
  const attacker = moveType.toLowerCase();

  defenderTypes.forEach((defType) => {
    const defender = defType.toLowerCase();

    const attackerChart = TYPE_CHART[attacker];
    const mod = attackerChart[defender];

    if (mod !== undefined) {
      multiplier *= mod;
    }
  });

  return multiplier;
};
