import { POKEMON_TYPE_ICONS } from "@/utils/constant";

interface Props {
  type: string;
}

const TypeIcon = ({ type }: Props) => (
  <img
    src={POKEMON_TYPE_ICONS[type]}
    alt={type}
    width={18}
    height={18}
    style={{ marginRight: 6 }}
  />
);

export default TypeIcon;
