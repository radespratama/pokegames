import { createFileRoute } from "@tanstack/react-router";
import ExplorePokemonModule from "@/features/explores/modules/ExplorePokemon";
import NotFoundModule from "@/features/error/modules/NotFound";

export const Route = createFileRoute("/pokemons/")({
  component: ExplorePokemon,
  notFoundComponent: NotFoundModule,
});

function ExplorePokemon() {
  return <ExplorePokemonModule />;
}
