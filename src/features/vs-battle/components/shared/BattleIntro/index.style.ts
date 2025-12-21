import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { colors } from "@/utils";

export const IntroOverlay = styled(motion.div)({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",

  backgroundColor: colors["red-700"],

  backgroundImage: `
    linear-gradient(45deg, ${colors["red-500"]} 30%, transparent 60%), 
    linear-gradient(-45deg, ${colors["red-500"]} 30%, transparent 60%), 
    linear-gradient(45deg, transparent 75%, ${colors["red-500"]} 75%), 
    linear-gradient(-45deg, transparent 75%, ${colors["red-500"]} 75%)
  `,

  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",

  imageRendering: "pixelated",
});

export const IntroText = styled(motion.h1)({
  fontFamily: "'VT323', monospace",
  fontSize: "5rem",
  color: colors["white-800"],
  textTransform: "uppercase",
  textShadow: `6px 6px 0px ${colors["gray-800"]}`,
  textAlign: "center",
  lineHeight: 1,
  padding: "1rem 3rem",
  backgroundColor: colors["gray-800"],
  border: `4px solid ${colors["white-800"]}`,
  boxShadow: `10px 10px 0px rgba(0,0,0,0.5)`,
});

export const SubText = styled(motion.p)({
  fontFamily: "'VT323', monospace",
  fontSize: "1.5rem",
  color: colors["white-800"],
  marginTop: "2rem",
  textShadow: "2px 2px 0px #000",
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: "4px 8px",
});

export const VsContainer = styled("div")({
  display: "flex",
  width: "100%",
  height: "100%",
  position: "relative",
  zIndex: 10,
});

export const VsSide = styled(motion.div)<{
  align: "left" | "right";
  color: string;
}>(({ align, color }) => ({
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: color,
  clipPath:
    align === "left"
      ? "polygon(0 0, 100% 0, 85% 100%, 0% 100%)"
      : "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
  marginLeft: align === "right" ? "-10%" : "0",
  zIndex: align === "left" ? 2 : 1,
}));

export const VsImage = styled("img")({
  width: "300px",
  height: "300px",
  objectFit: "contain",
  imageRendering: "pixelated",
  filter: "drop-shadow(10px 10px 0px rgba(0,0,0,0.5))",
});

export const VsName = styled("h2")({
  fontFamily: "'VT323', monospace",
  fontSize: "3rem",
  color: colors["white-800"],
  textTransform: "uppercase",
  textShadow: `4px 4px 0px ${colors["gray-800"]}`,
  backgroundColor: colors["gray-800"],
  padding: "0.5rem 2rem",
  border: `4px solid ${colors["white-800"]}`,
  marginTop: "20px",
});

export const VsBadge = styled(motion.div)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 20,
  fontFamily: "'VT323', monospace",
  fontSize: "8rem",
  color: colors["red-500"],
  textShadow: `
    4px 4px 0px ${colors["white-800"]}, 
    8px 8px 0px ${colors["gray-800"]}
  `,
  fontStyle: "italic",
  fontWeight: "bold",
});
