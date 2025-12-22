import styled from "@emotion/styled";
import { units } from "@/utils";

export const GradientBakcdrop = styled("div")({
  position: "fixed",
  zIndex: 1,
  left: 0,
  right: 0,
  bottom: 0,
});

export const OuterNav = styled("nav")({
  padding: units.spacing.base,
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  gap: units.spacing.base,
  margin: "0 auto",
  "@media (min-width: 640px)": {
    width: "80vh",
  },
});

export const InnerNav = styled("div")({
  display: "flex",
  gap: units.spacing.base,
});
