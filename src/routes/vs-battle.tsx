import { useMemo } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import VersusBattleModule from "@/features/vs-battle/modules/VSBattle";

export interface IVsBattleSearch {
  mode: "1v1" | "3v3";
  /** Comma separated nickname slugs, pick order preserved. */
  team: string;
  seed: number;
}

export const Route = createFileRoute("/vs-battle")({
  component: VersusBattle,
  validateSearch: (search: Record<string, unknown>): IVsBattleSearch => {
    // `pokemon` is the pre-v2 param; keep it as a 1v1 alias.
    const legacy = typeof search.pokemon === "string" ? search.pokemon : "";
    return {
      mode: search.mode === "3v3" ? "3v3" : "1v1",
      team: typeof search.team === "string" ? search.team : legacy,
      seed: Number(search.seed) || 1,
    };
  },
});

function VersusBattle() {
  const { mode, team, seed } = useSearch({ from: "/vs-battle" });
  // Stable array identity: useBattleEngine keys its session on `team`.
  const nicknames = useMemo(() => team.split(",").filter(Boolean), [team]);
  return (
    <VersusBattleModule
      key={`${mode}:${team}:${seed}`}
      mode={mode}
      team={nicknames}
      seed={seed}
    />
  );
}
