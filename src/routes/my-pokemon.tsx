import { createFileRoute } from "@tanstack/react-router";
import MyPokemonModule from "@/features/my-pokemon/modules/MyPokemon";
import NotFoundModule from "@/features/error/modules/NotFound";

export const Route = createFileRoute("/my-pokemon")({
  component: MyPokemon,
  notFoundComponent: NotFoundModule,
});

function MyPokemon() {
  return <MyPokemonModule />;
}
