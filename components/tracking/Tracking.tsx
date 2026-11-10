"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/content/types";
import {
  CONSENT_EVENT, OPEN_SETTINGS_EVENT, getConsent, hasAnyConsent, isDebug, saveConsent, track, type StoredConsent,
} from "@/lib/track";
import { captureAttribution, preserveCampaignParamsSoon } from "@/lib/tracking/attribution";
import { siteConfig } from "@/config";

const reviewHost = new RegExp(siteConfig.reviewPlatform.host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

export type ClientTrackingConfig = { gtmId?: string; ga4Id?: string; gadsId?: string; gadsLabel?: string; configured: boolean; load: boolean };

function inject(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

/**
 * Loads Google Tag Manager (or gtag.js when only GA4 / Google Ads IDs are set) once the visitor
 * has accepted at least one cookie category. Consent Mode defaults ("denied") are already in place
 * from the inline script in the layout, so tags inside GTM still respect each category.
 */
function loadGoogle(cfg: ClientTrackingConfig, c: StoredConsent) {
  if (!cfg.load || isDebug() || !hasAnyConsent(c)) return;
  window.dataLayer = window.dataLayer || [];
  if (cfg.gtmId) {
    if (!document.getElementById("gtm-src")) window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    window.__siteTracking = { mode: "gtm", gadsId: cfg.gadsId, gadsLabel: cfg.gadsLabel };
    inject("gtm-src", `https://www.googletagmanager.com/gtm.js?id=${cfg.gtmId}`);
    return;
  }
  const first = cfg.ga4Id ?? cfg.gadsId;
  if (!first || !window.gtag) return;
  const isNew = !document.getElementById("gtag-src");
  window.__siteTracking = { mode: "gtag", gadsId: cfg.gadsId, gadsLabel: cfg.gadsLabel };
  inject("gtag-src", `https://www.googletagmanager.com/gtag/js?id=${first}`);
  if (isNew) window.gtag("js", new Date());
  if (cfg.ga4Id && c.analytics) window.gtag("config", cfg.ga4Id);
  if (cfg.gadsId && c.advertising) window.gtag("config", cfg.gadsId, { allow_enhanced_conversions: true });
}

/* --------------------------- click tracking (delegated) --------------------------- */

const SECTION_LOCATION: Record<string, string> = {
  header: "header", hero: "hero", announcement: "banner", footer: "footer", "mobile-bar": "sticky_bar",
  "quote-band": "quote_band", "service-lead": "service_page",
};

function locationOf(el: HTMLElement): string {
  if (el.dataset.trackLocation) return el.dataset.trackLocation;
  const section = el.closest("[data-section]")?.getAttribute("data-section") ?? "";
  if (section === "cta-aside") return location.pathname.startsWith("/services/") ? "service_page" : "page_aside";
  return SECTION_LOCATION[section] ?? (section ? section.replace(/-/g, "_") : "page");
}

/** A quote CTA: any link to the quote page (so CTAs the owner adds in the CMS are tracked automatically). */
const isQuoteLink = (href: string) => /^\/get-a-quote(?:[?#]|$)/.test(href) || href === "#quick-quote";

function onClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest<HTMLElement>("a,button");
  if (!el) return;
  const href = el.getAttribute("href") ?? "";
  const loc = locationOf(el);
  if (href.startsWith("tel:")) return track("phone_click", { phone_location: loc });
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) return track("whatsapp_click", { whatsapp_location: loc });
  if (el.dataset.tiktokTitle !== undefined) return track("tiktok_thumbnail_click", { post_title: el.dataset.tiktokTitle, project_type: el.dataset.tiktokType ?? "" });
  if (reviewHost.test(href) || el.dataset.track === "review_badge_click") return track("review_badge_click");
  if (isQuoteLink(href) || el.dataset.track === "cta_click") {
    return track("cta_click", { cta_text: (el.dataset.trackLabel ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60), cta_location: loc });
  }
}

/* --------------------------------- banner --------------------------------- */

type Banner = SiteSettings["cookieBanner"];

export function Tracking({ banner, config }: { banner: Banner; config: ClientTrackingConfig }) {
  const [open, setOpen] = useState<"closed" | "banner" | "prefs">("closed");
  const [prefs, setPrefs] = useState({ analytics: false, advertising: false });
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Consent state + loading Google after consent
  useEffect(() => {
    if (isDebug()) console.info("[tracking] debug mode on: events are logged here and Google scripts are not loaded. Add ?debug_tracking=0 to turn off.");
    const c = getConsent();
    if (c) {
      setPrefs({ analytics: c.analytics, advertising: c.advertising });
      loadGoogle(config, c);
    } else if (config.configured) setOpen("banner");
    const onChange = (e: Event) => loadGoogle(config, (e as CustomEvent<StoredConsent>).detail);
    const onOpen = () => {
      const cur = getConsent();
      setPrefs({ analytics: Boolean(cur?.analytics), advertising: Boolean(cur?.advertising) });
      setOpen("prefs");
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
    };
  }, [config]);

  // Attribution + keep campaign params on every page
  useEffect(() => {
    captureAttribution();
    preserveCampaignParamsSoon();
  }, [pathname]);

  // One delegated listener tracks every CTA, call, WhatsApp, TikTok and review-platform click
  useEffect(() => {
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (open === "prefs") panelRef.current?.querySelector<HTMLElement>("input:not([disabled]), button")?.focus();
  }, [open]);

  if (open === "closed") return null;

  const choose = (analytics: boolean, advertising: boolean) => {
    saveConsent({ analytics, advertising });
    setPrefs({ analytics, advertising });
    setOpen("closed");
  };
  const btn = "min-h-11 flex-1 rounded-xl border-2 border-ink bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-ink/85 focus-visible:outline-offset-2";

  return (
    <section
      ref={panelRef}
      aria-label="Cookie choices"
      data-testid="cookie-banner"
      onKeyDown={(e) => e.key === "Escape" && open === "prefs" && getConsent() && setOpen("closed")}
      className="fixed inset-x-3 bottom-[4.5rem] z-[60] mx-auto max-h-[80dvh] max-w-xl overflow-y-auto rounded-2xl bg-white p-4 text-ink shadow-2xl ring-1 ring-black/10 md:bottom-4"
    >
      <h2 className="text-base font-extrabold">{banner.heading}</h2>
      <p className="mt-1 text-sm">
        {banner.text}{" "}
        <a href="/privacy#cookies" className="font-semibold underline">{banner.policyLinkLabel}</a>
      </p>

      {open === "prefs" && (
        <fieldset className="mt-3 space-y-3 rounded-xl bg-sand p-3 text-sm" data-testid="cookie-prefs">
          <legend className="sr-only">Cookie categories</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-0.5 size-5 shrink-0" />
            <span><strong>Necessary (always on).</strong> {banner.necessaryText}</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="analytics" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} />
            <span><strong>Analytics:</strong> {banner.analyticsProviders}. {banner.analyticsText}</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="advertising" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" checked={prefs.advertising} onChange={(e) => setPrefs({ ...prefs, advertising: e.target.checked })} />
            <span><strong>Advertising:</strong> {banner.advertisingProviders}. {banner.advertisingText}</span>
          </label>
        </fieldset>
      )}
      {open === "banner" && (
        <p className="mt-2 text-xs text-muted">
          Analytics: {banner.analyticsProviders}. Advertising: {banner.advertisingProviders}.
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="button" className={btn} onClick={() => choose(true, true)}>{banner.accept}</button>
        <button type="button" className={btn} onClick={() => choose(false, false)}>{banner.reject}</button>
        {open === "banner" ? (
          <button type="button" className={btn} onClick={() => setOpen("prefs")}>{banner.manage}</button>
        ) : (
          <button type="button" className={btn} onClick={() => choose(prefs.analytics, prefs.advertising)}>{banner.save}</button>
        )}
      </div>
    </section>
  );
}

/** Footer link that reopens the cookie choices. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="hover:text-accent" data-testid="cookie-settings" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      {label}
    </button>
  );
}
