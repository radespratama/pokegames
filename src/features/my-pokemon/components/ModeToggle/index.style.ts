import styled from "@emotion/styled";

export const Switch = styled("div")({
  display: "flex",
  border: "3px solid #000",
  backgroundColor: "#111",
  boxShadow: "3px 3px 0 #000",
});

export const Option = styled("button")<{ on: boolean }>(({ on }) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: "0.85rem",
  letterSpacing: "1px",
  color: on ? "#111" : "#9ca3af",
  backgroundColor: on ? "#71f57d" : "transparent",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.08s",
  "&:active": { transform: "scale(0.94)" },
  animation: on ? "mode-blink 1.6s steps(2) infinite" : "none",
  "@keyframes mode-blink": {
    "0%": { boxShadow: "inset 0 0 0 0 #fff" },
    "50%": { boxShadow: "inset 0 0 0 2px #fff" },
  },
}));
