"use client";

import { getAttribution } from "@/lib/tracking/attribution";
import { storageKey } from "@/config";

export type SubmitBody = {
  kind: "quick" | "partial" | "quote" | "checklist";
  data: Record<string, unknown>;
  leadId?: string;
  token?: string;
  website?: string;
  turnstileToken?: string;
};

export type SubmitResponse = { ok: boolean; leadId?: string; token?: string; score?: string; downloadUrl?: string; error?: string; fields?: Record<string, string> };

const LEAD_KEY = storageKey("lead", "-");
export type SavedLead = { leadId: string; token: string; name?: string; phone?: string; projectType?: string };

export function getSavedLead(): SavedLead | null {
  try {
    return JSON.parse(localStorage.getItem(LEAD_KEY) || "null");
  } catch {
    return null;
  }
}
export function saveLead(v: SavedLead) {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify(v));
  } catch {}
}
export function clearSavedLead() {
  try {
    localStorage.removeItem(LEAD_KEY);
  } catch {}
}

export function getSource() {
  const p = new URLSearchParams(window.location.search);
  return {
    page: window.location.pathname,
    referrer: document.referrer.slice(0, 500) || undefined,
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
  };
}

export async function submitLead(body: SubmitBody, opts: { keepalive?: boolean } = {}): Promise<SubmitResponse> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, source: getSource(), attribution: getAttribution() }),
      keepalive: opts.keepalive,
    });
    return (await res.json()) as SubmitResponse;
  } catch {
    return { ok: false, error: "Couldn't connect. Please check your signal and try again, or call us." };
  }
}
