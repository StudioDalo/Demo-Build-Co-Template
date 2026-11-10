import { describe, expect, it } from "vitest";
import { SupabaseLeadStore } from "@/lib/leads/store";

/** Minimal fake of the supabase-js query builder, enough to check column mapping. */
function fakeDb() {
  const rows: Record<string, any>[] = [];
  const calls: { op: string; payload?: any; filters: [string, unknown][] }[] = [];
  const builder = (op: string, payload?: any) => {
    const call = { op, payload, filters: [] as [string, unknown][] };
    calls.push(call);
    const run = () => {
      if (op === "insert") {
        const row = { id: "11111111-1111-4111-8111-111111111111", created_at: "2026-11-05T10:00:00Z", updated_at: "2026-11-05T10:00:00Z", ...payload };
        rows.push(row);
        return row;
      }
      let found = rows.filter((r) => call.filters.every(([k, v]) => r[k] === v));
      if (op === "update") found = found.map((r) => Object.assign(r, payload));
      return found;
    };
    const q: any = {
      select: () => q, order: () => q, limit: () => q,
      eq: (k: string, v: unknown) => (call.filters.push([k, v]), q),
      single: async () => ({ data: run(), error: null }),
      maybeSingle: async () => ({ data: ([] as any[]).concat(run())[0] ?? null, error: null }),
      then: (res: any) => res({ data: run(), error: null }),
    };
    return q;
  };
  const db: any = { from: () => ({ insert: (p: any) => builder("insert", p), update: (p: any) => builder("update", p), select: () => builder("select") }) };
  return { db, rows, calls };
}

describe("SupabaseLeadStore", () => {
  it("maps camelCase leads to snake_case columns and back", async () => {
    const { db, rows } = fakeDb();
    const store = new SupabaseLeadStore(db);
    const lead = await store.create({
      type: "quote", complete: false, status: "new", score: "warm", scorePoints: 5, name: "Sam", phone: "07700900456", email: "s@example.com",
      postcode: "SW16 3AA", services: ["landscaping"], answers: { timing: "asap" }, uploads: [], notes: [], source: { page: "/" }, consent: true, tokenHash: "abc", wonValue: null, wonAt: null, attribution: {},
    });
    expect(rows[0]).toMatchObject({ score_points: 5, token_hash: "abc", postcode: "SW16 3AA", complete: false });
    expect(rows[0]).not.toHaveProperty("scorePoints");
    expect(lead).toMatchObject({ id: "11111111-1111-4111-8111-111111111111", scorePoints: 5, tokenHash: "abc", createdAt: "2026-11-05T10:00:00Z" });
    const updated = await store.update(lead.id, { status: "won", notes: [{ at: "x", text: "Signed" }] });
    expect(updated?.status).toBe("won");
    expect(rows[0].notes).toEqual([{ at: "x", text: "Signed" }]);
    expect(rows[0].updated_at).not.toBe("2026-11-05T10:00:00Z");
  });

  it("applies list filters as column filters", async () => {
    const { db, calls } = fakeDb();
    const store = new SupabaseLeadStore(db);
    await store.list({ status: "contacted", score: "hot", complete: true });
    expect(calls.at(-1)!.filters).toEqual([["status", "contacted"], ["score", "hot"], ["complete", true]]);
  });
});

describe("SupabaseLeadStore: won value + attribution columns", () => {
  it("maps wonValue/wonAt and attribution to their own columns", async () => {
    const { db, rows } = fakeDb();
    const store = new SupabaseLeadStore(db);
    const lead = await store.create({
      type: "quote", complete: true, status: "new", score: null, scorePoints: null, name: "A", phone: "07700900456", email: "", postcode: "",
      services: [], answers: {}, uploads: [], notes: [], source: {}, consent: true, tokenHash: "x",
      wonValue: null, wonAt: null, attribution: { gclid: "Cj0KCQ", utm_source: "google", utm_campaign: "loft-conversions" },
    });
    expect(rows[0]).toMatchObject({ gclid: "Cj0KCQ", utm_source: "google", utm_campaign: "loft-conversions" });
    expect(lead.attribution).toEqual({ gclid: "Cj0KCQ", utm_source: "google", utm_campaign: "loft-conversions" });
    await store.update(lead.id, { status: "won", wonAt: "2026-11-06T10:00:00Z", wonValue: 48500 });
    expect(rows[0]).toMatchObject({ won_value: 48500, won_at: "2026-11-06T10:00:00Z" });
  });
});

describe("getStores on Vercel", () => {
  it("refuses the temporary file fallback when Supabase isn't configured", async () => {
    const saved = { ...process.env };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.VERCEL = "1";
    const { vi } = await import("vitest");
    vi.resetModules();
    const mod = await import("@/lib/leads/store");
    expect(() => mod.getStores()).toThrow(mod.StorageNotConfiguredError);
    expect(mod.tryGetStores()).toBeNull();
    process.env = saved;
  });
});
