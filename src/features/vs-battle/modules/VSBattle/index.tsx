import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import * as T from "./index.style";
import BattleIntro from "@/features/vs-battle/components/shared/BattleIntro";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { useSpawnEnemy } from "@/hooks/common/battle/useSpawnEnemy";
import { Text } from "@/components/ui";

interface IVersusBattleModuleProps {
  pokemonNicknameParam: string;
}

const VersusBattleModule = ({
  pokemonNicknameParam,
}: IVersusBattleModuleProps) => {
  const navigate = useNavigate();

  const formattedNickname = pokemonNicknameParam
    .replace(/-/g, " ")
    .toUpperCase();

  const { pokemons } = usePokemonStore();
  const playerPokemon = pokemons.find(
    (p) => p.nickname.toUpperCase() === formattedNickname,
  );

  const { enemy, isLoadingEnemy } = useSpawnEnemy({
    userPokemon: {
      level: playerPokemon?.battle_state.level || 1,
      experience: playerPokemon?.battle_state.experience || 0,
    },
  });

  const maxPlayerHP = playerPokemon?.stats.hp || 1;
  const maxEnemyHP = enemy?.stats.hp || 1;

  const [playerCurrentHP, setPlayerCurrentHP] = useState(0);
  const [enemyCurrentHP, setEnemyCurrentHP] = useState(0);

  const [battleLog, setBattleLog] = useState<Array<string>>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (playerPokemon && enemy) {
      setPlayerCurrentHP(playerPokemon.stats.hp);
      setEnemyCurrentHP(enemy.stats.hp);
      setBattleLog([`Wild ${enemy.name} appeared!`]);
    }
  }, [playerPokemon, enemy]);

  const playerHPPercentage = (playerCurrentHP / maxPlayerHP) * 100;
  const enemyHPPercentage = (enemyCurrentHP / maxEnemyHP) * 100;

  const handlePlayerWin = () => {
    setBattleLog((prev) => [...prev, "Enemy Fainted! You Win!"]);
    setGameOver(true);
  };

  const handlePlayerLose = () => {
    setBattleLog((prev) => [
      ...prev,
      `${playerPokemon?.nickname} Fainted... You Lose!`,
    ]);
    setGameOver(true);
  };

  const performPlayerAttack = (moveName: string, movePower: number) => {
    if (!isPlayerTurn || gameOver) return;

    const damageDealt = Math.floor(movePower / 2);
    const newEnemyHP = Math.max(0, enemyCurrentHP - damageDealt);
    setEnemyCurrentHP(newEnemyHP);

    setBattleLog((prev) => [
      ...prev,
      `${playerPokemon?.nickname} used ${moveName}! Dealt ${damageDealt} damage.`,
    ]);

    if (newEnemyHP <= 0) {
      handlePlayerWin();
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(performEnemyTurn, 1500);
  };

  const performEnemyTurn = () => {
    if (gameOver || !enemy) return;

    const randomMove =
      enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
    const moveName = randomMove.name || "Tackle";
    const movePower = randomMove.power || 10;

    const damageDealt = Math.floor(movePower / 2);
    const newPlayerHP = Math.max(0, playerCurrentHP - damageDealt);
    setPlayerCurrentHP(newPlayerHP);

    setBattleLog((prev) => [
      ...prev,
      `Enemy ${enemy.name} used ${moveName}! Dealt ${damageDealt} damage.`,
    ]);

    if (newPlayerHP <= 0) {
      handlePlayerLose();
      return;
    }

    setIsPlayerTurn(true);
  };

  const resetGame = () => {
    localStorage.removeItem("pokegames_current_enemy");
    window.location.reload();
  };

  const goBackToMyPokemon = () => {
    navigate({ to: "/my-pokemon" });
  };

  if (!playerPokemon) {
    return (
      <T.Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}>
        <Text variant="default" size="xl">
          Pokemon Not Found!
        </Text>
        <T.StyledButton onClick={goBackToMyPokemon}>
          Back to My Pokemon
        </T.StyledButton>
      </T.Container>
    );
  }

  if (isLoadingEnemy && !enemy) return <T.Container />;

  const playerDisplaySprite = playerPokemon.sprite_back || playerPokemon.sprite;

  return (
    <T.Container>
      <AnimatePresence>
        {showIntro && (
          <BattleIntro
            player={playerPokemon}
            enemy={enemy}
            onComplete={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <T.BattleWrapper>
        <T.BattleField>
          {/* ENEMY SECTION */}
          <T.EnemySection>
            <T.EnemyInfo>
              <T.InfoBox>
                <T.CharacterName>{enemy?.name}</T.CharacterName>
                <T.HPBarContainer>
                  <T.HPBar width={enemyHPPercentage} color="#ef4444" />
                </T.HPBarContainer>
                <T.HPText>
                  {enemyCurrentHP}/{maxEnemyHP} HP
                </T.HPText>
                <T.HPText>Lvl. {enemy?.battle_state.level}</T.HPText>
              </T.InfoBox>
            </T.EnemyInfo>

            <T.EnemySpriteWrapper>
              <AnimatePresence>
                {enemyCurrentHP > 0 && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
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
                    <T.Shadow />
                  </motion.div>
                )}
              </AnimatePresence>
            </T.EnemySpriteWrapper>
          </T.EnemySection>

          {/* PLAYER SECTION */}
          <T.PlayerSection>
            <T.PlayerSpriteWrapper>
              <AnimatePresence>
                {playerCurrentHP > 0 && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
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
                  {playerCurrentHP}/{maxPlayerHP} HP
                </T.HPText>
                <T.HPText>Lvl. {playerPokemon.battle_state.level}</T.HPText>
              </T.PlayerInfoBox>
            </T.PlayerInfo>
          </T.PlayerSection>

          <T.InterfaceWrapper>
            <T.BattleLog>
              <T.LogTitle>Battle Log</T.LogTitle>
              {battleLog.map((log, idx) => (
                <T.LogEntry key={idx}>&gt; {log}</T.LogEntry>
              ))}
            </T.BattleLog>

            <T.BattleMenu>
              <T.MenuTitle>
                {gameOver
                  ? "Game Over"
                  : isPlayerTurn
                    ? `What will ${playerPokemon.nickname} do?`
                    : `${enemy?.name} is attacking...`}
              </T.MenuTitle>

              {!gameOver ? (
                <T.AttackGrid>
                  {playerPokemon.moves.map((move, idx) => (
                    <T.StyledButton
                      key={idx}
                      onClick={() =>
                        performPlayerAttack(move.name, move.power || 10)
                      }
                      disabled={!isPlayerTurn}>
                      {move.name}
                    </T.StyledButton>
                  ))}

                  {playerPokemon.moves.length === 0 && (
                    <T.StyledButton
                      onClick={() => performPlayerAttack("Struggle", 10)}
                      disabled={!isPlayerTurn}>
                      Struggle
                    </T.StyledButton>
                  )}
                </T.AttackGrid>
              ) : (
                <>
                  {playerCurrentHP <= 0 ? (
                    <T.ResetButton
                      onClick={goBackToMyPokemon}
                      style={{ backgroundColor: "#ef4444" }}>
                      <Text>Run Away (Back to Home)</Text>
                    </T.ResetButton>
                  ) : (
                    <T.ResetButton onClick={resetGame}>
                      <Text as="span" variant="outlined">
                        Find New Opponent
                      </Text>
                    </T.ResetButton>
                  )}
                </>
              )}
            </T.BattleMenu>
          </T.InterfaceWrapper>
        </T.BattleField>
      </T.BattleWrapper>
    </T.Container>
  );
};

export default VersusBattleModule;
