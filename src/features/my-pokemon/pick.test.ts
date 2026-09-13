import { describe, expect, it } from "vitest";
import { maxPick, toSlug, togglePick } from "./pick";

describe("togglePick", () => {
  it("adds up to max in order, removes on second click, ignores overflow", () => {
    expect(togglePick([], "a", 3)).toEqual(["a"]);
    expect(togglePick(["a"], "b", 3)).toEqual(["a", "b"]);
    expect(togglePick(["a", "b", "c"], "d", 3)).toEqual(["a", "b", "c"]);
    expect(togglePick(["a", "b", "c"], "b", 3)).toEqual(["a", "c"]);
  });

  it("1v1 replaces the single pick", () => {
    expect(togglePick(["a"], "b", 1)).toEqual(["b"]);
    expect(togglePick(["a"], "a", 1)).toEqual([]);
  });

  it("maxPick and toSlug", () => {
    expect(maxPick("1v1")).toBe(1);
    expect(maxPick("3v3")).toBe(3);
    expect(toSlug("Big Chungus")).toBe("big-chungus");
  });
});
