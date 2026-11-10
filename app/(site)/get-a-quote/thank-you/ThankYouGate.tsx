"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getConsent, track } from "@/lib/track";
import { CONVERSION_GUARD_PREFIX, THANKS_KEY, type ThanksData } from "@/lib/tracking/thanks";

function readThanks(): ThanksData | null {
  try {
    return JSON.parse(sessionStorage.getItem(THANKS_KEY) || "null");
  } catch {
    return null;
  }
}

/**
 * The thank-you page only shows after a successful quote submission in this tab (otherwise → home),
 * and fires the quote_form_submit conversion exactly once per lead, even if the page is refreshed.
 */
export function ThankYouGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const t = readThanks();
    if (!t) {
      router.replace("/");
      return;
    }
    setOk(true);
    if (!t.leadId) return;
    const guard = CONVERSION_GUARD_PREFIX + t.leadId;
    try {
      if (sessionStorage.getItem(guard)) return;
      sessionStorage.setItem(guard, "1");
    } catch {
      return;
    }
    const userData = getConsent()?.advertising ? t.userData : undefined;
    track("quote_form_submit", {
      lead_id: t.leadId,
      transaction_id: t.leadId,
      services: t.services,
      ...t.params,
      lead_score: t.score,
      value: 0,
      currency: "GBP",
      ...(userData ? { user_data: userData } : {}),
    });
    // Without GTM (gtag.js only): send the Google Ads conversion directly
    const cfg = window.__siteTracking;
    if (cfg?.mode === "gtag" && cfg.gadsId && cfg.gadsLabel && getConsent()?.advertising) {
      if (userData) window.gtag?.("set", "user_data", userData);
      window.gtag?.("event", "conversion", { send_to: `${cfg.gadsId}/${cfg.gadsLabel}`, value: 0, currency: "GBP", transaction_id: t.leadId });
    }
  }, [router]);

  if (!ok) return <div className="min-h-[60vh]" aria-busy="true" />;
  return <>{children}</>;
}
