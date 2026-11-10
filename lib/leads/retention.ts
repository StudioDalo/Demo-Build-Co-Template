import type { Lead } from "./types";
import type { LeadStore, UploadStore } from "./store";

export type RetentionMonths = { enquiries: number; partial: number };

const monthsAgo = (now: Date, months: number) => {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString();
};

/**
 * Leads past the retention periods in the privacy policy:
 * - unfinished (partial) enquiries older than `partial` months
 * - finished enquiries that didn't become a won job, older than `enquiries` months
 * Won jobs are never deleted automatically (kept for tax records / guarantees).
 */
export function dueForDeletion(leads: Lead[], months: RetentionMonths, now = new Date()) {
  const partialBefore = monthsAgo(now, months.partial);
  const enquiryBefore = monthsAgo(now, months.enquiries);
  const partial = leads.filter((l) => !l.complete && l.status !== "won" && l.createdAt < partialBefore);
  const enquiries = leads.filter((l) => l.complete && l.status !== "won" && l.createdAt < enquiryBefore);
  return { partial, enquiries, all: [...partial, ...enquiries] };
}

/** Delete the leads and their uploaded photos/plans. Returns the number of leads deleted. */
export async function deleteLeads(stores: { leads: LeadStore; uploads: UploadStore }, leads: Lead[]) {
  if (!leads.length) return 0;
  const files = leads.flatMap((l) => l.uploads.map((u) => u.path));
  if (files.length) await stores.uploads.remove(files);
  return stores.leads.remove(leads.map((l) => l.id));
}
