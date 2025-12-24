/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback } from "react";
import type { IMyPokemon } from "@/services/api/pokemons";
import { getTypeEffectiveness } from "@/utils";

interface IAttackResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  effectiveness: number;
  desc: Array<string>;
}

export const useBattleMechanics = () => {
  const calculateDamage = useCallback(
    (
      attacker: IMyPokemon,
      defender: IMyPokemon,
      movePower: number,
      moveType: string = "normal",
    ): IAttackResult => {
      const attackStat = attacker.stats.attack;
      const defenseStat = defender.stats.defense;

      const isBasicAttack = moveType === "basic";

      let effectiveness = 1;
      let stab = 1;

      if (!isBasicAttack) {
        const normalizedMoveType = moveType.toLowerCase();
        const normalizedDefenderTypes = (defender.types || ["normal"]).map(
          (t) => t.toLowerCase(),
        );

        effectiveness = getTypeEffectiveness(
          normalizedMoveType,
          normalizedDefenderTypes,
        );

        const attackerType = (attacker.types[0] || "normal").toLowerCase();
        stab = attackerType === normalizedMoveType ? 1.2 : 1.0;
      }

      const randomVariance = (Math.floor(Math.random() * 21) + 90) / 100;

      const isCritical = Math.random() < 0.15;
      const critMultiplier = isCritical ? 1.5 : 1.0;

      const rawDamage = attackStat * (movePower / 85);

      const defenseMultiplier = 100 / (100 + defenseStat);

      let totalDamage = rawDamage * defenseMultiplier;

      totalDamage =
        totalDamage * effectiveness * stab * critMultiplier * randomVariance;

      const finalDamage = Math.max(1, Math.floor(totalDamage));

      const desc: Array<string> = [];
      if (isCritical) desc.push("Critical hit!");

      if (!isBasicAttack) {
        if (effectiveness > 0 && effectiveness < 1) {
          desc.push("It's not very effective...");
        } else if (effectiveness >= 2) {
          desc.push("It's super effective!");
        } else if (effectiveness === 0) {
          desc.push("It had no effect...");
        }
      }

      return {
        damage: finalDamage,
        isCritical,
        isMiss: false,
        effectiveness,
        desc,
      };
    },
    [],
  );

  return { calculateDamage };
};
