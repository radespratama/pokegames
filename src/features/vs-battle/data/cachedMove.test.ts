import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { MOVE_STALE_MS, loadCachedMove } from "./cachedMove";

const { getMoveDetail } = vi.hoisted(() => ({ getMoveDetail: vi.fn() }));

vi.mock("@/services/api/moves", () => ({ getMoveDetail }));

describe("loadCachedMove", () => {
  it("uses a 24-hour move-detail cache with one retry", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const move = {
      name: "psybeam",
      power: 65,
      accuracy: 100,
      priority: 0,
      type: { name: "psychic" },
      damage_class: { name: "special" as const },
    };
    getMoveDetail.mockResolvedValue(move);

    await expect(loadCachedMove(queryClient, "psybeam")).resolves.toEqual(move);
    await expect(loadCachedMove(queryClient, "psybeam")).resolves.toEqual(move);
    expect(getMoveDetail).toHaveBeenCalledTimes(1);
    expect(
      queryClient.getQueryState(["move-detail", "psybeam"])?.dataUpdatedAt,
    ).toBeGreaterThan(0);
    expect(MOVE_STALE_MS).toBe(24 * 60 * 60 * 1000);
  });
});
