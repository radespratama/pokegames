import { createFileRoute } from "@tanstack/react-router";
import DetailPokemonModule from "@/features/detail/modules/DetailPokemon";
import NotFoundModule from "@/features/error/modules/NotFound";

export const Route = createFileRoute("/pokemons/$pokemonName")({
  component: DetailPokemon,
  notFoundComponent: NotFoundModule,
});

function DetailPokemon() {
  const { pokemonName } = Route.useParams();

  return <DetailPokemonModule pokemonName={pokemonName} />;
}
