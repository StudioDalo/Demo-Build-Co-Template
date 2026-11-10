import "server-only";
import { storageKey } from "@/config";

/** Strict formats so an ID can never inject script when it's written into the page. */
const GTM = /^GTM-[A-Z0-9]{4,12}$/;
const GA4 = /^G-[A-Z0-9]{4,15}$/;
const GADS = /^AW-\d{6,15}$/;
const LABEL = /^[A-Za-z0-9_-]{4,40}$/;

export type TrackingConfig = {
  gtmId?: string;
  ga4Id?: string;
  gadsId?: string;
  gadsLabel?: string;
  /** Any ID set: show the cookie banner and "Cookie settings" link. */
  configured: boolean;
  /** Actually load Google scripts after consent. Production deployments only. */
  load: boolean;
};

const pick = (v: string | undefined, re: RegExp) => {
  const t = v?.trim();
  return t && re.test(t) ? t : undefined;
};

export function trackingConfig(): TrackingConfig {
  const gtmId = pick(process.env.NEXT_PUBLIC_GTM_ID, GTM);
  const ga4Id = pick(process.env.NEXT_PUBLIC_GA4_ID, GA4);
  const gadsId = pick(process.env.NEXT_PUBLIC_GADS_ID, GADS);
  const gadsLabel = pick(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL, LABEL);
  const configured = Boolean(gtmId || ga4Id || gadsId);
  // Previews and localhost never send data, so test enquiries don't pollute the owner's reports.
  // TRACKING_LOAD_OUTSIDE_PRODUCTION exists only for the automated tests (network calls are blocked there).
  const prod = process.env.VERCEL_ENV === "production" || process.env.TRACKING_LOAD_OUTSIDE_PRODUCTION === "1";
  return { gtmId, ga4Id, gadsId, gadsLabel, configured, load: configured && prod };
}

export const CONSENT_STORAGE_KEY = storageKey("consent");
/** 6 months: the visitor is asked again after this. */
export const CONSENT_MAX_AGE_DAYS = 182;

/**
 * Runs before anything else on the page: creates dataLayer + gtag, sets Google Consent Mode v2
 * defaults to "denied", then re-applies a stored choice (if still within 6 months).
 * Makes no network requests and sets no cookies.
 */
export function consentDefaultsScript(): string {
  const maxAge = CONSENT_MAX_AGE_DAYS * 864e5;
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=window.gtag||gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
try{var c=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null');if(c&&c.v===1&&Date.now()-c.ts<${maxAge}){var a=c.analytics?'granted':'denied',d=c.advertising?'granted':'denied';gtag('consent','update',{analytics_storage:a,ad_storage:d,ad_user_data:d,ad_personalization:d});}}catch(e){}`;
}
