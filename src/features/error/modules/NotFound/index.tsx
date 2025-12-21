import { useNavigate } from "@tanstack/react-router";

import * as T from "./index.style";
import { Button, Text } from "@/components/ui";

const NotFoundModule = () => {
  const navigate = useNavigate();

  return (
    <T.Container>
      <Text as="h2" variant="outlined" size="lg">
        Oops! Your destination is not found.
      </Text>
      <T.Box>
        <Button
          onClick={() => navigate({ to: "/pokemons" })}
          size="lg"
          variant="sky">
          Back to Home
        </Button>
      </T.Box>
    </T.Container>
  );
};

export default NotFoundModule;
