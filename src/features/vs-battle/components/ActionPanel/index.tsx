import * as S from "./index.style";
import type {
  BattleAction,
  Combatant,
} from "@/features/vs-battle/engine/types";
import Gloves from "@/components/ui/Icon/Gloves";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";
import { RULES, overchargeMul } from "@/features/vs-battle/engine/rules";
import { availableActions } from "@/features/vs-battle/engine/reducer";

interface Props {
  combatant: Combatant;
  disabled: boolean;
  onAct: (a: BattleAction) => void;
  /** Present only in 3v3 with a live bench. */
  onSwitch?: () => void;
}

const TypeIcon = ({ type }: { type: string }) => (
  <img
    src={POKEMON_TYPE_ICONS[type]}
    alt={type}
    width={18}
    height={18}
    style={{ marginRight: 6 }}
  />
);

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
        onClick={() => onAct({ kind: "basic" })}>
        <Gloves
          style={{ width: 18, height: 18, marginRight: 6 }}
          color="#1f2937"
        />
        Basic · {RULES.BASIC.power}
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill1}
        pokemonType={s1.type}
        onClick={() => onAct({ kind: "skill1" })}>
        <TypeIcon type={s1.type} />
        {s1.name} · {s1.power}
        {combatant.cooldowns.skill1 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill1}</S.CooldownBadge>
        )}
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill2}
        pokemonType={s2.type}
        onClick={() => onAct({ kind: "skill2" })}>
        <TypeIcon type={s2.type} />
        {s2.name} · {s2.power}
        {combatant.cooldowns.skill2 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill2}</S.CooldownBadge>
        )}
      </S.StyledButton>

      {/* ponytail: one ult button per move (one per type), same as v1 layout;
          collapse into a type picker if a third type ever appears. */}
      {combatant.moves.map((m, index) => (
        <S.UltimateButton
          key={m.name}
          state={ultState}
          disabled={disabled || !avail.ultimate}
          onClick={() => onAct({ kind: "ultimate", index })}>
          <TypeIcon type={m.type || combatant.types[0]} />
          <S.UltimateText>
            {ultState === "locked"
              ? `ULT · ${m.name}`
              : `${ultState === "overcharge" ? "OVERCHARGE " : ""}${m.name} x${overchargeMul(combatant.gauge).toFixed(1)}`}
          </S.UltimateText>
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
