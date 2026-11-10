import { storageKey } from "@/config";
/** What the quote form leaves in sessionStorage for the thank-you page (no raw personal data except first name for the greeting). */
export const THANKS_KEY = storageKey("thanks", "-");
export const CONVERSION_GUARD_PREFIX = storageKey("conv-", "-");

export type ThanksData = {
  /** Shown in the heading only; never sent to analytics */
  name: string;
  leadId?: string;
  services: string[];
  /** Trade-specific conversion values from the pack (e.g. budget_band, timescale), no personal data */
  params: Record<string, string>;
  score: string;
  /** SHA-256 hashed email/phone, only present if advertising consent was given */
  userData?: Record<string, string>;
};
