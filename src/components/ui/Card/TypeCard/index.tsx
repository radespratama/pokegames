import { PixelatedTypeCard } from "./index.style";
import Text from "@/components/ui/Text";

export interface TypeCardProps {
  type: string;
}

const TypeCard = ({ type }: TypeCardProps) => {
  return (
    <PixelatedTypeCard type={type} className="pxl-border">
      <Text variant="outlined" size="lg">
        {type}
      </Text>
    </PixelatedTypeCard>
  );
};

export default TypeCard;
