import * as S from "./index.style";
import MoveMeta from "./MoveMeta";
import TypeIcon from "./TypeIcon";
import type {
  BattleAction,
  Combatant,
} from "@/features/vs-battle/engine/types";
import type { IBattleMove } from "@/services/api/pokemons";
import Gloves from "@/components/ui/Icon/Gloves";
import { RULES, overchargeMul } from "@/features/vs-battle/engine/rules";
import { availableActions } from "@/features/vs-battle/engine/reducer";

interface Props {
  combatant: Combatant;
  disabled: boolean;
  onAct: (a: BattleAction) => void;
  onSwitch?: () => void;
}

const basicMove: IBattleMove = {
  name: "Basic",
  power: RULES.BASIC.power,
  type: "normal",
  damageClass: "physical",
  accuracy: 100,
  priority: 0,
};

const moveLabel = (move: IBattleMove) =>
  `${move.name}, ${move.damageClass}, power ${move.power}, accuracy ${move.accuracy}`;

const ActionPanel = ({ combatant, disabled, onAct, onSwitch }: Props) => {
  const avail = availableActions(combatant);
  const [s1, s2] = combatant.skills;
  const ultState =
    combatant.gauge >= RULES.GAUGE_MAX
      ? "overcharge"
      : combatant.gauge >= RULES.ULT_THRESHOLD
        ? "ready"
        : "locked";

  return (
    <S.AttackGrid>
      <S.StyledButton
        disabled={disabled}
        pokemonType="normal"
        aria-label={moveLabel(basicMove)}
        onClick={() => onAct({ kind: "basic" })}>
        <Gloves
          style={{ width: 18, height: 18, marginRight: 6 }}
          color="#ffffff"
        />
        Basic · {RULES.BASIC.power}
        <MoveMeta move={basicMove} />
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill1}
        pokemonType={s1.type}
        aria-label={moveLabel(s1)}
        onClick={() => onAct({ kind: "skill1" })}>
        <TypeIcon type={s1.type} />
        {s1.name} · {s1.power}
        {combatant.cooldowns.skill1 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill1}</S.CooldownBadge>
        )}
        <MoveMeta move={s1} />
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill2}
        pokemonType={s2.type}
        aria-label={moveLabel(s2)}
        onClick={() => onAct({ kind: "skill2" })}>
        <TypeIcon type={s2.type} />
        {s2.name} · {s2.power}
        {combatant.cooldowns.skill2 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill2}</S.CooldownBadge>
        )}
        <MoveMeta move={s2} />
      </S.StyledButton>

      {combatant.moves.map((m, index) => (
        <S.UltimateButton
          key={m.name}
          state={ultState}
          disabled={disabled || !avail.ultimate}
          aria-label={moveLabel(m)}
          onClick={() => onAct({ kind: "ultimate", index })}>
          <TypeIcon type={m.type} />
          <S.UltimateText>
            {ultState === "locked"
              ? `ULT · ${m.name}`
              : `${ultState === "overcharge" ? "OVERCHARGE " : ""}${m.name} x${overchargeMul(combatant.gauge).toFixed(1)}`}
          </S.UltimateText>
          <MoveMeta move={m} />
        </S.UltimateButton>
      ))}

      {onSwitch && (
        <S.SwitchButton disabled={disabled} onClick={onSwitch}>
          ⇄ Switch Pokemon
        </S.SwitchButton>
      )}
    </S.AttackGrid>
  );
};

export default ActionPanel;
