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
