import type { IBattleMove, IMyPokemon, ISkill } from "@/services/api/pokemons";
import type { BattleState, Combatant, Rng } from "./types";

export const sequenceRng = (values: Array<number>): Rng => {
  let index = 0;
  return () => values.at(index++) ?? values.at(-1) ?? 0;
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
