import Link from "next/link";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { parseFilter } from "@/lib/admin/filter";
import { tryGetStores } from "@/lib/leads/store";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads/types";
import { getPrivacyPolicy, getServices, getSiteSettings, sanityHealthy } from "@/lib/content";
import { AdminBar, ScoreBadge } from "./ui";
import { runRetentionCleanup, updateStatus } from "./actions";
import { dueForDeletion } from "@/lib/leads/retention";
import { CopyReviewLink } from "./CopyReviewLink";
import { hasAdClick, sourceSummary } from "@/lib/leads/attribution";
import { fmt as fmtTokens, siteConfig } from "@/config";
import { withLenientContent } from "@/lib/content/mode";
import { checkSettings, type SettingIssue } from "@/lib/env-check";

const fmt = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

async function AdminPageImpl({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = parseFilter(sp);
  const stores = tryGetStores();
  if (!stores) return <StorageMissing />;
  const { leads: store, backend } = stores;
  const [leads, all, services, settings, policy] = await Promise.all([store.list(filter), store.list(), getServices(), getSiteSettings(), getPrivacyPolicy()]);
  const due = dueForDeletion(all, policy.retentionMonths);
  const [issues, sanityOk] = [checkSettings(), await sanityHealthy()];
  const cleanup = typeof sp.cleanup === "string" ? sp.cleanup : undefined;
  const svcName = (s: string) => services.find((x) => x.slug === s)?.name ?? s;
  const qs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string" && v) as [string, string][]).toString();
  const counts = { new: all.filter((l) => l.status === "new").length, hot: all.filter((l) => l.score === "hot" && l.status === "new").length, partial: all.filter((l) => !l.complete).length };

  return (
    <>
      <AdminBar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <SettingsBanner issues={issues} sanityOk={sanityOk} />
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Total leads" value={all.length} />
          <Stat label="New (not contacted)" value={counts.new} />
          <Stat label="Hot & new" value={counts.hot} />
          <Stat label="Partial (abandoned)" value={counts.partial} />
        </div>

        <form className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4" data-testid="lead-filters">
          <Select name="status" label="Status" value={filter.status} options={LEAD_STATUSES.map((s) => [s, STATUS_LABELS[s]])} />
          <Select name="score" label="Score" value={filter.score} options={[["hot", "Hot"], ["warm", "Warm"], ["cold", "Cold"]]} />
          <Select name="type" label="Type" value={filter.type} options={[["quote", "Quote form"], ["quick", "Quick callback"], ["checklist", "Checklist"]]} />
          <Select name="complete" label="Completed?" value={filter.complete === undefined ? undefined : filter.complete ? "yes" : "no"} options={[["yes", "Complete"], ["no", "Partial"]]} />
          <div><label className="label" htmlFor="q">Search</label><input id="q" name="q" defaultValue={filter.q} placeholder="Name, phone, email, postcode" className="input min-h-10 py-2" /></div>
          <button className="btn-dark min-h-10 py-2">Filter</button>
          <Link href="/admin" className="py-2 text-sm font-semibold underline">Clear</Link>
          <a href={`/api/admin/export${qs ? `?${qs}` : ""}`} className="btn-primary ml-auto min-h-10 py-2" data-testid="export-csv"><Download className="size-4" aria-hidden /> Export CSV</a>
          <a href="/api/admin/export/google-ads" className="btn-dark min-h-10 py-2" data-testid="export-gads" title="Won jobs that came from a Google Ads click. Upload in Google Ads → Goals → Conversions → Uploads.">
            <Download className="size-4" aria-hidden /> Export Google Ads offline conversions
          </a>
        </form>

        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[980px] text-left text-sm" data-testid="lead-table">
            <thead className="border-b border-stone text-xs text-muted uppercase">
              <tr><th className="p-3">Received</th><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Project</th><th className="p-3">Postcode</th><th className="p-3">Source</th><th className="p-3">Score</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-sand/60" data-testid="lead-row">
                  <td className="p-3 whitespace-nowrap">{fmt(l.createdAt)}{!l.complete && <span className="ml-2 rounded bg-stone px-1.5 py-0.5 text-[10px] font-bold uppercase">Partial</span>}</td>
                  <td className="p-3 font-semibold"><Link href={`/admin/leads/${l.id}`} className="underline-offset-2 hover:underline">{l.name || "(no name)"}</Link><span className="block text-xs font-normal text-muted">{l.type === "quick" ? "Quick callback" : l.type === "checklist" ? "Checklist" : "Quote form"}</span></td>
                  <td className="p-3 whitespace-nowrap">{l.phone ? <a href={`tel:${l.phone}`} className="underline">{l.phone}</a> : l.email}</td>
                  <td className="p-3">{l.services.map(svcName).join(", ")}</td>
                  <td className="p-3">{l.postcode}</td>
                  <td className="p-3 text-xs" data-testid="lead-source">{sourceSummary(l.attribution) || <span className="text-muted">Not recorded</span>}{hasAdClick(l.attribution) && <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-800" title="Google click ID saved: can be uploaded as an offline conversion">gclid</span>}</td>
                  <td className="p-3"><ScoreBadge score={l.score} />{l.status === "won" && l.wonValue !== null && <span className="mt-1 block text-xs font-bold text-green-700">£{l.wonValue.toLocaleString("en-GB")}</span>}</td>
                  <td className="p-3">
                    {/* key: remount after save so the select shows the stored status (React resets forms after actions) */}
                    <form key={`${l.id}-${l.status}`} action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="rounded-lg border border-stone px-2 py-1.5" aria-label={`Status for ${l.name}`}>
                        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button className="rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-white">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!leads.length && <tr><td colSpan={8} className="p-10 text-center text-muted">No leads yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <section className={`mt-8 rounded-2xl p-5 ${due.all.length ? "bg-accent/10 ring-2 ring-accent" : "bg-white"}`} data-testid="retention-panel" aria-labelledby="retention-h">
          <h2 id="retention-h" className="font-bold">Data clean-up (privacy policy retention)</h2>
          <p className="mt-1 text-sm text-muted">
            Check this monthly. Unfinished enquiries are deleted after {policy.retentionMonths.partial} months and enquiries that didn&apos;t go ahead after {policy.retentionMonths.enquiries} months, with their photos and plans.
            Won jobs are never deleted here. Change the periods in Studio → Privacy &amp; cookies policy → Retention.
          </p>
          {cleanup === "done" && <p className="mt-2 text-sm font-bold text-green-700" role="status">Deleted {String(sp.deleted ?? 0)} old enquiries.</p>}
          {due.all.length ? (
            <form action={runRetentionCleanup} className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold" data-testid="retention-due">{due.partial.length} unfinished and {due.enquiries.length} older enquiries are due for deletion.</p>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required className="size-4" /> I understand this permanently deletes them</label>
              <button className="btn-dark min-h-10 py-2">Delete {due.all.length} now</button>
            </form>
          ) : (
            <p className="mt-2 text-sm font-semibold text-green-700" data-testid="retention-ok">Nothing due for deletion.</p>
          )}
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5">
            <h2 className="font-bold">Ask a customer for a review</h2>
            <p className="mt-1 text-sm text-muted">Send this link by text, WhatsApp or email after handover.</p>
            <CopyReviewLink url={settings.reviewLinkUrl || settings.checkatrade.url || ""} platform={siteConfig.reviewPlatform.name} message={fmtTokens(settings.uiText.reviewRequestMessage, { businessName: settings.businessName })} />
          </div>
          <p className="self-end text-xs text-muted">Storage: {backend === "supabase" ? "Supabase (secure database)" : "Local test file (development only)"}</p>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl bg-white p-4"><p className="text-xs font-semibold text-muted uppercase">{label}</p><p className="font-display text-3xl font-black">{value}</p></div>;
}

function Select({ name, label, value, options }: { name: string; label: string; value?: string; options: [string, string][] }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <select id={`f-${name}`} name={name} defaultValue={value ?? ""} className="input min-h-10 py-2">
        <option value="">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

/** Missing or unsafe settings (names only, never values). Errors would stop a production deployment. */
function SettingsBanner({ issues, sanityOk }: { issues: SettingIssue[]; sanityOk: boolean | null }) {
  const list = [...issues];
  if (sanityOk === false) list.unshift({ key: "Sanity", level: "warning", message: "can't be reached right now: the public site keeps showing its last good version until it's back" });
  if (!list.length) return null;
  return (
    <section className="mb-6 rounded-2xl bg-white p-5 ring-2 ring-accent" role="status" data-testid="settings-warnings" aria-labelledby="settings-h">
      <h2 id="settings-h" className="font-bold">Settings to check</h2>
      <p className="mt-1 text-sm text-muted">Set these in Vercel → Settings → Environment Variables, then redeploy. See <code>.env.example</code> for what each one does.</p>
      <ul className="mt-3 space-y-1 text-sm">
        {list.map((i) => (
          <li key={i.key + i.message} data-level={i.level}>
            <span className={i.level === "error" ? "font-bold text-red-700" : "font-bold"}>{i.level === "error" ? "Required" : "Recommended"}: {i.key}</span> {i.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StorageMissing() {
  return (
    <>
      <AdminBar />
      <main className="mx-auto max-w-2xl px-4 py-16" data-testid="storage-missing">
        <h1 className="text-2xl font-extrabold">Lead storage isn&apos;t connected</h1>
        <p className="mt-3 text-muted">
          Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel → Settings → Environment Variables, then redeploy.
          Until then the quote form shows visitors an error asking them to call, so no enquiry is silently lost.
        </p>
      </main>
    </>
  );
}

/** Admin keeps working (with starter settings) even if Sanity is down. */
export default function AdminPage(props: Parameters<typeof AdminPageImpl>[0]) {
  return withLenientContent(() => AdminPageImpl(props));
}
