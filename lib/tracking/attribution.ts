"use client";

import { getConsent } from "@/lib/track";
import { storageKey } from "@/config";

/**
 * Ad attribution (gclid, utm_*…) captured when a visitor lands, so each lead records which
 * advert or campaign brought it in (needed for Google Ads offline conversions).
 *
 * Stored in a first-party cookie for 90 days when the visitor accepted cookies,
 * otherwise only in sessionStorage for this visit.
 */

export const CLICK_KEYS = ["gclid", "gbraid", "wbraid"] as const;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const URL_KEYS = [...CLICK_KEYS, ...UTM_KEYS] as const;
export type Attribution = Partial<Record<(typeof URL_KEYS)[number] | "landing_page" | "referrer" | "first_seen_at", string>>;

const KEY = storageKey("attr");
/** Campaign params seen in a URL during THIS visit (only these are carried between pages). */
const CARRY_KEY = storageKey("carry");
const MAX_AGE = 90 * 86400;

function readCookie(): Attribution | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${KEY}=([^;]*)`));
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

function readSession(): Attribution | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function write(a: Attribution) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {}
  if (getConsent()?.analytics || getConsent()?.advertising) {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${KEY}=${encodeURIComponent(JSON.stringify(a))}; Max-Age=${MAX_AGE}; path=/; SameSite=Lax${secure}`;
  }
}

export function getAttribution(): Attribution {
  return readSession() ?? readCookie() ?? {};
}

const clip = (v: string, n: number) => v.slice(0, n);

/** The tracked query parameters present in the current URL. */
export function urlParams(search = location.search): Record<string, string> {
  const p = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const k of URL_KEYS) {
    const v = p.get(k);
    if (v) out[k] = clip(v, k === "gclid" || k === "gbraid" || k === "wbraid" ? 300 : 150);
  }
  return out;
}

/**
 * Call on every page view. The first landing is recorded; a new ad click (new gclid/utm in the URL)
 * replaces it, because the latest click is the one Google Ads credits.
 */
export function captureAttribution() {
  const existing = getAttribution();
  const fromUrl = urlParams();
  if (Object.keys(fromUrl).length) {
    try {
      sessionStorage.setItem(CARRY_KEY, JSON.stringify(fromUrl));
    } catch {}
  }
  const hasNew = Object.keys(fromUrl).length > 0 && (Object.keys(fromUrl).some((k) => fromUrl[k] !== existing[k as keyof Attribution]));
  if (existing.first_seen_at && !hasNew) {
    write(existing); // refresh cookie (e.g. after consent was given)
    return;
  }
  let ref = "";
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) ref = clip(document.referrer, 300);
  } catch {}
  write({
    ...fromUrl,
    landing_page: clip(location.pathname, 300),
    referrer: ref || undefined,
    first_seen_at: new Date().toISOString(),
  });
}

/**
 * Keep campaign parameters in the address bar as the visitor moves around the site,
 * so they survive into the quote form and any analytics page view.
 */
export function preserveCampaignParams() {
  let carry: Record<string, string> = {};
  try {
    carry = JSON.parse(sessionStorage.getItem(CARRY_KEY) || "{}");
  } catch {}
  if (!Object.keys(carry).length) return;
  const url = new URL(location.href);
  let changed = false;
  for (const [k, v] of Object.entries(carry)) {
    if (!url.searchParams.has(k)) {
      url.searchParams.set(k, v);
      changed = true;
    }
  }
  if (changed) window.history.replaceState(window.history.state, "", url.toString());
}

/** Run after Next.js has finished updating the URL for a client-side navigation. */
export function preserveCampaignParamsSoon() {
  window.setTimeout(preserveCampaignParams, 0);
}
