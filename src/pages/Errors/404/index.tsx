import { useNavigate } from "react-router-dom";

import { Button, Text } from "../../../components";
import * as T from "./index.style";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <T.Container>
      <Text as="h2" variant="outlined" size="lg">
        Oops! Your destination is not found.
      </Text>
      <T.Box>
        <Button onClick={() => navigate("/pokemons")} size="lg" variant="sky">
          Back to Home
        </Button>
      </T.Box>
    </T.Container>
  );
}
