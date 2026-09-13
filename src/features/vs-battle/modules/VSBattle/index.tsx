import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as T from "./index.style";
import DamageFloaters from "./DamageFloaters";
import BattleIntro from "@/features/vs-battle/components/shared/BattleIntro";
import ActionPanel from "@/features/vs-battle/components/ActionPanel";
import GaugeBar from "@/features/vs-battle/components/GaugeBar";
import ChainIndicator from "@/features/vs-battle/components/ChainIndicator";
import UltimateBanner from "@/features/vs-battle/components/UltimateBanner";
import Bench from "@/features/vs-battle/components/Bench";
import SwitchModal from "@/features/vs-battle/components/SwitchModal";
import ResultPanel from "@/features/vs-battle/components/ResultPanel";
import { usePokemonStore } from "@/store/app/pokemonStore";
import { useSpawnEnemies } from "@/hooks/common/battle/useSpawnEnemies";
import { useBattleEngine } from "@/hooks/common/battle/useBattleEngine";
import { aliveBench } from "@/features/vs-battle/engine/reducer";
import { toSlug } from "@/utils/pokemon-utils";

interface Props {
  mode: "1v1" | "3v3";
  team: Array<string>;
  seed: number;
}

const VersusBattleModule = ({ mode, team, seed }: Props) => {
  const { pokemons } = usePokemonStore();
  const logRef = useRef<HTMLDivElement>(null);
  const [switchOpen, setSwitchOpen] = useState<boolean>(false);

  const playerTeam = useMemo(
    () =>
      team
        .map((slug) => pokemons.find((p) => toSlug(p.nickname) === slug))
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
    return <T.Container />;
  if (isLoading || !state) return <T.Container />;

  const me = state.player.team[view.active.player];
  const foe = state.enemy.team[view.active.enemy];
  const myHp = view.hp.player[view.active.player];
  const foeHp = view.hp.enemy[view.active.enemy];
  const locked = view.busy || state.phase !== "select";

  return (
    <T.Container>
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

      <AnimatePresence>
        {state.phase === "intro" && (
          <BattleIntro
            player={playerTeam}
            enemy={state.enemy.team}
            onComplete={actions.endIntro}
          />
        )}
      </AnimatePresence>

      <T.BattleWrapper>
        <UltimateBanner cast={view.ultimateCast} />
        <T.BattleField>
          {mode === "3v3" && (
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
          )}

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
                  : state.phase === "forced-switch"
                    ? "Choose your next Pokemon!"
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
                  <T.MeterStack>
                    <GaugeBar gauge={me.gauge} />
                    <ChainIndicator
                      step={me.chainStep}
                      finished={
                        state.log.at(-1)?.includes("COMBO FINISHER") ?? false
                      }
                    />
                  </T.MeterStack>
                  <ActionPanel
                    combatant={me}
                    disabled={locked}
                    onAct={actions.act}
                    onSwitch={
                      mode === "3v3" && aliveBench(state.player).length
                        ? () => setSwitchOpen(true)
                        : undefined
                    }
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
