import React from "react";
import { useNavigate } from "react-router-dom";

import { Text } from "../../components";
import Button from "../../components/Button";

import * as T from "./index.style";

const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <T.Container>
      <T.Centering>
        <Text as="h1" variant="outlined" size="xl">
          POKEGAMES
        </Text>
        <Button onClick={() => navigate("/explore")} variant="light">Press Start</Button>
        <Text variant="outlined" size="base">
          Source API <a href="https://pokeapi.co" target="_blank">here</a>
        </Text>
      </T.Centering>
    </T.Container>
  );
};

export default StartScreen;
