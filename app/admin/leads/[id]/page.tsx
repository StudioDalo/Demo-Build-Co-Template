import Link from "next/link";
import { hasAdClick, sourceSummary } from "@/lib/leads/attribution";
import type { AttributionKey } from "@/lib/leads/types";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { tryGetStores } from "@/lib/leads/store";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads/types";
import { getQuoteForm, getServices } from "@/lib/content";
import { answerRows } from "@/lib/email/templates";
import { whatsappHref } from "@/lib/phone";
import { AdminBar, ScoreBadge } from "../../ui";
import { addNote, setWonValue, updateStatus } from "../../actions";
import { withLenientContent } from "@/lib/content/mode";

async function LeadPageImpl({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const stores = tryGetStores();
  if (!stores) notFound();
  const { leads, uploads } = stores;
  const lead = await leads.get(id);
  if (!lead) notFound();
  const [form, services] = await Promise.all([getQuoteForm(), getServices()]);
  const rows = answerRows(lead, form, services);
  const files = await Promise.all(lead.uploads.map(async (u) => ({ ...u, href: await uploads.url(u.path) })));

  return (
    <>
      <AdminBar />
      <main className="mx-auto max-w-5xl px-4 py-8" data-testid="lead-detail">
        <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold"><ArrowLeft className="size-4" aria-hidden /> All leads</Link>
        <div className="rounded-2xl bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{lead.name || "(no name)"}</h1>
              <p className="mt-1 text-muted">Received {new Date(lead.createdAt).toLocaleString("en-GB")} · {lead.type === "quick" ? "Quick callback" : lead.type === "checklist" ? "Checklist download" : "Quote form"}{!lead.complete && " · PARTIAL (didn't finish the form)"}</p>
            </div>
            <ScoreBadge score={lead.score} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {lead.phone && <a href={`tel:${lead.phone}`} className="btn-primary min-h-10 py-2">Call {lead.phone}</a>}
            {lead.phone && <a href={whatsappHref(lead.phone)} target="_blank" rel="noopener noreferrer" className="btn-outline min-h-10 py-2">WhatsApp</a>}
            {lead.email && <a href={`mailto:${lead.email}`} className="btn-outline min-h-10 py-2">Email {lead.email}</a>}
          </div>
          <form key={lead.status} action={updateStatus} className="mt-6 flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={lead.id} />
            <label htmlFor="status" className="font-semibold">Status</label>
            <select id="status" name="status" defaultValue={lead.status} className="rounded-lg border border-stone px-3 py-2" data-testid="detail-status">
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button className="btn-dark min-h-10 py-2">Update</button>
          </form>
          {lead.status === "won" && (
            <form key={`won-${lead.wonValue}`} action={setWonValue} className="mt-3 flex flex-wrap items-center gap-2" data-testid="won-form">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="wonValue" className="font-semibold">Job value (£)</label>
              <input id="wonValue" name="wonValue" inputMode="decimal" defaultValue={lead.wonValue ?? ""} placeholder="e.g. 48500" className="w-40 rounded-lg border border-stone px-3 py-2" />
              <button className="btn-primary min-h-10 py-2">Save value</button>
              {lead.wonAt && <span className="text-sm text-muted">Won {new Date(lead.wonAt).toLocaleDateString("en-GB")}</span>}
            </form>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Answers</h2>
            <dl className="divide-y divide-stone text-sm">
              {rows.map(([k, v]) => <div key={k} className="grid grid-cols-[38%_1fr] gap-3 py-2.5"><dt className="text-muted">{k}</dt><dd className="whitespace-pre-wrap">{v}</dd></div>)}
            </dl>
            <h3 className="mt-6 mb-2 font-bold">Where this lead came from</h3>
            <dl className="divide-y divide-stone text-sm" data-testid="lead-attribution">
              <div className="grid grid-cols-[38%_1fr] gap-3 py-2.5"><dt className="text-muted">Source</dt><dd>{sourceSummary(lead.attribution) || "Not recorded"}</dd></div>
              <div className="grid grid-cols-[38%_1fr] gap-3 py-2.5"><dt className="text-muted">Google click ID</dt><dd>{hasAdClick(lead.attribution) ? "Saved (can be uploaded to Google Ads when won)" : "None"}</dd></div>
              {ATTRIBUTION_ROWS.filter(([k]) => lead.attribution?.[k]).map(([k, label]) => (
                <div key={k} className="grid grid-cols-[38%_1fr] gap-3 py-2.5"><dt className="text-muted">{label}</dt><dd className="break-all">{k === "first_seen_at" ? new Date(lead.attribution[k]!).toLocaleString("en-GB") : lead.attribution[k]}</dd></div>
              ))}
            </dl>
            {files.length > 0 && (
              <>
                <h3 className="mt-6 mb-2 font-bold">Uploads</h3>
                <ul className="grid gap-3 sm:grid-cols-3" data-testid="lead-uploads">
                  {files.map((f) => (
                    <li key={f.path}>
                      <a href={f.href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-stone">
                        {f.type.startsWith("image/") && f.type !== "image/heic" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={f.href} alt={f.name} className="aspect-square w-full object-cover" />
                        ) : (
                          <span className="grid aspect-square place-items-center bg-sand"><FileText className="size-8" aria-hidden /></span>
                        )}
                        <span className="block truncate p-2 text-xs">{f.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <section className="rounded-2xl bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Notes</h2>
            <ul className="mb-4 space-y-3" data-testid="lead-notes">
              {lead.notes.map((n, i) => <li key={i} className="rounded-xl bg-sand p-3 text-sm"><span className="block text-xs text-muted">{new Date(n.at).toLocaleString("en-GB")}</span>{n.text}</li>)}
              {!lead.notes.length && <li className="text-sm text-muted">No notes yet.</li>}
            </ul>
            <form action={addNote} className="space-y-2">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="note" className="sr-only">Add a note</label>
              <textarea id="note" name="note" rows={3} className="input" placeholder="e.g. Called, survey booked for Tues 10am" required />
              <button className="btn-dark w-full min-h-10 py-2">Add note</button>
            </form>
            <p className="mt-6 text-xs text-muted">Source: {lead.source.page ?? "–"}{lead.source.utm_source ? ` · ${lead.source.utm_source}` : ""}</p>
          </section>
        </div>
      </main>
    </>
  );
}

const ATTRIBUTION_ROWS: [AttributionKey, string][] = [
  ["gclid", "gclid"], ["gbraid", "gbraid"], ["wbraid", "wbraid"], ["utm_source", "utm_source"], ["utm_medium", "utm_medium"], ["utm_campaign", "Campaign"], ["utm_term", "Keyword (utm_term)"],
  ["utm_content", "Ad (utm_content)"], ["landing_page", "First page visited"], ["referrer", "Came from"], ["first_seen_at", "First visit"],
];

/** Admin keeps working (with starter settings) even if Sanity is down. */
export default function LeadPage(props: Parameters<typeof LeadPageImpl>[0]) {
  return withLenientContent(() => LeadPageImpl(props));
}
