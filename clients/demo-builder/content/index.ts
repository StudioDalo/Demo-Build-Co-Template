/**
 * DEMO CLIENT starter content = loft-extension pack content (filled with this client's
 * location and name) + this client's own settings, areas, pages and placeholders.
 * When Sanity is connected, Sanity content replaces this.
 */
import * as pack from "@/packs/active/content";
import { fillTokens } from "@/lib/content/tokens";
import type { QuoteFormSettings } from "@/lib/content/types";
import { opt } from "@/lib/content/ph";
import { config } from "../config";
import { siteSettings } from "./settings";

const vars = { location: config.location.primary, businessName: siteSettings.businessName };

export const services = fillTokens(pack.services, vars);
export const guides = fillTokens(pack.guides, vars);
export const costGuides = fillTokens(pack.costGuides, vars);
export const faqs = fillTokens(pack.faqs, vars);

/** Pack quote form, with this client's own "How did you hear about us?" options. */
export const quoteForm: QuoteFormSettings = fillTokens(
  {
    ...pack.quoteForm,
    optionGroups: pack.quoteForm.optionGroups.map((g) =>
      g.key === "heardAbout" ? { key: g.key, options: opt(["Google", "Social media", "Saw our van or a site board", "Recommendation", "Other"]) } : g,
    ),
  },
  vars,
);

export { siteSettings, homePage } from "./settings";
export { areas } from "./areas";
export { pages } from "./pages";
export { tiktokItems, projects, beforeAfters, reviews, team, stats } from "./misc";
export { privacyPolicy } from "./privacy";
