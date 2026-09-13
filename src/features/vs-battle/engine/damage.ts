import { RULES } from "./rules";
import type { Rng } from "./types";
import type { IMyPokemon } from "@/services/api/pokemons";
import { getTypeEffectiveness } from "@/utils";

export interface DamageInput {
  power: number;
  /** null = Basic Attack: no type chart, no STAB. */
  type: string | null;
  missChance: number;
  critChance: number;
  chainMul?: number;
  overchargeMul?: number;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  effectiveness: number;
  desc: Array<string>;
}

/** Roll order: miss, crit, variance. Tests depend on it. */
export function calculateDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
  rng: Rng = Math.random,
): DamageResult {
  if (rng() < input.missChance) {
    return {
      damage: 0,
      isCritical: false,
      isMiss: true,
      effectiveness: 1,
      desc: ["It missed!"],
    };
  }

  let effectiveness = 1;
  let stab = 1;

  if (input.type) {
    const moveType = input.type.toLowerCase();
    const defenderTypes = defender.types.length ? defender.types : ["normal"];
    effectiveness = getTypeEffectiveness(moveType, defenderTypes);
    if (attacker.types.some((t) => t.toLowerCase() === moveType)) {
      stab = RULES.STAB_MUL;
    }
  }

  const isCritical = rng() < input.critChance;
  const variance =
    RULES.VARIANCE_MIN + rng() * (RULES.VARIANCE_MAX - RULES.VARIANCE_MIN);

  // ponytail: physical only. special_attack / special_defense are unused;
  // add a per-move category if balance ever needs it.
  const raw = attacker.stats.attack * (input.power / 85);
  const defMul = 100 / (100 + defender.stats.defense);
  const total =
    raw *
    defMul *
    effectiveness *
    stab *
    (isCritical ? RULES.CRIT_MUL : 1) *
    (input.chainMul ?? 1) *
    (input.overchargeMul ?? 1) *
    variance;

  const damage = effectiveness === 0 ? 0 : Math.max(1, Math.floor(total));

  const desc: Array<string> = [];
  if (isCritical) desc.push("Critical hit!");
  if (effectiveness === 0) desc.push("It had no effect...");
  else if (effectiveness >= 2) desc.push("It's super effective!");
  else if (effectiveness < 1) desc.push("It's not very effective...");

  return { damage, isCritical, isMiss: false, effectiveness, desc };
}
