import "server-only";
import { cache } from "react";
import { createClient } from "next-sanity";
import { sanityApiVersion, sanityConfigured, sanityDataset, sanityProjectId } from "@/lib/sanity/env";
import { q } from "@/lib/sanity/queries";
import * as seed from "@/clients/active/content";
import type {
  Area, BeforeAfter, CostGuide, Faq, Guide, HomePage, Page, PrivacyPolicy, Project, QuoteFormSettings,
  Review, Service, SiteSettings, Stat, TeamMember, TikTokItem,
} from "./types";
import { deepMerge } from "./merge";
import { hidePlaceholders, realValue } from "./placeholder";
import { live } from "./live";
import { ContentUnavailableError, isLenientContent } from "./mode";
import { isProductionRuntime, testFallbacksAllowed } from "@/lib/runtime";

const client = sanityConfigured
  ? createClient({ projectId: sanityProjectId, dataset: sanityDataset, apiVersion: sanityApiVersion, useCdn: process.env.SANITY_USE_CDN !== "false", perspective: "published" })
  : null;

async function fetchSanity<T>(query: string): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, {}, { next: { revalidate: 60, tags: ["sanity"] } });
  } catch (err) {
    if (isProductionRuntime() && !testFallbacksAllowed() && !isLenientContent()) {
      // ALERT (Vercel → Logs / runtime errors). The page render fails, so the last good version stays live.
      console.error("[content] ALERT: Sanity fetch failed in production. Keeping the last good page; starter content is NOT shown.", err);
      throw new ContentUnavailableError(err);
    }
    console.error("[content] Sanity fetch failed, using the client's starter content", err);
    return null;
  }
}

/** Can Sanity be reached right now? (shown in /admin; never throws) */
export async function sanityHealthy(): Promise<boolean | null> {
  if (!client) return null;
  try {
    await client.fetch("count(*[_type == \"siteSettings\"])", {}, { cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

/** Singletons: Sanity values override seed values field-by-field, so a missing field never breaks the page. */
async function singleton<T extends object>(query: string, fallback: T): Promise<T> {
  const doc = await fetchSanity<Partial<T>>(query);
  return doc ? deepMerge(fallback, doc) : fallback;
}

/** Collections: when Sanity is connected the owner's list is the source of truth (even if empty). */
async function collection<T>(query: string, fallback: T[]): Promise<T[]> {
  const docs = await fetchSanity<T[]>(query);
  return docs ?? fallback;
}

/** On the real domain, strip anything still marked as a placeholder. */
const onLive = <T,>(v: T, fn: (x: T) => T): T => (hidePlaceholders() ? fn(v) : v);

/** Contact/legal fields that are still placeholders (e.g. hello@…example, company no. 00000000) become "" so they're hidden. */
function cleanSettings(s: SiteSettings): SiteSettings {
  return {
    ...s,
    email: realValue(s.email),
    privacyEmail: realValue(s.privacyEmail),
    companyNumber: realValue(s.companyNumber),
    registeredAddress: realValue(s.registeredAddress),
    icoNumber: realValue(s.icoNumber),
    phones: s.phones.filter((p) => realValue(p.number)),
    footer: { ...s.footer, legalLine: realValue(s.footer.legalLine) },
  };
}

export const getSiteSettings = cache(async () => onLive(cleanSettings(await singleton<SiteSettings>(q.siteSettings, seed.siteSettings)), live.settings));
export const getHomePage = cache(async () => onLive(await singleton<HomePage>(q.homePage, seed.homePage), live.home));
/** Quote form settings. Answer-option groups from Sanity replace the defaults group by group, so a missing group never breaks the form. */
export const getQuoteForm = cache(async () => {
  const form = await singleton<QuoteFormSettings>(q.quoteForm, seed.quoteForm);
  const fromCms = (form.optionGroups ?? []).filter((g) => g?.key && Array.isArray(g.options) && g.options.length);
  const optionGroups = seed.quoteForm.optionGroups.map((d) => fromCms.find((g) => g.key === d.key) ?? d);
  return { ...form, optionGroups };
});

/** Privacy policy with {legalName}, {companyNumber}, {registeredAddress}, {icoNumber}, {privacyEmail} filled in from Site settings. */
export const getPrivacyPolicy = cache(async () => {
  const [p, s] = await Promise.all([singleton<PrivacyPolicy>(q.privacyPolicy, seed.privacyPolicy), getSiteSettings()]);
  const email = s.privacyEmail || s.email;
  const tokens: Record<string, string> = {
    legalName: s.legalName,
    companyNumber: s.companyNumber || "[EDITABLE PLACEHOLDER: company number]",
    registeredAddress: s.registeredAddress || "[EDITABLE PLACEHOLDER: registered office address]",
    icoNumber: s.icoNumber || "[EDITABLE PLACEHOLDER: ICO registration number]",
    privacyEmail: email ? `[${email}](mailto:${email})` : "[EDITABLE PLACEHOLDER: privacy email address]",
  };
  const fill = (t: string) => t.replace(/\{(legalName|companyNumber|registeredAddress|icoNumber|privacyEmail)\}/g, (_, k: string) => tokens[k]);
  return {
    ...p,
    whoWeAre: fill(p.whoWeAre),
    partialEnquiries: fill(p.partialEnquiries),
    checklist: fill(p.checklist),
    transfers: p.transfers.map(fill),
    rights: p.rights.map(fill),
    complaints: fill(p.complaints),
    retentionMonths: {
      enquiries: Number(p.retentionMonths?.enquiries) || seed.privacyPolicy.retentionMonths.enquiries,
      partial: Number(p.retentionMonths?.partial) || seed.privacyPolicy.retentionMonths.partial,
    },
  } satisfies PrivacyPolicy;
});

export const getServices = cache(async () =>
  onLive((await collection<Service>(q.services, seed.services)).filter((s) => !s.hidden).sort((a, b) => a.order - b.order), live.services),
);
export const getService = async (slug: string) => (await getServices()).find((s) => s.slug === slug);

export const getTikTokItems = cache(async () =>
  onLive((await collection<TikTokItem>(q.tiktok, seed.tiktokItems)).filter((t) => !t.hidden).sort((a, b) => a.order - b.order), live.tiktok),
);
export const getProjects = cache(async () => onLive(await collection<Project>(q.projects, seed.projects), live.projects));
export const getProject = async (slug: string) => (await getProjects()).find((p) => p.slug === slug);
export const getBeforeAfters = cache(async () => onLive((await collection<BeforeAfter>(q.beforeAfters, seed.beforeAfters)).filter((b) => !b.hidden), live.beforeAfters));
export const getReviews = cache(async () => onLive((await collection<Review>(q.reviews, seed.reviews)).filter((r) => !r.hidden), live.reviews));
export const getFaqs = cache(async () => onLive(await collection<Faq>(q.faqs, seed.faqs), live.faqs));
export const getAreas = cache(async () => onLive(await collection<Area>(q.areas, seed.areas), live.areas));
export const getArea = async (slug: string) => (await getAreas()).find((a) => a.slug === slug);
export const getGuides = cache(async () => onLive(await collection<Guide>(q.guides, seed.guides), live.guides));
export const getGuide = async (slug: string) => (await getGuides()).find((g) => g.slug === slug);
export const getCostGuides = cache(() => collection<CostGuide>(q.costGuides, seed.costGuides));
export const getCostGuide = async (slug: string) => (await getCostGuides()).find((g) => g.slug === slug);
export const getTeam = cache(async () => onLive(await collection<TeamMember>(q.team, seed.team), live.team));
export const getStats = cache(async () => onLive(await collection<Stat>(q.stats, seed.stats), live.stats));

const getPages = cache(() => collection<Page>(q.pages, seed.pages));
/** Pages always exist: Sanity version merged over the seed version of the same slug. */
export async function getPage(slug: string): Promise<Page> {
  const fromCms = (await getPages()).find((p) => p.slug === slug);
  const fallback = seed.pages.find((p) => p.slug === slug) ?? { slug, title: slug, intro: "", sections: [], seo: {} };
  return onLive(fromCms ? deepMerge(fallback, fromCms) : fallback, live.page);
}
