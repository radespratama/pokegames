# Battle v3 Hybrid Moves and Tactical AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PokeAPI-backed hybrid move metadata, physical/special damage, move priority, and tactical 3v3 enemy switching without implementing status effects.

**Architecture:** A data module enriches at most eight move refs through an injected cached loader and returns normalized `IBattleMove` values. The pure battle engine consumes those values for damage, action order, and tactical scoring; React callers only load/cache data and render category/accuracy metadata. Zustand schema v3 keeps older saves playable and marks them for background enrichment.

**Tech Stack:** React 19, TypeScript 5 strict, Vite 7, Axios, TanStack Query 5, Zustand 5 persist, Emotion, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-09-13-battle-v3-hybrid-moves-tactical-ai-design.md`

## Global Constraints

- Keep BGM, SFX, status effects, buffs/debuffs, PP, weather, abilities, and items out of scope.
- Fetch only PokeAPI `/move/{name}` metadata; never parse localized `effect_entries`.
- Enrich at most eight unique candidate moves per Pokemon and cache each move detail for 24 hours with retry 1.
- Preserve battle v2 power bands: normalized Ultimate 30–65, Skill 1 40–50, Skill 2 60–70.
- Basic remains neutral physical, power 20, accuracy 100, priority 0.
- Every engine random decision must use an injected `Rng`; do not add direct `Math.random()` calls inside engine modules.
- Store migration must never make an older Pokemon unplayable when network enrichment fails.
- Preserve Combo Chain, gauge, cooldown, EXP, forced switch, session persistence, and the current pixel-art layout.
- Use `import type` under `verbatimModuleSyntax` and keep TypeScript strict, ESLint, and Prettier clean.
- Preserve unrelated dirty worktree changes. Stage and commit only paths listed by the current task.

## File Map

| Path                                                  | Responsibility                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `src/services/api/moves.ts`                           | Raw PokeAPI move response and REST adapter                      |
| `src/services/api/pokemons.ts`                        | Persisted move and Pokemon contracts                            |
| `src/features/vs-battle/data/movePool.ts`             | Selection, enrichment, normalization, fallback, slot assignment |
| `src/features/vs-battle/data/cachedMove.ts`           | TanStack Query adapter for cached move loading                  |
| `src/store/app/migrate.ts`                            | Store v2 → v3 compatibility defaults                            |
| `src/features/detail/modules/DetailPokemon/index.tsx` | Enrichment before saving a caught Pokemon                       |
| `src/features/my-pokemon/modules/MyPokemon/index.tsx` | Background enrichment of saved v2 Pokemon                       |
| `src/hooks/common/battle/useSpawnEnemies.ts`          | Enriched enemy profiles; pure `buildEnemy`                      |
| `src/features/vs-battle/engine/action.ts`             | Action metadata, damage input, and priority                     |
| `src/features/vs-battle/engine/damage.ts`             | Physical/special damage and deterministic estimate              |
| `src/features/vs-battle/engine/testFixtures.ts`       | Complete typed factories shared by engine tests                 |
| `src/features/vs-battle/engine/reducer.ts`            | Priority-first round execution                                  |
| `src/features/vs-battle/engine/ai.ts`                 | Full-state tactical scoring and voluntary switch                |
| `src/features/vs-battle/components/ActionPanel/*`     | Move category, accuracy, and accessible labels                  |

---

### Task 1: Move contracts, REST adapter, and store v3

**Files:**

- Create: `src/services/api/moves.ts`
- Modify: `src/services/api/pokemons.ts`
- Modify: `src/store/app/migrate.ts`
- Modify: `src/store/app/migrate.test.ts`
- Modify: `src/store/app/pokemonStore.ts`
- Modify typed move fixtures in: `src/hooks/common/battle/buildEnemy.test.ts`, `src/utils/pokemon-utils.test.ts`

**Interfaces:**

- Produces: `MoveDamageClass`, `IBattleMove`, `ISkill`, `IPokeMoveDetailResponse`, `getMoveDetail(name)`.
- Produces: `IMyPokemon.moveDataVersion?: 2 | 3` and store version 3 compatibility defaults.

- [ ] **Step 1: Write the failing migration test**

Add to `src/store/app/migrate.test.ts`:

```ts
it("keeps v2 moves playable and marks them for enrichment", () => {
  const pokemon = migratePokemon({
    ...legacy,
    moves: [{ name: "thunder", power: 60, type: "electric" }],
    skills: [
      { name: "spark", power: 45, type: "electric", cooldown: 2 },
      { name: "slam", power: 65, type: "normal", cooldown: 3 },
    ],
  });

  expect(pokemon.moveDataVersion).toBe(2);
  expect(pokemon.moves[0]).toMatchObject({
    damageClass: "physical",
    accuracy: 100,
    priority: 0,
  });
  expect(pokemon.skills[0]).toMatchObject({
    damageClass: "physical",
    accuracy: 100,
    priority: 0,
  });
});
```

- [ ] **Step 2: Run the test and verify red**

```bash
npx vitest run src/store/app/migrate.test.ts
```

Expected: FAIL because move metadata and `moveDataVersion` are absent.

- [ ] **Step 3: Add contracts and the move endpoint**

In `src/services/api/pokemons.ts`:

```ts
export type MoveDamageClass = "physical" | "special";

export interface IBattleMove {
  name: string;
  power: number;
  type: string;
  damageClass: MoveDamageClass;
  accuracy: number;
  priority: number;
}

export interface ISkill extends IBattleMove {
  cooldown: number;
}
```

Add `moveDataVersion?: 2 | 3`, change `moves` to `Array<IBattleMove>`, and keep `skills: [ISkill, ISkill]` on `IMyPokemon`.

Create `src/services/api/moves.ts`:

```ts
import axios from "@/libs/axios";

export interface IPokeMoveDetailResponse {
  name: string;
  power: number | null;
  accuracy: number | null;
  priority: number;
  type: { name: string };
  damage_class: { name: "physical" | "special" | "status" };
}

export async function getMoveDetail(
  name: string,
): Promise<IPokeMoveDetailResponse | undefined> {
  const result = await axios.get(`/move/${name}`);
  return result.data as IPokeMoveDetailResponse;
}
```

- [ ] **Step 4: Implement compatibility defaults and bump the store**

In `src/store/app/migrate.ts` add:

```ts
import type { IBattleMove, ISkill } from "@/services/api/pokemons";

const migrateMove = <
  T extends { name: string; power: number; type?: string | null },
>(
  move: T,
): T & IBattleMove => ({
  ...move,
  type: move.type || "normal",
  damageClass:
    "damageClass" in move && move.damageClass === "special"
      ? "special"
      : "physical",
  accuracy:
    "accuracy" in move && typeof move.accuracy === "number"
      ? move.accuracy
      : 100,
  priority:
    "priority" in move && typeof move.priority === "number" ? move.priority : 0,
});
```

Map existing moves through `migrateMove`, map skills and cast the result to `[ISkill, ISkill]`, and set `moveDataVersion: p.moveDataVersion === 3 ? 3 : 2`. Change the Zustand persist version to `3`.

- [ ] **Step 5: Update fixtures and verify green**

Add `damageClass: "physical"`, `accuracy: 100`, and `priority: 0` to every move fixture in `buildEnemy.test.ts`, `migrate.test.ts`, and `pokemon-utils.test.ts`.

```bash
npx vitest run src/store/app/migrate.test.ts
npx tsc --noEmit
```

Expected: PASS with no missing move fields.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/services/api/moves.ts src/services/api/pokemons.ts src/store/app/migrate.ts src/store/app/migrate.test.ts src/store/app/pokemonStore.ts src/hooks/common/battle/buildEnemy.test.ts src/utils/pokemon-utils.test.ts
git commit -m "feat(battle): add hybrid move contracts"
```

---

### Task 2: Enriched move-pool module

**Files:**

- Create: `src/features/vs-battle/data/movePool.ts`
- Create: `src/features/vs-battle/data/movePool.test.ts`
- Create: `src/features/vs-battle/data/cachedMove.ts`
- Modify: `src/utils/pokemon-utils.ts`
- Modify: `src/utils/pokemon-utils.test.ts`

**Interfaces:**

- Produces: `loadBattleMovePool(refs, count, rng, loadMove): Promise<IBattleMove[]>`.
- Produces: `assignBattleSlots(pool, ultimateCount)` and `loadCachedMove(queryClient, name)`.
- Produces: `createSeededRng(seed): Rng` for repeatable enemy selection.
- Changes: `buildSkills(pool: IBattleMove[])` preserves move metadata.

- [ ] **Step 1: Write failing normalization tests**

Create `src/features/vs-battle/data/movePool.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { loadBattleMovePool, normalizePower } from "./movePool";

const refs = ["psybeam", "tackle", "growl"].map((name) => ({
  move: { name },
}));
const detail = (
  name: string,
  damageClass: "physical" | "special" | "status",
  power: number | null,
) => ({
  name,
  power,
  accuracy: 90,
  priority: name === "tackle" ? 1 : 0,
  type: { name: name === "psybeam" ? "psychic" : "normal" },
  damage_class: { name: damageClass },
});

describe("loadBattleMovePool", () => {
  it("normalizes damaging moves and excludes known status moves", async () => {
    const load = vi.fn(async (name: string) =>
      name === "psybeam"
        ? detail(name, "special", 65)
        : name === "tackle"
          ? detail(name, "physical", 40)
          : detail(name, "status", null),
    );
    const pool = await loadBattleMovePool(refs, 2, () => 0.999, load);
    expect(pool).toEqual([
      {
        name: "psybeam",
        power: normalizePower(65),
        type: "psychic",
        damageClass: "special",
        accuracy: 90,
        priority: 0,
      },
      {
        name: "tackle",
        power: normalizePower(40),
        type: "normal",
        damageClass: "physical",
        accuracy: 90,
        priority: 1,
      },
    ]);
  });

  it("uses deterministic physical fallback after total failure", async () => {
    const load = vi.fn(async () => {
      throw new Error("offline");
    });
    const pool = await loadBattleMovePool(refs, 2, () => 0.999, load);
    expect(pool).toHaveLength(2);
    expect(pool[0]).toMatchObject({
      name: "psybeam",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
      type: "normal",
    });
  });
});
```

- [ ] **Step 2: Run the test and verify red**

```bash
npx vitest run src/features/vs-battle/data/movePool.test.ts
```

Expected: FAIL because the data module does not exist.

- [ ] **Step 3: Implement normalization and fallback**

Create `movePool.ts` with `MAX_CANDIDATES = 8`, unique seeded shuffle, `Promise.allSettled`, and:

```ts
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const normalizePower = (power: number) =>
  Math.round(30 + ((clamp(power, 20, 150) - 20) / 130) * 35);

const fallbackMove = (name: string): IBattleMove => ({
  name,
  power: powerFromMoveName(name),
  type: "normal",
  damageClass: "physical",
  accuracy: 100,
  priority: 0,
});

export function createSeededRng(seed: number): Rng {
  let value = seed || 1;
  return () => (value = (value * 1103515245 + 12345) % 2147483648) / 2147483648;
}
```

Filter fulfilled responses to `physical`/`special` with positive power. Normalize accuracy with `clamp(detail.accuracy ?? 100, 1, 100)`. Append unused fallback candidates and return exactly `count` entries when enough refs exist.

- [ ] **Step 4: Add slot assignment and metadata-preserving skills**

Export:

```ts
export function assignBattleSlots(
  pool: Array<IBattleMove>,
  ultimateCount: number,
): { moves: Array<IBattleMove>; skills: [ISkill, ISkill] } {
  const count = Math.max(1, ultimateCount);
  return {
    moves: pool.slice(0, count),
    skills: buildSkills(pool.slice(count, count + 2)),
  };
}
```

Change `buildSkills` to accept `Array<IBattleMove>`. Present moves return `{ ...move, power: fitPower(move.power, range), cooldown }`. Default skills include `damageClass: "physical"`, accuracy 100, priority 0, and type normal.

- [ ] **Step 5: Add the cached loader**

Create `cachedMove.ts`:

```ts
import type { QueryClient } from "@tanstack/react-query";
import { getMoveDetail } from "@/services/api/moves";

export const MOVE_STALE_MS = 24 * 60 * 60 * 1000;
export const loadCachedMove = (queryClient: QueryClient, name: string) =>
  queryClient.fetchQuery({
    queryKey: ["move-detail", name],
    queryFn: () => getMoveDetail(name),
    staleTime: MOVE_STALE_MS,
    retry: 1,
  });
```

- [ ] **Step 6: Verify and commit Task 2**

```bash
npx vitest run src/features/vs-battle/data/movePool.test.ts src/utils/pokemon-utils.test.ts
npx tsc --noEmit
git add src/features/vs-battle/data src/utils/pokemon-utils.ts src/utils/pokemon-utils.test.ts
git commit -m "feat(battle): normalize PokeAPI moves"
```

---

### Task 3: Catch, saved-Pokemon, and enemy enrichment

**Files:**

- Modify: `src/features/detail/modules/DetailPokemon/index.tsx`
- Modify: `src/features/my-pokemon/modules/MyPokemon/index.tsx`
- Modify: `src/hooks/common/battle/useSpawnEnemies.ts`
- Modify: `src/hooks/common/battle/buildEnemy.test.ts`

**Interfaces:**

- Consumes: `loadBattleMovePool`, `assignBattleSlots`, `loadCachedMove`.
- Changes: `buildEnemy(detail, pool, refLevel, rng): IMyPokemon`.
- Produces: newly caught, backfilled, and enemy Pokemon with `moveDataVersion: 3`.

- [ ] **Step 1: Write the failing enemy-profile test**

Pass a normalized pool into `buildEnemy` and assert:

```ts
expect(enemy.moveDataVersion).toBe(3);
expect(enemy.moves[0].damageClass).toBe("special");
expect(enemy.skills).toHaveLength(2);
expect(enemy.skills.every((skill) => skill.accuracy > 0)).toBe(true);
```

- [ ] **Step 2: Run the enemy test and verify red**

```bash
npx vitest run src/hooks/common/battle/buildEnemy.test.ts
```

Expected: FAIL because `buildEnemy` does not consume an enriched pool.

- [ ] **Step 3: Enrich newly caught and saved Pokemon**

Get `queryClient` with `useQueryClient`. In DetailPokemon make `onNicknameSave` async and load:

```ts
const ultimateCount = Math.max(1, typesBuild.length);
const pool = await loadBattleMovePool(
  pokemonDetail.moves,
  ultimateCount + 2,
  Math.random,
  (name) => loadCachedMove(queryClient, name),
);
const { moves, skills } = assignBattleSlots(pool, ultimateCount);
```

Save `moves`, `skills`, and `moveDataVersion: 3`. In MyPokemon, backfill `pokemon.moveDataVersion !== 3` using the same loader and slot count, then call:

```ts
updatePokemon(pokemon.nickname, { moves, skills, moveDataVersion: 3 });
```

Keep the existing catch validation and network-failure fallback behavior.

- [ ] **Step 4: Make enemy loading battle-ready**

Change `buildEnemy` to receive `pool: Array<IBattleMove>`, use `assignBattleSlots`, and return `moveDataVersion: 3`.

Each enemy query returns `{ detail, pool }`:

```ts
queryFn: async () => {
  const detail = await getDetailPokemon(id);
  if (!detail) throw new Error(`Pokemon ${id} returned no detail`);
  const moveRng = createSeededRng(seed + id + index);
  const pool = await loadBattleMovePool(
    detail.moves,
    Math.max(1, detail.types.length) + 2,
    moveRng,
    (name) => loadCachedMove(queryClient, name),
  );
  return { detail, pool };
},
```

Use query key `["battle-enemy", id, seed]`. Use a separate seeded RNG for enemy level generation.

- [ ] **Step 5: Verify and commit Task 3**

```bash
npx vitest run src/hooks/common/battle/buildEnemy.test.ts src/features/vs-battle/data/movePool.test.ts src/store/app/migrate.test.ts
npx tsc --noEmit
npm run lint -- --no-fix
git add src/features/detail/modules/DetailPokemon/index.tsx src/features/my-pokemon/modules/MyPokemon/index.tsx src/hooks/common/battle/useSpawnEnemies.ts src/hooks/common/battle/buildEnemy.test.ts
git commit -m "feat(battle): enrich Pokemon move data"
```

---

### Task 4: Physical/special damage and accuracy

**Files:**

- Create: `src/features/vs-battle/engine/action.ts`
- Modify: `src/features/vs-battle/engine/damage.ts`
- Create or modify: `src/features/vs-battle/engine/damage.test.ts`
- Create: `src/features/vs-battle/engine/testFixtures.ts`
- Modify: `src/features/vs-battle/engine/reducer.ts`
- Modify: `src/features/vs-battle/engine/rules.ts`

**Interfaces:**

- Produces: `damageInputForAction(combatant, action): DamageInput`.
- Produces: `estimateDamage(attacker, defender, input): number` without consuming RNG.
- Changes: `DamageInput` uses `damageClass` and `accuracy` instead of slot `missChance`.

- [ ] **Step 1: Write failing damage and accuracy tests**

Create `engine/testFixtures.ts`:

```ts
import type { IBattleMove, IMyPokemon, ISkill } from "@/services/api/pokemons";
import type { BattleState, Combatant, Rng } from "./types";

export const sequenceRng = (values: Array<number>): Rng => {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
};

export const moveFixture = (
  overrides: Partial<IBattleMove> = {},
): IBattleMove => ({
  name: "tackle",
  power: 45,
  type: "normal",
  damageClass: "physical",
  accuracy: 100,
  priority: 0,
  ...overrides,
});

export const pokemonFixture = (
  statOverrides: Partial<IMyPokemon["stats"]> = {},
): IMyPokemon => {
  const skill = (overrides: Partial<ISkill>): ISkill => ({
    ...moveFixture(),
    cooldown: 2,
    ...overrides,
  });
  return {
    name: "testmon",
    nickname: "TEST",
    base_experience: 64,
    battle_state: { level: 10, experience: 1000 },
    stats: {
      hp: 100,
      attack: 70,
      defense: 70,
      special_attack: 70,
      special_defense: 70,
      speed: 70,
      ...statOverrides,
    },
    types: ["normal"],
    moveDataVersion: 3,
    moves: [moveFixture({ name: "hyper-beam", power: 65 })],
    skills: [
      skill({ name: "quick-attack", power: 45 }),
      skill({ name: "body-slam", power: 65, cooldown: 3 }),
    ],
  };
};

export const combatantFixture = (
  pokemon: IMyPokemon = pokemonFixture(),
): Combatant => ({
  ...pokemon,
  currentHp: pokemon.stats.hp,
  gauge: 0,
  chainStep: 0,
  cooldowns: { skill1: 0, skill2: 0 },
  fainted: false,
  participated: true,
});

export const battleStateFixture = (
  options: {
    mode?: "1v1" | "3v3";
    playerSpeed?: number;
    enemySpeed?: number;
  } = {},
): BattleState => {
  const player = combatantFixture(
    pokemonFixture({ speed: options.playerSpeed ?? 70 }),
  );
  const enemy = combatantFixture(
    pokemonFixture({ speed: options.enemySpeed ?? 60 }),
  );
  const bench = (nickname: string): Combatant => ({
    ...combatantFixture(),
    nickname,
  });
  return {
    mode: options.mode ?? "1v1",
    player: { team: [player], active: 0 },
    enemy: {
      team:
        options.mode === "3v3"
          ? [enemy, bench("BENCH-1"), bench("BENCH-2")]
          : [enemy],
      active: 0,
    },
    phase: "select",
    winner: null,
    log: [],
    events: [],
  };
};
```

Then create or update `damage.test.ts`:

```ts
import { pokemonFixture, sequenceRng } from "./testFixtures";

it("uses special attack and special defense for a special move", () => {
  const attacker = pokemonFixture({ attack: 20, special_attack: 120 });
  const defender = pokemonFixture({ defense: 120, special_defense: 20 });
  const result = calculateDamage(
    attacker,
    defender,
    {
      power: 60,
      type: "psychic",
      damageClass: "special",
      accuracy: 100,
      critChance: 0,
    },
    sequenceRng([0.5, 0.5, 0.5]),
  );
  expect(result.damage).toBeGreaterThan(30);
});

it("misses when the accuracy roll is outside the hit range", () => {
  const attacker = pokemonFixture();
  const defender = pokemonFixture();
  const result = calculateDamage(
    attacker,
    defender,
    {
      power: 60,
      type: "normal",
      damageClass: "physical",
      accuracy: 80,
      critChance: 0,
    },
    sequenceRng([0.9]),
  );
  expect(result).toMatchObject({ damage: 0, isMiss: true });
});
```

- [ ] **Step 2: Run the damage test and verify red**

```bash
npx vitest run src/features/vs-battle/engine/damage.test.ts
```

Expected: FAIL because `DamageInput` has no category/accuracy behavior.

- [ ] **Step 3: Implement selected stats and deterministic estimation**

Replace the miss check with:

```ts
if (rng() >= input.accuracy / 100) {
  return {
    damage: 0,
    isCritical: false,
    isMiss: true,
    effectiveness: 1,
    desc: ["It missed!"],
  };
}
```

Select stats with:

```ts
const attackStat =
  input.damageClass === "special"
    ? attacker.stats.special_attack
    : attacker.stats.attack;
const defenseStat =
  input.damageClass === "special"
    ? defender.stats.special_defense
    : defender.stats.defense;
```

Extract shared private damage math and export:

```ts
export function estimateDamage(
  attacker: IMyPokemon,
  defender: IMyPokemon,
  input: DamageInput,
): number {
  const expectedCrit = 1 + input.critChance * (RULES.CRIT_MUL - 1);
  return Math.max(
    0,
    Math.floor(
      baseDamage(attacker, defender, input, expectedCrit, 1) *
        (input.accuracy / 100),
    ),
  );
}
```

- [ ] **Step 4: Centralize action-to-input mapping**

Create `engine/action.ts`:

```ts
import type { BattleAction, Combatant } from "./types";
import type { DamageInput } from "./damage";
import { RULES, overchargeMul } from "./rules";

type AttackAction = Exclude<BattleAction, { kind: "switch" }>;

export function damageInputForAction(
  combatant: Combatant,
  action: AttackAction,
): DamageInput {
  if (action.kind === "basic") {
    return {
      power: RULES.BASIC.power,
      type: null,
      damageClass: "physical",
      accuracy: 100,
      critChance: RULES.BASIC.critChance,
    };
  }
  if (action.kind === "ultimate") {
    const move = combatant.moves[action.index];
    return {
      power: move.power,
      type: move.type,
      damageClass: move.damageClass,
      accuracy: move.accuracy,
      critChance: RULES.ULTIMATE.critChance,
      overchargeMul: overchargeMul(combatant.gauge),
    };
  }
  const move = combatant.skills[action.kind === "skill1" ? 0 : 1];
  const rule = action.kind === "skill1" ? RULES.SKILL1 : RULES.SKILL2;
  return {
    power: move.power,
    type: move.type,
    damageClass: move.damageClass,
    accuracy: move.accuracy,
    critChance: rule.critChance,
  };
}
```

Reducer adds `chainMul` to this input before calling `calculateDamage`. Remove `missChance` from Skill and Ultimate rules after no caller remains.

- [ ] **Step 5: Verify and commit Task 4**

```bash
npx vitest run src/features/vs-battle/engine/damage.test.ts src/features/vs-battle/engine/reducer.test.ts
npx tsc --noEmit
git add src/features/vs-battle/engine/action.ts src/features/vs-battle/engine/damage.ts src/features/vs-battle/engine/damage.test.ts src/features/vs-battle/engine/testFixtures.ts src/features/vs-battle/engine/reducer.ts src/features/vs-battle/engine/rules.ts
git commit -m "feat(battle): split physical and special damage"
```

---

### Task 5: Priority-first action order

**Files:**

- Modify: `src/features/vs-battle/engine/action.ts`
- Modify: `src/features/vs-battle/engine/rules.ts`
- Modify: `src/features/vs-battle/engine/reducer.ts`
- Create or modify: `src/features/vs-battle/engine/reducer.test.ts`

**Interfaces:**

- Produces: `actionPriority(combatant, action): number`.
- Produces: `playerActsFirst(state, playerAction, enemyAction, rng): boolean`.

- [ ] **Step 1: Write failing priority tests**

Add to `reducer.test.ts`:

```ts
import { battleStateFixture } from "./testFixtures";

it("processes an enemy switch before a faster player attack", () => {
  const state = battleStateFixture({ playerSpeed: 200, enemySpeed: 10 });
  expect(
    playerActsFirst(
      state,
      { kind: "basic" },
      { kind: "switch", to: 1 },
      () => 0,
    ),
  ).toBe(false);
});

it("uses move priority before speed", () => {
  const state = battleStateFixture({ playerSpeed: 10, enemySpeed: 200 });
  state.player.team[0].skills[0].priority = 1;
  expect(
    playerActsFirst(state, { kind: "skill1" }, { kind: "basic" }, () => 0.9),
  ).toBe(true);
});
```

- [ ] **Step 2: Run the reducer test and verify red**

```bash
npx vitest run src/features/vs-battle/engine/reducer.test.ts
```

Expected: FAIL because enemy switch and move priority are not considered.

- [ ] **Step 3: Implement priority helpers**

Add `SWITCH_PRIORITY: 100` to `RULES` so switch stays above the complete PokeAPI move-priority range. In `action.ts`:

```ts
export function actionPriority(
  combatant: Combatant,
  action: BattleAction,
): number {
  if (action.kind === "switch") return RULES.SWITCH_PRIORITY;
  if (action.kind === "basic") return 0;
  if (action.kind === "ultimate") {
    return combatant.moves[action.index]?.priority ?? 0;
  }
  return combatant.skills[action.kind === "skill1" ? 0 : 1].priority;
}
```

In `reducer.ts`, export and use:

```ts
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
```

- [ ] **Step 4: Verify and commit Task 5**

```bash
npx vitest run src/features/vs-battle/engine/reducer.test.ts
npx tsc --noEmit
git add src/features/vs-battle/engine/action.ts src/features/vs-battle/engine/rules.ts src/features/vs-battle/engine/reducer.ts src/features/vs-battle/engine/reducer.test.ts
git commit -m "feat(battle): resolve actions by priority"
```

---

### Task 6: Tactical full-state enemy AI

**Files:**

- Modify: `src/features/vs-battle/engine/ai.ts`
- Create: `src/features/vs-battle/engine/ai.test.ts`
- Modify: `src/features/vs-battle/engine/rules.ts`
- Modify: `src/features/vs-battle/engine/reducer.ts`

**Interfaces:**

- Changes: `chooseEnemyAction(state, rng): BattleAction` receives full battle state.
- Produces: attack scoring and conditional voluntary switch with deterministic jitter.

- [ ] **Step 1: Write failing tactical-choice tests**

Create `ai.test.ts` using `battleStateFixture` from Task 4:

```ts
import { describe, expect, it } from "vitest";
import { chooseEnemyAction } from "./ai";
import { battleStateFixture } from "./testFixtures";

describe("chooseEnemyAction", () => {
  it("chooses an available move that can KO", () => {
    const state = battleStateFixture();
    state.player.team[0].currentHp = 8;
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill2" });
  });

  it("switches from a bad matchup to a stronger live bench", () => {
    const state = battleStateFixture({ mode: "3v3" });
    state.enemy.team[0].types = ["fire"];
    state.enemy.team[0].skills.forEach((move) => {
      move.type = "fire";
    });
    state.enemy.team[0].currentHp = Math.floor(
      state.enemy.team[0].stats.hp * 0.3,
    );
    state.enemy.team[1].types = ["electric"];
    state.enemy.team[1].skills.forEach((move) => {
      move.type = "electric";
    });
    state.player.team[0].types = ["water"];
    expect(chooseEnemyAction(state, () => 0)).toEqual({
      kind: "switch",
      to: 1,
    });
  });

  it("never switches in 1v1 or to a fainted bench", () => {
    const one = battleStateFixture({ mode: "1v1" });
    expect(chooseEnemyAction(one, () => 0).kind).not.toBe("switch");
    const three = battleStateFixture({ mode: "3v3" });
    three.enemy.team.slice(1).forEach((pokemon) => {
      pokemon.fainted = true;
      pokemon.currentHp = 0;
    });
    expect(chooseEnemyAction(three, () => 0).kind).not.toBe("switch");
  });

  it("targets the weaker special defense when powers match", () => {
    const state = battleStateFixture();
    state.player.team[0].stats.defense = 150;
    state.player.team[0].stats.special_defense = 20;
    state.enemy.team[0].skills[0].power = 60;
    state.enemy.team[0].skills[0].damageClass = "physical";
    state.enemy.team[0].skills[1].power = 60;
    state.enemy.team[0].skills[1].damageClass = "special";
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill2" });
  });

  it("continues a chain when candidate damage is otherwise equal", () => {
    const state = battleStateFixture();
    state.enemy.team[0].chainStep = 1;
    state.enemy.team[0].skills[0].power = 50;
    state.enemy.team[0].skills[1].power = 50;
    expect(chooseEnemyAction(state, () => 0)).toEqual({ kind: "skill1" });
  });
});
```

- [ ] **Step 2: Run AI tests and verify red**

```bash
npx vitest run src/features/vs-battle/engine/ai.test.ts
```

Expected: FAIL because AI accepts one combatant and never switches voluntarily.

- [ ] **Step 3: Add tunable AI rules**

Replace probability-only AI values with:

```ts
AI: {
  KO_BONUS: 1000,
  CHAIN_CONTINUE_BONUS: 18,
  OVERCHARGE_READY_BONUS: 12,
  SWITCH_MARGIN: 35,
  LOW_HP_RATIO: 0.35,
  BAD_EFFECTIVENESS: 0.5,
  JITTER: 4,
},
```

- [ ] **Step 4: Implement attack scoring**

Build Basic, available skills, and every available Ultimate. For each candidate call `damageInputForAction` and `estimateDamage`, then add KO, matching-chain, Overcharge, and `rng() * RULES.AI.JITTER` bonuses. Stable-sort descending and retain both `score` and estimated raw damage for switch evaluation.

```ts
const score =
  damage +
  (damage >= defender.currentHp ? RULES.AI.KO_BONUS : 0) +
  (action.kind === CHAIN_ORDER[attacker.chainStep]
    ? RULES.AI.CHAIN_CONTINUE_BONUS
    : 0) +
  (action.kind === "ultimate" && attacker.gauge >= RULES.GAUGE_MAX
    ? RULES.AI.OVERCHARGE_READY_BONUS
    : 0) +
  rng() * RULES.AI.JITTER;
```

- [ ] **Step 5: Implement guarded switch scoring**

Only score live bench in 3v3 when active HP is at or below `LOW_HP_RATIO` or the best active move effectiveness is at or below `BAD_EFFECTIVENESS`.

```ts
const zeroRng: Rng = () => 0;
const offense = bestAttack(candidate, player, zeroRng);
const incoming = bestAttack(player, candidate, zeroRng).damage;
const hpRatio = candidate.currentHp / candidate.stats.hp;
const switchScore = offense.score - incoming * 0.5 + hpRatio * 25;
```

Return `{ kind: "switch", to }` only if the best bench score is at least `SWITCH_MARGIN` above the active attack score. Never include the active index or a fainted member.

- [ ] **Step 6: Pass the full state from reducer and verify**

Change the reducer call to:

```ts
const enemyAction = chooseEnemyAction(s, rng);
```

Run:

```bash
npx vitest run src/features/vs-battle/engine/ai.test.ts src/features/vs-battle/engine/reducer.test.ts src/features/vs-battle/engine/damage.test.ts
npx tsc --noEmit
```

Expected: all focused engine tests PASS.

- [ ] **Step 7: Commit Task 6**

```bash
git add src/features/vs-battle/engine/ai.ts src/features/vs-battle/engine/ai.test.ts src/features/vs-battle/engine/rules.ts src/features/vs-battle/engine/reducer.ts
git commit -m "feat(battle): add tactical enemy AI"
```

---

### Task 7: ActionPanel category and accuracy feedback

**Files:**

- Modify: `src/features/vs-battle/components/ActionPanel/index.tsx`
- Modify: `src/features/vs-battle/components/ActionPanel/index.style.ts`
- Create: `src/features/vs-battle/components/ActionPanel/index.test.tsx`

**Interfaces:**

- Consumes: `IBattleMove.damageClass`, `accuracy`, and `priority`.
- Produces: visible `PHY`/`SP`, `ACC n`, and descriptive accessible button names.

- [ ] **Step 1: Write the failing static-render test**

Create `ActionPanel/index.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ActionPanel from ".";
import { toCombatant } from "@/features/vs-battle/engine/reducer";

const combatant = toCombatant({
  name: "alakazam",
  nickname: "SPOON",
  base_experience: 225,
  battle_state: { level: 20, experience: 8000 },
  stats: {
    hp: 100,
    attack: 40,
    defense: 45,
    special_attack: 135,
    special_defense: 95,
    speed: 120,
  },
  types: ["psychic"],
  moveDataVersion: 3,
  moves: [
    {
      name: "psychic",
      power: 65,
      type: "psychic",
      damageClass: "special",
      accuracy: 100,
      priority: 0,
    },
  ],
  skills: [
    {
      name: "psybeam",
      power: 45,
      type: "psychic",
      damageClass: "special",
      accuracy: 90,
      priority: 0,
      cooldown: 2,
    },
    {
      name: "headbutt",
      power: 65,
      type: "normal",
      damageClass: "physical",
      accuracy: 100,
      priority: 0,
      cooldown: 3,
    },
  ],
});

describe("ActionPanel move metadata", () => {
  it("renders category, accuracy, and an accessible skill label", () => {
    const html = renderToStaticMarkup(
      <ActionPanel combatant={combatant} disabled={false} onAct={vi.fn()} />,
    );
    expect(html).toContain("SP");
    expect(html).toContain("ACC 90");
    expect(html).toContain(
      'aria-label="psybeam, special, power 45, accuracy 90"',
    );
  });
});
```

- [ ] **Step 2: Run the component test and verify red**

```bash
npx vitest run src/features/vs-battle/components/ActionPanel/index.test.tsx
```

Expected: FAIL because metadata badges and accessible labels are absent.

- [ ] **Step 3: Add reusable move metadata markup**

In `ActionPanel/index.tsx` add:

```tsx
const MoveMeta = ({ move }: { move: IBattleMove }) => (
  <S.MoveMeta>
    <S.ClassBadge damageClass={move.damageClass}>
      {move.damageClass === "physical" ? "PHY" : "SP"}
    </S.ClassBadge>
    <span>ACC {move.accuracy}</span>
  </S.MoveMeta>
);

const moveLabel = (move: IBattleMove) =>
  `${move.name}, ${move.damageClass}, power ${move.power}, accuracy ${move.accuracy}`;
```

Render `MoveMeta` inside both skill buttons and each Ultimate button. Add `aria-label={moveLabel(move)}`. Define Basic as an `IBattleMove` constant with name `Basic`, normal type, power 20, physical category, accuracy 100, and priority 0, then render the same metadata.

- [ ] **Step 4: Style compact pixel badges**

Add to `ActionPanel/index.style.ts`:

```ts
export const MoveMeta = styled("span")({
  position: "absolute",
  left: 6,
  bottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.7rem",
  lineHeight: 1,
  letterSpacing: "1px",
  color: colors["white-800"],
  textShadow: "1px 1px 0 #000",
});

export const ClassBadge = styled("span")<{
  damageClass: MoveDamageClass;
}>(({ damageClass }) => ({
  padding: "1px 3px",
  color: colors["white-800"],
  backgroundColor:
    damageClass === "physical" ? colors["red-700"] : colors["sky-700"],
  border: `1px solid ${colors["gray-900"]}`,
}));
```

Increase button bottom padding enough to keep metadata separate from the move name and power.

- [ ] **Step 5: Verify and commit Task 7**

```bash
npx vitest run src/features/vs-battle/components/ActionPanel/index.test.tsx
npx tsc --noEmit
npm run lint -- --no-fix
git add src/features/vs-battle/components/ActionPanel/index.tsx src/features/vs-battle/components/ActionPanel/index.style.ts src/features/vs-battle/components/ActionPanel/index.test.tsx
git commit -m "feat(battle): show move class and accuracy"
```

---

### Task 8: End-to-end verification and scope audit

**Files:**

- No planned source changes. A failure returns to the task that owns the affected module.

**Interfaces:**

- Verifies all interfaces produced by Tasks 1–7 together.

- [ ] **Step 1: Run focused battle and migration tests**

```bash
npx vitest run src/features/vs-battle src/hooks/common/battle/buildEnemy.test.ts src/store/app/migrate.test.ts src/utils/pokemon-utils.test.ts
```

Expected: all focused test files PASS with no unhandled rejection.

- [ ] **Step 2: Run the complete automated suite**

```bash
npm test
npx tsc --noEmit
npm run lint -- --no-fix
npx prettier --check src/services/api/moves.ts src/services/api/pokemons.ts src/features/vs-battle src/hooks/common/battle/useSpawnEnemies.ts src/store/app src/utils/pokemon-utils.ts src/features/detail/modules/DetailPokemon/index.tsx src/features/my-pokemon/modules/MyPokemon/index.tsx
npm run build
```

Expected: every command exits 0. Existing Vite option-deprecation messages are accepted; new warnings are failures.

- [ ] **Step 3: Confirm excluded mechanics were not added**

```bash
rg -n "effect_entries|ailment|stat_changes|healing|drain|flinch|weather|terrain|audio|bgm" src/features/vs-battle src/services/api/moves.ts
```

Expected: no matches because battle v3 does not type or execute excluded effects.

- [ ] **Step 4: Confirm deterministic engine randomness**

```bash
rg -n "Math\.random" src/features/vs-battle/engine
```

Expected: matches occur only in default parameter declarations such as `rng: Rng = Math.random`; no function body calls `Math.random()` directly.

- [ ] **Step 5: Exercise both battle modes in the running app**

1. Catch or backfill a Pokemon with at least one special move.
2. Start 1v1 and confirm `PHY`/`SP` plus `ACC` are visible.
3. Use one physical and one special move; confirm damage and playback complete.
4. Start 3v3 with a poor enemy matchup and confirm voluntary switch resolves before the player attack.
5. Reload mid-battle and confirm move metadata, HP, active Pokemon, reward ledger, and phase remain intact.
6. Finish the match and confirm `Find New Opponent` starts a fresh enriched battle.

- [ ] **Step 6: Inspect final repository state**

```bash
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors and no files outside the Task 1–7 path lists were changed by battle v3 implementation. If any check fails, return to the owning task, add a regression test that reproduces the failure, fix it, rerun that task’s verification, and amend only that task’s commit.
