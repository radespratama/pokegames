import * as S from "./index.style";
import type { IBattleMove } from "@/services/api/pokemons";

interface Props {
  move: IBattleMove;
}

const MoveMeta = ({ move }: Props) => (
  <S.MoveMeta>
    <S.ClassBadge damageClass={move.damageClass}>
      {move.damageClass === "physical" ? "PHY" : "SP"}
    </S.ClassBadge>
    <span>ACC {move.accuracy}</span>
  </S.MoveMeta>
);

export default MoveMeta;
