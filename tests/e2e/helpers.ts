import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { PREFIX, tiktokItems } from "./client";

export const TIKTOK_URL = tiktokItems[0]?.url ?? "https://www.tiktok.com/";
export const ADMIN_PASSWORD = "e2e-password-123";
const DATA = ".data-test";

type Lead = { id: string; name: string; phone: string; email: string; type: string; complete: boolean; status: string; score: string | null; uploads: unknown[]; notes: { text: string }[]; services: string[]; answers: Record<string, unknown> };
export function readLeads(): Lead[] {
  try {
    return JSON.parse(readFileSync(path.join(DATA, "leads.json"), "utf8"));
  } catch {
    return [];
  }
}
export function readOutbox(): { to: string; subject: string; html: string; text: string }[] {
  try {
    return JSON.parse(readFileSync(path.join(DATA, "outbox.json"), "utf8"));
  } catch {
    return [];
  }
}

/** Events pushed to window.dataLayer (custom events only, not gtag() argument lists). */
export async function dlEvents(page: Page): Promise<Record<string, any>[]> {
  return page.evaluate(() => (window.dataLayer ?? []).filter((e: any) => e && !("length" in e) && typeof e.event === "string" && !e.event.startsWith("gtm.")) as any);
}

/** Init script: mark the cookie choice as made and the exit prompt as shown, for this client's storage prefix. */
export const noExitScript = (prefix: string) => sessionStorage.setItem(`${prefix}-exit-shown`, "1");
export const consentScript = ([prefix, on]: readonly [string, boolean]) =>
  localStorage.setItem(`${prefix}_consent`, JSON.stringify({ analytics: on, advertising: on, ts: Date.now(), v: 1 }));

/** Dismiss cookie banner + stop the exit prompt from appearing mid-test. */
export async function quiet(page: Page, consent: "granted" | "denied" = "denied") {
  await page.addInitScript(([c, prefix]) => {
    const on = c === "granted";
    localStorage.setItem(`${prefix}_consent`, JSON.stringify({ analytics: on, advertising: on, ts: Date.now(), v: 1 }));
    sessionStorage.setItem(`${prefix}-exit-shown`, "1");
  }, [consent, PREFIX] as const);
  // Never actually hit third-party hosts during tests
  await page.route(/tiktok\.com|googletagmanager\.com|facebook\.net|challenges\.cloudflare\.com/, (r) => r.abort());
}

export async function adminLogin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/admin");
}

export const uniq = () => Math.random().toString(36).slice(2, 7);
