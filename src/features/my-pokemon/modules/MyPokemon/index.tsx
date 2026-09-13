import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import ModeToggle from "../../components/ModeToggle";
import StatusModal from "../../components/StatusModal";
import { loadMode, maxPick, saveMode, toSlug, togglePick } from "../../pick";
import * as T from "./index.style";
import type { BattleMode } from "../../pick";
import type { IMyPokemon } from "@/services/api/pokemons";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { Button, DeleteButton, Modal, PokeCard, Text } from "@/components/ui";
import { getDetailPokemon } from "@/services/api/pokemons";
import {
  PLACEHOLDER_SKILL_NAMES,
  buildSkills,
  pickRandomMoves,
  powerFromMoveName,
} from "@/utils/pokemon-utils";

const PokedexDecorations = () => (
  <T.PokedexHeaderDeco>
    <T.BigBlueLight />
    <T.SmallLightsContainer>
      <T.SmallLight color="#990000" />
      <T.SmallLight color="#D4AF37" />
      <T.SmallLight color="#32CD32" />
    </T.SmallLightsContainer>
  </T.PokedexHeaderDeco>
);

/** One round button + label under it; the three control-panel buttons were copy-paste before. */
const RoundControl = ({
  label,
  onClick,
  disabled,
  bg,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  bg?: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
    <T.RoundButton
      style={bg ? { backgroundColor: bg } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}>
      {children}
    </T.RoundButton>
    <span
      style={{
        fontSize: "10px",
        color: "#555",
        fontWeight: "bold",
        fontFamily: "monospace",
      }}>
      {label}
    </span>
  </div>
);

const MyPokemonModule = () => {
  const navigate = useNavigate();

  const { pokemons, removePokemon, updatePokemon } = usePokemonStore();
  const [deleteTarget, setDeleteTarget] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [picked, setPicked] = useState<Array<string>>([]);
  const [mode, setMode] = useState<BattleMode>(loadMode);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [shakeKey, setShakeKey] = useState<string>("");

  function releasePokemon(nickname: string) {
    removePokemon(nickname);
    setPicked((p) => p.filter((n) => n !== nickname));
    setDeleteConfirmation(false);
  }

  const changeMode = (m: BattleMode) => {
    setMode(m);
    saveMode(m);
    setPicked((p) => p.slice(0, maxPick(m)));
  };

  const pick = (nickname: string) => {
    setPicked((p) => {
      const next = togglePick(p, nickname, maxPick(mode));
      if (next === p && !p.includes(nickname)) {
        setShakeKey(nickname);
        setTimeout(() => setShakeKey(""), 300);
      }
      return next;
    });
  };

  // ponytail: backfill runs once per mount, sequential, no retry; placeholder stays if PokeAPI is down.
  const backfilled = useRef(false);
  useEffect(() => {
    if (backfilled.current) return;
    backfilled.current = true;
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

  const lastPicked = pokemons.find(
    (p) => p.nickname === picked[picked.length - 1],
  );

  return (
    <>
      <Modal open={deleteConfirmation} overlay="dark">
        <T.DeleteConfirmationModal>
          <div className="pxl-border">
            <Text variant="darker" size="lg">
              RELEASE {deleteTarget.toUpperCase()}?
            </Text>
            <br />
            <Text size="base">ACTION CANNOT BE UNDONE.</Text>
          </div>
          <div>
            <Button variant="dark" onClick={() => releasePokemon(deleteTarget)}>
              CONFIRM
            </Button>

            <Button
              variant="light"
              onClick={() => setDeleteConfirmation(false)}>
              CANCEL
            </Button>
          </div>
        </T.DeleteConfirmationModal>
      </Modal>

      <StatusModal
        pokemon={lastPicked}
        open={showStatus}
        onClose={() => setShowStatus(false)}
      />

      <Modal open={showInfoModal} overlay="dark">
        <T.InfoModal>
          <div
            className="pxl-border"
            style={{ textAlign: "left", width: "100%" }}>
            <Text
              variant="darker"
              size="lg"
              style={{
                borderBottom: "2px dashed #000",
                paddingBottom: 8,
                display: "block",
              }}>
              TRAINER MANUAL v.2.0
            </Text>

            <ul
              style={{
                paddingLeft: 20,
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
              <li>
                <Text size="base">
                  <strong>Battle Ready:</strong> Captured Pokemon receive a
                  genetic boost. <strong>+30 HP</strong> &{" "}
                  <strong>+2% Stats</strong> instantly.
                </Text>
              </li>
              <li>
                <Text size="base">
                  <strong>Growth Rate:</strong> Stats recalculated from base
                  stats every level, <strong>+5 HP</strong> per level. Stronger
                  foes give more EXP.
                </Text>
              </li>
              <li>
                <Text size="base">
                  <strong>Combo Chain:</strong> Basic → Skill 1 → Skill 2 in
                  order for <strong>x1.0 / x1.2 / x1.5</strong> damage.
                  Finishing the chain gives <strong>+50 Gauge</strong>. Wrong
                  order breaks it.
                </Text>
              </li>
              <li>
                <Text size="base">
                  <strong>Overcharge:</strong> Ultimate unlocks at{" "}
                  <strong>100 Gauge (x2.0)</strong> and scales to{" "}
                  <strong>x3.0</strong> at 150. Firing it empties the Gauge.
                </Text>
              </li>
              <li>
                <Text size="base">
                  <strong>Squad Tactics:</strong> 3v3 picks three. One fights,
                  two wait. Switch costs your turn. KO EXP: fighter{" "}
                  <strong>100%</strong>, bench <strong>50%</strong>.
                </Text>
              </li>
              <li>
                <Text size="base">
                  <strong>Danger Zone:</strong> Wild Pokemon limiters are
                  removed at <strong>Level 12</strong>. Expect{" "}
                  <strong>Real Stats</strong> & difficulty spikes!
                </Text>
              </li>
            </ul>
          </div>

          <Button
            variant="dark"
            onClick={() => setShowInfoModal(false)}
            style={{ width: "100%" }}>
            UNDERSTOOD
          </Button>
        </T.InfoModal>
      </Modal>

      <T.PokedexFrame>
        <PokedexDecorations />

        <T.ScreenBezel>
          <T.ScreenHeader>
            <Text variant="outlined" size="lg">
              • MY POKEMON
            </Text>
            <Text variant="outlined" size="lg">
              PICK {picked.length}/{maxPick(mode)}
            </Text>
          </T.ScreenHeader>

          <T.ScreenContainer>
            <T.ScreenContent>
              {pokemons.length ? (
                <T.Grid>
                  {[...pokemons].reverse().map((pokemon: IMyPokemon) => {
                    const order = picked.indexOf(pokemon.nickname);
                    const full = picked.length >= maxPick(mode) && order < 0;
                    return (
                      <T.WrapperCardList
                        key={pokemon.nickname}
                        className={
                          full && shakeKey === pokemon.nickname
                            ? "shake"
                            : undefined
                        }>
                        <PokeCard
                          name={pokemon.name}
                          nickname={pokemon.nickname}
                          sprite={pokemon.sprite}
                          level={pokemon.battle_state.level}
                          exp={pokemon.battle_state.experience}
                          selectedPokemon={
                            order >= 0 ? toSlug(pokemon.nickname) : ""
                          }
                          setSelectedPokemon={() => pick(pokemon.nickname)}>
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
                  })}
                </T.Grid>
              ) : (
                <T.EmptyState>
                  <Text size="lg" variant="outlined">
                    NO DATA
                  </Text>
                  <Link to="/pokemons">
                    <Button variant="light">SEARCH WILD</Button>
                  </Link>
                </T.EmptyState>
              )}
            </T.ScreenContent>
          </T.ScreenContainer>

          <T.ControlPanel>
            {/* GROUP ROUND BUTTONS */}
            <div style={{ display: "flex", gap: "16px" }}>
              <RoundControl
                label="BACK"
                onClick={() => navigate({ to: "/pokemons" })}>
                ◀
              </RoundControl>

              <RoundControl
                label="HELP"
                bg="#3b82f6"
                onClick={() => setShowInfoModal(true)}>
                ?
              </RoundControl>

              <RoundControl
                label="STATUS"
                bg="#22c55e"
                disabled={!picked.length}
                onClick={() => setShowStatus(true)}>
                i
              </RoundControl>
            </div>

            <T.BattleControls>
              <ModeToggle mode={mode} onChange={changeMode} />
              <Button
                type="button"
                variant="dark"
                disabled={picked.length !== maxPick(mode)}
                size="lg"
                style={{ width: "100%", boxShadow: "4px 4px 0px #000" }}
                onClick={() =>
                  navigate({
                    to: "/vs-battle",
                    search: {
                      mode,
                      team: picked.map(toSlug).join(","),
                      seed: Date.now(),
                    },
                  })
                }>
                {mode === "3v3" ? "SQUAD BATTLE 3v3" : "WILD BATTLE"}
              </Button>
            </T.BattleControls>

            <T.SpeakerVents>
              <div></div>
              <div></div>
              <div></div>
            </T.SpeakerVents>
          </T.ControlPanel>
        </T.ScreenBezel>
      </T.PokedexFrame>
    </>
  );
};

export default MyPokemonModule;
