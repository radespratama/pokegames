import React from "react";
import styled from "@emotion/styled";

import { Text } from "..";
import { skillColor } from "../../utils";

interface Props {
  type: string;
}

const PixelatedTypeCard = styled("div")(({ type }: Props) => {
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

const TypeCard: React.FC<Props> = ({ type }) => {
  return (
    <PixelatedTypeCard type={type} className="pxl-border">
      <Text variant="outlined" size="lg">
        {type}
      </Text>
    </PixelatedTypeCard>
  );
};

export default TypeCard;
