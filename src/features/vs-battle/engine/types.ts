import type { IMyPokemon } from "@/services/api/pokemons";
import type { ExpGrant } from "@/utils/leveling";

export type Side = "player" | "enemy";
export type Rng = () => number;

export type BattleAction =
  | { kind: "basic" | "skill1" | "skill2" }
  | { kind: "ultimate"; index: number }
  | { kind: "switch"; to: number };

export interface Combatant extends IMyPokemon {
  currentHp: number;
  gauge: number;
  chainStep: 0 | 1 | 2;
  cooldowns: { skill1: number; skill2: number };
  fainted: boolean;
  /** Has been on the field at least once (for lose EXP). */
  participated: boolean;
}

export interface Team {
  team: Array<Combatant>;
  active: number;
}

export type Phase = "intro" | "select" | "resolving" | "forced-switch" | "over";

export type BattleEvent =
  | {
      type: "hit";
      target: Side;
      index: number;
      damage: number;
      isCritical: boolean;
      effectiveness: number;
      isMiss: boolean;
      hpAfter: number;
      /** Set only when the hit came from an ultimate; drives the ULTIMATE overlay. */
      ultimate?: string;
    }
  | { type: "log"; lines: Array<string> }
  | { type: "faint"; side: Side; index: number }
  | { type: "switch"; side: Side; to: number }
  | { type: "exp"; grants: Array<ExpGrant> };

export interface BattleState {
  mode: "1v1" | "3v3";
  player: Team;
  enemy: Team;
  phase: Phase;
  winner: Side | null;
  log: Array<string>;
  /** Animation queue produced by the last transition. Consumed by the hook. */
  events: Array<BattleEvent>;
}
