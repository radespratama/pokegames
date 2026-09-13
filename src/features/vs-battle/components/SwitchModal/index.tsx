import { AnimatePresence, motion } from "framer-motion";
import * as S from "./index.style";
import type { Combatant } from "@/features/vs-battle/engine/types";
import { Modal } from "@/components/ui";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";

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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}>
          <S.Panel>
            <S.Header>
              <S.Title>
                {forced ? "Choose your next Pokemon" : "Switch to"}
              </S.Title>
              <S.Hint>{forced ? "No turning back" : "Costs your turn"}</S.Hint>
            </S.Header>

            <S.Grid>
              {team.map((c, i) => {
                const fainted = hp[i] === 0;
                const isActive = i === active;
                const state = fainted
                  ? "fainted"
                  : isActive
                    ? "active"
                    : "ready";
                const { tint, deep } = S.typeTint(c.types);
                const pct = (hp[i] / c.stats.hp) * 100;

                return (
                  <motion.div
                    key={c.nickname}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.22 }}>
                    <S.Card
                      tint={tint}
                      deep={deep}
                      state={state}
                      disabled={state !== "ready"}
                      onClick={() => onPick(i)}
                      style={{ width: "100%" }}>
                      {state !== "ready" && (
                        <S.Badge tone={fainted ? "fainted" : "active"}>
                          {fainted ? "Fainted" : "On field"}
                        </S.Badge>
                      )}
                      <motion.div
                        animate={
                          state === "ready" ? { y: [0, -5, 0] } : { y: 0 }
                        }
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}>
                        <S.Sprite src={c.sprite} alt={c.nickname} />
                      </motion.div>
                      <S.Name>{c.nickname}</S.Name>
                      <S.Level>Lv. {c.battle_state.level}</S.Level>
                      <S.Types>
                        {c.types.map((t) => (
                          <img key={t} src={POKEMON_TYPE_ICONS[t]} alt={t} />
                        ))}
                      </S.Types>
                      <S.HpRow>
                        <S.HpTrack pct={pct} />
                        <span>
                          {hp[i]}/{c.stats.hp}
                        </span>
                      </S.HpRow>
                    </S.Card>
                  </motion.div>
                );
              })}
            </S.Grid>

            {!forced && (
              <S.Footer>
                <S.CancelButton onClick={onCancel}>Cancel</S.CancelButton>
              </S.Footer>
            )}
          </S.Panel>
        </motion.div>
      )}
    </AnimatePresence>
  </Modal>
);

export default SwitchModal;
