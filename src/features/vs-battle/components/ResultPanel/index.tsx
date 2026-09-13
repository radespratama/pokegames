import type { Side } from "@/features/vs-battle/engine/types";
import type { ExpGrant } from "@/utils/leveling";
import { Button, Text } from "@/components/ui";

interface Props {
  winner: Side;
  expGained: Array<ExpGrant>;
  levelUps: Array<{ nickname: string; level: number }>;
  onFindNew: () => void;
  onLeave: () => void;
}

/** Sum grants per nickname so a 3v3 with three KOs shows one line per Pokemon. */
const totals = (grants: Array<ExpGrant>) =>
  Object.entries(
    grants.reduce<Record<string, number>>(
      (acc, g) => ({ ...acc, [g.nickname]: (acc[g.nickname] ?? 0) + g.amount }),
      {},
    ),
  );

const ResultPanel = ({
  winner,
  expGained,
  levelUps,
  onFindNew,
  onLeave,
}: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <Text variant="darker" size="lg" style={{ textAlign: "center" }}>
      {winner === "player" ? "VICTORY!" : "DEFEATED..."}
    </Text>
    {totals(expGained).map(([nickname, amount]) => (
      <Text key={nickname} size="base" style={{ textAlign: "center" }}>
        {nickname} +{amount} EXP
      </Text>
    ))}
    {levelUps.map((u) => (
      <Text
        key={`${u.nickname}-${u.level}`}
        size="base"
        style={{ textAlign: "center" }}>
        {u.nickname} reached Lv. {u.level}!
      </Text>
    ))}
    <Button variant="dark" onClick={onFindNew} style={{ width: "100%" }}>
      Find New Opponent
    </Button>
    <Button variant="light" onClick={onLeave} style={{ width: "100%" }}>
      Back to Pokedex
    </Button>
  </div>
);

export default ResultPanel;
