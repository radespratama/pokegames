import { MiniHp, Slot, Strip } from "./index.style";
import type { Combatant, Side } from "@/features/vs-battle/engine/types";

interface Props {
  side: Side;
  team: Array<Combatant>;
  active: number;
  hp: Array<number>;
}

/** The two non-active slots; the active one is on the field. */
const Bench = ({ side, team, active, hp }: Props) => (
  <Strip side={side}>
    {team.map((c, i) =>
      i === active ? null : (
        <Slot key={c.nickname} fainted={hp[i] === 0}>
          <img src={c.sprite} alt={c.nickname} />
          <div>{side === "player" ? c.nickname : c.name}</div>
          <div>Lv. {c.battle_state.level}</div>
          <MiniHp pct={(hp[i] / c.stats.hp) * 100} />
        </Slot>
      ),
    )}
  </Strip>
);

export default Bench;
