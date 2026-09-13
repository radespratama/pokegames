import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearTimeout, setTimeout } from "worker-timers";
import { useDamageSystem } from "./useDamageSystem";
import { usePokemonExperience } from "./usePokemonExperience";
import type { IMyPokemon } from "@/services/api/pokemons";
import type { ExpGrant } from "@/utils/leveling";
import type {
  BattleAction,
  BattleEvent,
  BattleState,
  Side,
} from "@/features/vs-battle/engine/types";
import {
  createBattle,
  endIntro as engineEndIntro,
  forcedSwitch as engineForcedSwitch,
  surrender as engineSurrender,
  resolveRound,
} from "@/features/vs-battle/engine/reducer";

export const BATTLE_SESSION_KEY = "pokegames@battle-session";

export interface BattleSession {
  mode: "1v1" | "3v3";
  team: Array<string>; // nicknames, order = pick order
  seed: number;
  state: BattleState | null;
  /** UI reward ledger is persisted with engine state so a reload keeps the summary complete. */
  expGained?: Array<ExpGrant>;
  levelUps?: Array<{ nickname: string; level: number }>;
}

export function loadSession(): BattleSession | null {
  try {
    const raw = localStorage.getItem(BATTLE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as BattleSession) : null;
  } catch {
    return null;
  }
}

export const clearSession = () => localStorage.removeItem(BATTLE_SESSION_KEY);

const saveSession = (s: BattleSession) =>
  localStorage.setItem(BATTLE_SESSION_KEY, JSON.stringify(s));

/** Delays between queued events, ms. */
const STEP_MS = { hit: 700, switch: 600, faint: 700, log: 0, exp: 0 } as const;
const HIT_EFFECT_MS = 600;
/** Extra dwell so the ULTIMATE banner is readable before the next event. */
const ULT_BANNER_MS = 1100;

interface Opts {
  mode: "1v1" | "3v3";
  playerTeam: Array<IMyPokemon>;
  enemyTeam: Array<IMyPokemon> | null;
  seed: number;
  team: Array<string>;
}

export function useBattleEngine({
  mode,
  playerTeam,
  enemyTeam,
  seed,
  team,
}: Opts) {
  const navigate = useNavigate();
  const { damages, showDamage } = useDamageSystem();
  const { grantExp } = usePokemonExperience();

  const [state, setState] = useState<BattleState | null>(null);
  const [hp, setHp] = useState<Record<Side, Array<number>>>({
    player: [],
    enemy: [],
  });
  const [activeHitTarget, setActiveHitTarget] = useState<Side | null>(null);
  const [active, setActive] = useState<Record<Side, number>>({
    player: 0,
    enemy: 0,
  });
  const [hitKey, setHitKey] = useState(0);
  const [ultimateCast, setUltimateCast] = useState<{
    name: string;
    side: Side;
    key: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [levelUps, setLevelUps] = useState<
    Array<{ nickname: string; level: number }>
  >([]);
  const [expGained, setExpGained] = useState<Array<ExpGrant>>([]);
  const expGainedRef = useRef<Array<ExpGrant>>([]);
  const levelUpsRef = useRef<Array<{ nickname: string; level: number }>>([]);
  const timers = useRef<Array<number>>([]);

  // --- init: restore or create ---
  useEffect(() => {
    if (state || !enemyTeam) return;
    const saved = loadSession();
    const sameBattle =
      saved?.state &&
      saved.mode === mode &&
      saved.seed === seed &&
      saved.team.join() === team.join();
    const initial =
      sameBattle && saved.state
        ? { ...saved.state, events: [] }
        : createBattle(mode, playerTeam, enemyTeam);
    setState(initial);
    setHp({
      player: initial.player.team.map((c) => c.currentHp),
      enemy: initial.enemy.team.map((c) => c.currentHp),
    });
    setActive({ player: initial.player.active, enemy: initial.enemy.active });
    const restoredExp = sameBattle ? (saved.expGained ?? []) : [];
    const restoredLevels = sameBattle ? (saved.levelUps ?? []) : [];
    expGainedRef.current = restoredExp;
    levelUpsRef.current = restoredLevels;
    setExpGained(restoredExp);
    setLevelUps(restoredLevels);
    saveSession({
      mode,
      team,
      seed,
      state: initial,
      expGained: restoredExp,
      levelUps: restoredLevels,
    });
  }, [state, enemyTeam]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const later = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  /** Plays the event queue sequentially, then commits the final state. */
  const playback = useCallback(
    (next: BattleState) => {
      setBusy(true);
      let delay = 0;
      next.events.forEach((ev: BattleEvent) => {
        later(delay, () => {
          if (ev.type === "hit") {
            const playImpact = () => {
              setActiveHitTarget(ev.target);
              setHitKey((k) => k + 1);
              showDamage(ev.target, ev.damage, ev.isCritical, ev.effectiveness);
              setHp((prev) => ({
                ...prev,
                [ev.target]: prev[ev.target].map((v, i) =>
                  i === ev.index ? ev.hpAfter : v,
                ),
              }));
              later(HIT_EFFECT_MS, () => setActiveHitTarget(null));
            };

            if (ev.ultimate) {
              const name = ev.ultimate;
              const caster: Side = ev.target === "player" ? "enemy" : "player";
              setUltimateCast((u) => ({
                name,
                side: caster,
                key: (u?.key ?? 0) + 1,
              }));
              later(ULT_BANNER_MS, () => {
                setUltimateCast(null);
                playImpact();
              });
            } else {
              playImpact();
            }
          }
          if (ev.type === "switch")
            setActive((prev) => ({ ...prev, [ev.side]: ev.to }));
          if (ev.type === "exp") {
            const nextExp = [...expGainedRef.current, ...ev.grants];
            expGainedRef.current = nextExp;
            setExpGained(nextExp);
            const ups = ev.grants.flatMap((g) =>
              grantExp(g).map((level) => ({ nickname: g.nickname, level })),
            );
            if (ups.length) {
              const nextLevels = [...levelUpsRef.current, ...ups];
              levelUpsRef.current = nextLevels;
              setLevelUps(nextLevels);
            }
          }
        });
        delay +=
          STEP_MS[ev.type] +
          (ev.type === "hit" && ev.ultimate ? ULT_BANNER_MS : 0);
      });
      later(delay, () => {
        setState(next);
        setBusy(false);
        if (next.phase === "over") clearSession();
        else
          saveSession({
            mode,
            team,
            seed,
            state: { ...next, events: [] },
            expGained: expGainedRef.current,
            levelUps: levelUpsRef.current,
          });
      });
    },
    [grantExp, showDamage],
  );

  const act = useCallback(
    (a: BattleAction) => {
      if (!state || busy || state.phase !== "select") return;
      const next = resolveRound(state, a);
      if (next !== state) playback(next);
    },
    [state, busy, playback],
  );

  const forcedSwitch = useCallback(
    (to: number) => {
      if (!state || busy) return;
      const next = engineForcedSwitch(state, to);
      if (next !== state) playback(next);
    },
    [state, busy, playback],
  );

  const endIntro = useCallback(() => {
    setState((s) => (s ? engineEndIntro(s) : s));
  }, []);

  const surrender = useCallback(() => {
    if (!state) return;
    const next = engineSurrender(state);
    setState(next);
    clearSession();
  }, [state]);

  const leave = useCallback(() => {
    clearSession();
    navigate({ to: "/my-pokemon" });
  }, [navigate]);

  const findNew = useCallback(() => {
    clearSession();
    navigate({
      to: "/vs-battle",
      search: { mode, team: team.join(","), seed: Date.now() },
    });
  }, [navigate, mode, team]);

  const view = useMemo(
    () => ({
      hp,
      activeHitTarget,
      hitKey,
      damages,
      busy,
      levelUps,
      expGained,
      active,
      ultimateCast,
    }),
    [
      hp,
      activeHitTarget,
      hitKey,
      damages,
      busy,
      levelUps,
      expGained,
      active,
      ultimateCast,
    ],
  );

  return {
    state,
    view,
    actions: { act, forcedSwitch, endIntro, surrender, leave, findNew },
  };
}
