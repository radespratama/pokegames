import styled from "@emotion/styled";

import type { TypeCardProps } from ".";
import { skillColor } from "@/utils";

export const PixelatedTypeCard = styled("div")(({ type }: TypeCardProps) => {
  return {
    marginRight: 16,
    background: skillColor[type + "-200"],
    "&:not(.no-inset)::after": {
      boxShadow: `inset -4px -4px ${skillColor[type + "-300"]}, inset 4px 4px ${
        skillColor[type + "-100"]
      }`,
    },
  };
});
