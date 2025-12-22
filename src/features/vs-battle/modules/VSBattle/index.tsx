import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";

import * as T from "./index.style";
import BattleIntro from "@/features/vs-battle/components/shared/BattleIntro";
import { usePokemonStore } from "@/store/app/pokemonStore";
import {
  LS_ENEMY_KEY,
  useSpawnEnemy,
} from "@/hooks/common/battle/useSpawnEnemy";
import { useBattleMechanics } from "@/hooks/common/battle/useBattleMechanics";
import { usePokemonExperience } from "@/hooks/common/battle/usePokemonExperience";
import { Text } from "@/components/ui";

interface IVersusBattleModuleProps {
  pokemonNicknameParam: string;
}

const LS_PLAYER_HP_KEY = "pokegames@battle-player-hp";

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

  const { enemy, isLoadingEnemy, updateEnemyState } = useSpawnEnemy({
    userPokemon: {
      level: playerPokemon?.battle_state.level || 1,
      experience: playerPokemon?.battle_state.experience || 0,
    },
  });

  const { calculateDamage } = useBattleMechanics();
  const { addExp, calculateExpGain } = usePokemonExperience();

  const maxPlayerHP = playerPokemon?.stats.hp || 1;
  const maxEnemyHP = enemy?.stats.hp || 1;

  const [playerCurrentHP, setPlayerCurrentHP] = useState(0);
  const [enemyCurrentHP, setEnemyCurrentHP] = useState(0);

  const [battleLog, setBattleLog] = useState<Array<string>>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const isBattleInitialized = useRef(false);

  useEffect(() => {
    if (!playerPokemon || !enemy) return;

    if (!isBattleInitialized.current) {
      const savedPlayerHP = localStorage.getItem(LS_PLAYER_HP_KEY);

      if (savedPlayerHP !== null) {
        const parsedHP = parseInt(savedPlayerHP);
        setPlayerCurrentHP(Math.min(parsedHP, playerPokemon.stats.hp));
      } else {
        setPlayerCurrentHP(playerPokemon.stats.hp);
      }

      const savedEnemyHP =
        (enemy as any).current_hp !== undefined
          ? (enemy as any).current_hp
          : enemy.stats.hp;
      const isEnemyDefeated = (enemy as any).is_defeated;

      setEnemyCurrentHP(savedEnemyHP);

      if (isEnemyDefeated || savedEnemyHP <= 0) {
        setBattleLog([`${enemy.name} is already defeated!`]);
        setGameOver(true);
        setShowIntro(false);

        localStorage.removeItem(LS_PLAYER_HP_KEY);
      } else {
        setBattleLog([`Wild ${enemy.name} appeared!`]);
      }

      isBattleInitialized.current = true;
    }
  }, [playerPokemon, enemy]);

  const playerHPPercentage = (playerCurrentHP / maxPlayerHP) * 100;
  const enemyHPPercentage = (enemyCurrentHP / maxEnemyHP) * 100;

  const clearPlayerHPStorage = () => {
    localStorage.removeItem(LS_PLAYER_HP_KEY);
  };

  // --- LOGIC MENANG ---
  const handlePlayerWin = () => {
    if (!enemy || !playerPokemon) return;

    if (typeof updateEnemyState === "function") {
      updateEnemyState({ current_hp: 0, is_defeated: true } as any);
    }

    clearPlayerHPStorage();

    const expReward = calculateExpGain(
      enemy.battle_state.level,
      enemy.base_experience || 60,
    );

    const result = addExp(playerPokemon.nickname, expReward);

    const winLogs = ["Enemy Fainted! You Win!", `Gained ${expReward} EXP.`];

    if (result.leveled) {
      winLogs.push(
        `${playerPokemon.nickname} grew to Level ${result.newLevel}!`,
      );
      winLogs.push("Stats increased!");
    }

    setBattleLog((prev) => [...prev, ...winLogs]);
    setGameOver(true);
  };

  // --- LOGIC KALAH ---
  const handlePlayerLose = () => {
    if (!enemy || !playerPokemon) return;

    clearPlayerHPStorage();

    const baseExp = enemy.base_experience || 60;
    const fullExp = calculateExpGain(enemy.battle_state.level, baseExp);
    const partialExp = Math.floor(fullExp / 4);

    const result = addExp(playerPokemon.nickname, partialExp);

    const loseLogs = [
      `${playerPokemon.nickname} Fainted... You Lose!`,
      `You gained ${partialExp} EXP for the effort.`,
    ];

    if (result.leveled) {
      loseLogs.push(
        `${playerPokemon.nickname} grew to Level ${result.newLevel}!`,
      );
    }

    setBattleLog((prev) => [...prev, ...loseLogs]);
    setGameOver(true);

    if (typeof updateEnemyState === "function") {
      updateEnemyState({
        current_hp: enemy.stats.hp,
        is_defeated: false,
      });
    }
  };

  // --- ACTION ATTACK PLAYER ---
  const performPlayerAttack = (moveName: string, movePower: number) => {
    if (!isPlayerTurn || gameOver || !playerPokemon || !enemy) return;

    const result = calculateDamage(playerPokemon, enemy, movePower);
    const damageDealt = result.damage;

    const newEnemyHP = Math.max(0, enemyCurrentHP - damageDealt);
    setEnemyCurrentHP(newEnemyHP);

    if (typeof updateEnemyState === "function") {
      updateEnemyState({ current_hp: newEnemyHP } as any);
    }

    const newLogs = [`${playerPokemon.nickname} used ${moveName}!`];

    if (result.desc.length > 0) {
      newLogs.push(...result.desc);
    }

    if (!result.isMiss) {
      newLogs.push(`Dealt ${damageDealt} damage.`);
    }

    setBattleLog((prev) => [...prev, ...newLogs]);

    if (newEnemyHP <= 0) {
      handlePlayerWin();
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(performEnemyTurn, 1500);
  };

  // --- ACTION ATTACK ENEMY ---
  const performEnemyTurn = () => {
    if (gameOver || !enemy || !playerPokemon) return;

    const randomMove =
      enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
    const moveName = randomMove.name || "Tackle";
    const movePower = randomMove.power || 10;

    const result = calculateDamage(enemy, playerPokemon, movePower);
    const damageDealt = result.damage;

    const newPlayerHP = Math.max(0, playerCurrentHP - damageDealt);
    setPlayerCurrentHP(newPlayerHP);

    localStorage.setItem(LS_PLAYER_HP_KEY, newPlayerHP.toString());

    const newLogs = [`Enemy ${enemy.name} used ${moveName}!`];

    if (result.desc.length > 0) {
      newLogs.push(...result.desc);
    }

    if (!result.isMiss) {
      newLogs.push(`Dealt ${damageDealt} damage.`);
    }

    setBattleLog((prev) => [...prev, ...newLogs]);

    if (newPlayerHP <= 0) {
      handlePlayerLose();
      return;
    }

    setIsPlayerTurn(true);
  };

  const resetGame = () => {
    localStorage.removeItem(LS_ENEMY_KEY);
    localStorage.removeItem(LS_PLAYER_HP_KEY);
    window.location.reload();
  };

  const goBackToMyPokemon = () => {
    localStorage.removeItem(LS_PLAYER_HP_KEY);
    localStorage.removeItem(LS_ENEMY_KEY);

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
        <Text variant="outlined" size="xl">
          Pokemon Not Found!
        </Text>
        <T.StyledButton onClick={goBackToMyPokemon} style={{ marginTop: 8 }}>
          <Text variant="outlined" size="base" as="span">
            Back to My Pokemon
          </Text>
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
                    <T.ShadowEnemy />
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
                      <Text variant="outlined">Run Away (Back to Home)</Text>
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

              {!gameOver && (
                <T.ResetButton
                  onClick={goBackToMyPokemon}
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
