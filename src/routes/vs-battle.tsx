import { createFileRoute, useSearch } from "@tanstack/react-router";
import VersusBattleModule from "@/features/vs-battle/modules/VSBattle";

interface IVsBattleSearch {
  pokemon: string;
}

export const Route = createFileRoute("/vs-battle")({
  component: VersusBattle,
  validateSearch: (search: Record<string, unknown>): IVsBattleSearch => {
    return {
      pokemon: (search.pokemon as string) || "",
    };
  },
});

function VersusBattle() {
  const { pokemon } = useSearch({ from: "/vs-battle" });
  return <VersusBattleModule pokemonNicknameParam={pokemon} />;
}
