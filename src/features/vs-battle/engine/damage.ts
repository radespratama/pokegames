import { RULES } from "./rules";
import type { Rng } from "./types";
import type { IMyPokemon, MoveDamageClass } from "@/services/api/pokemons";
import { getTypeEffectiveness } from "@/utils";

export interface DamageInput {
  power: number;
  type: string | null;
  damageClass: MoveDamageClass;
  accuracy: number;
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

function effectivenessFor(defender: IMyPokemon, type: string | null): number {
  return type
    ? getTypeEffectiveness(
        type.toLowerCase(),
        defender.types.length ? defender.types : ["normal"],
      )
    : 1;
}

function baseDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
  critMul: number,
  variance: number,
): number {
  const attackStat =
    input.damageClass === "special"
      ? attacker.stats.special_attack
      : attacker.stats.attack;
  const defenseStat =
    input.damageClass === "special"
      ? defender.stats.special_defense
      : defender.stats.defense;
  const stab =
    input.type &&
    attacker.types.some(
      (type) => type.toLowerCase() === input.type?.toLowerCase(),
    )
      ? RULES.STAB_MUL
      : 1;

  return (
    attackStat *
    (input.power / 85) *
    (100 / (100 + defenseStat)) *
    effectivenessFor(defender, input.type) *
    stab *
    critMul *
    (input.chainMul ?? 1) *
    (input.overchargeMul ?? 1) *
    variance
  );
}

export function estimateDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
): number {
  const expectedCrit = 1 + input.critChance * (RULES.CRIT_MUL - 1);
  return Math.max(
    0,
    Math.floor(
      baseDamage(attacker, defender, input, expectedCrit, 1) *
        (input.accuracy / 100),
    ),
  );
}

/** Roll order: accuracy, crit, variance. */
export function calculateDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
  rng: Rng = Math.random,
): DamageResult {
  if (rng() >= input.accuracy / 100) {
    return {
      damage: 0,
      isCritical: false,
      isMiss: true,
      effectiveness: 1,
      desc: ["It missed!"],
    };
  }

  const effectiveness = effectivenessFor(defender, input.type);
  const isCritical = rng() < input.critChance;
  const variance =
    RULES.VARIANCE_MIN + rng() * (RULES.VARIANCE_MAX - RULES.VARIANCE_MIN);

  const total = baseDamage(
    attacker,
    defender,
    input,
    isCritical ? RULES.CRIT_MUL : 1,
    variance,
  );

  const damage = effectiveness === 0 ? 0 : Math.max(1, Math.floor(total));

  const desc: Array<string> = [];
  if (isCritical) desc.push("Critical hit!");
  if (effectiveness === 0) desc.push("It had no effect...");
  else if (effectiveness >= 2) desc.push("It's super effective!");
  else if (effectiveness < 1) desc.push("It's not very effective...");

  return { damage, isCritical, isMiss: false, effectiveness, desc };
}
