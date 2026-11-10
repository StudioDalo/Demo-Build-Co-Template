import { optionsFor, type QuoteFormSettings } from "@/lib/content/types";
import { packForm } from "@/packs/active/form";

export type LeadScore = "hot" | "warm" | "cold";

/**
 * Score a quote request: add up the points of the chosen options for the answer fields the
 * active trade pack marks as scoring (packForm.scoreFields). Points and thresholds come from the CMS.
 */
export function scoreLead(answers: Record<string, unknown>, s: Pick<QuoteFormSettings, "optionGroups" | "scoring">, fields: readonly string[] = packForm.scoreFields): { score: LeadScore; points: number } {
  const points = fields.reduce((sum, key) => sum + (optionsFor(s, key).find((o) => o.value === answers[key])?.points ?? 0), 0);
  const score: LeadScore = points >= s.scoring.hot ? "hot" : points >= s.scoring.warm ? "warm" : "cold";
  return { score, points };
}
