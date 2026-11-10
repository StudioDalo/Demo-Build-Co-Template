"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveLead, submitLead } from "@/lib/forms/client";
import { track } from "@/lib/track";
import { Honeypot, Turnstile } from "./SpamGuard";

type Props = {
  heading: string;
  services: { slug: string; name: string }[];
  submitLabel: string;
  successText: string;
  addDetailText: string;
  consentText: string;
  location: string;
  /** "inline" lays the 3 fields + button out in one row on large screens */
  layout?: "stacked" | "inline";
  /** Pre-selects the project type (e.g. on a service page) */
  defaultProjectType?: string;
};

/** 3-field quick enquiry: name, phone, project type. Creates a lead; the long form can add detail to it later. */
export function QuickQuoteForm({ heading, services, submitLabel, successText, addDetailText, consentText, location, layout = "stacked", defaultProjectType = "" }: Props) {
  const inline = layout === "inline";
  const [v, setV] = useState({ name: "", phone: "", projectType: defaultProjectType });
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; error?: string; fields?: Record<string, string> }>({ status: "idle" });
  const onToken = useCallback((t: string) => setTurnstileToken(t), []);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    const res = await submitLead({ kind: "quick", data: v, website, turnstileToken });
    if (res.ok) {
      if (res.leadId && res.token) saveLead({ leadId: res.leadId, token: res.token, ...v });
      // Fires only on the server's success response, so failed/invalid submissions are never counted
      if (res.leadId) track("quick_quote_submit", { project_type: v.projectType, form_location: location });
      setState({ status: "done" });
    } else setState({ status: "error", error: res.error, fields: res.fields });
  }

  if (state.status === "done") {
    return (
      <div className="rounded-2xl bg-white p-5 text-ink shadow-xl" role="status" data-testid="quick-success">
        <p className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 className="size-6 text-green-600" aria-hidden /> {successText}</p>
        <Link href="/get-a-quote?resume=1" className="btn-primary mt-4 w-full text-center" data-track-location={`${location}_add_detail`}>{addDetailText}</Link>
      </div>
    );
  }

  const err = (k: string) => state.fields?.[k];
  const id = (k: string) => `qq-${location}-${k}`;
  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl bg-white p-5 text-ink shadow-xl" data-testid="quick-form" aria-labelledby={id("h")}>
      <h2 id={id("h")} className="mb-4 text-xl font-extrabold">{heading}</h2>
      <div className={inline ? "grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-start" : "grid gap-3"}>
        <div>
          <label htmlFor={id("name")} className="label">Your name</label>
          <input id={id("name")} className="input" autoComplete="name" value={v.name} onChange={set("name")} aria-invalid={Boolean(err("name"))} aria-describedby={err("name") ? id("name-err") : undefined} />
          {err("name") && <p id={id("name-err")} className="field-error">{err("name")}</p>}
        </div>
        <div>
          <label htmlFor={id("phone")} className="label">Mobile number</label>
          <input id={id("phone")} className="input" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} aria-invalid={Boolean(err("phone"))} aria-describedby={err("phone") ? id("phone-err") : undefined} />
          {err("phone") && <p id={id("phone-err")} className="field-error">{err("phone")}</p>}
        </div>
        <div>
          <label htmlFor={id("type")} className="label">Project type</label>
          <select id={id("type")} className="input" value={v.projectType} onChange={set("projectType")} aria-invalid={Boolean(err("projectType"))} aria-describedby={err("projectType") ? id("type-err") : undefined}>
            <option value="">Choose…</option>
            {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            <option value="other">Something else</option>
          </select>
          {err("projectType") && <p id={id("type-err")} className="field-error">{err("projectType")}</p>}
        </div>
        {inline && (
          <div>
            <span className="label hidden lg:block" aria-hidden>&nbsp;</span>
            <button type="submit" className="btn-primary w-full whitespace-nowrap" disabled={state.status === "sending"}>
              {state.status === "sending" && <Loader2 className="size-5 animate-spin" aria-hidden />} {submitLabel}
            </button>
          </div>
        )}
      </div>
      <Honeypot value={website} onChange={setWebsite} />
      <Turnstile onToken={onToken} />
      {state.status === "error" && !state.fields && <p className="field-error" role="alert">{state.error}</p>}
      {!inline && (
        <button type="submit" className="btn-primary mt-4 w-full" disabled={state.status === "sending"}>
          {state.status === "sending" && <Loader2 className="size-5 animate-spin" aria-hidden />} {submitLabel}
        </button>
      )}
      <p className="mt-3 text-xs text-muted" data-testid="quick-consent">
        {consentText.replace(/\s*See our privacy policy\.?$/i, "")}{" "}
        <a href="/privacy" target="_blank" className="font-semibold underline">Privacy policy</a>
      </p>
    </form>
  );
}
