import { AnimatePresence, motion } from "framer-motion";
import * as S from "./index.style";
import type { Side } from "@/features/vs-battle/engine/types";

interface Props {
  cast: { name: string; side: Side; key: number } | null;
}

const LETTERS = "ULTIMATE".split("");

const UltimateBanner = ({ cast }: Props) => (
  <AnimatePresence>
    {cast && (
      <S.Layer key={cast.key} aria-hidden>
        <motion.div
          style={{ position: "absolute", inset: 0 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}>
          <S.Flash />
        </motion.div>

        <motion.div
          style={{ position: "absolute", inset: 0 }}
          initial={{ x: "-30%", opacity: 0 }}
          animate={{ x: "10%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "linear" }}>
          <S.Streaks side={cast.side} />
        </motion.div>

        <motion.div
          style={{ position: "absolute", inset: 0 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}>
          <S.Band />
        </motion.div>

        <motion.div
          style={{ position: "relative", textAlign: "center" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}>
          <S.Content>
            <S.Word>
              {LETTERS.map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  style={{ display: "inline-block" }}
                  initial={{ y: -40, opacity: 0, scale: 1.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.16 + i * 0.035,
                    type: "spring",
                    stiffness: 700,
                    damping: 18,
                  }}>
                  {ch}
                </motion.span>
              ))}
            </S.Word>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.2 }}>
              <S.MoveName>{cast.name}</S.MoveName>
            </motion.div>
          </S.Content>
        </motion.div>
      </S.Layer>
    )}
  </AnimatePresence>
);

export default UltimateBanner;
