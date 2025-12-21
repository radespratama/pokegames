import { IconBroadcastOff } from "@tabler/icons-react";
import { Container } from "./index.style";
import Text from "@/components/ui/Text";

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
