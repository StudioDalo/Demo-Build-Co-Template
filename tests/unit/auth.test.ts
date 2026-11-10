import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }) }));
vi.mock("next/navigation", () => ({ redirect: () => undefined }));

describe("admin session", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-horse";
    delete process.env.ADMIN_SESSION_SECRET;
  });
  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("checks the password", async () => {
    const { checkPassword } = await import("@/lib/admin/auth");
    expect(checkPassword("correct-horse")).toBe(true);
    expect(checkPassword("wrong")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
  it("signs sessions, rejects tampering and expiry", async () => {
    const { createSessionValue, verifySessionValue } = await import("@/lib/admin/auth");
    const now = Date.now();
    const v = createSessionValue(now);
    expect(verifySessionValue(v, now)).toBe(true);
    const [exp, sig] = v.split(".");
    expect(verifySessionValue(`${Number(exp) + 1000}.${sig}`, now)).toBe(false);
    expect(verifySessionValue(v, now + 8 * 24 * 3600 * 1000)).toBe(false);
    expect(verifySessionValue(undefined, now)).toBe(false);
  });
  it("is disabled when no (or a too-short) password is configured", async () => {
    process.env.ADMIN_PASSWORD = "short";
    const { checkPassword, adminConfigured } = await import("@/lib/admin/auth");
    expect(adminConfigured()).toBe(false);
    expect(checkPassword("short")).toBe(false);
  });
});

describe("admin password strength", () => {
  it("rejects common/example passwords even when long enough", async () => {
    const { adminConfigured } = await import("@/lib/admin/auth");
    process.env.ADMIN_PASSWORD = "preview-password-123";
    expect(adminConfigured()).toBe(false);
    process.env.ADMIN_PASSWORD = "Strong-Pass-Phrase-2026!";
    expect(adminConfigured()).toBe(true);
  });
});
