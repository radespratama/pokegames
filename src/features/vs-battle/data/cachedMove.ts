import type { QueryClient } from "@tanstack/react-query";
import { getMoveDetail } from "@/services/api/moves";

export const MOVE_STALE_MS = 24 * 60 * 60 * 1000;

export const loadCachedMove = (queryClient: QueryClient, name: string) =>
  queryClient.query({
    queryKey: ["move-detail", name],
    queryFn: () => getMoveDetail(name),
    staleTime: MOVE_STALE_MS,
    retry: 1,
  });
