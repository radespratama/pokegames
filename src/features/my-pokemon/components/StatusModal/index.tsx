import type { IMyPokemon } from "@/services/api/pokemons";
import { Button, Modal, Text, TypeCard } from "@/components/ui";
import {
  StatBar,
  StatBlock,
  StatRow,
} from "@/features/detail/modules/DetailPokemon/index.style";
import { usePokemonExperience } from "@/hooks/common/battle/usePokemonExperience";
import { RULES } from "@/features/vs-battle/engine/rules";

interface Props {
  pokemon: IMyPokemon | undefined;
  open: boolean;
  onClose: () => void;
}

// bar scale; scaled stats at Lv.100 stay under this
const STAT_MAX = 400;

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
              EXP {exp.current}/{exp.needed}
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
