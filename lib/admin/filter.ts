import { LEAD_STATUSES, type LeadFilter, type LeadStatus } from "@/lib/leads/types";

export function parseFilter(sp: Record<string, string | string[] | undefined>): LeadFilter {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined)) || undefined;
  const status = one("status");
  const score = one("score");
  const type = one("type");
  const complete = one("complete");
  return {
    status: LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : undefined,
    score: score === "hot" || score === "warm" || score === "cold" ? score : undefined,
    type: type === "quick" || type === "quote" || type === "checklist" ? type : undefined,
    complete: complete === "yes" ? true : complete === "no" ? false : undefined,
    q: one("q")?.slice(0, 100),
  };
}
