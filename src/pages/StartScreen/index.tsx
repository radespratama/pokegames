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
        <Button onClick={() => navigate("/pokemons")} variant="light">
          Press Start
        </Button>
        <Text variant="outlined" size="base">
          Source API{" "}
          <T.A href="https://pokeapi.co" target="_blank">
            here
          </T.A>
        </Text>
      </T.Centering>
      <div style={{ position: "absolute", bottom: 18 }}>
        <Text variant="outlined">&copy;{new Date().getFullYear()} radespratama</Text>
      </div>
    </T.Container>
  );
};

export default StartScreen;
