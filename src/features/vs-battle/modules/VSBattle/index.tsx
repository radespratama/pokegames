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

              {/* Damage Text Enemy */}
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
                        <T.DamageText isCritical={damage.isCritical}>
                          {damage.value === 0 ? "Miss" : damage.value}
                          {damage.isCritical && "!"}
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

              {/* Damage Text Player */}
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
                        <T.DamageText isCritical={damage.isCritical}>
                          {damage.value}
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
                <T.LogEntry key={idx}>&gt; {log}</T.LogEntry>
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
                  {playerPokemon.moves.map((move, idx) => (
                    <T.StyledButton
                      key={idx}
                      onClick={() =>
                        actions.attack(move.name, move.power || 10)
                      }
                      disabled={!state.isPlayerTurn}>
                      {move.name}
                    </T.StyledButton>
                  ))}
                  {playerPokemon.moves.length === 0 && (
                    <T.StyledButton
                      onClick={() => actions.attack("Struggle", 10)}
                      disabled={!state.isPlayerTurn}>
                      Struggle
                    </T.StyledButton>
                  )}
                </T.AttackGrid>
              ) : (
                <>
                  {state.playerCurrentHP <= 0 ? (
                    <T.ResetButton
                      onClick={actions.runAway}
                      style={{ backgroundColor: "#ef4444" }}>
                      <Text variant="outlined">Run Away (Back to Home)</Text>
                    </T.ResetButton>
                  ) : (
                    <T.ResetButton onClick={actions.findNew}>
                      <Text as="span" variant="outlined">
                        Find New Opponent
                      </Text>
                    </T.ResetButton>
                  )}
                </>
              )}

              {!state.gameOver && (
                <T.ResetButton
                  onClick={actions.surrender}
                  style={{ backgroundColor: "#ef4444", marginTop: 16 }}>
                  <Text variant="outlined">Surrender (Back to My Pokemon)</Text>
                </T.ResetButton>
              )}
            </T.BattleMenu>
          </T.InterfaceWrapper>
        </T.BattleField>
      </T.BattleWrapper>
    </T.Container>
  );
};

export default VersusBattleModule;
