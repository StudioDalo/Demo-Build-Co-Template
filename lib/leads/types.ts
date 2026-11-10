import type { UploadRef } from "./schema";
import type { LeadScore } from "./score";

export const LEAD_STATUSES = ["new", "contacted", "survey_booked", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  survey_booked: "Survey booked",
  won: "Won",
  lost: "Lost",
};

export type LeadType = "quick" | "quote" | "checklist";
export type LeadNote = { at: string; text: string };

/** Ad attribution captured on first landing (gclid etc.), stored for Google Ads offline conversions. */
export const ATTRIBUTION_KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "landing_page", "referrer", "first_seen_at"] as const;
export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>>;

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: LeadType;
  /** false = abandoned part-way through the quote form (captured once name + phone were entered) */
  complete: boolean;
  status: LeadStatus;
  score: LeadScore | null;
  scorePoints: number | null;
  name: string;
  phone: string;
  email: string;
  postcode: string;
  services: string[];
  answers: Record<string, unknown>;
  uploads: UploadRef[];
  notes: LeadNote[];
  source: Record<string, string | undefined>;
  consent: boolean;
  /** Set when status becomes Won (GBP) */
  wonValue: number | null;
  wonAt: string | null;
  attribution: Attribution;
  /** sha256 of the resume token handed to the browser, lets the same visitor add detail to their lead */
  tokenHash: string;
};

export type LeadFilter = { status?: LeadStatus; score?: LeadScore; type?: LeadType; complete?: boolean; q?: string };
