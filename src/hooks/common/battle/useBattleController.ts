import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useBattleMechanics } from "./useBattleMechanics";
import { usePokemonExperience } from "./usePokemonExperience";
import { useDamageSystem } from "./useDamageSystem";

interface IBattleControllerProps {
  playerPokemon: any;
  enemy: any;
  updateEnemyState: (updates: any) => void;
  key: {
    LS_PLAYER_HP_KEY: string;
    LS_ENEMY_KEY: string;
  };
}

const HIT_EFFECT_DURATION = 600;

export const useBattleController = ({
  playerPokemon,
  enemy,
  updateEnemyState,
  key,
}: IBattleControllerProps) => {
  const navigate = useNavigate();
  const isMounted = useRef<boolean>(true);

  const [playerCurrentHP, setPlayerCurrentHP] = useState(0);
  const [enemyCurrentHP, setEnemyCurrentHP] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [battleLog, setBattleLog] = useState<Array<string>>([]);

  const [activeHitTarget, setActiveHitTarget] = useState<
    "player" | "enemy" | null
  >(null);
  const [hitKey, setHitKey] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const { calculateDamage } = useBattleMechanics();
  const { addExp, calculateExpGain } = usePokemonExperience();
  const { damages, showDamage } = useDamageSystem();

  const isBattleInitialized = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!playerPokemon || !enemy) return;
    if (isBattleInitialized.current) return;

    const savedPlayerHP = localStorage.getItem(key.LS_PLAYER_HP_KEY);
    const initialPlayerHP = savedPlayerHP
      ? Math.min(parseInt(savedPlayerHP), playerPokemon.stats.hp)
      : playerPokemon.stats.hp;
    setPlayerCurrentHP(initialPlayerHP);

    const savedEnemyHP =
      enemy.current_hp !== undefined ? enemy.current_hp : enemy.stats.hp;
    setEnemyCurrentHP(savedEnemyHP);

    if (enemy.is_defeated || savedEnemyHP <= 0) {
      setBattleLog([`${enemy.name} is already defeated!`]);
      setGameOver(true);
      setShowIntro(false);
      localStorage.removeItem(key.LS_PLAYER_HP_KEY);
    } else {
      setBattleLog([`Wild ${enemy.name} appeared!`]);

      // Debug Validation Stats
      console.log(
        `[Stats Check] ${enemy.name} Lvl.${enemy.battle_state.level} - HP: ${enemy.stats.hp}, Atk: ${enemy.stats.attack}`,
      );
    }

    isBattleInitialized.current = true;
  }, [playerPokemon, enemy, key.LS_PLAYER_HP_KEY]);

  const safeSetState = (setter: any, value: any) => {
    if (isMounted.current) setter(value);
  };

  const triggerHitEffect = (target: "player" | "enemy") => {
    if (!isMounted.current) return;
    setActiveHitTarget(target);
    setHitKey((prev) => prev + 1);
    setTimeout(() => {
      if (isMounted.current) setActiveHitTarget(null);
    }, HIT_EFFECT_DURATION);
  };

  const clearStorage = () => {
    localStorage.removeItem(key.LS_PLAYER_HP_KEY);
    localStorage.removeItem(key.LS_ENEMY_KEY);
  };

  // --- BATTLE END HANDLERS ---
  const handleWin = () => {
    if (!enemy || !playerPokemon) return;
    updateEnemyState({ current_hp: 0, is_defeated: true });
    localStorage.removeItem(key.LS_PLAYER_HP_KEY);

    const expReward = calculateExpGain(
      enemy.battle_state.level,
      enemy.base_experience || 60,
    );

    const result = addExp(playerPokemon.nickname, expReward);

    const winLogs = ["Enemy Fainted! You Win!", `Gained ${expReward} EXP.`];
    if (result.leveled) {
      winLogs.push(
        `${playerPokemon.nickname} grew to Level ${result.newLevel}!`,
        "Stats increased!",
      );
    }

    safeSetState(setBattleLog, (prev: Array<string>) => [...prev, ...winLogs]);
    safeSetState(setGameOver, true);
  };

  const handleLose = () => {
    if (!enemy || !playerPokemon) return;
    localStorage.removeItem(key.LS_PLAYER_HP_KEY);

    const baseExp = enemy.base_experience || 60;

    const partialExp = Math.floor(
      calculateExpGain(enemy.battle_state.level, baseExp) / 4,
    );

    const result = addExp(playerPokemon.nickname, partialExp);

    const loseLogs = [
      `${playerPokemon.nickname} Fainted...`,
      `Gained ${partialExp} EXP.`,
    ];
    if (result.leveled) {
      loseLogs.push(
        `${playerPokemon.nickname} grew to Level ${result.newLevel}!`,
      );
    }

    safeSetState(setBattleLog, (prev: Array<string>) => [...prev, ...loseLogs]);
    safeSetState(setGameOver, true);
    updateEnemyState({ current_hp: enemy.stats.hp, is_defeated: false });
  };

  // --- ACTIONS ---
  const performEnemyTurn = useCallback(() => {
    if (gameOver || !enemy || !playerPokemon || !isMounted.current) return;

    triggerHitEffect("player");

    setTimeout(() => {
      if (!isMounted.current) return;

      const randomMove =
        enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
      const moveName = randomMove?.name || "Tackle";
      const movePower = randomMove?.power || 10;

      const result = calculateDamage(enemy, playerPokemon, movePower);
      const isCritical = result.desc.some((d) =>
        d.toLowerCase().includes("critical"),
      );

      showDamage("player", result.damage, isCritical);

      const newHP = Math.max(0, playerCurrentHP - result.damage);
      setPlayerCurrentHP(newHP);
      localStorage.setItem(key.LS_PLAYER_HP_KEY, newHP.toString());

      setBattleLog((prev) => [
        ...prev,
        `Enemy ${enemy.name} used ${moveName}!`,
        ...result.desc,
        ...(result.isMiss ? [] : [`Dealt ${result.damage} damage.`]),
      ]);

      if (newHP <= 0) {
        handleLose();
      } else {
        setIsPlayerTurn(true);
      }
    }, 200);
  }, [enemy, playerPokemon, playerCurrentHP, gameOver]);

  const performPlayerAttack = (moveName: string, movePower: number) => {
    if (!isPlayerTurn || gameOver || !playerPokemon || !enemy) return;

    triggerHitEffect("enemy");

    setTimeout(() => {
      if (!isMounted.current) return;

      const result = calculateDamage(playerPokemon, enemy, movePower);
      const isCritical = result.desc.some((d) =>
        d.toLowerCase().includes("critical"),
      );

      showDamage("enemy", result.damage, isCritical);

      const newHP = Math.max(0, enemyCurrentHP - result.damage);
      setEnemyCurrentHP(newHP);
      updateEnemyState({ current_hp: newHP });

      setBattleLog((prev) => [
        ...prev,
        `${playerPokemon.nickname} used ${moveName}!`,
        ...result.desc,
        ...(result.isMiss ? [] : [`Dealt ${result.damage} damage.`]),
      ]);

      if (newHP <= 0) {
        handleWin();
      } else {
        setIsPlayerTurn(false);

        setTimeout(() => {
          if (isMounted.current) performEnemyTurn();
        }, 1500);
      }
    }, 200);
  };

  const actions = {
    attack: performPlayerAttack,
    runAway: () => {
      clearStorage();
      navigate({ to: "/my-pokemon" });
    },
    findNew: () => {
      clearStorage();
      window.location.reload();
    },
    surrender: () => {
      clearStorage();
      navigate({ to: "/my-pokemon" });
    },
    setShowIntro,
  };

  return {
    state: {
      playerCurrentHP,
      enemyCurrentHP,
      isPlayerTurn,
      gameOver,
      battleLog,
      showIntro,
      activeHitTarget,
      hitKey,
      damages,
    },
    actions,
  };
};
