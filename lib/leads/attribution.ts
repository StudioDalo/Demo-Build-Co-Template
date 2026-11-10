import type { Attribution } from "./types";

const host = (u?: string) => {
  try {
    return u ? new URL(u).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};

/** Where the lead came from, in plain English, e.g. "Google Ads, campaign: loft-conversions". "" if unknown. */
export function sourceSummary(a: Attribution | undefined): string {
  if (!a || !Object.keys(a).length) return "";
  let src: string;
  if (a.gclid || a.gbraid || a.wbraid) src = "Google Ads";
  else if (a.utm_source) src = [a.utm_source, a.utm_medium].filter(Boolean).join(" / ");
  else if (a.referrer) src = `Referral: ${host(a.referrer) || a.referrer}`;
  else src = "Direct / unknown";
  return a.utm_campaign ? `${src}, campaign: ${a.utm_campaign}` : src;
}

export const hasAdClick = (a: Attribution | undefined) => Boolean(a?.gclid || a?.gbraid || a?.wbraid);
