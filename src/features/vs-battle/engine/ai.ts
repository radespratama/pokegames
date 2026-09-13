import { CHAIN_ORDER, RULES } from "./rules";
import { availableActions } from "./reducer";
import type { BattleAction, Combatant, Rng } from "./types";

/** Spec 3.6. Deterministic given rng. Never switches voluntarily. */
export function chooseEnemyAction(
  c: Combatant,
  rng: Rng = Math.random,
): BattleAction {
  const avail = availableActions(c);
  const ultimate = (): BattleAction => ({
    kind: "ultimate",
    index: Math.floor(rng() * c.moves.length),
  });

  if (avail.ultimate && c.gauge >= RULES.GAUGE_MAX) return ultimate();
  if (avail.ultimate && rng() < RULES.AI.ULT_AT_THRESHOLD) return ultimate();

  if (c.chainStep > 0) {
    const next = CHAIN_ORDER[c.chainStep];
    if (next === "skill1" && avail.skill1) return { kind: "skill1" };
    if (next === "skill2" && avail.skill2) return { kind: "skill2" };
  }

  if (avail.skill2 && rng() < RULES.AI.USE_SKILL2) return { kind: "skill2" };
  if (avail.skill1 && rng() < RULES.AI.USE_SKILL1) return { kind: "skill1" };
  return { kind: "basic" };
}
