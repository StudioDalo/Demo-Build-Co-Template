import { afterEach, describe, expect, it, vi } from "vitest";
import { googleAdsOfflineCsv, londonTime } from "@/lib/leads/gads";
import { sourceSummary } from "@/lib/leads/attribution";
import { isPlaceholderValue } from "@/lib/content/placeholder";
import { hasMarker, live } from "@/lib/content/live";
import { trackingConfig, consentDefaultsScript } from "@/lib/tracking/config";
import { attributionSchema } from "@/lib/leads/schema";
import { e164 } from "@/lib/track";
import * as seed from "@/clients/active/content";
import type { Lead } from "@/lib/leads/types";

vi.mock("server-only", () => ({}));

const lead = (over: Partial<Lead>): Lead => ({
  id: "id", createdAt: "2026-07-01T10:00:00Z", updatedAt: "2026-07-02T10:00:00Z", type: "quote", complete: true, status: "won", score: "hot", scorePoints: 10,
  name: "A", phone: "", email: "", postcode: "", services: [], answers: {}, uploads: [], notes: [], source: {}, consent: true, tokenHash: "",
  wonValue: 48500, wonAt: "2026-07-01T13:05:09Z", attribution: { gclid: "abc" }, ...over,
});

describe("Google Ads offline conversions CSV", () => {
  it("uses Google's header, UK time and skips leads without a gclid or not won", () => {
    const { csv, count } = googleAdsOfflineCsv([lead({}), lead({ id: "2", attribution: {} }), lead({ id: "3", status: "contacted" })]);
    const lines = csv.trim().split("\r\n");
    expect(lines[0]).toBe("Parameters:TimeZone=Europe/London");
    expect(lines[1]).toBe("Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency");
    expect(lines[2]).toBe("abc,Won Job,2026-07-01 14:05:09,48500.00,GBP"); // BST = UTC+1
    expect(count).toBe(1);
  });
  it("formats winter times as GMT", () => expect(londonTime("2026-01-15T09:00:00Z")).toBe("2026-01-15 09:00:00"));
});

describe("lead source summary", () => {
  it("names Google Ads, utm sources and referrals", () => {
    expect(sourceSummary({ gclid: "x", utm_campaign: "loft-conversions" })).toBe("Google Ads, campaign: loft-conversions");
    expect(sourceSummary({ utm_source: "tiktok", utm_medium: "social" })).toBe("tiktok / social");
    expect(sourceSummary({ referrer: "https://www.checkatrade.com/x" })).toBe("Referral: checkatrade.com");
    expect(sourceSummary({ landing_page: "/" })).toBe("Direct / unknown");
    expect(sourceSummary({})).toBe("");
  });
});

describe("attribution schema", () => {
  it("accepts known keys, trims, and drops junk instead of failing the lead", () => {
    expect(attributionSchema.parse({ gclid: " g ", utm_source: "google", evil: "<script>" })).toEqual({ gclid: "g", utm_source: "google" });
    expect(attributionSchema.parse("nope")).toEqual({});
    expect(attributionSchema.parse({ first_seen_at: "not a date" })).toEqual({ first_seen_at: undefined });
  });
});

describe("placeholders", () => {
  it("detects placeholder settings values", () => {
    for (const v of ["", "hello@business.example", "00000000", "[EDITABLE PLACEHOLDER] x", "[00]", "[Customer first name]"]) expect(isPlaceholderValue(v)).toBe(true);
    for (const v of ["12345678", "quotes@example.org", "See [our FAQ](/faqs)"]) expect(isPlaceholderValue(v)).toBe(false);
  });
  it("live filters remove placeholder blocks, keep real content and strip owner-review tags", () => {
    expect(live.reviews(seed.reviews)).toEqual([]);
    expect(live.projects(seed.projects)).toEqual([]);
    expect(live.beforeAfters(seed.beforeAfters)).toEqual([]);
    expect(live.tiktok(seed.tiktokItems)).toEqual([]);
    expect(live.home(seed.homePage).hero.videos).toEqual([]);
    const s = live.settings(seed.siteSettings);
    expect(s.accreditations).toEqual([]);
    expect(s.promise.items.some((i) => hasMarker(i.text))).toBe(false);
    expect(s.promise.items.length).toBeGreaterThan(0);
    const areas = live.areas(seed.areas);
    expect(JSON.stringify(areas)).not.toContain("[EDITABLE PLACEHOLDER]");
    expect(areas[0].sections.length).toBe(seed.areas[0].sections.length);
    const page = live.page({ slug: "x", title: "x", intro: "[EDITABLE PLACEHOLDER] intro", seo: {}, sections: [{ heading: "H", body: ["[OWNER TO REVIEW] keep me", "Our guarantee. [EDITABLE PLACEHOLDER: terms]"] }] });
    expect(page.sections[0].body).toEqual(["keep me"]);
    expect(page.intro).toBe("");
  });
});

describe("tracking config", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("does nothing without IDs", () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "");
    vi.stubEnv("NEXT_PUBLIC_GA4_ID", "");
    vi.stubEnv("NEXT_PUBLIC_GADS_ID", "");
    expect(trackingConfig()).toMatchObject({ configured: false, load: false });
  });
  it("loads only on the production deployment, and rejects malformed IDs", () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-ABC123");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(trackingConfig()).toMatchObject({ gtmId: "GTM-ABC123", configured: true, load: false });
    vi.stubEnv("VERCEL_ENV", "production");
    expect(trackingConfig().load).toBe(true);
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-1');alert(1)//");
    expect(trackingConfig().gtmId).toBeUndefined();
  });
  it("consent defaults are all denied", () => {
    expect(consentDefaultsScript()).toContain("gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'");
  });
});

describe("enhanced conversions phone normalisation", () => {
  it("converts UK numbers to E.164", () => {
    expect(e164("07700 900456")).toBe("+447700900456");
    expect(e164("+44 7700 900456")).toBe("+447700900456");
    expect(e164("0044 20 7946 0000")).toBe("+442079460000");
  });
});

import { dueForDeletion } from "@/lib/leads/retention";
import { privacyPolicy } from "@/clients/active/content";

describe("data retention", () => {
  const now = new Date("2026-11-09T12:00:00Z");
  const at = (monthsBack: number) => { const d = new Date(now); d.setUTCMonth(d.getUTCMonth() - monthsBack); return d.toISOString(); };
  it("flags partial > 6 months and unwon enquiries > 24 months, never won jobs", () => {
    const leads = [
      lead({ id: "p-old", complete: false, status: "new", createdAt: at(7) }),
      lead({ id: "p-new", complete: false, status: "new", createdAt: at(5) }),
      lead({ id: "q-old", complete: true, status: "lost", createdAt: at(25) }),
      lead({ id: "q-mid", complete: true, status: "contacted", createdAt: at(13) }),
      lead({ id: "won", complete: true, status: "won", createdAt: at(80) }),
    ];
    const due = dueForDeletion(leads, privacyPolicy.retentionMonths, now);
    expect(due.partial.map((l) => l.id)).toEqual(["p-old"]);
    expect(due.enquiries.map((l) => l.id)).toEqual(["q-old"]);
  });
  it("privacy seed names every provider and no Meta/TikTok", () => {
    const names = privacyPolicy.providers.map((p) => p.name).join(" | ");
    for (const n of ["Vercel", "Supabase", "Resend", "Sanity", "Google Analytics", "Google Ads"]) expect(names).toContain(n);
    expect(JSON.stringify(privacyPolicy)).not.toMatch(/Meta|Facebook|TikTok pixel/);
  });
});

import { fmt, siteConfig, storageKey } from "@/config";
describe("client config", () => {
  it("fills {tokens} and leaves unknown ones", () => {
    expect(fmt("{service} in {location}", { service: "Loft conversions", location: "Exampleton" })).toBe("Loft conversions in Exampleton");
    expect(fmt("Hi {name}", {})).toBe("Hi {name}");
  });
  it("namespaces storage keys with the client prefix", () => {
    expect(storageKey("consent")).toBe(`${siteConfig.storagePrefix}_consent`);
    expect(storageKey("thanks", "-")).toBe(`${siteConfig.storagePrefix}-thanks`);
  });
  it("has valid theme tokens", () => {
    for (const k of ["accent", "dark", "paper", "sand", "stone", "muted"] as const) expect(siteConfig.theme[k]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
