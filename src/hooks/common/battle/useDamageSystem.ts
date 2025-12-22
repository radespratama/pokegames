import { useState } from "react";

type DamageEvent = {
  id: number;
  value: number;
  isCritical: boolean;
  target: "player" | "enemy";
};

export const useDamageSystem = () => {
  const [damages, setDamages] = useState<Array<DamageEvent>>([]);

  const showDamage = (
    target: "player" | "enemy",
    value: number,
    isCritical: boolean = false,
  ) => {
    const id = Date.now() + Math.random();
    const newDamage: DamageEvent = { id, value, isCritical, target };

    setDamages((prev) => [...prev, newDamage]);

    setTimeout(() => {
      setDamages((prev) => prev.filter((d) => d.id !== id));
    }, 1000);
  };

  return { damages, showDamage };
};
