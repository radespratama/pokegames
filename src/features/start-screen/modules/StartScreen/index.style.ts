import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled("section")({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  backgroundImage: "url('/static/poke-group.avif')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  imageRendering: "pixelated",
});

/** Animated background; poster/AVIF shows until it plays, and always for reduced-motion users. */
export const BgVideo = styled("video")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  imageRendering: "pixelated",
  pointerEvents: "none",
  zIndex: 0,
  "@media (prefers-reduced-motion: reduce)": { display: "none" },
});

export const Centering = styled(motion.div)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "10px",
});

export const Blink = styled("div")({
  animation: "start-blink 1.4s steps(2) infinite",
  "@keyframes start-blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.55 },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

export const Footer = styled(motion.footer)({
  position: "absolute",
  bottom: 18,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: "5px",
});

export const A = styled("a")({
  textDecoration: "underline",
});
