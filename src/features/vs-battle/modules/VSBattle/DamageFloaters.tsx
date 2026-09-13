import { AnimatePresence, motion } from "framer-motion";
import * as T from "./index.style";
import type { IDamage } from "@/hooks/common/battle/useDamageSystem";
import type { Side } from "@/features/vs-battle/engine/types";

interface Props {
  damages: Array<IDamage>;
  side: Side;
}

const DamageFloaters = ({ damages, side }: Props) => (
  <AnimatePresence>
    {damages
      .filter((damage) => damage.target === side)
      .map((damage) => (
        <T.DamageWrapper key={damage.id}>
          <motion.div
            initial={{ opacity: 0, y: 0, scale: damage.isCritical ? 0.5 : 0.8 }}
            animate={{
              opacity: [0, 1, 1],
              y: -60,
              scale: damage.isCritical ? [1, 1.5, 1.2] : 1,
              x: damage.isCritical ? [0, -5, 5, -5, 5, 0] : 0,
            }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.8, ease: "easeOut" }}>
            <T.DamageText
              isCritical={damage.isCritical}
              effectiveness={damage.effectiveness}>
              {damage.value === 0 ? "Miss" : damage.value}
              {damage.isCritical && "!"}
              {damage.effectiveness >= 2 && !damage.isCritical && (
                <span
                  style={{
                    fontSize: "0.5em",
                    marginLeft: 4,
                  }}>{`(${damage.effectiveness}x)`}</span>
              )}
            </T.DamageText>
          </motion.div>
        </T.DamageWrapper>
      ))}
  </AnimatePresence>
);

export default DamageFloaters;
