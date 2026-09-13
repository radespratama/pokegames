import styled from "@emotion/styled";
import { colors } from "@/utils";
import { RULES } from "@/features/vs-battle/engine/rules";

const MARK = (RULES.ULT_THRESHOLD / RULES.GAUGE_MAX) * 100;

export const Wrap = styled("div")<{ compact: boolean }>(({ compact }) => ({
  width: compact ? "180px" : "100%",
  fontFamily: "'VT323', monospace",
  fontSize: compact ? "0.8rem" : "1.05rem",
  letterSpacing: "1px",
  color: colors["gray-800"],
}));

export const Labels = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "2px",
});

export const Track = styled("div")<{ compact: boolean }>(({ compact }) => ({
  position: "relative",
  width: "100%",
  height: compact ? "6px" : "14px",
  backgroundColor: colors["gray-300"],
  border: `${compact ? 2 : 3}px solid ${colors["gray-800"]}`,
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${MARK}%`,
    width: "2px",
    backgroundColor: colors["gray-800"],
  },
}));

export const Fill = styled("div")<{
  pct: number;
  state: "charging" | "ready" | "overcharge";
}>(({ pct, state }) => ({
  height: "100%",
  width: `${pct}%`,
  transition: "width 0.4s steps(6)",
  backgroundColor:
    state === "overcharge"
      ? colors["red-500"]
      : state === "ready"
        ? colors["yellow-500"]
        : colors["sky-500"],
  animation: state === "charging" ? "none" : "gauge-blink 1s steps(2) infinite",
  "@keyframes gauge-blink": {
    "0%": { filter: "brightness(1)" },
    "50%": { filter: "brightness(1.4)" },
  },
}));
