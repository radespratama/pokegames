import { Option, Switch } from "./index.style";
import ModeBalls from "./ModeBalls";
import type { BattleMode } from "@/features/my-pokemon/pick";

interface Props {
  mode: BattleMode;
  onChange: (mode: BattleMode) => void;
}

const ModeToggle = ({ mode, onChange }: Props) => (
  <Switch role="radiogroup" aria-label="Battle mode">
    {(["1v1", "3v3"] as const).map((m) => (
      <Option
        key={m}
        role="radio"
        aria-checked={mode === m}
        on={mode === m}
        onClick={() => onChange(m)}>
        <ModeBalls count={m === "3v3" ? 3 : 1} active={mode === m} />
        {m.toUpperCase()}
      </Option>
    ))}
  </Switch>
);

export default ModeToggle;
