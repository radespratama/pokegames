import { damageInputForAction } from "./action";
import { estimateDamage } from "./damage";
import { availableActions } from "./reducer";
import { CHAIN_ORDER, RULES } from "./rules";
import type { BattleAction, BattleState, Combatant, Rng } from "./types";
import { getTypeEffectiveness } from "@/utils";

type AttackAction = Exclude<BattleAction, { kind: "switch" }>;

interface ScoredAction {
  action: AttackAction;
  damage: number;
  effectiveness: number;
  score: number;
}

const activeOf = (team: BattleState["player"]) => team.team[team.active];

const attackActions = (combatant: Combatant): Array<AttackAction> => {
  const available = availableActions(combatant);
  const actions: Array<AttackAction> = [{ kind: "basic" }];
  if (available.skill1) actions.push({ kind: "skill1" });
  if (available.skill2) actions.push({ kind: "skill2" });
  if (available.ultimate) {
    combatant.moves.forEach((_, index) => {
      actions.push({ kind: "ultimate", index });
    });
  }
  return actions;
};

const typeEffectiveness = (defender: Combatant, type: string | null) =>
  type
    ? getTypeEffectiveness(
        type.toLowerCase(),
        defender.types.length ? defender.types : ["normal"],
      )
    : 1;

function bestAttack(
  attacker: Combatant,
  defender: Combatant,
  rng: Rng,
): ScoredAction {
  return attackActions(attacker)
    .map((action) => {
      const input = damageInputForAction(attacker, action);
      const damage = estimateDamage(attacker, defender, input);
      const effectiveness = typeEffectiveness(defender, input.type);
      const score =
        damage +
        (damage >= defender.currentHp ? RULES.AI.KO_BONUS : 0) +
        (action.kind === CHAIN_ORDER[attacker.chainStep]
          ? RULES.AI.CHAIN_CONTINUE_BONUS
          : 0) +
        (action.kind === "ultimate" && attacker.gauge >= RULES.GAUGE_MAX
          ? RULES.AI.OVERCHARGE_READY_BONUS
          : 0) +
        rng() * RULES.AI.JITTER;
      return { action, damage, effectiveness, score };
    })
    .sort((left, right) => right.score - left.score)[0];
}

export function chooseEnemyAction(
  state: BattleState,
  rng: Rng = Math.random,
): BattleAction {
  const player = activeOf(state.player);
  const enemy = activeOf(state.enemy);
  const activeAttack = bestAttack(enemy, player, rng);
  const lowHp = enemy.currentHp / enemy.stats.hp <= RULES.AI.LOW_HP_RATIO;
  const poorMatchup = activeAttack.effectiveness <= RULES.AI.BAD_EFFECTIVENESS;

  if (state.mode === "3v3" && (lowHp || poorMatchup)) {
    const zeroRng: Rng = () => 0;
    const switchTarget = state.enemy.team
      .map((candidate, index) => ({ candidate, index }))
      .filter(
        ({ candidate, index }) =>
          index !== state.enemy.active && !candidate.fainted,
      )
      .map(({ candidate, index }) => {
        const offense = bestAttack(candidate, player, zeroRng);
        const incoming = bestAttack(player, candidate, zeroRng).damage;
        const hpRatio = candidate.currentHp / candidate.stats.hp;
        return {
          index,
          score: offense.score - incoming * 0.5 + hpRatio * 25,
        };
      })
      .sort((left, right) => right.score - left.score)
      .at(0);

    if (
      switchTarget &&
      switchTarget.score >= activeAttack.score + RULES.AI.SWITCH_MARGIN
    ) {
      return { kind: "switch", to: switchTarget.index };
    }
  }

  return activeAttack.action;
}
