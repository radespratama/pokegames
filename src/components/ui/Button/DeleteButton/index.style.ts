import styled from "@emotion/styled";
import { colors, units } from "@/utils";

export const StyledDeleteButton = styled("button")({
  padding: units.spacing.sm,
  zIndex: 1,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: colors["gray-200"],
  },
  "&:active::after": {
    boxShadow: `inset 4px 4px ${colors["gray-400"]}`,
  },
});
