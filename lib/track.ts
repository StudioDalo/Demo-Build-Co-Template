"use client";
import { siteConfig, storageKey } from "@/config";

/**
 * Consent + analytics helpers used in the browser.
 *
 * - The visitor's choice lives in localStorage and a first-party cookie (`<prefix>_consent`, prefix from the client config) with a timestamp,
 *   and expires after 6 months so the banner asks again.
 * - `track()` pushes to window.dataLayer ONLY when the visitor has accepted analytics or advertising.
 *   Google Tag Manager (loaded after consent, production only) forwards events to GA4 / Google Ads.
 * - `?debug_tracking=1` turns on debug mode for this tab: every push is logged to the console and
 *   no Google script is loaded, so nothing is sent.
 */

type Value = string | number | boolean | string[] | undefined | Record<string, string>;
export type TrackParams = Record<string, Value>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __siteTracking?: { mode: "gtm" | "gtag" | "none"; gadsId?: string; gadsLabel?: string };
  }
}

export const CONSENT_KEY = storageKey("consent");
export const CONSENT_EVENT = storageKey("consent-change", "-");
export const OPEN_SETTINGS_EVENT = storageKey("open-cookie-settings", "-");
const MAX_AGE_MS = 182 * 864e5;
const DEBUG_KEY = storageKey("debug_tracking");

export type ConsentChoice = { analytics: boolean; advertising: boolean };
export type StoredConsent = ConsentChoice & { ts: number; v: 1 };

export function getConsent(): StoredConsent | null {
  try {
    const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null") as StoredConsent | null;
    if (!c || c.v !== 1 || typeof c.ts !== "number") return null;
    if (Date.now() - c.ts > MAX_AGE_MS) return null; // ask again after 6 months
    return c;
  } catch {
    return null;
  }
}

export const hasAnyConsent = (c = getConsent()) => Boolean(c && (c.analytics || c.advertising));

/** Google cookies (and our 90-day attribution cookie) removed when consent is withdrawn. */
function clearGoogleCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (!name || !(/^(_ga|_gid|_gat|_gcl|_gac)/.test(name) || name === storageKey("attr"))) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

export function saveConsent(choice: ConsentChoice) {
  const stored: StoredConsent = { analytics: choice.analytics, advertising: choice.advertising, ts: Date.now(), v: 1 };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(stored));
  } catch {}
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_KEY}=${choice.analytics ? 1 : 0}${choice.advertising ? 1 : 0}.${stored.ts}; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}; path=/; SameSite=Lax${secure}`;
  } catch {}
  const ads = choice.advertising ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    analytics_storage: choice.analytics ? "granted" : "denied",
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  });
  if (!choice.analytics && !choice.advertising) clearGoogleCookies();
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: stored }));
}

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));

/* ------------------------------- debug mode ------------------------------- */

export function isDebug(): boolean {
  try {
    const q = new URLSearchParams(location.search).get("debug_tracking");
    if (q === "1") sessionStorage.setItem(DEBUG_KEY, "1");
    if (q === "0") sessionStorage.removeItem(DEBUG_KEY);
    return sessionStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.info("%c[tracking]", `color:${siteConfig.theme.accent};font-weight:bold`, ...args);
}

/* --------------------------------- events --------------------------------- */

/**
 * Push one analytics event. Safe to call any time (server render, before GTM loads, without consent).
 * Never pass names, emails, phone numbers, addresses or free text in params.
 */
export function track(event: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  const debug = isDebug();
  const consent = getConsent();
  if (!hasAnyConsent(consent)) {
    if (debug) log(`blocked (no cookie consent): ${event}`, params);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  const payload = { event, ...params };
  window.dataLayer.push(payload);
  if (debug) log(`dataLayer.push`, payload);
  // Without GTM, gtag.js only reads gtag() calls, so mirror the event for GA4
  if (window.__siteTracking?.mode === "gtag" && consent?.analytics) window.gtag?.("event", event, params);
}

/* ------------------------ enhanced conversions (hash) ------------------------ */

async function sha256(s: string): Promise<string | undefined> {
  if (!s || !globalThis.crypto?.subtle) return undefined;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** UK number → E.164 (+447…) as Google requires for enhanced conversions. */
export function e164(phone: string): string {
  const d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("0044")) return `+${d.slice(2)}`;
  if (d.startsWith("44")) return `+${d}`;
  if (d.startsWith("0")) return `+44${d.slice(1)}`;
  return d;
}

/**
 * SHA-256 hashes of the normalised email + phone, for Google Ads enhanced conversions.
 * Returns undefined unless the visitor accepted advertising cookies. Raw values never leave this function.
 */
export async function hashedUserData(email?: string, phone?: string): Promise<Record<string, string> | undefined> {
  if (!getConsent()?.advertising) return undefined;
  const [em, ph] = await Promise.all([sha256((email ?? "").trim().toLowerCase()), sha256(phone ? e164(phone) : "")]);
  const out: Record<string, string> = {};
  if (em) out.sha256_email_address = em;
  if (ph) out.sha256_phone_number = ph;
  return Object.keys(out).length ? out : undefined;
}
