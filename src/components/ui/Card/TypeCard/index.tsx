import { PixelatedTypeCard } from "./index.style";
import { POKEMON_TYPE_ICONS } from "@/utils/constant";
import Text from "@/components/ui/Text";

export interface TypeCardProps {
  type: string;
  hasIcon?: boolean;
  config?: {
    size?: number;
    fontSize?: "base" | "lg" | "xl";
  };
}

const TypeCard = ({ type, hasIcon = false, config }: TypeCardProps) => {
  return (
    <PixelatedTypeCard
      type={type}
      className="pxl-border"
      style={{
        ...(hasIcon && {
          display: "flex",
          alignItems: "center",
          maxWidth: "fit-content",
        }),
      }}>
      {hasIcon && (
        <img
          alt={type}
          src={POKEMON_TYPE_ICONS[type]}
          width={config?.size || 24}
          height={config?.size || 24}
          loading="lazy"
        />
      )}
      <Text
        as="p"
        variant="outlined"
        size={config?.fontSize || "lg"}
        style={{ ...(hasIcon && { marginLeft: 8 }) }}>
        {type}
      </Text>
    </PixelatedTypeCard>
  );
};

export default TypeCard;
