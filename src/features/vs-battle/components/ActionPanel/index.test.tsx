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
