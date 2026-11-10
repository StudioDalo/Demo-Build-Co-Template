import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkSettings, enforceSettings, settingErrors } from "@/lib/env-check";
import { isProductionRuntime, testFallbacksAllowed } from "@/lib/runtime";
import { isWeakAdminPassword } from "@/lib/admin/password";
import { hidePlaceholders } from "@/lib/site";
import { siteSettings } from "@/clients/active/content";

vi.mock("server-only", () => ({}));

/** A complete, safe production environment (neutral example values). */
const GOOD = {
  NODE_ENV: "production",
  VERCEL: "1",
  VERCEL_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://example-client.vercel.app",
  SUPABASE_URL: "https://abc.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  RESEND_API_KEY: "resend-key",
  EMAIL_FROM: "Business <quotes@example.com>",
  LEAD_NOTIFY_EMAIL: "owner@example.com",
  ADMIN_PASSWORD: "a-long-unique-passphrase",
  ADMIN_SESSION_SECRET: "x".repeat(40),
  CRON_SECRET: "y".repeat(40),
};

describe("startup settings check", () => {
  it("passes a complete production setup (warnings only)", () => {
    expect(settingErrors(GOOD)).toEqual([]);
    expect(() => enforceSettings("server", GOOD)).not.toThrow();
  });
  it("lists every missing required setting, by name only", () => {
    const keys = settingErrors({ NODE_ENV: "production", VERCEL_ENV: "production" }).map((i) => i.key);
    expect(keys).toEqual(expect.arrayContaining([
      "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "EMAIL_FROM", "LEAD_NOTIFY_EMAIL",
      "NEXT_PUBLIC_SITE_URL", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "CRON_SECRET",
    ]));
    let msg = "";
    try {
      enforceSettings("build", { NODE_ENV: "production", VERCEL_ENV: "production" });
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toMatch(/production setting\(s\) missing or unsafe/);
    for (const k of ["EMAIL_FROM", "RESEND_API_KEY", "LEAD_NOTIFY_EMAIL", "NEXT_PUBLIC_SITE_URL", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "CRON_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) expect(msg).toContain(k);
  });
  it("flags unsafe values without printing them", () => {
    const bad = { ...GOOD, EMAIL_FROM: "Test <onboarding@resend.dev>", ADMIN_PASSWORD: "password123", ADMIN_SESSION_SECRET: "short", NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "leak" };
    const issues = settingErrors(bad);
    expect(issues.map((i) => i.key)).toEqual(expect.arrayContaining(["EMAIL_FROM", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"]));
    expect(JSON.stringify(issues)).not.toMatch(/password123|"short"|leak"/);
  });
  it("refuses the demo client on a real domain", () => {
    expect(settingErrors({ ...GOOD, NEXT_PUBLIC_SITE_URL: "https://www.real-business.co.uk" }).map((i) => i.key)).toContain("CLIENT");
  });
  it("only enforces in production; tests can downgrade locally but never on Vercel production", () => {
    expect(() => enforceSettings("server", { NODE_ENV: "development" })).not.toThrow();
    expect(() => enforceSettings("server", { NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "preview" })).not.toThrow();
    expect(() => enforceSettings("server", { NODE_ENV: "production", ALLOW_TEST_FALLBACKS: "1" })).not.toThrow();
    expect(() => enforceSettings("server", { NODE_ENV: "production", VERCEL_ENV: "production", ALLOW_TEST_FALLBACKS: "1" })).toThrow(/ALLOW_TEST_FALLBACKS/);
  });
  it("warns (non-fatal) about Sanity, Turnstile and a vercel.app address", () => {
    const warnings = checkSettings(GOOD).filter((i) => i.level === "warning").map((i) => i.key);
    expect(warnings).toEqual(expect.arrayContaining(["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SANITY_PROJECT_ID", "TURNSTILE_SECRET_KEY"]));
  });
});

describe("runtime detection", () => {
  it("knows production", () => {
    expect(isProductionRuntime({ VERCEL_ENV: "production" })).toBe(true);
    expect(isProductionRuntime({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(false);
    expect(isProductionRuntime({ NODE_ENV: "production" })).toBe(true); // `next start` off Vercel
    expect(isProductionRuntime({ NODE_ENV: "development" })).toBe(false);
    expect(testFallbacksAllowed({ ALLOW_TEST_FALLBACKS: "1" })).toBe(true);
    expect(testFallbacksAllowed({ ALLOW_TEST_FALLBACKS: "1", VERCEL_ENV: "production" })).toBe(false);
  });
  it("rejects weak admin passwords, including the business name", () => {
    expect(isWeakAdminPassword("short")).toBe(true);
    expect(isWeakAdminPassword("password123")).toBe(true);
    expect(isWeakAdminPassword("Demo Build Co!!!", "Demo Build Co")).toBe(true); // just the name plus punctuation
    expect(isWeakAdminPassword("blue-ladder-2026-office", "Demo Build Co")).toBe(false);
    expect(isWeakAdminPassword("demobuildco", "Demo Build Co")).toBe(true);
    expect(isWeakAdminPassword("a-long-unique-passphrase")).toBe(false);
  });
});

describe("safe defaults", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    for (const k of ["VERCEL", "VERCEL_ENV", "NEXT_PUBLIC_VERCEL_ENV", "NEXT_PUBLIC_SITE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ALLOW_TEST_FALLBACKS", "ADMIN_SESSION_SECRET"]) delete process.env[k];
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...saved };
    vi.unstubAllEnvs();
  });

  it("U6: hides placeholders on any Vercel production deployment, even without the real domain", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(hidePlaceholders()).toBe(true);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(hidePlaceholders()).toBe(false);
  });

  it("U2: refuses the local leads file in production unless the test flag is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getStores, StorageNotConfiguredError } = await import("@/lib/leads/store");
    expect(() => getStores()).toThrow(StorageNotConfiguredError);
    vi.resetModules();
    vi.stubEnv("ALLOW_TEST_FALLBACKS", "1");
    const again = await import("@/lib/leads/store");
    expect(again.getStores().backend).toBe("file");
  });

  it("U10: the admin dashboard is off in production without a strong session secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "a-long-unique-passphrase");
    const auth = await import("@/lib/admin/auth");
    expect(auth.adminConfigured()).toBe(false);
    vi.stubEnv("ADMIN_SESSION_SECRET", "z".repeat(40));
    expect(auth.adminConfigured()).toBe(true);
  });

  it("U7: the client's starter settings switch every trust claim off", () => {
    expect(siteSettings.insured).toBe(false);
    const t = siteSettings.trustStrip;
    expect([t.showRating, t.showReviewCount, t.showYears, t.showInsured, t.showAccreditations]).toEqual([false, false, false, false, false]);
  });
});
