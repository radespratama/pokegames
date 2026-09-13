import { Fill, Labels, Track, Wrap } from "./index.style";
import { RULES, overchargeMul } from "@/features/vs-battle/engine/rules";

interface Props {
  gauge: number;
  /** Enemy variant: thin bar, no multiplier label. */
  compact?: boolean;
}

const GaugeBar = ({ gauge, compact = false }: Props) => {
  const pct = (gauge / RULES.GAUGE_MAX) * 100;
  const state =
    gauge >= RULES.GAUGE_MAX
      ? "overcharge"
      : gauge >= RULES.ULT_THRESHOLD
        ? "ready"
        : "charging";

  return (
    <Wrap compact={compact}>
      <Labels>
        <span>
          GAUGE {gauge}/{RULES.GAUGE_MAX}
        </span>
        {!compact && gauge >= RULES.ULT_THRESHOLD && (
          <span>
            {state === "overcharge" ? "OVERCHARGE " : ""}x
            {overchargeMul(gauge).toFixed(1)}
          </span>
        )}
      </Labels>
      <Track compact={compact}>
        <Fill pct={pct} state={state} />
      </Track>
    </Wrap>
  );
};

export default GaugeBar;
