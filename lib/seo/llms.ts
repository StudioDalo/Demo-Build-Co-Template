import "server-only";
import { getAreas, getFaqs, getGuides, getHomePage, getServices, getSiteSettings } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { stripMarkup } from "./jsonld";
import { siteConfig } from "@/config";

const clean = (s: string) => stripMarkup(s).replace(/\[(EDITABLE|OWNER)[^\]]*\]\s*/g, "").trim();

/** llms.txt: a plain-Markdown map of who we are, what we do, where, and the key pages (https://llmstxt.org). */
export async function buildLlmsTxt(full = false): Promise<string> {
  const [s, h, services, areas, guides, faqs] = await Promise.all([getSiteSettings(), getHomePage(), getServices(), getAreas(), getGuides(), getFaqs()]);
  const L: string[] = [];
  L.push(`# ${s.legalName}`, "", `> ${s.description}`, "");
  L.push("## Key facts");
  L.push(`- Business: ${s.legalName} (trading as ${s.businessName})`);
  L.push(`- What: ${services.map((x) => x.name).join(", ")}`);
  L.push(`- Where: ${siteConfig.location.primary}, ${siteConfig.location.country === "GB" ? "UK" : siteConfig.location.country}: ${areas.map((a) => a.name).join(", ")}`);
  L.push(`- Phone: ${s.phones.map((p) => p.number).join(" / ")} (WhatsApp ${s.whatsappNumber})`);
  if (s.email) L.push(`- Email: ${s.email}`);
  if (s.social.tiktok) L.push(`- TikTok (real site videos): ${s.social.tiktok}`);
  if (s.checkatrade.url || s.social.checkatrade) L.push(`- Reviews: ${s.checkatrade.url || s.social.checkatrade}`);
  L.push(`- How to get a quote: free survey visit, then a fixed written quote: ${absoluteUrl("/get-a-quote")}`, "");
  L.push("## Services");
  services.forEach((x) => L.push(`- [${x.name}](${absoluteUrl(`/services/${x.slug}`)}): ${clean(x.summary)}`));
  L.push("", "## Planning & regulations guides");
  guides.forEach((g) => L.push(`- [${g.title}](${absoluteUrl(`/guides/${g.slug}`)}): ${clean(g.summary)}`));
  L.push("", "## Areas covered");
  areas.forEach((a) => L.push(`- [${a.name}](${absoluteUrl(`/areas/${a.slug}`)}): ${a.postcodes.join(", ")}`));
  L.push("", "## Other pages");
  [["How we work", "/how-we-work"], ["Projects", "/projects"], ["Reviews", "/reviews"], ["FAQs", "/faqs"], ["Cost guides", "/cost-guides"], ["Contact", "/contact"]].forEach(([n, p]) => L.push(`- [${n}](${absoluteUrl(p)})`));
  if (full) {
    L.push("", "## Questions homeowners ask");
    [...h.questions.items.map((q) => ({ question: q.question, answer: q.answer })), ...faqs].forEach((f) => {
      const a = clean(f.answer);
      if (a) L.push("", `### ${f.question}`, a);
    });
    for (const g of guides) {
      L.push("", `## ${g.title}`, clean(g.answer));
      g.sections.forEach((sec) => L.push("", `### ${sec.heading}`, ...sec.body.map(clean).filter(Boolean)));
    }
    for (const x of services) {
      L.push("", `## ${x.name}`, clean(x.answer));
    }
  }
  return L.join("\n") + "\n";
}
