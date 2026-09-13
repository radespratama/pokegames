import { useEffect } from "react";
import { clearTimeout, setTimeout } from "worker-timers";
import {
  IntroOverlay,
  VsBadge,
  VsContainer,
  VsImage,
  VsLevel,
  VsName,
  VsSide,
} from "./index.style";
import type { IMyPokemon } from "@/services/api/pokemons";
import { TypeCard } from "@/components/ui";

interface IBattleIntroProps {
  player: Array<IMyPokemon>;
  enemy: Array<IMyPokemon>;
  onComplete: () => void;
}

const BattleIntro = ({ player, enemy, onComplete }: IBattleIntroProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const lead = player[0];
  const foe = enemy[0];

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
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {lead.types.map((type) => (
              <TypeCard
                key={type}
                hasIcon
                config={{ size: 16, fontSize: "base" }}
                type={type}
              />
            ))}
          </div>
          <VsName>{lead.nickname || "PLAYER"}</VsName>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {player.map((p, i) => (
              <div key={p.nickname} style={{ textAlign: "center" }}>
                <VsImage
                  src={p.sprite}
                  alt={p.nickname}
                  style={{
                    transform: "scaleX(-1)",
                    width: i === 0 ? 300 : 140,
                    height: i === 0 ? 300 : 140,
                  }}
                />
                <VsLevel>Lv. {p.battle_state.level}</VsLevel>
              </div>
            ))}
          </div>
        </VsSide>

        {/* ENEMY SIDE (Right) */}
        <VsSide
          align="right"
          color="rgba(239, 68, 68, 0.2)"
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {foe.types.map((type) => (
              <TypeCard
                key={type}
                hasIcon
                config={{ size: 16, fontSize: "base" }}
                type={type}
              />
            ))}
          </div>
          <VsName>{foe.name || "ENEMY"}</VsName>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {enemy.map((e, i) => (
              <div key={e.nickname} style={{ textAlign: "center" }}>
                <VsImage
                  src={e.sprite}
                  alt={e.name}
                  style={{
                    width: i === 0 ? 300 : 140,
                    height: i === 0 ? 300 : 140,
                  }}
                />
                <VsLevel>Lv. {e.battle_state.level}</VsLevel>
              </div>
            ))}
          </div>
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
