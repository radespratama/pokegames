import { useEffect } from "react";
import { clearTimeout, setTimeout } from "worker-timers";
import {
  IntroOverlay,
  VsBadge,
  VsContainer,
  VsImage,
  VsName,
  VsSide,
} from "./index.style";
import type { IMyPokemon } from "@/services/api/pokemons";

interface IBattleIntroProps {
  player: IMyPokemon | undefined;
  enemy: IMyPokemon | null;
  onComplete: () => void;
}

const BattleIntro = ({ player, enemy, onComplete }: IBattleIntroProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <IntroOverlay
      initial={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{
        clipPath: "circle(0% at 50% 50%)",
        transition: {
          duration: 1.2,
          ease: "linear",
        },
      }}>
      <VsContainer>
        {/* PLAYER SIDE (Left) */}
        <VsSide
          align="left"
          color="rgba(16, 185, 129, 0.2)"
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}>
          <VsName>{player?.nickname || "PLAYER"}</VsName>
          <VsImage
            src={player?.sprite}
            alt="Player"
            style={{
              transform: "scaleX(-1)",
            }}
          />
        </VsSide>

        {/* ENEMY SIDE (Right) */}
        <VsSide
          align="right"
          color="rgba(239, 68, 68, 0.2)"
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}>
          <VsName>{enemy?.name || "ENEMY"}</VsName>
          <VsImage src={enemy?.sprite} alt="Enemy" />
        </VsSide>

        {/* VS TEXT - Zoom In Effect */}
        <VsBadge
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}>
          VS
        </VsBadge>
      </VsContainer>
    </IntroOverlay>
  );
};

export default BattleIntro;
