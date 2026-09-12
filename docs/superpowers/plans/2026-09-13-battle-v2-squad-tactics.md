# Battle v2: Skill, Combo Chain, Overcharge, Squad Tactics 3v3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the battle mini game into a complete turn-based RPG: Basic / Skill 1 / Skill 2 / Ultimate with Combo Chain and Overcharge gauge, a 3v3 squad mode with bench and switch, cleaned-up leveling, a Pokemon status view, and a lighter StartScreen.

**Architecture:** Battle logic moves out of React into pure functions under `src/features/vs-battle/engine/` (`resolveRound(state, action, rng) → state`). A thin hook `useBattleEngine` owns React state, plays back the engine's event queue with timed animations, and persists the session to localStorage. UI is split into small components (ActionPanel, GaugeBar, ChainIndicator, Bench, SwitchModal, ResultPanel). Leveling math lives in `src/utils/leveling.ts`; the zustand store gets `version: 2` with a migration that adds `skills` and `base_stats` to older Pokemon.

**Tech Stack:** React 19, TypeScript 5 strict, Vite 7, Emotion, framer-motion 12, zustand 5 (`persist`), TanStack Router + Query, vitest 4 (already installed, `npm test`), ffmpeg (CLI, present at `/usr/bin/ffmpeg`).

**Spec:** `docs/superpowers/specs/2026-09-13-battle-v2-squad-tactics-design.md`

## Global Constraints

- TypeScript strict, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type` for types).
- Path alias `@/` → `src/`.
- Pre-commit runs prettier + eslint on staged files (husky + lint-staged). If eslint blocks a commit, fix the lint, do not bypass.
- Tests: vitest, files `*.test.ts`, run with `npm test` (= `vitest run`). Import `describe/it/expect` from `vitest`.
- Never use `Math.random` directly inside engine code; every engine function takes `rng: () => number` (default `Math.random`) so tests are deterministic.
- All tunable numbers live in `src/features/vs-battle/engine/rules.ts`. No magic numbers elsewhere.
- Do not touch the unrelated uncommitted WIP in `src/features/explores`, `src/features/detail/*/index.style.ts`, `src/components/ui/Navbar`, `src/hooks/queries`, `src/services/api/pokemons.ts` beyond the exact edits listed. Commit only the files each task names.
- Battle-time numbers (spec §3.1): Basic power 20, Skill 1 cooldown 2 / miss 10%, Skill 2 cooldown 3 / miss 5% / crit +10%, gauge max 150, Ultimate at 100, Overcharge `2 + (gauge - 100) / 50`, chain multipliers 1.0 / 1.2 / 1.5, chain finisher +50, hit taken +10, Basic hit +20, Skill hit +10.
- Leveling (spec §4): EXP next `(level+1)^3`, cap 100, level mod `clamp(1 + (enemyLevel - receiverLevel) * 0.1, 0.5, 1.5)`, bench share 50%, lose share 25%.
- Persistence keys: store `pokegames@pokemon-store` (version 2), session `pokegames@battle-session`, mode `pokegames@battle-mode`. Old keys `pokegames@battle-player-hp` and `pokegames@vs-battle-enemy` are removed from the code.

## File Map

| Path                                                                                                     | Responsibility                                                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/features/vs-battle/engine/rules.ts`                                                                 | constants + `overchargeMul`, `CHAIN_ORDER`                                                                |
| `src/features/vs-battle/engine/types.ts`                                                                 | `Combatant`, `BattleState`, `BattleAction`, `BattleEvent`, `Rng`                                          |
| `src/features/vs-battle/engine/damage.ts`                                                                | `calculateDamage` (pure)                                                                                  |
| `src/features/vs-battle/engine/ai.ts`                                                                    | `chooseEnemyAction`                                                                                       |
| `src/features/vs-battle/engine/reducer.ts`                                                               | `createBattle`, `resolveRound`, `forcedSwitch`, `surrender`, `endIntro`, helpers                          |
| `src/features/vs-battle/engine/*.test.ts`                                                                | vitest for the above                                                                                      |
| `src/utils/leveling.ts` (+ test)                                                                         | `expForNext`, `expGain`, `applyExp`, `statsAtLevel`, `baseStatsFromStats`, `koExpGrants`, `loseExpGrants` |
| `src/store/app/migrate.ts` (+ test)                                                                      | `migratePokemon` for persist v2                                                                           |
| `src/hooks/common/battle/useSpawnEnemies.ts`                                                             | `buildEnemy` (pure) + `useSpawnEnemies` (react-query)                                                     |
| `src/hooks/common/battle/useBattleEngine.ts`                                                             | React state, event playback, session persistence                                                          |
| `src/hooks/common/battle/usePokemonExperience.ts`                                                        | store wrapper over `leveling.ts`                                                                          |
| `src/features/vs-battle/components/{ActionPanel,GaugeBar,ChainIndicator,Bench,SwitchModal,ResultPanel}/` | UI units                                                                                                  |
| `src/features/vs-battle/components/shared/BattleIntro/`                                                  | intro accepts arrays                                                                                      |
| `src/features/vs-battle/modules/VSBattle/index.tsx`                                                      | composition only                                                                                          |
| `src/features/my-pokemon/pick.ts` (+ test)                                                               | `togglePick`, `maxPick`, `toSlug`, mode persistence                                                       |
| `src/features/my-pokemon/components/{ModeToggle,StatusModal}/`                                           | Pokedex additions                                                                                         |
| `src/routes/vs-battle.tsx`                                                                               | search params `mode`, `team`, `seed` (+ `pokemon` alias)                                                  |
| `README.md`                                                                                              | mechanics v2, roadmap items checked                                                                       |
| `src/features/my-pokemon/modules/MyPokemon/index.tsx`                                                    | mode toggle, multi pick, help v2, backfill                                                                |
| `src/features/start-screen/modules/StartScreen/`                                                         | video background, entrance animation                                                                      |
| Deleted                                                                                                  | `useBattleController.ts`, `useBattleMechanics.ts`, `useSpawnEnemy.ts`, `public/static/poke-group.gif`     |

---

### Task 1: Engine foundation — rules, types, damage

**Files:**

- Create: `src/features/vs-battle/engine/rules.ts`
- Create: `src/features/vs-battle/engine/types.ts`
- Create: `src/features/vs-battle/engine/damage.ts`
- Create: `src/features/vs-battle/engine/damage.test.ts`
- Modify: `src/utils/index.ts:19-37` (`getTypeEffectiveness` null-safety)
- Modify: `src/services/api/pokemons.ts:4-36` (add `ISkill`, `skills` field)

**Interfaces:**

- Produces: `RULES`, `overchargeMul(gauge: number): number`, `CHAIN_ORDER`, all engine types, `calculateDamage(attacker, defender, input: DamageInput, rng?): DamageResult`, `ISkill`, `IMyPokemon.skills: [ISkill, ISkill]`.

- [ ] **Step 1: Add `ISkill` to the API types**

In `src/services/api/pokemons.ts`, above `IMyPokemon` add and extend:

```ts
export interface ISkill {
  name: string;
  power: number;
  type: string;
  /** Own turns to wait after use, including the turn it was used. */
  cooldown: number;
}

export interface IMyPokemon {
  name: string;
  nickname: string;
  sprite?: string;
  sprite_back?: string;
  base_experience?: number;
  battle_state: {
    level: number;
    experience: number;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  base_stats?: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  types: Array<string>;
  /** Ultimate pool: one move per type. */
  moves: Array<{
    name: string;
    power: number;
    type?: string | null;
  }>;
  /** [Skill 1, Skill 2] */
  skills: [ISkill, ISkill];
}
```

`tsc` will now complain in `DetailPokemon` and `useSpawnEnemy` (missing `skills`). That is expected until Task 4 and Task 5. Do not run `npm run build` in this task; run `npm test` only.

- [ ] **Step 2: Make `getTypeEffectiveness` safe for unknown types**

In `src/utils/index.ts` replace the body of the `forEach`:

```ts
defenderTypes.forEach((defType) => {
  const defender = defType.toLowerCase();
  const mod = TYPE_CHART[attacker]?.[defender];

  if (mod !== undefined) {
    multiplier *= mod;
  }
});
```

- [ ] **Step 3: Write `rules.ts`**

```ts
/** Every tunable number of the battle engine. See spec section 3. */
export const RULES = {
  GAUGE_MAX: 150,
  ULT_THRESHOLD: 100,
  GAUGE_BASIC_HIT: 20,
  GAUGE_SKILL_HIT: 10,
  GAUGE_ON_HIT_TAKEN: 10,
  GAUGE_CHAIN_BONUS: 50,
  /** Multiplier for chain step 0 (Basic), 1 (Skill 1), 2 (Skill 2). */
  CHAIN_MUL: [1.0, 1.2, 1.5],
  CRIT_MUL: 1.5,
  STAB_MUL: 1.2,
  VARIANCE_MIN: 0.9,
  VARIANCE_MAX: 1.1,
  BASIC: { power: 20, missChance: 0, critChance: 0.12 },
  SKILL1: { cooldown: 2, missChance: 0.1, critChance: 0.12 },
  SKILL2: { cooldown: 3, missChance: 0.05, critChance: 0.22 },
  ULTIMATE: { missChance: 0, critChance: 0.12 },
  AI: { ULT_AT_THRESHOLD: 0.6, USE_SKILL2: 0.5, USE_SKILL1: 0.5 },
} as const;

export const CHAIN_ORDER = ["basic", "skill1", "skill2"] as const;

/** x2.0 at 100 gauge, linear up to x3.0 at 150. Below threshold: x1. */
export const overchargeMul = (gauge: number): number =>
  gauge < RULES.ULT_THRESHOLD
    ? 1
    : 2 +
      (gauge - RULES.ULT_THRESHOLD) / (RULES.GAUGE_MAX - RULES.ULT_THRESHOLD);
```

- [ ] **Step 4: Write `types.ts`**

```ts
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
      damage: number;
      isCritical: boolean;
      effectiveness: number;
      isMiss: boolean;
      hpAfter: number;
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
```

`ExpGrant` is created in Task 2. Until then create a stub `src/utils/leveling.ts` containing only:

```ts
export interface ExpGrant {
  nickname: string;
  amount: number;
}
```

- [ ] **Step 5: Write the failing damage test**

`src/features/vs-battle/engine/damage.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateDamage } from "./damage";
import type { IMyPokemon } from "@/services/api/pokemons";

const seq =
  (...values: Array<number>) =>
  () =>
    values.shift() ?? 0.5;

const mk = (over: Partial<IMyPokemon> = {}): IMyPokemon => ({
  name: "A",
  nickname: "A",
  battle_state: { level: 1, experience: 0 },
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    special_attack: 1,
    special_defense: 1,
    speed: 10,
  },
  types: ["normal"],
  moves: [],
  skills: [
    { name: "S1", power: 45, type: "normal", cooldown: 2 },
    { name: "S2", power: 65, type: "normal", cooldown: 3 },
  ],
  ...over,
});

const basic = { power: 20, type: null, missChance: 0, critChance: 0.12 };

describe("calculateDamage", () => {
  it("basic: attack 50 vs defense 50, power 20, no crit, variance 1.0 → 7", () => {
    const r = calculateDamage(mk(), mk(), basic, seq(0.5, 0.99, 0.5));
    expect(r).toMatchObject({
      damage: 7,
      isCritical: false,
      isMiss: false,
      effectiveness: 1,
    });
  });

  it("crit multiplies by 1.5", () => {
    const r = calculateDamage(mk(), mk(), basic, seq(0.5, 0.0, 0.5));
    expect(r.damage).toBe(11);
    expect(r.desc).toContain("Critical hit!");
  });

  it("miss returns 0 damage and no other rolls", () => {
    const r = calculateDamage(
      mk(),
      mk(),
      { ...basic, missChance: 0.1 },
      seq(0.05),
    );
    expect(r).toMatchObject({ damage: 0, isMiss: true });
  });

  it("typed move uses chart and STAB on any attacker type", () => {
    const atk = mk({ types: ["water", "fire"] });
    const def = mk({ types: ["grass"] });
    const r = calculateDamage(
      atk,
      def,
      { ...basic, type: "fire" },
      seq(0.5, 0.99, 0.5),
    );
    // 7.84 * 2 (fire vs grass) * 1.2 (stab) = 18.8 → 18
    expect(r.damage).toBe(18);
    expect(r.effectiveness).toBe(2);
    expect(r.desc).toContain("It's super effective!");
  });

  it("immune → 0 damage", () => {
    const r = calculateDamage(
      mk(),
      mk({ types: ["ground"] }),
      { ...basic, type: "electric" },
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(0);
    expect(r.desc).toContain("It had no effect...");
  });

  it("chain and overcharge multipliers stack", () => {
    const r = calculateDamage(
      mk(),
      mk(),
      { ...basic, chainMul: 1.5, overchargeMul: 2 },
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(23); // 7.84 * 3 = 23.5
  });

  it("minimum 1 damage when not immune", () => {
    const r = calculateDamage(
      mk({ stats: { ...mk().stats, attack: 1 } }),
      mk({ stats: { ...mk().stats, defense: 999 } }),
      basic,
      seq(0.5, 0.99, 0.5),
    );
    expect(r.damage).toBe(1);
  });
});
```

- [ ] **Step 6: Run test, expect failure**

Run: `npm test -- src/features/vs-battle/engine/damage.test.ts`
Expected: FAIL, `Cannot find module './damage'`.

- [ ] **Step 7: Write `damage.ts`**

```ts
import { RULES } from "./rules";
import type { Rng } from "./types";
import type { IMyPokemon } from "@/services/api/pokemons";
import { getTypeEffectiveness } from "@/utils";

export interface DamageInput {
  power: number;
  /** null = Basic Attack: no type chart, no STAB. */
  type: string | null;
  missChance: number;
  critChance: number;
  chainMul?: number;
  overchargeMul?: number;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  effectiveness: number;
  desc: Array<string>;
}

/** Roll order: miss, crit, variance. Tests depend on it. */
export function calculateDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
  rng: Rng = Math.random,
): DamageResult {
  if (rng() < input.missChance) {
    return {
      damage: 0,
      isCritical: false,
      isMiss: true,
      effectiveness: 1,
      desc: ["It missed!"],
    };
  }

  let effectiveness = 1;
  let stab = 1;

  if (input.type) {
    const moveType = input.type.toLowerCase();
    const defenderTypes = defender.types.length ? defender.types : ["normal"];
    effectiveness = getTypeEffectiveness(moveType, defenderTypes);
    if (attacker.types.some((t) => t.toLowerCase() === moveType)) {
      stab = RULES.STAB_MUL;
    }
  }

  const isCritical = rng() < input.critChance;
  const variance =
    RULES.VARIANCE_MIN + rng() * (RULES.VARIANCE_MAX - RULES.VARIANCE_MIN);

  // ponytail: physical only. special_attack / special_defense are unused;
  // add a per-move category if balance ever needs it.
  const raw = attacker.stats.attack * (input.power / 85);
  const defMul = 100 / (100 + defender.stats.defense);
  const total =
    raw *
    defMul *
    effectiveness *
    stab *
    (isCritical ? RULES.CRIT_MUL : 1) *
    (input.chainMul ?? 1) *
    (input.overchargeMul ?? 1) *
    variance;

  const damage = effectiveness === 0 ? 0 : Math.max(1, Math.floor(total));

  const desc: Array<string> = [];
  if (isCritical) desc.push("Critical hit!");
  if (effectiveness === 0) desc.push("It had no effect...");
  else if (effectiveness >= 2) desc.push("It's super effective!");
  else if (effectiveness < 1) desc.push("It's not very effective...");

  return { damage, isCritical, isMiss: false, effectiveness, desc };
}
```

- [ ] **Step 8: Run test, expect pass**

Run: `npm test -- src/features/vs-battle/engine/damage.test.ts`
Expected: 7 passed.

- [ ] **Step 9: Commit**

```bash
git add src/features/vs-battle/engine/rules.ts src/features/vs-battle/engine/types.ts src/features/vs-battle/engine/damage.ts src/features/vs-battle/engine/damage.test.ts src/utils/index.ts src/utils/leveling.ts src/services/api/pokemons.ts
git commit -m "feat(battle): pure damage engine with rules, chain and overcharge multipliers"
```

---

### Task 2: Leveling math

**Files:**

- Modify: `src/utils/leveling.ts` (replace stub)
- Create: `src/utils/leveling.test.ts`

**Interfaces:**

- Consumes: `scaleStat(base, level)` from `src/utils/pokemon-utils.ts`.
- Produces: `LEVEL_CAP`, `expForNext(level)`, `expGain(baseExp, enemyLevel, receiverLevel)`, `applyExp(level, experience, gained) → { level, experience, levelsGained }`, `statsAtLevel(base, level)`, `baseStatsFromStats(stats, level)`, `koExpGrants(team, activeIndex, enemy)`, `loseExpGrants(team, enemy)`, `ExpGrant`, `ExpReceiver`.

- [ ] **Step 1: Write the failing test**

`src/utils/leveling.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  LEVEL_CAP,
  applyExp,
  baseStatsFromStats,
  expForNext,
  expGain,
  koExpGrants,
  loseExpGrants,
  statsAtLevel,
} from "./leveling";

const base = {
  hp: 45,
  attack: 49,
  defense: 49,
  special_attack: 65,
  special_defense: 65,
  speed: 45,
};

describe("leveling", () => {
  it("expForNext is (level+1)^3", () => {
    expect(expForNext(1)).toBe(8);
    expect(expForNext(9)).toBe(1000);
  });

  it("expGain scales with level difference, clamped 0.5..1.5", () => {
    expect(expGain(60, 5, 5)).toBe(60);
    expect(expGain(60, 10, 5)).toBe(180);
    expect(expGain(60, 1, 10)).toBe(6);
  });

  it("applyExp can gain several levels at once and caps at 100", () => {
    expect(applyExp(1, 0, 30)).toEqual({
      level: 3,
      experience: 30,
      levelsGained: [2, 3],
    });
    expect(applyExp(LEVEL_CAP, 0, 1e9).level).toBe(LEVEL_CAP);
  });

  it("statsAtLevel adds flat HP bonus and roundtrips through baseStatsFromStats", () => {
    const at7 = statsAtLevel(base, 7);
    expect(at7.hp).toBe(51 + 65);
    const back = baseStatsFromStats(at7, 7);
    for (const key of Object.keys(base) as Array<keyof typeof base>) {
      expect(Math.abs(back[key] - base[key])).toBeLessThanOrEqual(1);
    }
  });

  it("koExpGrants: active 100%, alive bench 50%, fainted 0", () => {
    const team = [
      { nickname: "A", level: 1, fainted: false, participated: true },
      { nickname: "B", level: 1, fainted: false, participated: false },
      { nickname: "C", level: 1, fainted: true, participated: true },
    ];
    expect(koExpGrants(team, 0, { base_experience: 60, level: 1 })).toEqual([
      { nickname: "A", amount: 12 },
      { nickname: "B", amount: 6 },
    ]);
  });

  it("loseExpGrants: 25% to everyone who participated", () => {
    const team = [
      { nickname: "A", level: 1, fainted: true, participated: true },
      { nickname: "B", level: 1, fainted: false, participated: false },
    ];
    expect(loseExpGrants(team, { base_experience: 60, level: 1 })).toEqual([
      { nickname: "A", amount: 3 },
    ]);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- src/utils/leveling.test.ts`
Expected: FAIL, `expForNext is not a function` (or similar missing export).

- [ ] **Step 3: Write `leveling.ts`**

```ts
import { scaleStat } from "./pokemon-utils";
import type { IMyPokemon } from "@/services/api/pokemons";

type Stats = IMyPokemon["stats"];

export const LEVEL_CAP = 100;
export const EXP_BENCH_SHARE = 0.5;
export const EXP_LOSE_SHARE = 0.25;
const HP_BONUS = (level: number) => level * 5 + 30;

export interface ExpGrant {
  nickname: string;
  amount: number;
}

export interface ExpReceiver {
  nickname: string;
  level: number;
  fainted: boolean;
  participated: boolean;
}

export interface ExpGiver {
  base_experience?: number;
  level: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const expForNext = (level: number) => Math.pow(level + 1, 3);

/** Stronger foes pay more, weaker foes pay less. */
export function expGain(
  baseExp: number,
  enemyLevel: number,
  receiverLevel: number,
) {
  const mod = clamp(1 + (enemyLevel - receiverLevel) * 0.1, 0.5, 1.5);
  return Math.floor(Math.floor((baseExp * enemyLevel) / 5) * mod);
}

export function applyExp(level: number, experience: number, gained: number) {
  let lvl = level;
  const exp = experience + gained;
  const levelsGained: Array<number> = [];

  while (lvl < LEVEL_CAP && exp >= expForNext(lvl)) {
    lvl += 1;
    levelsGained.push(lvl);
  }

  return { level: lvl, experience: exp, levelsGained };
}

export function statsAtLevel(base: Stats, level: number): Stats {
  return {
    hp: scaleStat(base.hp, level) + HP_BONUS(level),
    attack: scaleStat(base.attack, level),
    defense: scaleStat(base.defense, level),
    special_attack: scaleStat(base.special_attack, level),
    special_defense: scaleStat(base.special_defense, level),
    speed: scaleStat(base.speed, level),
  };
}

/** Inverse of statsAtLevel, for Pokemon saved before base_stats existed. */
export function baseStatsFromStats(stats: Stats, level: number): Stats {
  const f = 1 + level * 0.02;
  return {
    hp: Math.round((stats.hp - HP_BONUS(level)) / f),
    attack: Math.round(stats.attack / f),
    defense: Math.round(stats.defense / f),
    special_attack: Math.round(stats.special_attack / f),
    special_defense: Math.round(stats.special_defense / f),
    speed: Math.round(stats.speed / f),
  };
}

export function koExpGrants(
  team: Array<ExpReceiver>,
  activeIndex: number,
  enemy: ExpGiver,
): Array<ExpGrant> {
  const baseExp = enemy.base_experience || 60;
  return team.flatMap((p, i) => {
    if (p.fainted) return [];
    const full = expGain(baseExp, enemy.level, p.level);
    const amount =
      i === activeIndex ? full : Math.floor(full * EXP_BENCH_SHARE);
    return [{ nickname: p.nickname, amount }];
  });
}

export function loseExpGrants(
  team: Array<ExpReceiver>,
  enemy: ExpGiver,
): Array<ExpGrant> {
  const baseExp = enemy.base_experience || 60;
  return team
    .filter((p) => p.participated)
    .map((p) => ({
      nickname: p.nickname,
      amount: Math.floor(
        expGain(baseExp, enemy.level, p.level) * EXP_LOSE_SHARE,
      ),
    }));
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- src/utils/leveling.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/utils/leveling.ts src/utils/leveling.test.ts
git commit -m "feat(leveling): pure exp, level-up and team exp split functions"
```

---

### Task 3: Engine core — AI and round reducer

**Files:**

- Create: `src/features/vs-battle/engine/ai.ts`
- Create: `src/features/vs-battle/engine/reducer.ts`
- Create: `src/features/vs-battle/engine/reducer.test.ts`
- Modify: `src/features/vs-battle/engine/types.ts` (add `index` to the `hit` event)

**Interfaces:**

- Consumes: `calculateDamage`, `RULES`, `CHAIN_ORDER`, `overchargeMul`, `koExpGrants`, `loseExpGrants`.
- Produces:
  - `toCombatant(p: IMyPokemon): Combatant`
  - `createBattle(mode, playerTeam: IMyPokemon[], enemyTeam: IMyPokemon[]): BattleState` (phase `intro`)
  - `endIntro(state): BattleState` (phase `select`)
  - `availableActions(c: Combatant): { skill1: boolean; skill2: boolean; ultimate: boolean }`
  - `resolveRound(state, action: BattleAction, rng?: Rng): BattleState`
  - `forcedSwitch(state, to: number): BattleState`
  - `surrender(state): BattleState`
  - `appendLog(state, lines: string[]): BattleState`
  - `chooseEnemyAction(c: Combatant, rng?: Rng): BattleAction`
  - `activeOf(team: Team): Combatant`, `aliveBench(team: Team): number[]`

**Cooldown semantics (fixed here, UI and tests rely on it):** using a skill sets `cooldowns.<skill> = RULES.<SKILL>.cooldown`; at the end of every own action the owner's cooldowns decrement by 1 (min 0); a skill is available when its counter is 0. So with cooldown 2 a skill used at turn N is unavailable at N+1 and available again at N+2. Full chain Basic → Skill 1 → Skill 2 is repeatable every 3 turns.

- [ ] **Step 1: Add `index` to the hit event**

In `types.ts` change the `hit` member of `BattleEvent` to:

```ts
  | {
      type: "hit";
      target: Side;
      index: number;
      damage: number;
      isCritical: boolean;
      effectiveness: number;
      isMiss: boolean;
      hpAfter: number;
    }
```

- [ ] **Step 2: Write `ai.ts`**

```ts
import { CHAIN_ORDER, RULES } from "./rules";
import { availableActions } from "./reducer";
import type { BattleAction, Combatant, Rng } from "./types";

/** Spec 3.6. Deterministic given rng. Never switches voluntarily. */
export function chooseEnemyAction(
  c: Combatant,
  rng: Rng = Math.random,
): BattleAction {
  const avail = availableActions(c);
  const ultimate = (): BattleAction => ({
    kind: "ultimate",
    index: Math.floor(rng() * c.moves.length),
  });

  if (avail.ultimate && c.gauge >= RULES.GAUGE_MAX) return ultimate();
  if (avail.ultimate && rng() < RULES.AI.ULT_AT_THRESHOLD) return ultimate();

  if (c.chainStep > 0) {
    const next = CHAIN_ORDER[c.chainStep];
    if (next === "skill1" && avail.skill1) return { kind: "skill1" };
    if (next === "skill2" && avail.skill2) return { kind: "skill2" };
  }

  if (avail.skill2 && rng() < RULES.AI.USE_SKILL2) return { kind: "skill2" };
  if (avail.skill1 && rng() < RULES.AI.USE_SKILL1) return { kind: "skill1" };
  return { kind: "basic" };
}
```

- [ ] **Step 3: Write the failing reducer tests**

`src/features/vs-battle/engine/reducer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  availableActions,
  createBattle,
  endIntro,
  forcedSwitch,
  resolveRound,
  surrender,
} from "./reducer";
import type { BattleState } from "./types";
import type { IMyPokemon } from "@/services/api/pokemons";

/** 0.5 everywhere: no miss, no crit, variance 1.0, AI takes ultimate at >=100 but never random skills. */
const flat = () => 0.5;

const mk = (nickname: string, over: Partial<IMyPokemon> = {}): IMyPokemon => ({
  name: nickname,
  nickname,
  base_experience: 60,
  battle_state: { level: 1, experience: 0 },
  stats: {
    hp: 100,
    attack: 50,
    defense: 50,
    special_attack: 1,
    special_defense: 1,
    speed: 20,
  },
  types: ["normal"],
  moves: [{ name: "Ult", power: 20, type: "water" }],
  skills: [
    { name: "S1", power: 45, type: "water", cooldown: 2 },
    { name: "S2", power: 65, type: "water", cooldown: 3 },
  ],
  ...over,
});

const slow = { stats: { ...mk("x").stats, speed: 5 } };

const start = (
  mode: "1v1" | "3v3" = "1v1",
  p = [mk("P")],
  e = [mk("E", slow)],
) => endIntro(createBattle(mode, p, e));

const hits = (s: BattleState) => s.events.filter((ev) => ev.type === "hit");

describe("resolveRound", () => {
  it("player basic then enemy basic, faster side first, gauges and chain update", () => {
    const s = resolveRound(start(), { kind: "basic" }, flat);
    const [first, second] = hits(s);
    expect(first).toMatchObject({ target: "enemy", damage: 7, hpAfter: 93 });
    expect(second).toMatchObject({ target: "player", damage: 7, hpAfter: 93 });
    expect(s.player.team[0]).toMatchObject({ gauge: 30, chainStep: 1 });
    expect(s.enemy.team[0]).toMatchObject({ gauge: 30, chainStep: 1 });
    expect(s.phase).toBe("select");
  });

  it("enemy acts first when faster", () => {
    const s = resolveRound(
      start("1v1", [mk("P", slow)], [mk("E")]),
      { kind: "basic" },
      flat,
    );
    expect(hits(s)[0].target).toBe("player");
  });

  it("full chain: skill1 after basic is boosted, skill2 finisher grants +50 and resets", () => {
    let s = resolveRound(start(), { kind: "basic" }, flat);
    s = resolveRound(s, { kind: "skill1" }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 21 }); // 17 * 1.2
    expect(s.player.team[0].chainStep).toBe(2);
    s = resolveRound(s, { kind: "skill2" }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 38 }); // 25 * 1.5
    expect(s.player.team[0].chainStep).toBe(0);
    expect(s.player.team[0].gauge).toBe(120); // (20+10) + (10+10) + (10+50+10)
    expect(s.log.some((l) => l.includes("COMBO FINISHER"))).toBe(true);
  });

  it("wrong order breaks the chain", () => {
    let s = resolveRound(start(), { kind: "basic" }, flat);
    s = resolveRound(s, { kind: "basic" }, flat);
    expect(s.player.team[0].chainStep).toBe(1);
    expect(s.log.some((l) => l.includes("Combo broken"))).toBe(true);
  });

  it("cooldown blocks the skill next turn and frees it the turn after", () => {
    let s = resolveRound(start(), { kind: "skill1" }, flat);
    expect(s.player.team[0].cooldowns.skill1).toBe(1);
    expect(availableActions(s.player.team[0]).skill1).toBe(false);
    const blocked = resolveRound(s, { kind: "skill1" }, flat);
    expect(blocked).toBe(s); // no-op
    s = resolveRound(s, { kind: "basic" }, flat);
    expect(availableActions(s.player.team[0]).skill1).toBe(true);
  });

  it("ultimate needs 100 gauge, scales with overcharge and empties the gauge", () => {
    const s0 = start();
    expect(resolveRound(s0, { kind: "ultimate", index: 0 }, flat)).toBe(s0);
    const charged: BattleState = {
      ...s0,
      player: { ...s0.player, team: [{ ...s0.player.team[0], gauge: 150 }] },
    };
    const s = resolveRound(charged, { kind: "ultimate", index: 0 }, flat);
    expect(hits(s)[0]).toMatchObject({ target: "enemy", damage: 23 }); // 7.84 * 3
    expect(s.player.team[0].gauge).toBe(10); // 0 after ult, +10 from being hit
    expect(s.log.some((l) => l.includes("ULTIMATE"))).toBe(true);
  });

  it("enemy uses ultimate at 100 gauge", () => {
    const s0 = start();
    const charged: BattleState = {
      ...s0,
      enemy: { ...s0.enemy, team: [{ ...s0.enemy.team[0], gauge: 100 }] },
    };
    const s = resolveRound(charged, { kind: "basic" }, flat);
    expect(hits(s)[1]).toMatchObject({ target: "player", damage: 17 }); // hit first: gauge 110 → x2.2 → 7.84 * 2.2
    expect(s.enemy.team[0].gauge).toBe(0); // ultimate empties the gauge after being hit
  });

  it("1v1 faint ends the battle and grants exp", () => {
    const s0 = start(
      "1v1",
      [mk("P")],
      [mk("E", { ...slow, stats: { ...slow.stats, hp: 5 } })],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("over");
    expect(s.winner).toBe("player");
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [{ nickname: "P", amount: 12 }],
    });
    expect(hits(s)).toHaveLength(1); // enemy never acted
  });

  it("1v1 player faint → enemy wins, lose exp 25%", () => {
    const s0 = start(
      "1v1",
      [mk("P", { ...slow, stats: { ...slow.stats, hp: 5 } })],
      [mk("E")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s).toMatchObject({ phase: "over", winner: "enemy" });
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [{ nickname: "P", amount: 3 }],
    });
  });

  it("3v3: switch resolves before the enemy acts and breaks the chain", () => {
    const s0 = start(
      "3v3",
      [mk("A"), mk("B", slow), mk("C")],
      [mk("E"), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "switch", to: 1 }, flat);
    expect(s.events[0]).toMatchObject({
      type: "switch",
      side: "player",
      to: 1,
    });
    expect(s.player.active).toBe(1);
    expect(hits(s)[0]).toMatchObject({ target: "player", index: 1 });
    expect(s.player.team[1].participated).toBe(true);
  });

  it("3v3: player active faints → forced-switch, then forcedSwitch resumes", () => {
    const weak = { stats: { ...mk("x").stats, hp: 5, speed: 1 } };
    const s0 = start(
      "3v3",
      [mk("A", weak), mk("B"), mk("C")],
      [mk("E"), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("forced-switch");
    expect(s.player.team[0].fainted).toBe(true);
    expect(hits(s)).toHaveLength(1); // A's own action was cancelled
    const resumed = forcedSwitch(s, 2);
    expect(resumed).toMatchObject({ phase: "select", player: { active: 2 } });
  });

  it("3v3: enemy active faints → auto switch, bench exp 50%, battle continues", () => {
    const weak = { stats: { ...mk("x").stats, hp: 5, speed: 1 } };
    const s0 = start(
      "3v3",
      [mk("A"), mk("B"), mk("C")],
      [mk("E", weak), mk("F"), mk("G")],
    );
    const s = resolveRound(s0, { kind: "basic" }, flat);
    expect(s.phase).toBe("select");
    expect(s.enemy.active).toBe(1);
    expect(s.events.find((e) => e.type === "exp")).toMatchObject({
      grants: [
        { nickname: "A", amount: 12 },
        { nickname: "B", amount: 6 },
        { nickname: "C", amount: 6 },
      ],
    });
  });

  it("surrender ends with enemy as winner and no exp", () => {
    const s = surrender(start());
    expect(s).toMatchObject({ phase: "over", winner: "enemy" });
    expect(s.events.find((e) => e.type === "exp")).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run tests, expect failure**

Run: `npm test -- src/features/vs-battle/engine/reducer.test.ts`
Expected: FAIL, `Cannot find module './reducer'`.

- [ ] **Step 5: Write `reducer.ts`**

```ts
import { calculateDamage } from "./damage";
import type { DamageInput } from "./damage";
import { CHAIN_ORDER, RULES, overchargeMul } from "./rules";
import { chooseEnemyAction } from "./ai";
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

// ---------- helpers ----------

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
  t.team.map((c, i) => i).filter((i) => i !== t.active && !t.team[i].fainted);
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

// ---------- lifecycle ----------

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

// ---------- actions ----------

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

/** One combatant performs one attack action against the other side's active. */
function attack(
  s: BattleState,
  side: Side,
  action: Exclude<BattleAction, { kind: "switch" }>,
  rng: Rng,
): BattleState {
  const atkTeam = side === "player" ? s.player : s.enemy;
  const defTeam = side === "player" ? s.enemy : s.player;
  const attacker = activeOf(atkTeam);
  const defender = activeOf(defTeam);
  const lines: Array<string> = [];

  // --- chain bookkeeping ---
  const expected = CHAIN_ORDER[attacker.chainStep];
  const inChain = action.kind !== "ultimate" && action.kind === expected;
  const chainMul = inChain ? RULES.CHAIN_MUL[attacker.chainStep] : 1;
  if (attacker.chainStep > 0 && !inChain) lines.push("Combo broken!");

  // --- resolve move ---
  let moveName = "Basic Attack";
  let input: DamageInput;
  let gaugeOnHit = RULES.GAUGE_BASIC_HIT;
  let gaugeAfter = attacker.gauge;
  let cooldowns = { ...attacker.cooldowns };

  if (action.kind === "basic") {
    input = { power: RULES.BASIC.power, type: null, ...RULES.BASIC, chainMul };
  } else if (action.kind === "skill1" || action.kind === "skill2") {
    const skill = attacker.skills[action.kind === "skill1" ? 0 : 1];
    const rule = action.kind === "skill1" ? RULES.SKILL1 : RULES.SKILL2;
    moveName = skill.name;
    input = {
      power: skill.power,
      type: skill.type,
      missChance: rule.missChance,
      critChance: rule.critChance,
      chainMul,
    };
    gaugeOnHit = RULES.GAUGE_SKILL_HIT;
    cooldowns = { ...cooldowns, [action.kind]: rule.cooldown };
  } else {
    const move = attacker.moves[action.index];
    moveName = move.name;
    input = {
      power: move.power,
      type: move.type || attacker.types[0] || "normal",
      ...RULES.ULTIMATE,
      overchargeMul: overchargeMul(attacker.gauge),
    };
    gaugeOnHit = 0;
    gaugeAfter = 0;
    lines.push(
      `>>> ULTIMATE SKILL: ${moveName.toUpperCase()} (x${overchargeMul(attacker.gauge).toFixed(1)})! <<<`,
    );
  }

  if (action.kind !== "ultimate")
    lines.push(`${label(attacker, side)} used ${moveName}!`);

  const r = calculateDamage(attacker, defender, input, rng);
  lines.push(...r.desc);
  if (!r.isMiss) lines.push(`Dealt ${r.damage} damage.`);

  // --- chain step after the move ---
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

// ---------- round ----------

export function resolveRound(
  state: BattleState,
  playerAction: BattleAction,
  rng: Rng = Math.random,
): BattleState {
  if (state.phase !== "select") return state;
  if (!isValid(state, "player", playerAction)) return state;

  let s: BattleState = { ...state, events: [], phase: "resolving" };
  const enemyAction = chooseEnemyAction(activeOf(s.enemy), rng);

  const playerFirst =
    playerAction.kind === "switch" ||
    activeOf(s.player).stats.speed > activeOf(s.enemy).stats.speed ||
    (activeOf(s.player).stats.speed === activeOf(s.enemy).stats.speed &&
      rng() < 0.5);

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
    if (actor.fainted) continue; // cancelled

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
```

- [ ] **Step 6: Run tests, expect pass**

Run: `npm test -- src/features/vs-battle/engine`
Expected: all reducer and damage tests pass. If a number is off by 1, re-derive with the fixture (attack 50, defense 50, variance 1.0) and fix the test expectation, not the engine, unless the engine violates a spec rule.

Note the circular import `ai.ts ↔ reducer.ts` (ai imports `availableActions`, reducer imports `chooseEnemyAction`). ESM handles it because both are only used inside function bodies. If vitest reports `availableActions is not a function`, move `availableActions` into `rules.ts`-adjacent file `src/features/vs-battle/engine/available.ts` and import it from both.

- [ ] **Step 7: Commit**

```bash
git add src/features/vs-battle/engine
git commit -m "feat(battle): pure round reducer with chain, overcharge, switch, faint and exp events"
```

---

### Task 4: `buildSkills`, catch flow, store migration v2

**Files:**

- Modify: `src/utils/pokemon-utils.ts` (add `buildSkills`, `PLACEHOLDER_SKILL_NAMES`)
- Create: `src/utils/pokemon-utils.test.ts`
- Create: `src/store/app/migrate.ts`
- Create: `src/store/app/migrate.test.ts`
- Modify: `src/store/app/pokemonStore.ts`
- Modify: `src/features/detail/modules/DetailPokemon/index.tsx:84-155` (`onNicknameSave`)

**Interfaces:**

- Consumes: `ISkill`, `IMyPokemon`, `baseStatsFromStats`, `RULES.SKILL1.cooldown`, `RULES.SKILL2.cooldown`.
- Produces:
  - `buildSkills(pool: Array<{ name: string; power: number }>, types: string[]): [ISkill, ISkill]`
  - `PLACEHOLDER_SKILL_NAMES = ["Quick Strike", "Power Blast"]`
  - `migratePokemon(p: unknown): IMyPokemon` and `migrateStore(persisted: unknown, version: number)`
  - `usePokemonStore` persist `version: 2`.

- [ ] **Step 1: Failing tests for `buildSkills` and `migratePokemon`**

`src/utils/pokemon-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildSkills } from "./pokemon-utils";

describe("buildSkills", () => {
  it("maps two pool moves into skill 1 (40-50) and skill 2 (60-70) with type per slot", () => {
    const [s1, s2] = buildSkills(
      [
        { name: "tackle", power: 30 },
        { name: "ember", power: 65 },
      ],
      ["fire", "flying"],
    );
    expect(s1).toEqual({
      name: "tackle",
      power: 40,
      type: "fire",
      cooldown: 2,
    });
    expect(s2).toEqual({
      name: "ember",
      power: 70,
      type: "flying",
      cooldown: 3,
    });
  });

  it("falls back to placeholders and types[0] when the pool is short", () => {
    const [s1, s2] = buildSkills([], ["water"]);
    expect(s1).toMatchObject({
      name: "Quick Strike",
      power: 45,
      type: "water",
    });
    expect(s2).toMatchObject({ name: "Power Blast", power: 65, type: "water" });
  });
});
```

`src/store/app/migrate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { migratePokemon, migrateStore } from "./migrate";

const legacy = {
  name: "PIKACHU",
  nickname: "ZAP",
  battle_state: { level: 3, experience: 40 },
  stats: {
    hp: 92,
    attack: 58,
    defense: 42,
    special_attack: 53,
    special_defense: 53,
    speed: 95,
  },
  types: ["electric"],
  moves: [{ name: "thunder", power: 60, type: "electric" }],
};

describe("migratePokemon", () => {
  it("adds placeholder skills and reconstructs base_stats", () => {
    const p = migratePokemon(legacy);
    expect(p.skills[0]).toMatchObject({
      name: "Quick Strike",
      type: "electric",
      cooldown: 2,
    });
    expect(p.skills[1]).toMatchObject({
      name: "Power Blast",
      type: "electric",
      cooldown: 3,
    });
    expect(p.base_stats).toEqual({
      hp: 45,
      attack: 55,
      defense: 40,
      special_attack: 50,
      special_defense: 50,
      speed: 90,
    });
  });

  it("keeps existing skills and base_stats", () => {
    const p = migratePokemon({
      ...legacy,
      base_stats: {
        hp: 1,
        attack: 1,
        defense: 1,
        special_attack: 1,
        special_defense: 1,
        speed: 1,
      },
      skills: [
        { name: "a", power: 1, type: "x", cooldown: 2 },
        { name: "b", power: 1, type: "x", cooldown: 3 },
      ],
    });
    expect(p.skills[0].name).toBe("a");
    expect(p.base_stats?.hp).toBe(1);
  });

  it("migrateStore maps the pokemons array", () => {
    const out = migrateStore({ pokemons: [legacy] }, 0) as {
      pokemons: Array<{ skills: unknown }>;
    };
    expect(out.pokemons[0].skills).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests, expect failure**

Run: `npm test -- src/utils/pokemon-utils.test.ts src/store/app/migrate.test.ts`
Expected: FAIL, missing exports.

- [ ] **Step 3: Add `buildSkills` to `pokemon-utils.ts`**

Append before the `export {}` block:

```ts
import type { ISkill } from "@/services/api/pokemons";
import { RULES } from "@/features/vs-battle/engine/rules";

export const PLACEHOLDER_SKILL_NAMES = ["Quick Strike", "Power Blast"] as const;

const SKILL_RANGES: [[number, number], [number, number]] = [
  [40, 50],
  [60, 70],
];

/** Squeeze powerFromMoveName's 30..65 into the slot's band so balance holds. */
const fitPower = (power: number, [lo, hi]: [number, number]) =>
  Math.round(lo + ((power - 30) / 35) * (hi - lo));

/**
 * Skill 1 uses types[0], Skill 2 uses types[1] (or types[0]).
 * Pool entries beyond two are ignored; missing entries become placeholders.
 */
function buildSkills(
  pool: Array<{ name: string; power: number }>,
  types: Array<string>,
): [ISkill, ISkill] {
  const t0 = types[0] || "normal";
  const t1 = types[1] || t0;
  const cds = [RULES.SKILL1.cooldown, RULES.SKILL2.cooldown];
  const fallbackPower = [45, 65];

  const slot = (i: 0 | 1, type: string): ISkill => {
    const m = pool[i];
    return m
      ? {
          name: m.name,
          power: fitPower(m.power, SKILL_RANGES[i]),
          type,
          cooldown: cds[i],
        }
      : {
          name: PLACEHOLDER_SKILL_NAMES[i],
          power: fallbackPower[i],
          type,
          cooldown: cds[i],
        };
  };

  return [slot(0, t0), slot(1, t1)];
}
```

Add `buildSkills` and `PLACEHOLDER_SKILL_NAMES` to the file's `export { ... }` list. Move the two new `import` lines to the top of the file with the existing import.

- [ ] **Step 4: Write `migrate.ts`**

```ts
import type { IMyPokemon } from "@/services/api/pokemons";
import { baseStatsFromStats } from "@/utils/leveling";
import { buildSkills } from "@/utils/pokemon-utils";

/**
 * Store v1 → v2: Pokemon caught before skills existed get placeholder skills
 * (backfilled from PokeAPI later by MyPokemon) and base_stats derived from stats.
 */
export function migratePokemon(raw: unknown): IMyPokemon {
  const p = raw as Partial<IMyPokemon> &
    Pick<IMyPokemon, "name" | "nickname" | "stats" | "battle_state">;
  const types = p.types?.length ? p.types : ["normal"];
  return {
    ...p,
    types,
    moves: p.moves ?? [],
    base_stats:
      p.base_stats ?? baseStatsFromStats(p.stats, p.battle_state.level),
    skills: p.skills ?? buildSkills([], types),
  };
}

export function migrateStore(persisted: unknown, _version: number) {
  const state = persisted as { pokemons?: Array<unknown> };
  return { ...state, pokemons: (state.pokemons ?? []).map(migratePokemon) };
}
```

- [ ] **Step 5: Wire migration into the store**

In `src/store/app/pokemonStore.ts` replace the persist options:

```ts
    {
      name: POKEMON_STORE_KEY,
      version: 2,
      migrate: migrateStore,
    },
```

and add `import { migrateStore } from "./migrate";`.

- [ ] **Step 6: Update the catch flow**

In `DetailPokemon.tsx` `onNicknameSave`, after `selectedUltimates` is computed, add:

```ts
const skillPool = movePool.slice(numberOfUltimates, numberOfUltimates + 2);
const skills = buildSkills(skillPool, typesBuild);
```

and add `skills,` to the `newPokemons` object. Import `buildSkills` from `@/utils/pokemon-utils` (extend the existing import list).

- [ ] **Step 7: Run tests, expect pass**

Run: `npm test`
Expected: all green (damage, leveling, reducer, pokemon-utils, migrate).

- [ ] **Step 8: Commit**

```bash
git add src/utils/pokemon-utils.ts src/utils/pokemon-utils.test.ts src/store/app/migrate.ts src/store/app/migrate.test.ts src/store/app/pokemonStore.ts src/features/detail/modules/DetailPokemon/index.tsx
git commit -m "feat(store): skills on catch and v2 migration with placeholder skills"
```

---

### Task 5: `useSpawnEnemies` (replaces `useSpawnEnemy`)

**Files:**

- Create: `src/hooks/common/battle/useSpawnEnemies.ts`
- Create: `src/hooks/common/battle/buildEnemy.test.ts`
- Delete: `src/hooks/common/battle/useSpawnEnemy.ts` (in Task 7, once nothing imports it)

**Interfaces:**

- Consumes: `IPokemonDetailResponse`, `getDetailPokemon`, `getBaseStat`, `pickRandomMoves`, `powerFromMoveName`, `scaleStat`, `buildSkills`, `useQueries` from `@tanstack/react-query`.
- Produces:
  - `getDifficultyParams(refLevel)` (moved verbatim from the old hook)
  - `buildEnemy(detail: IPokemonDetailResponse, refLevel: number, rng?: Rng): IMyPokemon`
  - `useSpawnEnemies({ count, refLevel, seed }): { enemies: IMyPokemon[] | null; isLoading: boolean; isError: boolean }`

- [ ] **Step 1: Failing test for `buildEnemy`**

`src/hooks/common/battle/buildEnemy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildEnemy } from "./useSpawnEnemies";
import type { IPokemonDetailResponse } from "@/services/api/pokemons";

const detail = {
  id: 150,
  name: "mewtwo",
  base_experience: 306,
  abilities: [],
  moves: [
    { move: { name: "psychic" } },
    { move: { name: "swift" } },
    { move: { name: "recover" } },
  ],
  types: [{ slot: 1, type: { name: "psychic", url: "" } }],
  sprites: { front_default: "f.png", back_default: "b.png" },
  stats: [
    { base_stat: 106, stat: { name: "hp", url: "" } },
    { base_stat: 110, stat: { name: "attack", url: "" } },
    { base_stat: 90, stat: { name: "defense", url: "" } },
    { base_stat: 154, stat: { name: "special-attack", url: "" } },
    { base_stat: 90, stat: { name: "special-defense", url: "" } },
    { base_stat: 130, stat: { name: "speed", url: "" } },
  ],
} as unknown as IPokemonDetailResponse;

describe("buildEnemy", () => {
  it("clamps BST to 320 below player level 12 and sets level within ±1", () => {
    const e = buildEnemy(detail, 5, () => 0.5);
    const bst = Object.values(e.base_stats!).reduce((a, b) => a + b, 0);
    expect(bst).toBeLessThanOrEqual(320);
    expect(e.battle_state.level).toBe(5);
    expect(e.skills).toHaveLength(2);
    expect(e.moves.length).toBeGreaterThan(0);
    expect(e.types).toEqual(["psychic"]);
    expect(e.stats.hp).toBe(Math.floor(e.base_stats!.hp * 1.1) + 55);
  });

  it("does not clamp at level 12+ and applies the stat multiplier", () => {
    const e = buildEnemy(detail, 12, () => 0.5);
    expect(e.base_stats!.hp).toBe(106);
    expect(e.stats.attack).toBe(Math.floor(Math.floor(110 * 1.24) * 1.05));
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- src/hooks/common/battle/buildEnemy.test.ts`
Expected: FAIL, `Cannot find module './useSpawnEnemies'`.

- [ ] **Step 3: Write `useSpawnEnemies.ts`**

```ts
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type {
  IMyPokemon,
  IPokemonDetailResponse,
} from "@/services/api/pokemons";
import type { Rng } from "@/features/vs-battle/engine/types";
import { getDetailPokemon } from "@/services/api/pokemons";
import {
  buildSkills,
  getBaseStat,
  pickRandomMoves,
  powerFromMoveName,
  scaleStat,
} from "@/utils/pokemon-utils";

/** Highest PokeAPI id with full sprite coverage. */
const MAX_POKEMON_ID = 649;
const EARLY_GAME_LEVEL = 12;
const MAX_ALLOWED_BST = 320;

export const getDifficultyParams = (playerLevel: number) => {
  if (playerLevel < EARLY_GAME_LEVEL)
    return { statMultiplier: 1.0, minLevelAdd: -1, maxLevelAdd: 1 };
  if (playerLevel < 20)
    return { statMultiplier: 1.05, minLevelAdd: 0, maxLevelAdd: 2 };
  if (playerLevel < 40)
    return { statMultiplier: 1.08, minLevelAdd: 1, maxLevelAdd: 3 };
  return { statMultiplier: 1.15, minLevelAdd: 2, maxLevelAdd: 4 };
};

export function buildEnemy(
  detail: IPokemonDetailResponse,
  refLevel: number,
  rng: Rng = Math.random,
): IMyPokemon {
  const difficulty = getDifficultyParams(refLevel);
  const min = Math.max(1, refLevel + difficulty.minLevelAdd);
  const max = refLevel + difficulty.maxLevelAdd;
  const level = Math.floor(rng() * (max - min + 1)) + min;

  const keys = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ] as const;
  let raw = keys.map((k) => getBaseStat(detail, k));

  if (refLevel < EARLY_GAME_LEVEL) {
    const bst = raw.reduce((a, b) => a + b, 0);
    if (bst > MAX_ALLOWED_BST)
      raw = raw.map((v) => Math.floor((v * MAX_ALLOWED_BST) / bst));
  }

  const [hp, attack, defense, special_attack, special_defense, speed] = raw;
  const base_stats = {
    hp,
    attack,
    defense,
    special_attack,
    special_defense,
    speed,
  };
  const scale = (base: number, isHp = false) =>
    Math.floor(
      (scaleStat(base, level) + (isHp ? level * 5 + 30 : 0)) *
        difficulty.statMultiplier,
    );

  const types = detail.types.map((t) => t.type.name || "normal");
  const pool = pickRandomMoves(detail.moves, 6).map((m) => {
    const name = m.move?.name || "struggle";
    return { name, power: powerFromMoveName(name) };
  });
  const ultimates = pool
    .slice(0, Math.max(1, types.length))
    .map((m, i) => ({ ...m, type: types[i] || types[0] || "normal" }));

  const animated =
    detail.sprites.versions?.["generation-v"]?.["black-white"]?.animated;

  return {
    name: detail.name,
    nickname: detail.name.toUpperCase(),
    sprite: animated?.front_default || detail.sprites.front_default || "",
    sprite_back: animated?.back_default || detail.sprites.back_default || "",
    base_experience: detail.base_experience || 0,
    battle_state: { level, experience: 0 },
    base_stats,
    stats: {
      hp: scale(hp, true),
      attack: scale(attack),
      defense: scale(defense),
      special_attack: scale(special_attack),
      special_defense: scale(special_defense),
      speed: scale(speed),
    },
    types,
    moves: ultimates,
    skills: buildSkills(
      pool.slice(ultimates.length, ultimates.length + 2),
      types,
    ),
  };
}

interface Props {
  count: number;
  refLevel: number;
  /** Stable per battle so a re-render never re-rolls the ids. */
  seed: number;
}

export function useSpawnEnemies({ count, refLevel, seed }: Props) {
  const ids = useMemo(() => {
    let x = seed || 1;
    // ponytail: tiny LCG so ids are stable for a session; not crypto, not meant to be.
    const next = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
    return Array.from(
      { length: count },
      () => 1 + Math.floor(next() * MAX_POKEMON_ID),
    );
  }, [count, seed]);

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["pokemon-detail", id],
      queryFn: () => getDetailPokemon(id),
      staleTime: 1000 * 60 * 60 * 24,
      retry: 1,
    })),
  });

  const isLoading = results.some((r) => r.isPending);
  const isError = results.some((r) => r.isError);
  const enemies = useMemo(() => {
    if (isLoading || isError) return null;
    return results.map((r) =>
      buildEnemy(r.data as IPokemonDetailResponse, refLevel),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isError, refLevel, ...results.map((r) => r.data)]);

  return { enemies, isLoading, isError };
}
```

- [ ] **Step 4: Run test, expect pass**

Run: `npm test -- src/hooks/common/battle/buildEnemy.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/common/battle/useSpawnEnemies.ts src/hooks/common/battle/buildEnemy.test.ts
git commit -m "feat(battle): pure buildEnemy and multi-enemy spawn hook"
```

---

### Task 6: `useBattleEngine` — React glue, event playback, session persistence

**Files:**

- Create: `src/hooks/common/battle/useBattleEngine.ts`
- Modify: `src/hooks/common/battle/usePokemonExperience.ts` (rewrite over `leveling.ts`)
- Modify: `src/hooks/common/battle/useDamageSystem.ts` (no API change; keep)

**Interfaces:**

- Consumes: everything from `engine/reducer.ts`, `useDamageSystem`, `applyExp`, `statsAtLevel`, `worker-timers`.
- Produces:

```ts
export const BATTLE_SESSION_KEY = "pokegames@battle-session";

export interface BattleSession {
  mode: "1v1" | "3v3";
  team: string[]; // nicknames, order = pick order
  seed: number;
  state: BattleState | null;
}

export function loadSession(): BattleSession | null;
export function clearSession(): void;

export function useBattleEngine(opts: {
  mode: "1v1" | "3v3";
  playerTeam: IMyPokemon[];
  enemyTeam: IMyPokemon[] | null;
  seed: number;
  team: string[];
}): {
  state: BattleState | null;
  view: {
    // what the UI renders while events play back
    hp: Record<Side, number[]>;
    activeHitTarget: Side | null;
    hitKey: number;
    damages: IDamage[];
    busy: boolean; // true while events are still playing
    levelUps: Array<{ nickname: string; level: number }>;
  };
  actions: {
    act: (a: BattleAction) => void;
    forcedSwitch: (to: number) => void;
    endIntro: () => void;
    surrender: () => void;
    leave: () => void; // clears session, navigates to /my-pokemon
    findNew: () => void; // clears session, bumps seed via navigate search
  };
};
```

- [ ] **Step 1: Rewrite `usePokemonExperience.ts`**

```ts
import { useCallback } from "react";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { applyExp, expForNext, statsAtLevel } from "@/utils/leveling";
import type { ExpGrant } from "@/utils/leveling";

export const usePokemonExperience = () => {
  const { updatePokemon, getPokemonByNickname } = usePokemonStore();

  /** Applies one grant to the store. Returns the levels gained (possibly several). */
  const grantExp = useCallback(
    ({ nickname, amount }: ExpGrant) => {
      const p = getPokemonByNickname(nickname);
      if (!p) return [];
      const { level, experience, levelsGained } = applyExp(
        p.battle_state.level,
        p.battle_state.experience,
        amount,
      );
      const base = p.base_stats;
      updatePokemon(nickname, {
        battle_state: { level, experience },
        ...(levelsGained.length && base
          ? { stats: statsAtLevel(base, level) }
          : {}),
      });
      return levelsGained;
    },
    [getPokemonByNickname, updatePokemon],
  );

  const getExpProgress = useCallback(
    (nickname: string) => {
      const p = getPokemonByNickname(nickname);
      if (!p)
        return {
          current: 0,
          needed: 100,
          percentage: 0,
          minExpForCurrentLevel: 0,
        };
      const level = p.battle_state.level;
      const minExp = Math.pow(level, 3);
      const nextExp = expForNext(level);
      const pct =
        ((p.battle_state.experience - minExp) / (nextExp - minExp)) * 100;
      return {
        current: p.battle_state.experience,
        needed: nextExp,
        minExpForCurrentLevel: minExp,
        percentage: Math.min(Math.max(pct, 0), 100),
      };
    },
    [getPokemonByNickname],
  );

  return { grantExp, getExpProgress, getExpForNextLevel: expForNext };
};
```

`PokeCard` already calls `getExpProgress` only; it keeps working.

- [ ] **Step 2: Write `useBattleEngine.ts`**

```ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearTimeout, setTimeout } from "worker-timers";
import { useDamageSystem } from "./useDamageSystem";
import { usePokemonExperience } from "./usePokemonExperience";
import type { IMyPokemon } from "@/services/api/pokemons";
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
  resolveRound,
  surrender as engineSurrender,
} from "@/features/vs-battle/engine/reducer";

export const BATTLE_SESSION_KEY = "pokegames@battle-session";

export interface BattleSession {
  mode: "1v1" | "3v3";
  team: Array<string>;
  seed: number;
  state: BattleState | null;
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
  const [hitKey, setHitKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [levelUps, setLevelUps] = useState<
    Array<{ nickname: string; level: number }>
  >([]);
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
    saveSession({ mode, team, seed, state: initial });
  }, [state, enemyTeam, mode, playerTeam, seed, team]);

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
          }
          if (ev.type === "exp") {
            const ups = ev.grants.flatMap((g) =>
              grantExp(g).map((level) => ({ nickname: g.nickname, level })),
            );
            if (ups.length) setLevelUps((prev) => [...prev, ...ups]);
          }
        });
        delay += STEP_MS[ev.type];
      });
      later(delay, () => {
        setState(next);
        setBusy(false);
        if (next.phase === "over") clearSession();
        else saveSession({ mode, team, seed, state: { ...next, events: [] } });
      });
    },
    [grantExp, showDamage, mode, team, seed],
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
    () => ({ hp, activeHitTarget, hitKey, damages, busy, levelUps }),
    [hp, activeHitTarget, hitKey, damages, busy, levelUps],
  );

  return {
    state,
    view,
    actions: { act, forcedSwitch, endIntro, surrender, leave, findNew },
  };
}
```

- [ ] **Step 3: Type-check the hook in isolation**

Run: `npx tsc --noEmit -p . 2>&1 | grep -E "useBattleEngine|usePokemonExperience|leveling" || echo "hook clean"`
Expected: `hook clean`. Other files (old VSBattle, useSpawnEnemy, useBattleController) still error; they are replaced in Task 7.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/common/battle/useBattleEngine.ts src/hooks/common/battle/usePokemonExperience.ts
git commit -m "feat(battle): useBattleEngine with event playback and session persistence"
```

---

### Task 7: VSBattle 1v1 UI — ActionPanel, GaugeBar, ChainIndicator, ResultPanel, route params, legacy removal

**Files:**

- Create: `src/features/vs-battle/components/ActionPanel/index.tsx` + `index.style.ts`
- Create: `src/features/vs-battle/components/GaugeBar/index.tsx` + `index.style.ts`
- Create: `src/features/vs-battle/components/ChainIndicator/index.tsx` + `index.style.ts`
- Create: `src/features/vs-battle/components/ResultPanel/index.tsx`
- Modify: `src/features/vs-battle/modules/VSBattle/index.tsx` (rewrite as composition)
- Modify: `src/features/vs-battle/modules/VSBattle/index.style.ts` (move button styles out, add `EnemyGaugeSlot`, `RunAwayButton`)
- Modify: `src/routes/vs-battle.tsx` (search params `mode`, `team`, `seed`; `pokemon` alias)
- Modify: `src/hooks/common/battle/useBattleEngine.ts` (expose `view.expGained`)
- Modify: `src/features/my-pokemon/modules/MyPokemon/index.tsx:242-249` (navigate with new search shape only; full rework in Task 9)
- Delete: `src/hooks/common/battle/useBattleController.ts`, `src/hooks/common/battle/useBattleMechanics.ts`, `src/hooks/common/battle/useSpawnEnemy.ts`

**Interfaces:**

- Consumes: `useBattleEngine`, `useSpawnEnemies`, `availableActions`, `activeOf`, `RULES`, `overchargeMul`, `Combatant`, `BattleAction`, `Side`, `POKEMON_TYPE_ICONS`, `Gloves`, `useDamageSystem`'s `IDamage`.
- Produces:
  - `ActionPanel({ combatant, disabled, onAct, onSwitch? })`
  - `GaugeBar({ gauge, compact? })`
  - `ChainIndicator({ step, finished })`
  - `ResultPanel({ winner, expGained, levelUps, onFindNew, onLeave })`
  - `view.expGained: ExpGrant[]` on `useBattleEngine` (one entry per grant, accumulated over the battle)
  - `VersusBattleModule({ mode, team, seed })`

No jsdom is installed, so UI components have no vitest coverage in this plan. Verification is `tsc`, `eslint`, and the manual checklist at the end of the task. Engine behaviour is already covered by Task 1–3 tests.

- [ ] **Step 1: Route search params**

Replace `src/routes/vs-battle.tsx`:

```tsx
import { useMemo } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import VersusBattleModule from "@/features/vs-battle/modules/VSBattle";

export interface IVsBattleSearch {
  mode: "1v1" | "3v3";
  /** Comma separated nickname slugs, pick order preserved. */
  team: string;
  seed: number;
}

export const Route = createFileRoute("/vs-battle")({
  component: VersusBattle,
  validateSearch: (search: Record<string, unknown>): IVsBattleSearch => {
    // `pokemon` is the pre-v2 param; keep it as a 1v1 alias.
    const legacy = typeof search.pokemon === "string" ? search.pokemon : "";
    return {
      mode: search.mode === "3v3" ? "3v3" : "1v1",
      team: typeof search.team === "string" ? search.team : legacy,
      seed: Number(search.seed) || 1,
    };
  },
});

function VersusBattle() {
  const { mode, team, seed } = useSearch({ from: "/vs-battle" });
  // Stable array identity: useBattleEngine keys its session on `team`.
  const nicknames = useMemo(() => team.split(",").filter(Boolean), [team]);
  return <VersusBattleModule mode={mode} team={nicknames} seed={seed} />;
}
```

- [ ] **Step 2: Patch the MyPokemon navigate call (minimal, typed)**

In `MyPokemon/index.tsx` replace the `search: { pokemon: selectedPokemon }` object with:

```ts
                    search: {
                      mode: "1v1",
                      team: selectedPokemon,
                      seed: Date.now(),
                    },
```

Task 9 replaces this block entirely; this edit only keeps the router types green.

- [ ] **Step 3: `GaugeBar`**

`src/features/vs-battle/components/GaugeBar/index.style.ts`:

```ts
import styled from "@emotion/styled";
import { colors } from "@/utils";
import { RULES } from "@/features/vs-battle/engine/rules";

const MARK = (RULES.ULT_THRESHOLD / RULES.GAUGE_MAX) * 100;

export const Wrap = styled("div")<{ compact: boolean }>(({ compact }) => ({
  width: compact ? "180px" : "100%",
  fontFamily: "monospace",
  fontSize: compact ? "0.65rem" : "0.75rem",
  fontWeight: "bold",
  color: colors["gray-800"],
}));

export const Labels = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "2px",
});

export const Track = styled("div")<{ compact: boolean }>(({ compact }) => ({
  position: "relative",
  width: "100%",
  height: compact ? "6px" : "12px",
  backgroundColor: colors["gray-300"],
  border: `2px solid ${colors["gray-800"]}`,
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    bottom: 0,
    left: `${MARK}%`,
    width: "2px",
    backgroundColor: colors["gray-800"],
  },
}));

export const Fill = styled("div")<{
  pct: number;
  state: "charging" | "ready" | "overcharge";
}>(({ pct, state }) => ({
  height: "100%",
  width: `${pct}%`,
  transition: "width 0.4s steps(6)",
  backgroundColor:
    state === "overcharge"
      ? colors["red-500"]
      : state === "ready"
        ? colors["yellow-500"]
        : colors["sky-500"],
  animation: state === "charging" ? "none" : "gauge-blink 1s steps(2) infinite",
  "@keyframes gauge-blink": {
    "0%": { filter: "brightness(1)" },
    "50%": { filter: "brightness(1.4)" },
  },
}));
```

`src/features/vs-battle/components/GaugeBar/index.tsx`:

```tsx
import { Fill, Labels, Track, Wrap } from "./index.style";
import { RULES, overchargeMul } from "@/features/vs-battle/engine/rules";

interface Props {
  gauge: number;
  /** Enemy variant: thin bar, no multiplier label. */
  compact?: boolean;
}

const GaugeBar = ({ gauge, compact = false }: Props) => {
  const pct = (gauge / RULES.GAUGE_MAX) * 100;
  const state =
    gauge >= RULES.GAUGE_MAX
      ? "overcharge"
      : gauge >= RULES.ULT_THRESHOLD
        ? "ready"
        : "charging";

  return (
    <Wrap compact={compact}>
      <Labels>
        <span>
          GAUGE {gauge}/{RULES.GAUGE_MAX}
        </span>
        {!compact && gauge >= RULES.ULT_THRESHOLD && (
          <span>
            {state === "overcharge" ? "OVERCHARGE " : ""}x
            {overchargeMul(gauge).toFixed(1)}
          </span>
        )}
      </Labels>
      <Track compact={compact}>
        <Fill pct={pct} state={state} />
      </Track>
    </Wrap>
  );
};

export default GaugeBar;
```

- [ ] **Step 4: `ChainIndicator`**

`src/features/vs-battle/components/ChainIndicator/index.style.ts`:

```ts
import styled from "@emotion/styled";
import { colors } from "@/utils";

export const Row = styled("div")({
  display: "flex",
  gap: "6px",
  justifyContent: "center",
  marginBottom: "6px",
});

export const Pip = styled("span")<{
  lit: boolean;
  next: boolean;
  broken: boolean;
}>(({ lit, next, broken }) => ({
  fontFamily: "monospace",
  fontSize: "0.65rem",
  fontWeight: "bold",
  padding: "2px 8px",
  border: `2px solid ${colors["gray-800"]}`,
  color: lit ? colors["white-800"] : colors["gray-600"],
  backgroundColor: broken
    ? colors["red-500"]
    : lit
      ? colors["green-600"]
      : colors["gray-200"],
  animation: next
    ? "pip-hint 0.8s steps(2) infinite"
    : broken
      ? "pip-flash 0.4s steps(2) 1"
      : "none",
  "@keyframes pip-hint": {
    "0%": { borderColor: colors["gray-800"] },
    "50%": { borderColor: colors["yellow-500"] },
  },
  "@keyframes pip-flash": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.3 },
    "100%": { opacity: 1 },
  },
}));
```

`src/features/vs-battle/components/ChainIndicator/index.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";
import { Pip, Row } from "./index.style";

const LABELS = ["BASIC", "SKILL 1", "SKILL 2"];

interface Props {
  step: 0 | 1 | 2;
  finished: boolean;
}

/** Lit pips = completed steps; next pip blinks; a break (step drops to 0 without a finisher) flashes red once. */
const ChainIndicator = ({ step, finished }: Props) => {
  const prev = useRef(step);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const dropped = prev.current > 0 && step === 0;
    prev.current = step;
    if (!dropped || finished) return;
    setBroken(true);
    const t = setTimeout(() => setBroken(false), 450);
    return () => clearTimeout(t);
  }, [step, finished]);

  return (
    <Row>
      {LABELS.map((label, i) => (
        <Pip
          key={label}
          lit={i < step}
          next={i === step && !broken}
          broken={broken}>
          {label}
        </Pip>
      ))}
    </Row>
  );
};

export default ChainIndicator;
```

`Props` is `{ step: 0 | 1 | 2; finished: boolean }`. `finished` is true when the last log line contains `COMBO FINISHER`, so completing the chain resets the pips without the red flash. `VSBattle` passes `finished={state.log.at(-1)?.includes("COMBO FINISHER") ?? false}`.

- [ ] **Step 5: `ActionPanel` (buttons move here from `VSBattle/index.style.ts`)**

Cut `AttackGrid`, `StyledButton`, `UltimateText`, `UltimateButton` (and their `@keyframes`) out of `VSBattle/index.style.ts` and paste them into `src/features/vs-battle/components/ActionPanel/index.style.ts` with these changes:

```ts
import styled from "@emotion/styled";
import { colors, skillColor } from "@/utils";

export const AttackGrid = styled("div")({/* unchanged */});

export const StyledButton = styled("button")<{
  disabled?: boolean;
  pokemonType?: string;
}>(/* unchanged */);

export const CooldownBadge = styled("span")({
  position: "absolute",
  top: "-8px",
  right: "-8px",
  minWidth: "22px",
  height: "22px",
  padding: "0 4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "monospace",
  fontSize: "0.75rem",
  fontWeight: "bold",
  color: colors["white-800"],
  backgroundColor: colors["gray-800"],
  border: `2px solid ${colors["white-800"]}`,
  zIndex: 3,
});

export const UltimateText = styled("span")({/* unchanged */});

/** state drives colour: locked (grey), ready (gold blink), overcharge (red blaze). */
export const UltimateButton = styled("button")<{
  state: "locked" | "ready" | "overcharge";
}>(({ state }) => {
  const ready = state !== "locked";
  return {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    backgroundColor:
      state === "overcharge"
        ? "#b91c1c"
        : state === "ready"
          ? "#b45309"
          : "#374151",
    backgroundImage:
      state === "overcharge"
        ? "linear-gradient(45deg, #b91c1c 25%, #ef4444 50%, #b91c1c 75%)"
        : state === "ready"
          ? "linear-gradient(45deg, #b45309 25%, #fbbf24 50%, #b45309 75%)"
          : "none",
    backgroundSize: "200% 200%",
    animation: ready ? "pulse-ult 1.5s infinite" : "none",
    border: `3px solid ${ready ? "#fbbf24" : "#1f2937"}`,
    cursor: ready ? "pointer" : "not-allowed",
    color: ready ? "#fff" : "#9ca3af",
    opacity: ready ? 1 : 0.7,
    transition: "all 0.2s ease",
    "&:hover": { transform: ready ? "scale(1.02) translateY(-2px)" : "none" },
    "@keyframes pulse-ult": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
  };
});

export const SwitchButton = styled("button")({
  gridColumn: "span 2",
  padding: "12px",
  fontFamily: "monospace",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: colors["gray-800"],
  backgroundColor: colors["sky-200"],
  border: `2px solid ${colors["gray-800"]}`,
  cursor: "pointer",
  "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
});
```

`src/features/vs-battle/components/ActionPanel/index.tsx`:

```tsx
import * as S from "./index.style";
import Gloves from "@/components/ui/Icon/Gloves";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";
import { RULES, overchargeMul } from "@/features/vs-battle/engine/rules";
import { availableActions } from "@/features/vs-battle/engine/reducer";
import type {
  BattleAction,
  Combatant,
} from "@/features/vs-battle/engine/types";

interface Props {
  combatant: Combatant;
  disabled: boolean;
  onAct: (a: BattleAction) => void;
  /** Present only in 3v3 with a live bench. */
  onSwitch?: () => void;
}

const TypeIcon = ({ type }: { type: string }) => (
  <img
    src={POKEMON_TYPE_ICONS[type]}
    alt={type}
    width={18}
    height={18}
    style={{ marginRight: 6 }}
  />
);

const ActionPanel = ({ combatant, disabled, onAct, onSwitch }: Props) => {
  const avail = availableActions(combatant);
  const [s1, s2] = combatant.skills;
  const ultState =
    combatant.gauge >= RULES.GAUGE_MAX
      ? "overcharge"
      : combatant.gauge >= RULES.ULT_THRESHOLD
        ? "ready"
        : "locked";

  return (
    <S.AttackGrid>
      <S.StyledButton
        disabled={disabled}
        pokemonType="normal"
        onClick={() => onAct({ kind: "basic" })}>
        <Gloves
          style={{ width: 18, height: 18, marginRight: 6 }}
          color="#1f2937"
        />
        Basic · {RULES.BASIC.power}
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill1}
        pokemonType={s1.type}
        onClick={() => onAct({ kind: "skill1" })}>
        <TypeIcon type={s1.type} />
        {s1.name} · {s1.power}
        {combatant.cooldowns.skill1 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill1}</S.CooldownBadge>
        )}
      </S.StyledButton>

      <S.StyledButton
        disabled={disabled || !avail.skill2}
        pokemonType={s2.type}
        onClick={() => onAct({ kind: "skill2" })}>
        <TypeIcon type={s2.type} />
        {s2.name} · {s2.power}
        {combatant.cooldowns.skill2 > 0 && (
          <S.CooldownBadge>{combatant.cooldowns.skill2}</S.CooldownBadge>
        )}
      </S.StyledButton>

      {/* One Ultimate button per elemental move (one per type), same as v1 layout. */}
      {combatant.moves.map((m, index) => (
        <S.UltimateButton
          key={m.name}
          state={ultState}
          disabled={disabled || !avail.ultimate}
          onClick={() => onAct({ kind: "ultimate", index })}>
          <TypeIcon type={m.type || combatant.types[0]} />
          <S.UltimateText>
            {ultState === "locked"
              ? `ULT · ${m.name}`
              : `${ultState === "overcharge" ? "OVERCHARGE " : ""}${m.name} x${overchargeMul(combatant.gauge).toFixed(1)}`}
          </S.UltimateText>
        </S.UltimateButton>
      ))}

      {onSwitch && (
        <S.SwitchButton disabled={disabled} onClick={onSwitch}>
          ⇄ Switch Pokemon
        </S.SwitchButton>
      )}
    </S.AttackGrid>
  );
};

export default ActionPanel;
```

Spec 5.2 says a 2x2 grid; with two-type Pokemon there are two Ultimate rows, which is the v1 behaviour and is kept deliberately (`// ponytail: one ult button per move; collapse into a type picker if a third type ever appears`).

- [ ] **Step 6: Expose EXP totals from the hook, then `ResultPanel`**

In `useBattleEngine.ts` add `const [expGained, setExpGained] = useState<Array<ExpGrant>>([]);` (import type `ExpGrant` from `@/utils/leveling`). In `playback`, inside the `ev.type === "exp"` branch, before computing level ups: `setExpGained((prev) => [...prev, ...ev.grants]);`. Add `expGained` to the `view` memo and its deps.

`src/features/vs-battle/components/ResultPanel/index.tsx`:

```tsx
import type { CSSProperties } from "react";
import { Text } from "@/components/ui";
import type { Side } from "@/features/vs-battle/engine/types";
import type { ExpGrant } from "@/utils/leveling";

interface Props {
  winner: Side;
  expGained: Array<ExpGrant>;
  levelUps: Array<{ nickname: string; level: number }>;
  onFindNew: () => void;
  onLeave: () => void;
}

/** Sum grants per nickname so a 3v3 with three KOs shows one line per Pokemon. */
const totals = (grants: Array<ExpGrant>) =>
  Object.entries(
    grants.reduce<Record<string, number>>(
      (acc, g) => ({ ...acc, [g.nickname]: (acc[g.nickname] ?? 0) + g.amount }),
      {},
    ),
  );

const btn = (bg: string): CSSProperties => ({
  width: "100%",
  padding: "12px",
  border: "2px solid #1f2937",
  backgroundColor: bg,
  color: "#fff",
  fontFamily: "monospace",
  fontWeight: "bold",
  textTransform: "uppercase",
  cursor: "pointer",
});

const ResultPanel = ({
  winner,
  expGained,
  levelUps,
  onFindNew,
  onLeave,
}: Props) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <Text variant="darker" size="lg" style={{ textAlign: "center" }}>
      {winner === "player" ? "VICTORY!" : "DEFEATED..."}
    </Text>
    {totals(expGained).map(([nickname, amount]) => (
      <Text key={nickname} size="base" style={{ textAlign: "center" }}>
        {nickname} +{amount} EXP
      </Text>
    ))}
    {levelUps.map((u) => (
      <Text
        key={`${u.nickname}-${u.level}`}
        size="base"
        style={{ textAlign: "center" }}>
        {u.nickname} reached Lv. {u.level}!
      </Text>
    ))}
    <button style={btn("#10b981")} onClick={onFindNew}>
      Find New Opponent
    </button>
    <button style={btn("#374151")} onClick={onLeave}>
      Back to Pokedex
    </button>
  </div>
);

export default ResultPanel;
```

- [ ] **Step 7: Trim `VSBattle/index.style.ts` and add two slots**

Remove `AttackGrid`, `StyledButton`, `UltimateText`, `UltimateButton` (moved in Step 5). Remove any game-over button styles that nothing references after Step 8 (check with `grep -n "T\.<Name>" index.tsx` before deleting each). Add:

```ts
export const EnemyGaugeSlot = styled("div")({ marginTop: "4px" });

export const RunAwayButton = styled("button")({
  alignSelf: "flex-end",
  padding: "6px 12px",
  fontFamily: "monospace",
  fontWeight: "bold",
  textTransform: "uppercase",
  color: colors["white-800"],
  backgroundColor: colors["red-600"],
  border: `2px solid ${colors["gray-800"]}`,
  cursor: "pointer",
  "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
});
```

- [ ] **Step 8: Rewrite `VSBattle/index.tsx`**

Keep the enemy/player sections, hit effect, damage text and log markup from the current file. Replace all state plumbing. Skeleton (the `DamageFloaters` helper deduplicates the two identical `AnimatePresence` blocks that exist today):

```tsx
import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as T from "./index.style";
import BattleIntro from "@/features/vs-battle/components/shared/BattleIntro";
import ActionPanel from "@/features/vs-battle/components/ActionPanel";
import GaugeBar from "@/features/vs-battle/components/GaugeBar";
import ChainIndicator from "@/features/vs-battle/components/ChainIndicator";
import ResultPanel from "@/features/vs-battle/components/ResultPanel";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { useSpawnEnemies } from "@/hooks/common/battle/useSpawnEnemies";
import { useBattleEngine } from "@/hooks/common/battle/useBattleEngine";
import type { IDamage } from "@/hooks/common/battle/useDamageSystem";
import { activeOf } from "@/features/vs-battle/engine/reducer";
import type { Side } from "@/features/vs-battle/engine/types";

interface Props {
  mode: "1v1" | "3v3";
  team: Array<string>;
  seed: number;
}

/** Slug used by MyPokemon: lower-case, first space → "-". Kept as-is. */
const matchesSlug = (nickname: string, slug: string) =>
  nickname.toUpperCase() === slug.replace(/-/g, " ").toUpperCase();

const DamageFloaters = ({
  damages,
  side,
}: {
  damages: Array<IDamage>;
  side: Side;
}) => (
  <AnimatePresence>
    {damages
      .filter((d) => d.target === side)
      .map((damage) => (
        <T.DamageWrapper key={damage.id}>
          <motion.div
            initial={{ opacity: 0, y: 0, scale: damage.isCritical ? 0.5 : 0.8 }}
            animate={{
              opacity: [0, 1, 1],
              y: -60,
              scale: damage.isCritical ? [1, 1.5, 1.2] : 1,
              x: damage.isCritical ? [0, -5, 5, -5, 5, 0] : 0,
            }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.8, ease: "easeOut" }}>
            <T.DamageText
              isCritical={damage.isCritical}
              effectiveness={damage.effectiveness}>
              {damage.value === 0 ? "Miss" : damage.value}
              {damage.isCritical && "!"}
              {damage.effectiveness >= 2 && !damage.isCritical && (
                <span
                  style={{
                    fontSize: "0.5em",
                    marginLeft: 4,
                  }}>{`(${damage.effectiveness}x)`}</span>
              )}
            </T.DamageText>
          </motion.div>
        </T.DamageWrapper>
      ))}
  </AnimatePresence>
);

const VersusBattleModule = ({ mode, team, seed }: Props) => {
  const { pokemons } = usePokemonStore();
  const logRef = useRef<HTMLDivElement>(null);

  const playerTeam = useMemo(
    () =>
      team
        .map((slug) => pokemons.find((p) => matchesSlug(p.nickname, slug)))
        .filter((p) => p !== undefined),
    [pokemons, team],
  );
  const refLevel = Math.max(1, ...playerTeam.map((p) => p.battle_state.level));
  const { enemies, isLoading } = useSpawnEnemies({
    count: mode === "3v3" ? 3 : 1,
    refLevel,
    seed,
  });

  const { state, view, actions } = useBattleEngine({
    mode,
    playerTeam,
    enemyTeam: enemies,
    seed,
    team,
  });

  useEffect(() => {
    const img = new Image();
    img.src = "/static/hit-effects.gif";
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state?.log]);

  if (!playerTeam.length || playerTeam.length !== team.length)
    return <T.Container />; // bad param, blank like v1
  if (isLoading || !state) return <T.Container />;

  const me = activeOf(state.player);
  const foe = activeOf(state.enemy);
  const myHp = view.hp.player[state.player.active];
  const foeHp = view.hp.enemy[state.enemy.active];
  const locked = view.busy || state.phase !== "select";

  return (
    <T.Container>
      <AnimatePresence>
        {state.phase === "intro" && (
          <BattleIntro
            player={playerTeam[0]}
            enemy={state.enemy.team[0]}
            onComplete={actions.endIntro}
          />
        )}
      </AnimatePresence>

      <T.BattleWrapper>
        <T.BattleField>
          <T.EnemySection>
            <T.EnemyInfo>
              <T.InfoBox>
                <T.CharacterName>{foe.name}</T.CharacterName>
                <T.HPBarContainer>
                  <T.HPBar
                    width={(foeHp / foe.stats.hp) * 100}
                    color="#ef4444"
                  />
                </T.HPBarContainer>
                <T.HPText>
                  {foeHp}/{foe.stats.hp} HP
                </T.HPText>
                <T.HPText>Lvl. {foe.battle_state.level}</T.HPText>
                <T.EnemyGaugeSlot>
                  <GaugeBar gauge={foe.gauge} compact />
                </T.EnemyGaugeSlot>
              </T.InfoBox>
            </T.EnemyInfo>
            <T.EnemySpriteWrapper>
              {view.activeHitTarget === "enemy" && (
                <T.HitEffectImage
                  key={`hit-enemy-${view.hitKey}`}
                  src="/static/hit-effects.gif"
                  alt="hit"
                />
              )}
              <DamageFloaters damages={view.damages} side="enemy" />
              <AnimatePresence>
                {foeHp > 0 && (
                  <motion.div
                    key={foe.nickname}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}>
                    <T.PokemonSprite src={foe.sprite} alt="Enemy" />
                    <T.ShadowEnemy />
                  </motion.div>
                )}
              </AnimatePresence>
            </T.EnemySpriteWrapper>
          </T.EnemySection>

          <T.PlayerSection>
            <T.PlayerSpriteWrapper>
              {view.activeHitTarget === "player" && (
                <T.HitEffectImage
                  key={`hit-player-${view.hitKey}`}
                  src="/static/hit-effects.gif"
                  alt="hit"
                />
              )}
              <DamageFloaters damages={view.damages} side="player" />
              <AnimatePresence>
                {myHp > 0 && (
                  <motion.div
                    key={me.nickname}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 50 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                    }}>
                    <T.PokemonSprite
                      src={me.sprite_back || me.sprite}
                      alt="Player"
                    />
                    <T.Shadow />
                  </motion.div>
                )}
              </AnimatePresence>
            </T.PlayerSpriteWrapper>
            <T.PlayerInfo>
              <T.PlayerInfoBox>
                <T.CharacterName>{me.nickname}</T.CharacterName>
                <T.HPBarContainer>
                  <T.HPBar width={(myHp / me.stats.hp) * 100} color="#10b981" />
                </T.HPBarContainer>
                <T.HPText>
                  {myHp}/{me.stats.hp} HP
                </T.HPText>
                <T.HPText>Lvl. {me.battle_state.level}</T.HPText>
              </T.PlayerInfoBox>
            </T.PlayerInfo>
          </T.PlayerSection>

          <T.InterfaceWrapper>
            <T.BattleLog ref={logRef}>
              <T.LogTitle>Battle Log</T.LogTitle>
              {state.log.map((line, idx) => (
                <T.LogEntry
                  key={idx}
                  style={
                    line.includes(">>>")
                      ? { color: "#fbbf24", fontWeight: "bold" }
                      : undefined
                  }>
                  &gt; {line}
                </T.LogEntry>
              ))}
            </T.BattleLog>

            <T.BattleMenu>
              <T.MenuTitle>
                {state.phase === "over"
                  ? "Game Over"
                  : locked
                    ? "Resolving..."
                    : `What will ${me.nickname} do?`}
              </T.MenuTitle>

              {state.phase === "over" && state.winner ? (
                <ResultPanel
                  winner={state.winner}
                  expGained={view.expGained}
                  levelUps={view.levelUps}
                  onFindNew={actions.findNew}
                  onLeave={actions.leave}
                />
              ) : (
                <>
                  <GaugeBar gauge={me.gauge} />
                  <ChainIndicator
                    step={me.chainStep}
                    finished={
                      state.log.at(-1)?.includes("COMBO FINISHER") ?? false
                    }
                  />
                  <ActionPanel
                    combatant={me}
                    disabled={locked}
                    onAct={actions.act}
                  />
                  <T.RunAwayButton
                    disabled={locked}
                    onClick={actions.surrender}>
                    Run Away
                  </T.RunAwayButton>
                </>
              )}
            </T.BattleMenu>
          </T.InterfaceWrapper>
        </T.BattleField>
      </T.BattleWrapper>
    </T.Container>
  );
};

export default VersusBattleModule;
```

`BattleIntro` still takes single Pokemon here; Task 8 changes it to arrays. `surrender` in the engine is an immediate lose and the hook clears the session, so "Run Away" and "Surrender" from v1 collapse into one button (spec 3.7 treats both as a loss).

- [ ] **Step 9: Delete legacy hooks**

```bash
git rm src/hooks/common/battle/useBattleController.ts src/hooks/common/battle/useBattleMechanics.ts src/hooks/common/battle/useSpawnEnemy.ts
grep -rn "useBattleController\|useBattleMechanics\|useSpawnEnemy\b\|LS_ENEMY_KEY\|battle-player-hp" src || echo "no legacy refs"
```

Expected: `no legacy refs`.

- [ ] **Step 10: Type-check, lint, tests**

Run: `npx tsc --noEmit -p . && npm run lint && npm test`
Expected: all clean. Common fixes: unused imports after the rewrite (`noUnusedLocals`), `React.CSSProperties` needs `import type { CSSProperties } from "react"` under `verbatimModuleSyntax`.

- [ ] **Step 11: Manual check (dev server)**

Run: `npm run dev`, open `/my-pokemon`, select one Pokemon, WILD BATTLE.

- Intro plays, then action panel shows Basic / Skill 1 / Skill 2 / Ultimate(s), gauge `0/150`, chain pips with BASIC blinking.
- Basic → Skill 1 → Skill 2 in order: pips light up, log shows `COMBO FINISHER`, gauge jumps by 50.
- Skill buttons grey out with a cooldown badge and come back after the stated turns.
- Ultimate greys until 100, gold at 100–149, red at 150 with `OVERCHARGE x3.0`.
- Reload mid-battle: HP, gauge, cooldowns, log restored.
- Win: level-up lines in the result panel; Pokedex card shows new EXP/level. Lose: 25% EXP, no crash.
- URL `/vs-battle?pokemon=<slug>` (old link) still starts a 1v1.

- [ ] **Step 12: Commit**

```bash
git add src/features/vs-battle src/routes/vs-battle.tsx src/features/my-pokemon/modules/MyPokemon/index.tsx src/hooks/common/battle/useBattleEngine.ts
git commit -m "feat(battle): v2 battle screen with skills, gauge, chain indicator and result panel"
```

---

### Task 8: 3v3 UI — Bench, SwitchModal, team intro, forced switch

**Files:**

- Create: `src/features/vs-battle/components/Bench/index.tsx` + `index.style.ts`
- Create: `src/features/vs-battle/components/SwitchModal/index.tsx`
- Modify: `src/features/vs-battle/components/shared/BattleIntro/index.tsx` (arrays, levels)
- Modify: `src/hooks/common/battle/useBattleEngine.ts` (expose `view.active`)
- Modify: `src/features/vs-battle/modules/VSBattle/index.tsx` (wire bench, switch, forced switch)
- Modify: `src/features/vs-battle/modules/VSBattle/index.style.ts` (`BenchAnchor`)

**Interfaces:**

- Produces:
  - `Bench({ side, team, active, hp })`
  - `SwitchModal({ open, forced, team, active, hp, onPick, onCancel })`
  - `BattleIntro({ player: IMyPokemon[]; enemy: IMyPokemon[]; onComplete })`
  - `view.active: Record<Side, number>` on `useBattleEngine`

- [ ] **Step 1: Track the active index during playback**

In `useBattleEngine.ts`:

- add `const [active, setActive] = useState<Record<Side, number>>({ player: 0, enemy: 0 });`
- in the init effect, after `setHp(...)`: `setActive({ player: initial.player.active, enemy: initial.enemy.active });`
- in `playback`, inside the per-event callback add:
  ```ts
  if (ev.type === "switch")
    setActive((prev) => ({ ...prev, [ev.side]: ev.to }));
  ```
- add `active` to the `view` memo and its dependency list.

Reason: the committed `state` only updates after the whole queue plays, but the sprite must swap when the `switch` event fires so the next `hit` lands on the right Pokemon visually.

- [ ] **Step 2: `Bench`**

`src/features/vs-battle/components/Bench/index.style.ts`:

```ts
import styled from "@emotion/styled";
import { colors } from "@/utils";

export const Strip = styled("div")<{ side: "player" | "enemy" }>(
  ({ side }) => ({
    position: "absolute",
    zIndex: 25,
    display: "flex",
    gap: "8px",
    ...(side === "player"
      ? { left: "24px", bottom: "24px" }
      : { right: "24px", top: "24px" }),
  }),
);

export const Slot = styled("div")<{ fainted: boolean }>(({ fainted }) => ({
  width: "96px",
  padding: "6px",
  backgroundColor: colors["white-800"],
  border: `3px solid ${colors["gray-800"]}`,
  boxShadow: `3px 3px 0 ${colors["gray-800"]}`,
  textAlign: "center",
  fontFamily: "monospace",
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: colors["gray-800"],
  opacity: fainted ? 0.5 : 1,
  img: {
    width: "56px",
    height: "56px",
    margin: "0 auto",
    imageRendering: "pixelated",
    filter: fainted ? "grayscale(1)" : "none",
  },
}));

export const MiniHp = styled("div")<{ pct: number }>(({ pct }) => ({
  height: "6px",
  border: `2px solid ${colors["gray-800"]}`,
  backgroundColor: colors["gray-300"],
  "&::after": {
    content: '""',
    display: "block",
    height: "100%",
    width: `${pct}%`,
    backgroundColor: pct > 50 ? "#10b981" : pct > 20 ? "#fbbf24" : "#ef4444",
    transition: "width 0.4s steps(5)",
  },
}));
```

`src/features/vs-battle/components/Bench/index.tsx`:

```tsx
import { MiniHp, Slot, Strip } from "./index.style";
import type { Combatant, Side } from "@/features/vs-battle/engine/types";

interface Props {
  side: Side;
  team: Array<Combatant>;
  active: number;
  hp: Array<number>;
}

/** The two non-active slots; the active one is on the field. */
const Bench = ({ side, team, active, hp }: Props) => (
  <Strip side={side}>
    {team.map((c, i) =>
      i === active ? null : (
        <Slot key={c.nickname} fainted={hp[i] === 0}>
          <img src={c.sprite} alt={c.nickname} />
          <div>{side === "player" ? c.nickname : c.name}</div>
          <div>Lv. {c.battle_state.level}</div>
          <MiniHp pct={(hp[i] / c.stats.hp) * 100} />
        </Slot>
      ),
    )}
  </Strip>
);

export default Bench;
```

- [ ] **Step 3: `SwitchModal`**

`src/features/vs-battle/components/SwitchModal/index.tsx`:

```tsx
import { Button, Modal, Text } from "@/components/ui";
import type { Combatant } from "@/features/vs-battle/engine/types";

interface Props {
  open: boolean;
  /** Forced after a faint: no cancel button. */
  forced: boolean;
  team: Array<Combatant>;
  active: number;
  hp: Array<number>;
  onPick: (index: number) => void;
  onCancel: () => void;
}

const SwitchModal = ({
  open,
  forced,
  team,
  active,
  hp,
  onPick,
  onCancel,
}: Props) => (
  <Modal open={open} overlay="dark">
    <div
      className="pxl-border"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        minWidth: 320,
      }}>
      <Text variant="darker" size="lg">
        {forced ? "CHOOSE YOUR NEXT POKEMON" : "SWITCH TO"}
      </Text>
      {team.map((c, i) => {
        const disabled = i === active || hp[i] === 0;
        return (
          <Button
            key={c.nickname}
            variant={disabled ? "light" : "dark"}
            disabled={disabled}
            onClick={() => onPick(i)}
            style={{ width: "100%", justifyContent: "space-between" }}>
            {c.nickname} · Lv.{c.battle_state.level} · {hp[i]}/{c.stats.hp} HP
          </Button>
        );
      })}
      {!forced && (
        <Button variant="light" onClick={onCancel} style={{ width: "100%" }}>
          CANCEL
        </Button>
      )}
    </div>
  </Modal>
);

export default SwitchModal;
```

- [ ] **Step 4: `BattleIntro` takes teams**

Change the props and both sides:

```tsx
interface IBattleIntroProps {
  player: Array<IMyPokemon>;
  enemy: Array<IMyPokemon>;
  onComplete: () => void;
}
```

Inside each `VsSide`, render `TypeCard`s and `VsName` from `player[0]` / `enemy[0]` as today, then replace the single `VsImage` with:

```tsx
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  {player.map((p, i) => (
    <div key={p.nickname} style={{ textAlign: "center" }}>
      <VsImage
        src={p.sprite}
        alt={p.nickname}
        style={{
          transform: "scaleX(-1)",
          width: i === 0 ? 300 : 140,
          height: i === 0 ? 300 : 140,
        }}
      />
      <VsLevel>Lv. {p.battle_state.level}</VsLevel>
    </div>
  ))}
</div>
```

(mirror for `enemy` without `scaleX(-1)`, name from `e.name`). Add to `BattleIntro/index.style.ts`:

```ts
export const VsLevel = styled("span")({
  display: "block",
  fontFamily: "'VT323', monospace",
  fontSize: "1.5rem",
  color: colors["white-800"],
  textShadow: `2px 2px 0 ${colors["gray-800"]}`,
});
```

- [ ] **Step 5: Wire 3v3 into `VSBattle`**

In `VSBattle/index.tsx`:

- `useState<boolean>(false)` named `switchOpen`.
- Intro call becomes `<BattleIntro player={playerTeam} enemy={state.enemy.team} onComplete={actions.endIntro} />`.
- Read the active index from `view.active` instead of `state.*.active`:
  ```ts
  const me = state.player.team[view.active.player];
  const foe = state.enemy.team[view.active.enemy];
  const myHp = view.hp.player[view.active.player];
  const foeHp = view.hp.enemy[view.active.enemy];
  ```
- After `</T.PlayerSection>` and before `<T.InterfaceWrapper>` add:
  ```tsx
  {
    mode === "3v3" && (
      <>
        <Bench
          side="enemy"
          team={state.enemy.team}
          active={view.active.enemy}
          hp={view.hp.enemy}
        />
        <Bench
          side="player"
          team={state.player.team}
          active={view.active.player}
          hp={view.hp.player}
        />
      </>
    );
  }
  ```
- `ActionPanel` gets `onSwitch={mode === "3v3" && aliveBench(state.player).length ? () => setSwitchOpen(true) : undefined}` (import `aliveBench` from the reducer).
- Before `<T.BattleWrapper>` add:
  ```tsx
  <SwitchModal
    open={switchOpen || (state.phase === "forced-switch" && !view.busy)}
    forced={state.phase === "forced-switch"}
    team={state.player.team}
    active={view.active.player}
    hp={view.hp.player}
    onPick={(to) => {
      setSwitchOpen(false);
      if (state.phase === "forced-switch") actions.forcedSwitch(to);
      else actions.act({ kind: "switch", to });
    }}
    onCancel={() => setSwitchOpen(false)}
  />
  ```
- `MenuTitle`: add a branch `state.phase === "forced-switch" ? "Choose your next Pokemon!"`.
- Remove the `key={foe.nickname}` / `key={me.nickname}` sprites' reliance on HP alone: they already re-mount on nickname change, so a switch animates out/in. Keep.

- [ ] **Step 6: Type-check, lint, tests, manual 3v3**

Run: `npx tsc --noEmit -p . && npm run lint && npm test`

Manual (until Task 9 lands, start 3v3 by URL): `/vs-battle?mode=3v3&team=<slug1>,<slug2>,<slug3>&seed=7`

- Intro shows three sprites per side with levels.
- Bench strips show two slots each with Lv and mini HP; enemy bench top-right, yours bottom-left.
- Switch: modal lists alive bench, switch resolves before the enemy acts (log order), sprite swaps.
- Your active faints: forced modal, no cancel; pick, battle continues.
- Enemy faints: enemy auto-switches, log shows `Enemy sent out`.
- KO grants EXP immediately: bench Pokemon get half (check Pokedex EXP after the battle).
- All three enemy down: victory; all three of yours down: defeat with 25% to every Pokemon that fought.

- [ ] **Step 7: Commit**

```bash
git add src/features/vs-battle src/hooks/common/battle/useBattleEngine.ts
git commit -m "feat(battle): 3v3 bench, switch modal, forced switch and team intro"
```

---

### Task 9: MyPokemon — mode toggle, multi pick, Status modal, Help v2, skill backfill

**Files:**

- Create: `src/features/my-pokemon/pick.ts` + `pick.test.ts`
- Create: `src/features/my-pokemon/components/ModeToggle/index.tsx` + `index.style.ts`
- Create: `src/features/my-pokemon/components/StatusModal/index.tsx`
- Modify: `src/features/my-pokemon/modules/MyPokemon/index.tsx`
- Modify: `src/features/my-pokemon/modules/MyPokemon/index.style.ts` (`PickBadge`, `HeaderRight`)

**Interfaces:**

- Consumes: `PokeCard` (unchanged), `Modal`, `Button`, `Text`, `TypeCard`, `StatRow`/`StatBar`/`StatBlock` from `@/features/detail/modules/DetailPokemon/index.style`, `usePokemonExperience().getExpProgress`, `RULES`, `getDetailPokemon`, `pickRandomMoves`, `powerFromMoveName`, `buildSkills`, `PLACEHOLDER_SKILL_NAMES`, `Gloves`.
- Produces:
  - `togglePick(picked: string[], nickname: string, max: number): string[]`
  - `maxPick(mode): 1 | 3`
  - `toSlug(nickname): string` (the existing `toLowerCase().replace(" ", "-")` rule, now in one place)
  - `BATTLE_MODE_KEY = "pokegames@battle-mode"`
  - `ModeToggle({ mode, onChange })`, `StatusModal({ pokemon, open, onClose })`

- [ ] **Step 1: Failing test for pick logic**

`src/features/my-pokemon/pick.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { maxPick, togglePick, toSlug } from "./pick";

describe("togglePick", () => {
  it("adds up to max in order, removes on second click, ignores overflow", () => {
    expect(togglePick([], "a", 3)).toEqual(["a"]);
    expect(togglePick(["a"], "b", 3)).toEqual(["a", "b"]);
    expect(togglePick(["a", "b", "c"], "d", 3)).toEqual(["a", "b", "c"]);
    expect(togglePick(["a", "b", "c"], "b", 3)).toEqual(["a", "c"]);
  });

  it("1v1 replaces the single pick", () => {
    expect(togglePick(["a"], "b", 1)).toEqual(["b"]);
    expect(togglePick(["a"], "a", 1)).toEqual([]);
  });

  it("maxPick and toSlug", () => {
    expect(maxPick("1v1")).toBe(1);
    expect(maxPick("3v3")).toBe(3);
    expect(toSlug("Big Chungus")).toBe("big-chungus");
  });
});
```

- [ ] **Step 2: `pick.ts`**

```ts
export type BattleMode = "1v1" | "3v3";

export const BATTLE_MODE_KEY = "pokegames@battle-mode";

export const maxPick = (mode: BattleMode) => (mode === "3v3" ? 3 : 1);

/** Same slug rule PokeCard uses for its selected check. ponytail: only the first space is replaced, as before. */
export const toSlug = (nickname: string) =>
  nickname.toLowerCase().replace(" ", "-");

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
```

Run: `npm test -- src/features/my-pokemon` → pass.

- [ ] **Step 3: `ModeToggle`**

`src/features/my-pokemon/components/ModeToggle/index.style.ts`:

```ts
import styled from "@emotion/styled";

export const Switch = styled("div")({
  display: "flex",
  border: "3px solid #000",
  backgroundColor: "#111",
  boxShadow: "3px 3px 0 #000",
});

export const Option = styled("button")<{ on: boolean }>(({ on }) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: "0.85rem",
  letterSpacing: "1px",
  color: on ? "#111" : "#9ca3af",
  backgroundColor: on ? "#71f57d" : "transparent",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.08s",
  "&:active": { transform: "scale(0.94)" },
  animation: on ? "mode-blink 1.6s steps(2) infinite" : "none",
  "@keyframes mode-blink": {
    "0%": { boxShadow: "inset 0 0 0 0 #fff" },
    "50%": { boxShadow: "inset 0 0 0 2px #fff" },
  },
}));
```

`src/features/my-pokemon/components/ModeToggle/index.tsx`:

```tsx
import { Option, Switch } from "./index.style";
import type { BattleMode } from "@/features/my-pokemon/pick";

interface Props {
  mode: BattleMode;
  onChange: (mode: BattleMode) => void;
}

/** 1v1: one ball. 3v3: three balls overlapping like a stack. Dim when the segment is off. */
const Balls = ({ n, on }: { n: number; on: boolean }) => (
  <span style={{ display: "flex" }}>
    {Array.from({ length: n }, (_, i) => (
      <img
        key={i}
        src="/static/pokeball-transparent.png"
        alt=""
        width={14}
        height={14}
        style={{
          imageRendering: "pixelated",
          marginLeft: i ? -5 : 0,
          opacity: on ? 1 : 0.45,
        }}
      />
    ))}
  </span>
);

const ModeToggle = ({ mode, onChange }: Props) => (
  <Switch role="radiogroup" aria-label="Battle mode">
    {(["1v1", "3v3"] as const).map((m) => (
      <Option
        key={m}
        role="radio"
        aria-checked={mode === m}
        on={mode === m}
        onClick={() => onChange(m)}>
        <Balls n={m === "3v3" ? 3 : 1} on={mode === m} />
        {m.toUpperCase()}
      </Option>
    ))}
  </Switch>
);

export default ModeToggle;
```

- [ ] **Step 4: `StatusModal`**

`src/features/my-pokemon/components/StatusModal/index.tsx`:

```tsx
import { Button, Modal, Text, TypeCard } from "@/components/ui";
import {
  StatBar,
  StatBlock,
  StatRow,
} from "@/features/detail/modules/DetailPokemon/index.style";
import { usePokemonExperience } from "@/hooks/common/battle/usePokemonExperience";
import { RULES } from "@/features/vs-battle/engine/rules";
import type { IMyPokemon } from "@/services/api/pokemons";

interface Props {
  pokemon: IMyPokemon | undefined;
  open: boolean;
  onClose: () => void;
}

const STAT_MAX = 400; // bar scale; scaled stats at Lv.100 stay under this

const STAT_LABELS: Array<[keyof IMyPokemon["stats"], string]> = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["special_attack", "Sp. Atk"],
  ["special_defense", "Sp. Def"],
  ["speed", "Speed"],
];

const StatusModal = ({ pokemon, open, onClose }: Props) => {
  const { getExpProgress } = usePokemonExperience();
  if (!pokemon) return null;
  const exp = getExpProgress(pokemon.nickname);
  const type = pokemon.types[0];

  const actions = [
    { name: "Basic Attack", power: RULES.BASIC.power, type: "normal", cd: "-" },
    {
      name: pokemon.skills[0].name,
      power: pokemon.skills[0].power,
      type: pokemon.skills[0].type,
      cd: String(pokemon.skills[0].cooldown),
    },
    {
      name: pokemon.skills[1].name,
      power: pokemon.skills[1].power,
      type: pokemon.skills[1].type,
      cd: String(pokemon.skills[1].cooldown),
    },
    ...pokemon.moves.map((m) => ({
      name: `ULT · ${m.name}`,
      power: m.power,
      type: m.type || type,
      cd: "gauge",
    })),
  ];

  return (
    <Modal open={open} overlay="dark">
      <div
        className="pxl-border"
        style={{
          width: "min(92vw, 520px)",
          padding: 16,
          textAlign: "left",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <img
            src={pokemon.sprite}
            alt={pokemon.nickname}
            width={96}
            height={96}
            style={{ imageRendering: "pixelated" }}
          />
          <div>
            <Text variant="darker" size="lg">
              {pokemon.nickname}
            </Text>
            <Text size="base">
              {pokemon.name} · Lv. {pokemon.battle_state.level}
            </Text>
            <Text size="base">
              EXP {exp?.current ?? 0}/{exp?.needed ?? 0}
            </Text>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {pokemon.types.map((t) => (
                <TypeCard
                  key={t}
                  type={t}
                  hasIcon
                  config={{ size: 14, fontSize: "base" }}
                />
              ))}
            </div>
          </div>
        </div>

        <StatBlock style={{ marginTop: 16 }}>
          {STAT_LABELS.map(([key, label]) => (
            <StatRow key={key}>
              <span>{label}</span>
              <StatBar
                type={type}
                pct={Math.min(100, (pokemon.stats[key] / STAT_MAX) * 100)}
              />
              <b>{pokemon.stats[key]}</b>
            </StatRow>
          ))}
        </StatBlock>

        <Text
          variant="darker"
          size="base"
          style={{
            display: "block",
            marginTop: 16,
            borderBottom: "2px dashed #000",
          }}>
          ACTIONS
        </Text>
        <table
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            marginTop: 8,
          }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th>Type</th>
              <th>Power</th>
              <th>CD</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td align="center">{a.type}</td>
                <td align="center">{a.power}</td>
                <td align="center">{a.cd}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Button
          variant="dark"
          onClick={onClose}
          style={{ width: "100%", marginTop: 16 }}>
          CLOSE
        </Button>
      </div>
    </Modal>
  );
};

export default StatusModal;
```

Check `StatBar`, `StatRow`, `StatBlock` are in the `export { ... }` list of `DetailPokemon/index.style.ts` (they are at lines ~511-513 today). If `StatBar` clip-path looks wrong on a white modal background, that is cosmetic; leave it.

- [ ] **Step 5: Rework `MyPokemon/index.tsx`**

Changes, in order:

1. Imports: add `useEffect, useRef` from react; `ModeToggle`, `StatusModal`; `loadMode, maxPick, saveMode, togglePick, toSlug` from `../../pick`; `getDetailPokemon` from `@/services/api/pokemons`; `buildSkills, PLACEHOLDER_SKILL_NAMES, pickRandomMoves, powerFromMoveName` from `@/utils/pokemon-utils`; `updatePokemon` from the store.
2. State: replace `selectedPokemon: string` with `picked: string[]` (nicknames) and `mode` (`useState(loadMode)`). Keep `deleteTarget: string` for the release modal. Add `showStatus: boolean`.
3. Mode change handler: `setMode(m); saveMode(m); setPicked((p) => p.slice(0, maxPick(m)));`
4. Backfill (runs once per mount, only for placeholder skills):
   ```tsx
   const backfilled = useRef(false);
   useEffect(() => {
     if (backfilled.current) return;
     backfilled.current = true;
     // ponytail: sequential, no retry; placeholder stays if PokeAPI is down.
     pokemons
       .filter((p) => p.skills[0].name === PLACEHOLDER_SKILL_NAMES[0])
       .forEach((p) => {
         getDetailPokemon(p.name.toLowerCase())
           .then((detail) => {
             if (!detail) return;
             const pool = pickRandomMoves(detail.moves, 2).map((m) => {
               const name = m.move?.name || "struggle";
               return { name, power: powerFromMoveName(name) };
             });
             updatePokemon(p.nickname, { skills: buildSkills(pool, p.types) });
           })
           .catch(() => undefined);
       });
   }, [pokemons, updatePokemon]);
   ```
5. Header right side: replace `{pokemons.length}/∞` with `<Text variant="outlined" size="lg">PICK {picked.length}/{maxPick(mode)}</Text>`. The toggle goes in the control panel (item 8), left of the battle button, per spec 5.1.
6. Card mapping:
   ```tsx
   {
     [...pokemons].reverse().map((pokemon) => {
       const order = picked.indexOf(pokemon.nickname);
       return (
         <T.WrapperCardList key={pokemon.nickname}>
           <PokeCard
             name={pokemon.name}
             nickname={pokemon.nickname}
             sprite={pokemon.sprite}
             level={pokemon.battle_state.level}
             exp={pokemon.battle_state.experience}
             selectedPokemon={order >= 0 ? toSlug(pokemon.nickname) : ""}
             setSelectedPokemon={() =>
               setPicked((p) => togglePick(p, pokemon.nickname, maxPick(mode)))
             }>
             {order >= 0 && (
               <T.PickBadge order={order}>{order + 1}</T.PickBadge>
             )}
             <DeleteButton
               onClick={(e) => {
                 e.stopPropagation();
                 setDeleteTarget(pokemon.nickname);
                 setDeleteConfirmation(true);
               }}
             />
           </PokeCard>
         </T.WrapperCardList>
       );
     });
   }
   ```
   `releasePokemon` also does `setPicked((p) => p.filter((n) => n !== nickname))`.
7. Control panel: add a third round button `i` labelled `STATUS`, `disabled={!picked.length}`, opens `StatusModal` for `pokemons.find((p) => p.nickname === picked[picked.length - 1])`. Extract the repeated round-button+label block into a local `RoundControl({ label, onClick, disabled?, bg?, children })` component inside the file to stop the inline-style copy paste.
8. Battle button block: wrap in `<T.BattleControls>` (flex row, gap 12, align center, flex 1) containing `<ModeToggle mode={mode} onChange={...} />` then the `Button`. Button: `disabled={picked.length !== maxPick(mode)}`, `onClick` navigates with `{ mode, team: picked.map(toSlug).join(","), seed: Date.now() }`, label `mode === "3v3" ? "SQUAD BATTLE 3v3" : "WILD BATTLE"`.
   8b. Overflow feedback (spec: 4th click shakes the card): in the card mapping compute `const full = picked.length >= maxPick(mode) && order < 0;` and pass `className={full && shakeKey === pokemon.nickname ? "shake" : undefined}` to `T.WrapperCardList`. `shakeKey` is a `useState<string>("")` set inside `setSelectedPokemon` when `togglePick` returns the same array (`next === p`), cleared by a 300 ms `setTimeout`. `WrapperCardList` gets `"&.shake": { animation: "card-shake 0.3s steps(4) 1" }` and the keyframes `{ "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-4px)" }, "75%": { transform: "translateX(4px)" } }`.
9. Help modal: title `TRAINER MANUAL v.2.0`, replace the four bullets with:
   - **Battle Ready:** unchanged.
   - **Growth Rate:** stats recalculated from base stats every level, +5 HP per level. Stronger foes give more EXP.
   - **Combo Chain:** Basic → Skill 1 → Skill 2 in order for x1.0 / x1.2 / x1.5 damage. Finishing the chain gives +50 Gauge. Wrong order breaks it.
   - **Overcharge:** Ultimate unlocks at 100 Gauge (x2.0) and scales to x3.0 at 150. Firing it empties the Gauge.
   - **Squad Tactics:** 3v3 picks three. One fights, two wait. Switch costs your turn. KO EXP: fighter 100%, bench 50%.
   - **Danger Zone:** unchanged.
10. Add to `index.style.ts` and its export list:
    ```ts
    /** Lead = red, 2nd = gold, 3rd = green (spec: distinct colour per pick order). */
    const BADGE_COLORS = ["#DC0A2D", "#D4AF37", "#32CD32"];

    const PickBadge = styled("span")<{ order: number }>(({ order }) => ({
      position: "absolute",
      top: 4,
      left: 8,
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "monospace",
      fontWeight: "bold",
      color: "#fff",
      backgroundColor: BADGE_COLORS[order] ?? BADGE_COLORS[0],
      border: "2px solid #000",
      zIndex: 6,
    }));

    const BattleControls = styled("div")({
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 16px",
    });
    ```
    `PokeCard`'s style already positions `.capture-qty, button` absolutely at top-right; the badge is a `span` at top-left so nothing collides.

- [ ] **Step 6: Type-check, lint, tests, manual**

Run: `npx tsc --noEmit -p . && npm run lint && npm test`

Manual:

- Toggle 1v1/3v3 persists across reload.
- 1v1: clicking a second card moves the pick. 3v3: badges 1, 2, 3; fourth click ignored; clicking a picked card removes it and renumbers.
- Fourth click in 3v3 shakes the card and changes nothing.
- STATUS opens for the last pick: sprite, level, EXP, types, six stat bars, action table with Skill 1/2 cooldowns and ULT rows.
- Toggle sits left of the battle button; SQUAD BATTLE 3v3 disabled until three picked; lands on `/vs-battle?mode=3v3&team=a,b,c&seed=...`.
- A Pokemon caught before this branch (skills named `Quick Strike`/`Power Blast`) gets real move names after one visit to the Pokedex (check STATUS again). With the network tab offline they keep the placeholders and nothing crashes.

- [ ] **Step 7: Commit**

```bash
git add src/features/my-pokemon
git commit -m "feat(pokedex): battle mode toggle, 3v3 team pick, status modal, manual v2 and skill backfill"
```

---

### Task 10: StartScreen — video background, entrance animation, footer, link hygiene

**Files:**

- Create: `public/static/poke-group.webm`, `public/static/poke-group.avif` (generated)
- Delete: `public/static/poke-group.gif`
- Modify: `src/features/start-screen/modules/StartScreen/index.tsx`
- Modify: `src/features/start-screen/modules/StartScreen/index.style.ts`

Measured on this machine with the commands below: gif 504 KB → webm 62 KB (VP9, crf 38) + avif poster 8 KB.

- [ ] **Step 1: Convert the asset**

```bash
ffmpeg -hide_banner -loglevel error -y -i public/static/poke-group.gif \
  -c:v libvpx-vp9 -b:v 0 -crf 38 -pix_fmt yuv420p -an \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" public/static/poke-group.webm
ffmpeg -hide_banner -loglevel error -y -i public/static/poke-group.gif -frames:v 1 \
  -c:v libaom-av1 -still-picture 1 -crf 30 -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" public/static/poke-group.avif
ls -la public/static/poke-group.*
git rm public/static/poke-group.gif
```

Expected: webm well under 100 KB, avif under 20 KB.

- [ ] **Step 2: Styles**

Replace `index.style.ts`:

```ts
import styled from "@emotion/styled";
import { motion } from "framer-motion";

export const Container = styled("section")({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  backgroundImage: "url('/static/poke-group.avif')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  imageRendering: "pixelated",
});

/** Animated background; poster/AVIF shows until it plays, and always for reduced-motion users. */
export const BgVideo = styled("video")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  imageRendering: "pixelated",
  pointerEvents: "none",
  zIndex: 0,
  "@media (prefers-reduced-motion: reduce)": { display: "none" },
});

export const Centering = styled(motion.div)({
  position: "relative",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "10px",
});

export const Blink = styled("div")({
  animation: "start-blink 1.4s steps(2) infinite",
  "@keyframes start-blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.55 },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

export const Footer = styled(motion.footer)({
  position: "absolute",
  bottom: 18,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: "5px",
});

export const A = styled("a")({
  textDecoration: "underline",
});
```

- [ ] **Step 3: Component**

Replace `index.tsx`:

```tsx
import { useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import * as T from "./index.style";
import { Button, Text } from "@/components/ui";

const item = { hidden: { opacity: 0, y: -24 }, show: { opacity: 1, y: 0 } };

const StartScreenModule = () => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  return (
    <T.Container>
      <T.BgVideo
        autoPlay
        muted
        loop
        playsInline
        poster="/static/poke-group.avif"
        aria-hidden="true">
        <source src="/static/poke-group.webm" type="video/webm" />
      </T.BgVideo>

      <T.Centering
        initial={reduced ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
        <motion.div variants={item}>
          <Text as="h1" variant="outlined" size="xl">
            POKEGAMES
          </Text>
        </motion.div>
        <motion.div variants={item}>
          <T.Blink>
            <Button
              onClick={() => navigate({ to: "/pokemons" })}
              variant="light">
              Press Start
            </Button>
          </T.Blink>
        </motion.div>
        <motion.div variants={item}>
          <Text variant="outlined" size="base">
            Source API{" "}
            <T.A
              href="https://pokeapi.co"
              target="_blank"
              rel="noopener noreferrer">
              PokeAPI
            </T.A>
          </Text>
        </motion.div>
      </T.Centering>

      <T.Footer
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}>
        <Text variant="outlined">
          &copy;{new Date().getFullYear()} radespratama
        </Text>
        <Text variant="outlined">
          | Want to contribute?{" "}
          <T.A
            href="https://github.com/radespratama/pokegames"
            target="_blank"
            rel="noopener noreferrer">
            GitHub
          </T.A>
        </Text>
      </T.Footer>
    </T.Container>
  );
};

export default StartScreenModule;
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit -p . && npm run lint && npm run build`
Then `npm run preview`: landing loads webm (Network tab ~62 KB instead of 504 KB), no horizontal scrollbar at 375 px width, title/button/link stagger in, Press Start blinks, links open in a new tab. With OS "reduce motion" on: static AVIF, no blink, no stagger.

- [ ] **Step 5: Commit**

```bash
git add public/static/poke-group.webm public/static/poke-group.avif src/features/start-screen
git commit -m "perf(start-screen): webm background with avif poster, entrance animation, footer cleanup"
```

---

### Task 11: README

**Files:**

- Modify: `README.md`

The working tree already carries an uncommitted reorder of the roadmap list (moves the Squad Tactics line up). Build on top of it; do not `git checkout` the file.

- [ ] **Step 1: Battle Mechanics section**

Replace the "We implemented fresh mechanics such as:" bullet list with:

```md
We implemented fresh mechanics such as:

- **Action Set:** Basic Attack, two elemental Skills with cooldowns, and a type-based Ultimate.
- **Combo Chain:** Basic → Skill 1 → Skill 2 in order multiplies damage (x1.0 / x1.2 / x1.5) and refunds +50 Gauge on the finisher. Breaking the order resets the chain.
- **Gauge & Overcharge:** Hits and hits taken charge a 0–150 Gauge. Ultimate unlocks at 100 (x2.0) and scales up to x3.0 at 150. Firing it empties the Gauge.
- **Squad Tactics (3v3):** Pick three Pokemon; one fights while two wait on the bench. Switching costs a turn, fainting forces a switch.
- **Adaptive Difficulty:** Wild Pokemon use a "Stat Clamping" system in the early game to ensure a fair fight, but unleash their full potential after Level 12.
- **Custom Scaling:** Stats are recalculated from base stats each level (~2% compound + flat HP). EXP scales with the level gap; bench members earn 50% of every KO.
```

If a heading in this section carries a version (`v1.0`), bump it to `v2.0`.

- [ ] **Step 2: Features and roadmap**

Move the two roadmap lines into the features list as checked:

```md
- [x] **Squad Tactics (3vs3 Team Match):** Pick a team of three, switch mid-battle, shared EXP.
- [x] **Pokemon Status Information:** Level, EXP, stats and full action set from the Pokedex.
```

and leave only Multiplayer PvP and Online Account under the roadmap.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(readme): battle mechanics v2, squad tactics and status view shipped"
```

---

## Final check (after Task 11)

- `npm test` green; `npx tsc --noEmit -p .` clean; `npm run lint` clean; `npm run build` succeeds.
- `grep -rn "battle-player-hp\|vs-battle-enemy\|poke-group.gif" src public index.html README.md` returns nothing.
- Full manual runs: one 1v1 to a win, one 3v3 to a loss, one reload mid-3v3, one migrated Pokemon (clear the store version to 1 in devtools to simulate) opens without errors.
