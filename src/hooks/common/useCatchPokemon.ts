import { useRef, useState } from "react";
import { clearTimeout, setTimeout } from "worker-timers";
import { shakeChance } from "@/utils/pokemon-utils";

/** Three wobbles before the ball clicks, like the games. */
const SHAKES = 3;
const SHAKE_MS = 900;
const REVEAL_MS = 1600;

interface UseCatchPokemonReturn {
  isCatching: boolean;
  isCaught: boolean;
  isEndPhase: boolean;
  /** 0 while idle, then 1..SHAKES as the ball wobbles. */
  shake: number;
  totalShakes: number;
  throwPokeball: () => Promise<void>;
  resetCatch: () => void;
}

export const useCatchPokemon = (
  onCatchSuccess?: () => void,
  /** Overall odds for this species; the wobbles subdivide it. */
  chance = 0.5,
): UseCatchPokemonReturn => {
  const shakeTimeout = useRef<NodeJS.Timeout | number>(0);
  const throwBallTimeout = useRef<NodeJS.Timeout | number>(0);

  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);
  const [shake, setShake] = useState<number>(0);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current as number);
      shakeTimeout.current = setTimeout(resolve, ms);
    });

  /** Each wobble can break the ball open early, so a near-catch is visible. */
  async function rollShakes(): Promise<boolean> {
    const perShake = shakeChance(chance, SHAKES);

    for (let round = 1; round <= SHAKES; round++) {
      setShake(round);
      await wait(SHAKE_MS);

      if (Math.random() >= perShake) return false;
    }

    return true;
  }

  async function throwPokeball(): Promise<void> {
    if (isCatching) return;

    setIsCatching(true);
    setShake(0);

    const isCaughtPokemon = await rollShakes();

    setIsCatching(false);
    setShake(0);
    setIsEndPhase(true);
    setIsCaught(isCaughtPokemon);

    if (throwBallTimeout.current)
      clearTimeout(throwBallTimeout.current as number);

    // A caught Pokemon holds on the reveal before the nickname prompt.
    throwBallTimeout.current = setTimeout(
      () => {
        setIsEndPhase(false);
        if (isCaughtPokemon && onCatchSuccess) {
          onCatchSuccess();
        }
      },
      isCaughtPokemon ? REVEAL_MS : 1200,
    );
  }

  function resetCatch(): void {
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current as number);
    if (throwBallTimeout.current)
      clearTimeout(throwBallTimeout.current as number);

    setIsCatching(false);
    setIsCaught(false);
    setIsEndPhase(false);
    setShake(0);
  }

  return {
    isCatching,
    isCaught,
    isEndPhase,
    shake,
    totalShakes: SHAKES,
    throwPokeball,
    resetCatch,
  };
};
