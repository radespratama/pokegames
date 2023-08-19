import styled from "@emotion/styled";
import { IconBroadcastOff } from "@tabler/icons-react";
import Text from "../../components/Text";

const Container = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
});

export default function NoSignal() {
  return (
    <Container>
      <IconBroadcastOff size={20} />
      <Text variant="darker" as="h4" size="base">
        Connection lost!
      </Text>
    </Container>
  );
}
