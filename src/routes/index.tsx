import { createFileRoute } from "@tanstack/react-router";
import StartScreenModule from "@/features/start-screen/modules/StartScreen";

export const Route = createFileRoute("/")({
  component: StartScreen,
});

function StartScreen() {
  return <StartScreenModule />;
}
