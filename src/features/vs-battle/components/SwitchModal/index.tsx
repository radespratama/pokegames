import type { Combatant } from "@/features/vs-battle/engine/types";
import { Button, Modal, Text } from "@/components/ui";

interface Props {
  open: boolean;
  /** Forced after a faint: no cancel button. */
  forced: boolean;
  team: Array<Combatant>;
  active: number;
  hp: Array<number>;
  onPick: (index: number) => void;
  onCancel: () => void;
}

const SwitchModal = ({
  open,
  forced,
  team,
  active,
  hp,
  onPick,
  onCancel,
}: Props) => (
  <Modal open={open} overlay="dark">
    <div
      className="pxl-border"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        minWidth: 320,
      }}>
      <Text variant="darker" size="lg">
        {forced ? "CHOOSE YOUR NEXT POKEMON" : "SWITCH TO"}
      </Text>
      {team.map((c, i) => {
        const disabled = i === active || hp[i] === 0;
        return (
          <Button
            key={c.nickname}
            variant={disabled ? "light" : "dark"}
            disabled={disabled}
            onClick={() => onPick(i)}
            style={{ width: "100%", justifyContent: "space-between" }}>
            {c.nickname} · Lv.{c.battle_state.level} · {hp[i]}/{c.stats.hp} HP
          </Button>
        );
      })}
      {!forced && (
        <Button variant="light" onClick={onCancel} style={{ width: "100%" }}>
          CANCEL
        </Button>
      )}
    </div>
  </Modal>
);

export default SwitchModal;
