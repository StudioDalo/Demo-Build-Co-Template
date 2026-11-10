import { optionsFor, type QuoteFormSettings, type Service, type SiteSettings } from "@/lib/content/types";
import type { Lead } from "@/lib/leads/types";
import { STATUS_LABELS } from "@/lib/leads/types";
import { siteUrl } from "@/lib/site";
import { hasAdClick, sourceSummary } from "@/lib/leads/attribution";
import { siteConfig } from "@/config";
import * as pack from "@/packs/active/pack";
import { packForm } from "@/packs/active/form";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const { accent: ACCENT, dark: DARK } = siteConfig.theme;
const SCORE_COLOURS = { hot: "#D92D20", warm: ACCENT, cold: "#667085" } as const;

/** Email header wordmark: the short name, then the rest of the business name in the accent colour. */
function wordmark(): string {
  const { appName, shortName } = siteConfig.brand;
  const rest = appName.startsWith(shortName) ? appName.slice(shortName.length).trim() : "";
  return rest ? `${esc(shortName)} <span style="color:${ACCENT}">${esc(rest)}</span>` : esc(appName);
}

/** Map stored option values back to the human labels from the CMS. Trade rows come from the active pack. */
export function answerRows(lead: Lead, form: QuoteFormSettings, services: Service[]): [string, string][] {
  const a = lead.answers as Record<string, unknown>;
  const label = (key: string, v: unknown) => optionsFor(form, key).find((o) => o.value === v)?.label ?? (v ? String(v) : "");
  const svcName = (slug: string) => (slug === "other" ? "Other" : services.find((s) => s.slug === slug)?.name ?? slug);
  const opts = (a.serviceOptions ?? {}) as Record<string, string[]>;
  const svc = ((a.services as string[]) ?? lead.services)
    .map((s) => (opts[s]?.length ? `${svcName(s)} (${opts[s].join(", ")})` : svcName(s)))
    .join(", ");
  const rows: [string, string][] = [
    ["Services", svc + (a.otherService ? ` | Other: ${a.otherService}` : "") || String(a.projectType ?? "")],
    ...packForm.answerRows({ postcode: lead.postcode, answers: a }, label),
    ["Description", String(a.description ?? "")],
    ["Contact by", [label("contactMethod", a.contactMethod), label("contactTime", a.contactTime)].filter(Boolean).join(", ")],
    ["Heard about us", label("heardAbout", a.heardAbout)],
    ["Uploads", lead.uploads.length ? `${lead.uploads.length} file(s), view in admin` : ""],
  ];
  return rows.filter(([, v]) => v && v.trim());
}

const shell = (body: string) => `<!doctype html><html><body style="margin:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:${DARK.toLowerCase()}">
<div style="max-width:600px;margin:0 auto;background:#fff">
<div style="background:${DARK.toLowerCase()};padding:20px 24px;color:#fff;font-weight:700;font-size:18px">${wordmark()}</div>
<div style="padding:24px">${body}</div></div></body></html>`;

export function ownerLeadEmail(lead: Lead, rows: [string, string][]) {
  const kind = lead.type === "quick" ? "Quick callback request" : lead.type === "checklist" ? "Checklist download" : "Quote request";
  const scoreBadge = lead.score
    ? `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${SCORE_COLOURS[lead.score]};color:#fff;font-weight:700;text-transform:uppercase;font-size:12px">${lead.score} lead</span>`
    : "";
  const adminUrl = `${siteUrl()}/admin/leads/${lead.id}`;
  const source = sourceSummary(lead.attribution) || "Not recorded";
  const sourceLine = `Source: ${source}${hasAdClick(lead.attribution) ? " (Google click ID saved)" : ""}`;
  const subject = `${lead.score ? `[${lead.score.toUpperCase()}] ` : ""}${kind}: ${lead.name}${lead.postcode ? `, ${lead.postcode}` : ""}`;
  const html = shell(`
    <p style="margin:0 0 8px">${scoreBadge}</p>
    <h1 style="font-size:22px;margin:8px 0 4px">${esc(kind)} from ${esc(lead.name)}</h1>
    <p style="margin:0 0 16px;font-size:16px"><a href="tel:${esc(lead.phone)}" style="color:${DARK.toLowerCase()};font-weight:700">${esc(lead.phone)}</a>${lead.email ? ` · <a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>` : ""}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows
      .map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#555;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:8px;border-bottom:1px solid #eee">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("")}</table>
    <p style="margin:24px 0 0"><a href="${esc(adminUrl)}" style="background:${ACCENT};color:${DARK.toLowerCase()};padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none">Open in leads dashboard</a></p>
    <p style="margin:16px 0 0;font-size:14px" data-source-line><strong>${esc(sourceLine)}</strong>${lead.attribution?.landing_page ? ` · landed on ${esc(lead.attribution.landing_page)}` : ""}</p>
    <p style="color:#888;font-size:12px;margin-top:8px">Status: ${STATUS_LABELS[lead.status]} · Form page: ${esc(lead.source.page ?? "")}</p>`);
  const text = `${kind} from ${lead.name}\n${lead.score ? `Score: ${lead.score.toUpperCase()}\n` : ""}Phone: ${lead.phone}\nEmail: ${lead.email}\n${sourceLine}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${adminUrl}`;
  return { subject, html, text };
}

export function customerAutoReply(lead: Lead, settings: SiteSettings, rows: [string, string][]) {
  const first = lead.name.split(" ")[0];
  const phone = settings.phones[0]?.number ?? "";
  const subject = `Thanks ${first}, we've got your quote request`;
  const html = shell(`
    <h1 style="font-size:22px;margin:0 0 12px">Thanks ${esc(first)}, we've got your request</h1>
    <p style="font-size:16px;line-height:1.5">We'll call you within <strong>${settings.callbackHours} hours</strong> ${esc(pack.emailCopy.nextStep)}. If it's urgent, call us on <a href="tel:${esc(phone)}" style="color:${DARK.toLowerCase()};font-weight:700">${esc(phone)}</a>.</p>
    <h2 style="font-size:16px;margin:24px 0 8px">What you told us</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows
      .filter(([k]) => k !== "Uploads")
      .map(([k, v]) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;color:#555;width:38%">${esc(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(v)}</td></tr>`)
      .join("")}</table>
    <p style="margin-top:24px">While you wait, have a look at our <a href="${siteUrl()}/guides">${esc(pack.emailCopy.guidesLabel)}</a> or <a href="${esc(settings.social.tiktok ?? siteUrl())}">${esc(pack.emailCopy.socialLabel)}</a>.</p>
    <p style="color:#888;font-size:12px;margin-top:24px">${esc(settings.legalName)} · You're receiving this because you requested a quote on our website.</p>`);
  const text = `Thanks ${first}, we've got your request.\n\nWe'll call you within ${settings.callbackHours} hours ${pack.emailCopy.nextStep}. Urgent? Call ${phone}.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${settings.legalName}`;
  return { subject, html, text };
}

export function checklistEmail(name: string, settings: SiteSettings) {
  const url = `${siteUrl()}${siteConfig.leadMagnet?.pdfPath ?? ""}`;
  const subject = siteConfig.leadMagnet?.emailSubject ?? "Your free checklist";
  const hi = name ? `Hi ${esc(name.split(" ")[0])},` : "Hi,";
  const html = shell(`<p>${hi}</p><p>${esc(pack.emailCopy.checklistIntro)}</p>
    <p><a href="${url}" style="background:${ACCENT};color:${DARK.toLowerCase()};padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none">Download the checklist (PDF)</a></p>
    <p>When you're ready, <a href="${siteUrl()}/get-a-quote">${esc(pack.emailCopy.checklistNextStepHtml)}</a>${esc(pack.emailCopy.checklistNextStepAfter)}</p>
    <p style="color:#888;font-size:12px">${esc(settings.legalName)}</p>`);
  return { subject, html, text: `${hi}\n\nDownload your checklist: ${url}\n\n${pack.emailCopy.checklistNextStepText}: ${siteUrl()}/get-a-quote`, url };
}
