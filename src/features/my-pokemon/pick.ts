export type BattleMode = "1v1" | "3v3";

export const BATTLE_MODE_KEY = "pokegames@battle-mode";

export const maxPick = (mode: BattleMode) => (mode === "3v3" ? 3 : 1);

export { toSlug } from "@/utils/pokemon-utils";

export function togglePick(
  picked: Array<string>,
  nickname: string,
  max: number,
): Array<string> {
  if (picked.includes(nickname)) return picked.filter((n) => n !== nickname);
  if (max === 1) return [nickname];
  if (picked.length >= max) return picked;
  return [...picked, nickname];
}

export const loadMode = (): BattleMode =>
  localStorage.getItem(BATTLE_MODE_KEY) === "3v3" ? "3v3" : "1v1";
export const saveMode = (mode: BattleMode) =>
  localStorage.setItem(BATTLE_MODE_KEY, mode);
