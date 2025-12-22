import { useCallback } from "react";
import type { IMyPokemon } from "@/services/api/pokemons";

interface IAttackResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  desc: Array<string>;
}

export const useBattleMechanics = () => {
  const calculateDamage = useCallback(
    (
      attacker: IMyPokemon,
      defender: IMyPokemon,
      movePower: number,
    ): IAttackResult => {
      // --- LOGIC MISS (AKURASI) ---
      const attackerSpeed = attacker.stats.speed;
      const defenderSpeed = defender.stats.speed;

      const speedRatio = attackerSpeed / defenderSpeed;

      // Rumus: Base 0.65 + (0.25 * Ratio)
      let hitChance = 0.65 + 0.25 * speedRatio;

      hitChance = Math.min(Math.max(hitChance, 0.65), 1.0);

      // Random Roll
      const randomHit = Math.random();
      const isMiss = randomHit > hitChance;

      if (isMiss) {
        return {
          damage: 0,
          isCritical: false,
          isMiss: true,
          desc: ["Attack missed!"],
        };
      }

      // --- LOGIC DAMAGE ---
      const level = attacker.battle_state.level;
      const isSpecial = attacker.stats.special_attack > attacker.stats.attack;

      const A = isSpecial
        ? attacker.stats.special_attack
        : attacker.stats.attack;
      const D = isSpecial
        ? defender.stats.special_defense
        : defender.stats.defense;

      // Randomness (Variance 0.85 - 1.00)
      const randomFactor = (Math.floor(Math.random() * 16) + 85) / 100;

      // Critical Hit (20%)
      const CRITICAL_RATE = 0.2;
      const isCritical = Math.random() < CRITICAL_RATE;
      const criticalFactor = isCritical ? 1.5 : 1;

      // Base Damage Formula
      const levelFactor = (2 * level) / 5 + 2;
      const baseDamage = (levelFactor * movePower * (A / D)) / 50 + 2;

      // Final Calculation
      const totalDamage = Math.floor(
        baseDamage * criticalFactor * randomFactor,
      );

      const finalDamage = movePower > 0 ? Math.max(1, totalDamage) : 0;

      const desc: Array<string> = [];
      if (isCritical) desc.push("A critical hit!");

      return {
        damage: finalDamage,
        isCritical,
        isMiss: false,
        desc,
      };
    },
    [],
  );

  return { calculateDamage };
};
