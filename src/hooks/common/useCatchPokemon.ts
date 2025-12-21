import { useRef, useState } from "react";
import { clearTimeout, setTimeout } from "worker-timers";

interface UseCatchPokemonReturn {
  isCatching: boolean;
  isCaught: boolean;
  isEndPhase: boolean;
  throwPokeball: () => Promise<void>;
  resetCatch: () => void;
}

export const useCatchPokemon = (
  onCatchSuccess?: () => void,
): UseCatchPokemonReturn => {
  const catchPokemonTimeout = useRef<NodeJS.Timeout | number>(0);
  const throwBallTimeout = useRef<NodeJS.Timeout | number>(0);

  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);

  async function catchPokemon(): Promise<boolean> {
    if (catchPokemonTimeout.current)
      clearTimeout(catchPokemonTimeout.current as number);

    return new Promise<boolean>((resolve) => {
      catchPokemonTimeout.current = setTimeout(() => {
        resolve(Math.random() < 0.5 ? false : true);
      }, 2000);
    });
  }

  async function throwPokeball(): Promise<void> {
    setIsCatching(true);
    const isCaughtPokemon = await catchPokemon();

    setIsCatching(false);
    setIsEndPhase(true);
    setIsCaught(isCaughtPokemon);

    if (throwBallTimeout.current)
      clearTimeout(throwBallTimeout.current as number);

    throwBallTimeout.current = setTimeout(() => {
      setIsEndPhase(false);
      if (isCaughtPokemon && onCatchSuccess) {
        onCatchSuccess();
      }
    }, 1200);
  }

  function resetCatch(): void {
    setIsCatching(false);
    setIsCaught(false);
    setIsEndPhase(false);
  }

  return {
    isCatching,
    isCaught,
    isEndPhase,
    throwPokeball,
    resetCatch,
  };
};
