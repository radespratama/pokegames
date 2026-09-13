import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { colors } from "@/utils";

export const Panel = styled(motion.div)({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  fontFamily: "'VT323', monospace",
});

export const ResultHeader = styled("div")<{ won: boolean }>(({ won }) => ({
  position: "relative",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "58px 1fr",
  alignItems: "center",
  gap: "12px",
  minHeight: "78px",
  padding: "10px 14px",
  color: colors["white-800"],
  backgroundColor: won ? colors["green-700"] : colors["red-700"],
  border: `4px solid ${colors["gray-800"]}`,
  boxShadow: `0 5px 0 ${colors["gray-800"]}`,

  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(-45deg, transparent 0 10px, rgba(255,255,255,0.08) 10px 14px)",
    pointerEvents: "none",
  },
}));

export const ResultIcon = styled("span")({
  position: "relative",
  zIndex: 1,
  display: "grid",
  placeItems: "center",
  width: "52px",
  height: "52px",
  fontSize: "2rem",
  lineHeight: 1,
  color: colors["yellow-300"],
  backgroundColor: "rgba(17, 24, 39, 0.45)",
  border: `3px solid ${colors["white-800"]}`,
  boxShadow: "3px 3px 0 rgba(0,0,0,0.45)",
});

export const ResultCopy = styled("div")({
  position: "relative",
  zIndex: 1,
});

export const Eyebrow = styled("p")({
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1,
  letterSpacing: "3px",
  textTransform: "uppercase",
  color: colors["gray-200"],
});

export const Title = styled("h2")({
  margin: "3px 0 0",
  fontSize: "2.25rem",
  lineHeight: 0.9,
  letterSpacing: "4px",
  textTransform: "uppercase",
  textShadow: "3px 3px 0 rgba(0,0,0,0.7)",
});

export const Rewards = styled("section")({
  padding: "10px",
  backgroundColor: colors["gray-800"],
  border: `3px solid ${colors["gray-800"]}`,
});

export const RewardsHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  padding: "1px 2px 8px",
  fontSize: "1rem",
  lineHeight: 1,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: colors["sky-300"],
});

export const RewardList = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const RewardRow = styled(motion.div)({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "8px",
  minHeight: "44px",
  padding: "6px 8px",
  backgroundColor: colors["gray-100"],
  border: `3px solid ${colors["gray-500"]}`,
  boxShadow: `inset -3px -3px 0 ${colors["gray-300"]}`,
});

export const PokemonName = styled("p")({
  overflow: "hidden",
  margin: 0,
  fontSize: "1.2rem",
  lineHeight: 1,
  letterSpacing: "1px",
  textOverflow: "ellipsis",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  color: colors["gray-800"],
});

export const RewardMeta = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "8px",
});

export const Exp = styled("span")({
  fontSize: "1.1rem",
  lineHeight: 1,
  letterSpacing: "1px",
  color: colors["sky-700"],
  whiteSpace: "nowrap",
});

export const LevelBadge = styled(motion.span)({
  padding: "3px 6px",
  fontSize: "0.9rem",
  lineHeight: 1,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors["gray-900"],
  backgroundColor: colors["yellow-300"],
  border: `2px solid ${colors["gray-900"]}`,
  boxShadow: `2px 2px 0 ${colors["yellow-700"]}`,
  whiteSpace: "nowrap",
});

export const EmptyReward = styled("p")({
  margin: 0,
  padding: "12px 8px",
  textAlign: "center",
  fontSize: "1rem",
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: colors["gray-400"],
  border: `2px dashed ${colors["gray-600"]}`,
});

export const Actions = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
});

const actionBase = {
  position: "relative" as const,
  minHeight: "46px",
  padding: "9px 8px",
  fontFamily: "'VT323', monospace",
  fontSize: "1.05rem",
  lineHeight: 1,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  border: `3px solid ${colors["gray-800"]}`,
  boxShadow: `0 4px 0 ${colors["gray-800"]}`,
  cursor: "pointer",
  transition: "transform 0.08s steps(2), box-shadow 0.08s steps(2)",
  "&:hover": { transform: "translateY(-2px)" },
  "&:active": { transform: "translateY(4px)", boxShadow: "none" },
};

export const FindButton = styled("button")({
  ...actionBase,
  color: colors["white-800"],
  backgroundColor: colors["green-600"],
  textShadow: "2px 2px 0 rgba(0,0,0,0.6)",
});

export const LeaveButton = styled("button")({
  ...actionBase,
  color: colors["gray-800"],
  backgroundColor: colors["gray-200"],
});
