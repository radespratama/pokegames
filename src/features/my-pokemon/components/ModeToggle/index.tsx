import { Option, Switch } from "./index.style";
import type { BattleMode } from "@/features/my-pokemon/pick";

interface Props {
  mode: BattleMode;
  onChange: (mode: BattleMode) => void;
}

/** 1v1: one ball. 3v3: three balls overlapping like a stack. Dim when the segment is off. */
const Balls = ({ n, on }: { n: number; on: boolean }) => (
  <span style={{ display: "flex" }}>
    {Array.from({ length: n }, (_, i) => (
      <img
        key={i}
        src="/static/pokeball-transparent.png"
        alt=""
        width={14}
        height={14}
        style={{
          imageRendering: "pixelated",
          marginLeft: i ? -5 : 0,
          opacity: on ? 1 : 0.45,
        }}
      />
    ))}
  </span>
);

const ModeToggle = ({ mode, onChange }: Props) => (
  <Switch role="radiogroup" aria-label="Battle mode">
    {(["1v1", "3v3"] as const).map((m) => (
      <Option
        key={m}
        role="radio"
        aria-checked={mode === m}
        on={mode === m}
        onClick={() => onChange(m)}>
        <Balls n={m === "3v3" ? 3 : 1} on={mode === m} />
        {m.toUpperCase()}
      </Option>
    ))}
  </Switch>
);

export default ModeToggle;
