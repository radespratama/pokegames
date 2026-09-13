import { RULES, overchargeMul } from "./rules";
import type { BattleAction, Combatant } from "./types";
import type { DamageInput } from "./damage";

type AttackAction = Exclude<BattleAction, { kind: "switch" }>;

export function damageInputForAction(
  combatant: Combatant,
  action: AttackAction,
): DamageInput {
  if (action.kind === "basic") {
    return {
      power: RULES.BASIC.power,
      type: null,
      damageClass: "physical",
      accuracy: 100,
      critChance: RULES.BASIC.critChance,
    };
  }
  if (action.kind === "ultimate") {
    const move = combatant.moves[action.index];
    return {
      power: move.power,
      type: move.type,
      damageClass: move.damageClass,
      accuracy: move.accuracy,
      critChance: RULES.ULTIMATE.critChance,
      overchargeMul: overchargeMul(combatant.gauge),
    };
  }
  const move = combatant.skills[action.kind === "skill1" ? 0 : 1];
  const rule = action.kind === "skill1" ? RULES.SKILL1 : RULES.SKILL2;
  return {
    power: move.power,
    type: move.type,
    damageClass: move.damageClass,
    accuracy: move.accuracy,
    critChance: rule.critChance,
  };
}
