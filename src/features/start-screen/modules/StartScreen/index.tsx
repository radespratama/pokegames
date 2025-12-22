import { useNavigate } from "@tanstack/react-router";

import * as T from "./index.style";
import { Button, Text } from "@/components/ui";

const StartScreenModule = () => {
  const navigate = useNavigate();

  return (
    <T.Container>
      <T.Centering>
        <Text as="h1" variant="outlined" size="xl">
          POKEGAMES
        </Text>
        <Button
          onClick={() =>
            navigate({
              to: "/pokemons",
            })
          }
          variant="light">
          Press Start
        </Button>
        <Text variant="outlined" size="base">
          Source API{" "}
          <T.A href="https://pokeapi.co" target="_blank">
            here
          </T.A>
        </Text>
      </T.Centering>
      <div
        style={{
          position: "absolute",
          bottom: 18,
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}>
        <Text variant="outlined">
          &copy;{new Date().getFullYear()} radespratama
        </Text>
        <Text variant="outlined">
          | Want to contribute?{" "}
          <T.A href="https://github.com/radespratama/pokegames" target="_blank">
            GitHub
          </T.A>
        </Text>
      </div>
    </T.Container>
  );
};

export default StartScreenModule;
