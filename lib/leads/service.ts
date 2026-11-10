import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getQuoteForm, getServices, getSiteSettings } from "@/lib/content";
import { getMailer } from "@/lib/email/mailer";
import { answerRows, checklistEmail, customerAutoReply, ownerLeadEmail } from "@/lib/email/templates";
import { verifyTurnstile } from "@/lib/spam";
import { checklistSchema, fieldErrors, partialSchema, quickSchema, quoteSchema, type QuoteAnswers, type Submission } from "./schema";
import { scoreLead } from "./score";
import { getStores } from "./store";
import type { Lead } from "./types";
import { siteConfig } from "@/config";

export type SubmitResult =
  | { ok: true; status: 200; leadId?: string; token?: string; score?: string | null; downloadUrl?: string }
  | { ok: false; status: 400 | 403 | 404 | 429 | 500; error: string; fields?: Record<string, string> };

const hash = (t: string) => createHash("sha256").update(t).digest("hex");
const newToken = () => randomBytes(24).toString("base64url");

function tokenMatches(lead: Lead, token?: string) {
  if (!token || !lead.tokenHash) return false;
  const a = Buffer.from(hash(token));
  const b = Buffer.from(lead.tokenHash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Validate that chosen option values exist in the CMS lists (stops junk values reaching the dashboard). */
async function invalidOptions(answers: Record<string, unknown>) {
  const form = await getQuoteForm();
  const services = await getServices();
  const errors: Record<string, string> = {};
  // Every answer that has an option list in the CMS must be one of those options
  for (const g of form.optionGroups) {
    if (answers[g.key] !== undefined && !g.options.some((o) => o.value === answers[g.key])) errors[g.key] = "Please choose one of the options";
  }
  const validServices = new Set([...services.map((s) => s.slug), "other"]);
  for (const s of (answers.services as string[]) ?? []) if (!validServices.has(s)) errors.services = "Unknown service";
  return Object.keys(errors).length ? errors : null;
}

async function notify(lead: Lead, { customer }: { customer: boolean }) {
  const [settings, form, services] = await Promise.all([getSiteSettings(), getQuoteForm(), getServices()]);
  const rows = answerRows(lead, form, services);
  const mailer = getMailer();
  const ownerTo = process.env.LEAD_NOTIFY_EMAIL || settings.email;
  if (!ownerTo) console.error("[leads] No LEAD_NOTIFY_EMAIL or contact email set: owner notification not sent (the lead is saved).");
  const owner = ownerLeadEmail(lead, rows);
  const jobs: Promise<unknown>[] = ownerTo ? [mailer.send({ to: ownerTo, ...owner, replyTo: lead.email || undefined })] : [];
  if (customer && lead.email) {
    jobs.push(mailer.send({ to: lead.email, ...customerAutoReply(lead, settings, rows), replyTo: settings.email || undefined }));
  }
  // Email failure must never lose the lead: it's already stored.
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === "rejected") console.error("[leads] email failed", r.reason);
}

/** A lead keeps the attribution from when it was first created; it's only filled in if it had none. */
const keepFirstAttribution = (existing: Lead, attribution: Lead["attribution"]) =>
  Object.keys(existing.attribution ?? {}).length || !Object.keys(attribution).length ? {} : { attribution };

const blankLead = (): Omit<Lead, "id" | "createdAt" | "updatedAt"> => ({
  type: "quote", complete: false, status: "new", score: null, scorePoints: null, name: "", phone: "", email: "", postcode: "",
  services: [], answers: {}, uploads: [], notes: [], source: {}, consent: false, tokenHash: "", wonValue: null, wonAt: null, attribution: {},
});

/** Drop empty values so blank strings never overwrite stored attribution. */
function cleanAttribution(a: Submission["attribution"]): Lead["attribution"] {
  return Object.fromEntries(Object.entries(a ?? {}).filter(([, v]) => typeof v === "string" && v.trim())) as Lead["attribution"];
}

export async function handleSubmission(sub: Submission, ip?: string): Promise<SubmitResult> {
  const { leads } = getStores();
  const attribution = cleanAttribution(sub.attribution);

  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if (sub.website) return { ok: true, status: 200 };

  if (sub.kind !== "partial" && !(await verifyTurnstile(sub.turnstileToken, ip))) {
    return { ok: false, status: 403, error: "Spam check failed. Please try again." };
  }

  // Existing lead (quick form → add detail, or partial → final submit) is only reachable with its token.
  let existing: Lead | null = null;
  if (sub.leadId) {
    const found = await leads.get(sub.leadId);
    if (found && tokenMatches(found, sub.token)) existing = found;
  }

  if (sub.kind === "quick") {
    const parsed = quickSchema.safeParse(sub.data);
    if (!parsed.success) return { ok: false, status: 400, error: "Please check the form", fields: fieldErrors(parsed.error) };
    const token = newToken();
    const lead = await leads.create({
      ...blankLead(), type: "quick", complete: true, name: parsed.data.name, phone: parsed.data.phone,
      services: [parsed.data.projectType], answers: { projectType: parsed.data.projectType }, source: sub.source, attribution, tokenHash: hash(token),
    });
    await notify(lead, { customer: false });
    return { ok: true, status: 200, leadId: lead.id, token };
  }

  if (sub.kind === "partial") {
    const parsed = partialSchema.safeParse(sub.data);
    if (!parsed.success) return { ok: false, status: 400, error: "Name and phone needed", fields: fieldErrors(parsed.error) };
    const { name, phone, ...rest } = parsed.data as Record<string, unknown> & { name: string; phone: string };
    const answers = { ...(existing?.answers ?? {}), ...rest };
    const patch = {
      name, phone,
      email: typeof rest.email === "string" ? rest.email : existing?.email ?? "",
      postcode: typeof rest.postcode === "string" ? rest.postcode.toUpperCase() : existing?.postcode ?? "",
      services: Array.isArray(rest.services) ? (rest.services as string[]) : existing?.services ?? [],
      answers,
    };
    if (existing) {
      await leads.update(existing.id, { ...patch, ...keepFirstAttribution(existing, attribution) });
      return { ok: true, status: 200, leadId: existing.id, token: sub.token };
    }
    const token = newToken();
    const lead = await leads.create({ ...blankLead(), ...patch, source: sub.source, attribution, tokenHash: hash(token) });
    return { ok: true, status: 200, leadId: lead.id, token };
  }

  if (sub.kind === "quote") {
    const parsed = quoteSchema.safeParse(sub.data);
    if (!parsed.success) return { ok: false, status: 400, error: "Please check the form", fields: fieldErrors(parsed.error) };
    const answers = parsed.data as unknown as Record<string, unknown>;
    const bad = await invalidOptions(answers);
    if (bad) return { ok: false, status: 400, error: "Please check the form", fields: bad };
    const form = await getQuoteForm();
    const { score, points } = scoreLead(answers, form);
    const { name, phone, email, postcode, services, uploads, consent, ...rest } = parsed.data as QuoteAnswers;
    const patch = {
      type: "quote" as const, complete: true, name, phone, email, postcode: typeof postcode === "string" ? postcode.toUpperCase() : "", services, uploads,
      consent, score, scorePoints: points, answers: { ...(existing?.answers ?? {}), ...rest, services },
    };
    let lead: Lead;
    let token = sub.token;
    if (existing) {
      lead = (await leads.update(existing.id, { ...patch, ...keepFirstAttribution(existing, attribution) }))!;
    } else {
      token = newToken();
      lead = await leads.create({ ...blankLead(), ...patch, source: sub.source, attribution, tokenHash: hash(token) });
    }
    await notify(lead, { customer: true });
    return { ok: true, status: 200, leadId: lead.id, token, score };
  }

  // checklist
  const parsed = checklistSchema.safeParse(sub.data);
  if (!parsed.success) return { ok: false, status: 400, error: "Please check the form", fields: fieldErrors(parsed.error) };
  const settings = await getSiteSettings();
  const lead = await leads.create({
    ...blankLead(), type: "checklist", complete: true, name: parsed.data.name, email: parsed.data.email, consent: true, source: sub.source, attribution,
  });
  const mail = checklistEmail(parsed.data.name, settings);
  await getMailer().send({ to: parsed.data.email, subject: mail.subject, html: mail.html, text: mail.text }).catch((e) => console.error("[leads] checklist email failed", e));
  await notify(lead, { customer: false });
  return { ok: true, status: 200, leadId: lead.id, downloadUrl: siteConfig.leadMagnet?.pdfPath };
}
