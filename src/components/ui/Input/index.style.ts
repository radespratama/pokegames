import styled from "@emotion/styled";
import { colors, units } from "@/utils";

export const PixelatedInput = styled("div")({
  input: {
    fontSize: units.fontSize.lg,
    textAlign: "center",
    width: "100%",
    textTransform: "uppercase",
    "::placeholder": {
      color: colors["gray-200"],
    },
  },
});
