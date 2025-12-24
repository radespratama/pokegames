import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as T from "./index.style";
import BattleIntro from "@/features/vs-battle/components/shared/BattleIntro";
import { usePokemonStore } from "@/store/app/pokemonStore";
import {
  LS_ENEMY_KEY,
  useSpawnEnemy,
} from "@/hooks/common/battle/useSpawnEnemy";
import { useBattleController } from "@/hooks/common/battle/useBattleController";
import { Text } from "@/components/ui";
import Gloves from "@/components/ui/Icon/Gloves";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";

interface IVersusBattleModuleProps {
  pokemonNicknameParam: string;
}

const LS_PLAYER_HP_KEY = "pokegames@battle-player-hp";

const VersusBattleModule = ({
  pokemonNicknameParam,
}: IVersusBattleModuleProps) => {
  const formattedNickname = pokemonNicknameParam
    .replace(/-/g, " ")
    .toUpperCase();
  const { pokemons } = usePokemonStore();
  const battleLogRef = useRef<HTMLDivElement>(null);

  const playerPokemon = pokemons.find(
    (p) => p.nickname.toUpperCase() === formattedNickname,
  );

  const { enemy, isLoadingEnemy, updateEnemyState } = useSpawnEnemy({
    userPokemon: {
      level: playerPokemon?.battle_state.level || 1,
      experience: playerPokemon?.battle_state.experience || 0,
    },
  });

  const { state, actions } = useBattleController({
    playerPokemon,
    enemy,
    updateEnemyState,
    key: { LS_PLAYER_HP_KEY, LS_ENEMY_KEY },
  });

  useEffect(() => {
    const img = new Image();
    img.src = "/static/hit-effects.gif";
  }, []);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [state.battleLog]);

  if (!playerPokemon) return <T.Container />;
  if (isLoadingEnemy && !enemy) return <T.Container />;

  const maxPlayerHP = playerPokemon.stats.hp;
  const maxEnemyHP = enemy?.stats.hp || 1;
  const playerHPPercentage = (state.playerCurrentHP / maxPlayerHP) * 100;
  const enemyHPPercentage = (state.enemyCurrentHP / maxEnemyHP) * 100;
  const playerDisplaySprite = playerPokemon.sprite_back || playerPokemon.sprite;

  const isInputLocked = !state.isPlayerTurn || state.isProcessingTurn;

  return (
    <T.Container>
      <AnimatePresence>
        {state.showIntro && (
          <BattleIntro
            player={playerPokemon}
            enemy={enemy}
            onComplete={() => actions.setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <T.BattleWrapper>
        <T.BattleField>
          {/* --- ENEMY SECTION --- */}
          <T.EnemySection>
            <T.EnemyInfo>
              <T.InfoBox>
                <T.CharacterName>{enemy?.name}</T.CharacterName>
                <T.HPBarContainer>
                  <T.HPBar width={enemyHPPercentage} color="#ef4444" />
                </T.HPBarContainer>
                <T.HPText>
                  {state.enemyCurrentHP}/{maxEnemyHP} HP
                </T.HPText>
                <T.HPText>Lvl. {enemy?.battle_state.level}</T.HPText>
              </T.InfoBox>
            </T.EnemyInfo>

            <T.EnemySpriteWrapper>
              {state.activeHitTarget === "enemy" && (
                <T.HitEffectImage
                  key={`hit-enemy-${state.hitKey}`}
                  src="/static/hit-effects.gif"
                  alt="hit"
                />
              )}

              {/* --- ENEMY DAMAGE TEXT (UPDATED) --- */}
              <AnimatePresence>
                {state.damages
                  .filter((d) => d.target === "enemy")
                  .map((damage) => (
                    <T.DamageWrapper key={damage.id}>
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 0,
                          scale: damage.isCritical ? 0.5 : 0.8,
                        }}
                        animate={{
                          opacity: [0, 1, 1],
                          y: -60,
                          scale: damage.isCritical ? [1, 1.5, 1.2] : 1,
                          x: damage.isCritical ? [0, -5, 5, -5, 5, 0] : 0,
                        }}
                        exit={{ opacity: 0, y: -80 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}>
                        {/* PASSING EFFECTIVENESS KE STYLED COMPONENT */}
                        <T.DamageText
                          isCritical={damage.isCritical}
                          effectiveness={damage.effectiveness}>
                          {damage.value === 0 ? "Miss" : damage.value}
                          {damage.isCritical && "!"}

                          {damage.effectiveness >= 2 && !damage.isCritical && (
                            <span style={{ fontSize: "0.5em", marginLeft: 4 }}>
                              {`(${damage.effectiveness}x)`}
                            </span>
                          )}
                        </T.DamageText>
                      </motion.div>
                    </T.DamageWrapper>
                  ))}
              </AnimatePresence>

              <AnimatePresence>
                {state.enemyCurrentHP > 0 && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}>
                    <T.PokemonSprite
                      src={enemy?.sprite}
                      alt="Enemy"
                      style={{ transform: "scaleX(1)" }}
                    />
                    <T.ShadowEnemy />
                  </motion.div>
                )}
              </AnimatePresence>
            </T.EnemySpriteWrapper>
          </T.EnemySection>

          {/* --- PLAYER SECTION --- */}
          <T.PlayerSection>
            <T.PlayerSpriteWrapper>
              {state.activeHitTarget === "player" && (
                <T.HitEffectImage
                  key={`hit-player-${state.hitKey}`}
                  src="/static/hit-effects.gif"
                  alt="hit"
                />
              )}

              {/* --- PLAYER DAMAGE TEXT (UPDATED) --- */}
              <AnimatePresence>
                {state.damages
                  .filter((d) => d.target === "player")
                  .map((damage) => (
                    <T.DamageWrapper key={damage.id}>
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 0,
                          scale: damage.isCritical ? 0.5 : 0.8,
                        }}
                        animate={{
                          opacity: [0, 1, 1],
                          y: -60,
                          scale: damage.isCritical ? [1, 1.5, 1.2] : 1,
                          x: damage.isCritical ? [0, -5, 5, -5, 5, 0] : 0,
                        }}
                        exit={{ opacity: 0, y: -80 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}>
                        {/* PASSING EFFECTIVENESS */}
                        <T.DamageText
                          isCritical={damage.isCritical}
                          effectiveness={damage.effectiveness}>
                          {damage.value === 0 ? "Miss" : damage.value}
                          {damage.isCritical && "!"}
                        </T.DamageText>
                      </motion.div>
                    </T.DamageWrapper>
                  ))}
              </AnimatePresence>

              <AnimatePresence>
                {state.playerCurrentHP > 0 && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 50 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}>
                    <T.PokemonSprite
                      src={playerDisplaySprite}
                      alt="Player"
                      style={{ transform: "scaleX(1)" }}
                    />
                    <T.Shadow />
                  </motion.div>
                )}
              </AnimatePresence>
            </T.PlayerSpriteWrapper>

            <T.PlayerInfo>
              <T.PlayerInfoBox>
                <T.CharacterName>{playerPokemon.nickname}</T.CharacterName>
                <T.HPBarContainer>
                  <T.HPBar width={playerHPPercentage} color="#10b981" />
                </T.HPBarContainer>
                <T.HPText>
                  {state.playerCurrentHP}/{maxPlayerHP} HP
                </T.HPText>
                <T.HPText>Lvl. {playerPokemon.battle_state.level}</T.HPText>
              </T.PlayerInfoBox>
            </T.PlayerInfo>
          </T.PlayerSection>

          {/* --- INTERFACE --- */}
          <T.InterfaceWrapper>
            <T.BattleLog ref={battleLogRef}>
              <T.LogTitle>Battle Log</T.LogTitle>
              {state.battleLog.map((log, idx) => (
                <T.LogEntry
                  key={idx}
                  style={{
                    color: log.includes(">>>") ? "#fbbf24" : "inherit",
                    fontWeight: log.includes(">>>") ? "bold" : "normal",
                    textShadow: log.includes(">>>") ? "1px 1px 0 #000" : "none",
                  }}>
                  &gt; {log}
                </T.LogEntry>
              ))}
            </T.BattleLog>

            <T.BattleMenu>
              <T.MenuTitle>
                {state.gameOver
                  ? "Game Over"
                  : state.isPlayerTurn
                    ? `What will ${playerPokemon.nickname} do?`
                    : `${enemy?.name} is attacking...`}
              </T.MenuTitle>

              {!state.gameOver ? (
                <T.AttackGrid>
                  {/* --- ULTIMATE GAUGE BAR --- */}
                  <div
                    style={{
                      gridColumn: "span 2",
                      marginBottom: "0.25rem",
                      marginTop: "-0.25rem",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        marginBottom: "0.1rem",
                        fontWeight: "bold",
                        color: "#374151",
                      }}>
                      <span>Ultimate Charge</span>
                      <span>{state.ultimateGauge}%</span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "0.6rem",
                        backgroundColor: "#d1d5db",
                        borderRadius: "999px",
                        overflow: "hidden",
                        border: "1px solid #9ca3af",
                      }}>
                      <div
                        style={{
                          width: `${state.ultimateGauge}%`,
                          height: "100%",
                          backgroundColor:
                            state.ultimateGauge >= 100 ? "#fbbf24" : "#3b82f6",
                          transition: "width 0.3s ease-out",
                        }}
                      />
                    </div>
                  </div>

                  {/* --- ULTIMATE MOVES --- */}
                  {playerPokemon.moves.map((move, idx) => {
                    const isUltimateReady =
                      !isInputLocked && state.ultimateGauge >= 100;

                    return (
                      <T.StyledButton
                        key={idx}
                        type="button"
                        style={{
                          fontSize: "1rem",
                          gap: "0.5rem",
                          opacity: isUltimateReady ? 1 : 0.6,
                          filter: isUltimateReady ? "none" : "grayscale(100%)",
                          cursor: isUltimateReady ? "pointer" : "not-allowed",
                        }}
                        onClick={() =>
                          actions.useUltimate(
                            move.name,
                            move.power || 50,
                            move.type || "normal",
                          )
                        }
                        pokemonType={move.type || "normal"}
                        disabled={!isUltimateReady}>
                        <img
                          alt={move.type || "normal"}
                          src={POKEMON_TYPE_ICONS[move.type || "normal"]}
                          width={24}
                          height={24}
                          loading="lazy"
                        />
                        <Text as="span" variant="outlined">
                          {move.name}
                        </Text>
                      </T.StyledButton>
                    );
                  })}

                  {/* --- BASIC ATTACK (CHARGER) --- */}
                  <T.BasicAttackButton
                    type="button"
                    style={{ gridColumn: "span 2 / span 2" }}
                    disabled={isInputLocked}
                    onClick={actions.basicAttack}>
                    <Text
                      variant="outlined"
                      size="lg"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}>
                      <span
                        style={{
                          position: "relative",
                          width: "1.75rem",
                          height: "1.5rem",
                          flexShrink: 0,
                        }}>
                        <Gloves
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            zIndex: 2,
                          }}
                        />
                        <Gloves
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            position: "absolute",
                            left: "0.15rem",
                            top: 0,
                          }}
                          color="#000"
                        />
                      </span>
                      <span>Basic Attack (Charge)</span>
                    </Text>
                  </T.BasicAttackButton>

                  {playerPokemon.moves.length === 0 && (
                    <T.StyledButton
                      type="button"
                      onClick={actions.useStruggle}
                      disabled={isInputLocked}>
                      Struggle
                    </T.StyledButton>
                  )}
                </T.AttackGrid>
              ) : (
                <>
                  {state.playerCurrentHP <= 0 ? (
                    <T.ResetButton
                      type="button"
                      onClick={actions.runAway}
                      style={{ backgroundColor: "#ef4444" }}>
                      <Text variant="outlined">Run Away (Back to Home)</Text>
                    </T.ResetButton>
                  ) : (
                    <T.ResetButton type="button" onClick={actions.findNew}>
                      <Text as="span" variant="outlined">
                        Find New Opponent
                      </Text>
                    </T.ResetButton>
                  )}
                </>
              )}
            </T.BattleMenu>

            <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #ccc" }}>
              {!state.gameOver && (
                <T.ResetButton
                  onClick={actions.surrender}
                  style={{ backgroundColor: "#ef4444", marginTop: 16 }}>
                  <Text variant="outlined">Surrender (Back to My Pokemon)</Text>
                </T.ResetButton>
              )}
            </div>
          </T.InterfaceWrapper>
        </T.BattleField>
      </T.BattleWrapper>
    </T.Container>
  );
};

export default VersusBattleModule;
