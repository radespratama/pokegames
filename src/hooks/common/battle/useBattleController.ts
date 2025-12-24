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
const GAUGE_CHARGE_PER_HIT = 20;

export const useBattleController = ({
  playerPokemon,
  enemy,
  updateEnemyState,
  key,
}: IBattleControllerProps) => {
  const navigate = useNavigate();
  const isMounted = useRef<boolean>(true);

  const [playerCurrentHP, setPlayerCurrentHP] = useState<number>(0);
  const [enemyCurrentHP, setEnemyCurrentHP] = useState<number>(0);

  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<Array<string>>([]);

  const [ultimateGauge, setUltimateGauge] = useState<number>(0);
  const [enemyUltimateGauge, setEnemyUltimateGauge] = useState<number>(0);

  const [activeHitTarget, setActiveHitTarget] = useState<
    "player" | "enemy" | null
  >(null);
  const [hitKey, setHitKey] = useState<number>(0);
  const [showIntro, setShowIntro] = useState<boolean>(true);

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

    const enemyMaxHP = enemy.stats.hp;

    setPlayerCurrentHP(initialPlayerHP);

    const savedEnemyHP =
      enemy.current_hp !== undefined ? enemy.current_hp : enemyMaxHP;
    setEnemyCurrentHP(savedEnemyHP);

    if (enemy.is_defeated || savedEnemyHP <= 0) {
      setBattleLog([`${enemy.name} is already defeated!`]);
      setGameOver(true);
      setShowIntro(false);
      localStorage.removeItem(key.LS_PLAYER_HP_KEY);
    } else {
      setBattleLog([`Wild ${enemy.name} appeared!`]);
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
    setIsProcessingTurn(false);
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
    setIsProcessingTurn(false);
  };

  // --- ENEMY TURN ---
  const performEnemyTurn = useCallback(() => {
    if (gameOver || !enemy || !playerPokemon || !isMounted.current) return;

    triggerHitEffect("player");

    setTimeout(() => {
      if (!isMounted.current) return;

      const isUltimateReady = enemyUltimateGauge >= 100;
      let moveName = "";
      let result;
      let logHeader = "";

      if (!isUltimateReady) {
        // --- BASIC ATTACK (CHARGE) ---
        moveName = "Basic Attack";
        setEnemyUltimateGauge((prev) =>
          Math.min(100, prev + GAUGE_CHARGE_PER_HIT),
        );

        result = calculateDamage(enemy, playerPokemon, 20, "basic");

        const cleanDesc = [];
        if (result.isCritical) cleanDesc.push("Critical hit!");
        result.desc = cleanDesc;

        logHeader = `${enemy.name} used Basic Attack!`;
      } else {
        // --- ULTIMATE (FULL DAMAGE & ELEMENT) ---
        const randomMove =
          enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
        moveName = randomMove?.name || "Tackle";
        let movePower = randomMove?.power || 40;
        const moveType = randomMove?.type || "normal";

        // Safety Nerf Early Game
        if (enemy.battle_state.level < 5 && movePower > 50) {
          movePower = 50;
        }

        result = calculateDamage(enemy, playerPokemon, movePower, moveType);

        setEnemyUltimateGauge(0);
        logHeader = `>>> ENEMY ULTIMATE: ${moveName.toUpperCase()}! <<<`;
      }

      showDamage(
        "player",
        result.damage,
        result.isCritical,
        result.effectiveness,
      );

      const newHP = Math.max(0, playerCurrentHP - result.damage);
      setPlayerCurrentHP(newHP);
      localStorage.setItem(key.LS_PLAYER_HP_KEY, newHP.toString());

      const logMessages = [
        logHeader,
        ...result.desc,
        ...(result.isMiss ? [] : [`Dealt ${result.damage} damage.`]),
      ];

      // Optional Hint
      if (!isUltimateReady) {
        logMessages.push("Enemy is charging power...");
      }

      setBattleLog((prev) => [...prev, ...logMessages]);

      if (newHP <= 0) {
        handleLose();
      } else {
        setIsPlayerTurn(true);
        setIsProcessingTurn(false);
      }
    }, 200);
  }, [enemy, playerPokemon, playerCurrentHP, gameOver, enemyUltimateGauge]);

  // --- PLAYER ACTIONS ---
  const executePlayerAttack = (
    moveName: string,
    damagePayload: {
      damage: number;
      desc: Array<string>;
      isMiss: boolean;
      isCritical: boolean;
      effectiveness: number;
    },
    gaugeGain: number,
    isUltimate: boolean,
  ) => {
    if (
      !isPlayerTurn ||
      gameOver ||
      !playerPokemon ||
      !enemy ||
      isProcessingTurn
    )
      return;

    setIsProcessingTurn(true);
    triggerHitEffect("enemy");

    setTimeout(() => {
      if (!isMounted.current) return;

      const { damage, desc, isMiss, isCritical, effectiveness } = damagePayload;

      // Visual Damage
      showDamage("enemy", damage, isCritical, effectiveness);

      // HP Logic
      const newHP = Math.max(0, enemyCurrentHP - damage);
      setEnemyCurrentHP(newHP);
      updateEnemyState({ current_hp: newHP });

      // Gauge Logic
      if (isUltimate) {
        setUltimateGauge(0);
      } else {
        setUltimateGauge((prev) => Math.min(100, prev + gaugeGain));
      }

      let headerLog = "";
      if (isUltimate) {
        headerLog = `>>> ULTIMATE SKILL: ${moveName.toUpperCase()}! <<<`;
      } else {
        headerLog = `${playerPokemon.nickname} used ${moveName}!`;
      }

      const logMessages = [
        headerLog,
        ...desc,
        ...(isMiss ? [] : [`Dealt ${damage} damage.`]),
      ];

      if (!isUltimate && !isMiss) {
        logMessages.push(`Gauge +${gaugeGain}%`);
      }

      setBattleLog((prev) => [...prev, ...logMessages]);

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

  const basicAttack = () => {
    if (isProcessingTurn) return;
    const basicAttackPower = 20;

    const result = calculateDamage(
      playerPokemon,
      enemy,
      basicAttackPower,
      "basic",
    );

    const cleanDesc = [];
    if (result.isCritical) cleanDesc.push("Critical hit!");

    const finalResult = { ...result, desc: cleanDesc, effectiveness: 1 };

    executePlayerAttack(
      "Basic Attack",
      finalResult,
      GAUGE_CHARGE_PER_HIT,
      false,
    );
  };

  const useUltimate = (
    moveName: string,
    movePower: number,
    moveType: string,
  ) => {
    if (ultimateGauge < 100 || isProcessingTurn) return;

    const result = calculateDamage(playerPokemon, enemy, movePower, moveType);
    executePlayerAttack(moveName, result, 0, true);
  };

  const useStruggle = () => {
    if (isProcessingTurn) return;
    const result = calculateDamage(playerPokemon, enemy, 20, "normal");
    executePlayerAttack("Struggle", result, 0, false);
  };

  const actions = {
    basicAttack,
    useUltimate,
    useStruggle,
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
      ultimateGauge,
      isPlayerTurn,
      isProcessingTurn,
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
