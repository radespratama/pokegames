import { chooseEnemyAction } from "./ai";
import { actionPriority, damageInputForAction } from "./action";
import { calculateDamage } from "./damage";
import { CHAIN_ORDER, RULES, overchargeMul } from "./rules";
import type {
  BattleAction,
  BattleEvent,
  BattleState,
  Combatant,
  Rng,
  Side,
  Team,
} from "./types";
import type { IMyPokemon } from "@/services/api/pokemons";
import { koExpGrants, loseExpGrants } from "@/utils/leveling";

export const toCombatant = (p: IMyPokemon): Combatant => ({
  ...p,
  currentHp: p.stats.hp,
  gauge: 0,
  chainStep: 0,
  cooldowns: { skill1: 0, skill2: 0 },
  fainted: false,
  participated: false,
});

export const activeOf = (t: Team) => t.team[t.active];
export const aliveBench = (t: Team) =>
  t.team.map((_, i) => i).filter((i) => i !== t.active && !t.team[i].fainted);
const other = (s: Side): Side => (s === "player" ? "enemy" : "player");
const clampGauge = (g: number) => Math.min(RULES.GAUGE_MAX, Math.max(0, g));

export function availableActions(c: Combatant) {
  return {
    skill1: c.cooldowns.skill1 === 0,
    skill2: c.cooldowns.skill2 === 0,
    ultimate: c.gauge >= RULES.ULT_THRESHOLD && c.moves.length > 0,
  };
}

const patchActive = (t: Team, patch: Partial<Combatant>): Team => ({
  ...t,
  team: t.team.map((c, i) => (i === t.active ? { ...c, ...patch } : c)),
});

const withSide = (s: BattleState, side: Side, t: Team): BattleState =>
  side === "player" ? { ...s, player: t } : { ...s, enemy: t };

const push = (s: BattleState, ev: BattleEvent): BattleState => {
  const events = [...s.events, ev];
  const log = ev.type === "log" ? [...s.log, ...ev.lines] : s.log;
  return { ...s, events, log };
};

export const appendLog = (s: BattleState, lines: Array<string>) =>
  push(s, { type: "log", lines });

const label = (c: Combatant, side: Side) =>
  side === "player" ? c.nickname : c.name;

export function createBattle(
  mode: BattleState["mode"],
  playerTeam: Array<IMyPokemon>,
  enemyTeam: Array<IMyPokemon>,
): BattleState {
  const player = { team: playerTeam.map(toCombatant), active: 0 };
  const enemy = { team: enemyTeam.map(toCombatant), active: 0 };
  player.team[0] = { ...player.team[0], participated: true };
  return {
    mode,
    player,
    enemy,
    phase: "intro",
    winner: null,
    log: [],
    events: [],
  };
}

export const endIntro = (s: BattleState): BattleState =>
  s.phase === "intro"
    ? appendLog({ ...s, phase: "select" }, [
        `A wild ${activeOf(s.enemy).name} appeared!`,
        `Go, ${activeOf(s.player).nickname}!`,
      ])
    : s;

export function surrender(s: BattleState): BattleState {
  if (s.phase === "over") return s;
  return appendLog({ ...s, events: [], phase: "over", winner: "enemy" }, [
    "You gave up...",
  ]);
}

export function forcedSwitch(s: BattleState, to: number): BattleState {
  if (s.phase !== "forced-switch") return s;
  if (!aliveBench(s.player).includes(to)) return s;
  const next = {
    ...s,
    events: [] as Array<BattleEvent>,
    phase: "select" as const,
  };
  return switchTo(next, "player", to);
}

function switchTo(s: BattleState, side: Side, to: number): BattleState {
  const t = side === "player" ? s.player : s.enemy;
  const team = t.team.map((c, i) =>
    i === t.active
      ? { ...c, chainStep: 0 as const }
      : i === to
        ? { ...c, participated: true }
        : c,
  );
  let next = withSide(s, side, { team, active: to });
  next = push(next, { type: "switch", side, to });
  return appendLog(next, [
    `${side === "player" ? "Go" : "Enemy sent out"}, ${label(team[to], side)}!`,
  ]);
}

function isValid(s: BattleState, side: Side, action: BattleAction): boolean {
  const c = activeOf(side === "player" ? s.player : s.enemy);
  const avail = availableActions(c);
  switch (action.kind) {
    case "basic":
      return true;
    case "skill1":
      return avail.skill1;
    case "skill2":
      return avail.skill2;
    case "ultimate":
      return (
        avail.ultimate && action.index >= 0 && action.index < c.moves.length
      );
    case "switch":
      return (
        s.mode === "3v3" &&
        aliveBench(side === "player" ? s.player : s.enemy).includes(action.to)
      );
  }
}

function attack(
  s: BattleState,
  side: Side,
  action: Exclude<BattleAction, { kind: "switch"; to: number }>,
  rng: Rng,
): BattleState {
  const atkTeam = side === "player" ? s.player : s.enemy;
  const defTeam = side === "player" ? s.enemy : s.player;
  const attacker = activeOf(atkTeam);
  const defender = activeOf(defTeam);
  const lines: Array<string> = [];

  const expected = CHAIN_ORDER[attacker.chainStep];
  const inChain = action.kind !== "ultimate" && action.kind === expected;
  const chainMul = inChain ? RULES.CHAIN_MUL[attacker.chainStep] : 1;
  if (attacker.chainStep > 0 && !inChain) lines.push("Combo broken!");

  let moveName = "Basic Attack";
  const input = { ...damageInputForAction(attacker, action), chainMul };
  let gaugeOnHit: number = RULES.GAUGE_BASIC_HIT;
  let gaugeAfter = attacker.gauge;
  let cooldowns = { ...attacker.cooldowns };

  if (action.kind === "ultimate") {
    const move = attacker.moves[action.index];
    moveName = move.name;
    gaugeOnHit = 0;
    gaugeAfter = 0;
    lines.push(
      `>>> ULTIMATE SKILL: ${moveName.toUpperCase()} (x${overchargeMul(attacker.gauge).toFixed(1)})! <<<`,
    );
  } else if (action.kind !== "basic") {
    const skill = attacker.skills[action.kind === "skill1" ? 0 : 1];
    const rule = action.kind === "skill1" ? RULES.SKILL1 : RULES.SKILL2;
    moveName = skill.name;
    gaugeOnHit = RULES.GAUGE_SKILL_HIT;
    cooldowns = { ...cooldowns, [action.kind]: rule.cooldown };
  }

  if (action.kind !== "ultimate")
    lines.push(`${label(attacker, side)} used ${moveName}!`);

  const r = calculateDamage(attacker, defender, input, rng);
  lines.push(...r.desc);
  if (!r.isMiss) lines.push(`Dealt ${r.damage} damage.`);

  let chainStep: Combatant["chainStep"] = 0;
  if (!r.isMiss && action.kind !== "ultimate") {
    if (action.kind === "basic") chainStep = 1;
    else if (action.kind === "skill1" && inChain) chainStep = 2;
    else if (action.kind === "skill2" && inChain) {
      gaugeAfter += RULES.GAUGE_CHAIN_BONUS;
      lines.push(`>>> COMBO FINISHER! Gauge +${RULES.GAUGE_CHAIN_BONUS}% <<<`);
    }
  }
  if (!r.isMiss && action.kind !== "ultimate") gaugeAfter += gaugeOnHit;

  // decrement cooldowns at end of own action
  cooldowns = {
    skill1: Math.max(0, cooldowns.skill1 - 1),
    skill2: Math.max(0, cooldowns.skill2 - 1),
  };

  const hpAfter = Math.max(0, defender.currentHp - r.damage);
  const defPatch: Partial<Combatant> = {
    currentHp: hpAfter,
    gauge:
      r.damage > 0
        ? clampGauge(defender.gauge + RULES.GAUGE_ON_HIT_TAKEN)
        : defender.gauge,
    fainted: hpAfter === 0,
    chainStep: hpAfter === 0 ? 0 : defender.chainStep,
  };

  let next = withSide(
    s,
    side,
    patchActive(atkTeam, {
      gauge: clampGauge(gaugeAfter),
      chainStep,
      cooldowns,
    }),
  );
  next = withSide(
    next,
    other(side),
    patchActive(side === "player" ? next.enemy : next.player, defPatch),
  );
  next = appendLog(next, lines);
  next = push(next, {
    type: "hit",
    target: other(side),
    index: defTeam.active,
    damage: r.damage,
    isCritical: r.isCritical,
    effectiveness: r.effectiveness,
    isMiss: r.isMiss,
    hpAfter,
    ultimate: action.kind === "ultimate" ? moveName : undefined,
  });
  if (hpAfter === 0) {
    next = push(next, {
      type: "faint",
      side: other(side),
      index: defTeam.active,
    });
    next = appendLog(next, [`${label(defender, other(side))} fainted!`]);
  }
  return next;
}

const receivers = (t: Team) =>
  t.team.map((c) => ({
    nickname: c.nickname,
    level: c.battle_state.level,
    fainted: c.fainted,
    participated: c.participated,
  }));

/** After an attack: exp, win/lose, auto/forced switch. Returns state and whether the round must stop. */
function afterHit(
  s: BattleState,
  victimSide: Side,
): { s: BattleState; stop: boolean } {
  const victimTeam = victimSide === "player" ? s.player : s.enemy;
  const victim = activeOf(victimTeam);
  if (!victim.fainted) return { s, stop: false };

  if (victimSide === "enemy") {
    const grants = koExpGrants(receivers(s.player), s.player.active, {
      base_experience: victim.base_experience,
      level: victim.battle_state.level,
    });
    let next = push(s, { type: "exp", grants });
    const bench = aliveBench(next.enemy);
    if (bench.length === 0) {
      next = appendLog({ ...next, phase: "over", winner: "player" }, [
        "You won the battle!",
      ]);
      return { s: next, stop: true };
    }
    return { s: switchTo(next, "enemy", bench[0]), stop: true };
  }

  const bench = aliveBench(s.player);
  if (bench.length === 0) {
    const grants = loseExpGrants(receivers(s.player), {
      base_experience: activeOf(s.enemy).base_experience,
      level: activeOf(s.enemy).battle_state.level,
    });

    let next = push(s, { type: "exp", grants });
    next = appendLog({ ...next, phase: "over", winner: "enemy" }, [
      "You lost the battle...",
    ]);

    return { s: next, stop: true };
  }

  return {
    s: appendLog({ ...s, phase: "forced-switch" }, [
      "Choose your next Pokemon!",
    ]),
    stop: true,
  };
}

export function resolveRound(
  state: BattleState,
  playerAction: BattleAction,
  rng: Rng = Math.random,
): BattleState {
  if (state.phase !== "select") return state;
  if (!isValid(state, "player", playerAction)) return state;

  let s: BattleState = { ...state, events: [], phase: "resolving" };
  const enemyAction = chooseEnemyAction(s, rng);

  const playerFirst = playerActsFirst(s, playerAction, enemyAction, rng);

  const order: Array<[Side, BattleAction]> = playerFirst
    ? [
        ["player", playerAction],
        ["enemy", enemyAction],
      ]
    : [
        ["enemy", enemyAction],
        ["player", playerAction],
      ];

  for (const [side, action] of order) {
    const actor = activeOf(side === "player" ? s.player : s.enemy);
    if (actor.fainted) continue;

    if (action.kind === "switch") {
      s = switchTo(s, side, action.to);
      continue;
    }

    s = attack(s, side, action, rng);
    const { s: after, stop } = afterHit(s, other(side));
    s = after;
    if (stop) break;
  }

  if (s.phase === "resolving") s = { ...s, phase: "select" };
  return s;
}

export function playerActsFirst(
  state: BattleState,
  playerAction: BattleAction,
  enemyAction: BattleAction,
  rng: Rng,
): boolean {
  const player = activeOf(state.player);
  const enemy = activeOf(state.enemy);
  const playerPriority = actionPriority(player, playerAction);
  const enemyPriority = actionPriority(enemy, enemyAction);
  if (playerPriority !== enemyPriority) return playerPriority > enemyPriority;
  if (player.stats.speed !== enemy.stats.speed) {
    return player.stats.speed > enemy.stats.speed;
  }
  return rng() < 0.5;
}
