import { describe, expect, it } from "vitest";
import { deepMerge } from "@/lib/content/merge";

describe("deepMerge (CMS over seed)", () => {
  it("overrides set values and keeps seed for missing/empty ones", () => {
    const base = { a: "seed", b: { c: "seed", d: "seed" }, list: [1, 2] };
    const out = deepMerge(base, { a: "cms", b: { c: "", d: null }, list: [3], _id: "x" });
    expect(out).toEqual({ a: "cms", b: { c: "seed", d: "seed" }, list: [3] });
  });
  it("returns base when override is null", () => {
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
  });
});
