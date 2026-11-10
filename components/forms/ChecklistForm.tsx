"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/forms/client";
import { track } from "@/lib/track";
import { Honeypot, Turnstile } from "./SpamGuard";

export function ChecklistForm({ cta, location }: { cta: string; location: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; error?: string; fields?: Record<string, string>; url?: string }>({ status: "idle" });
  const onToken = useCallback((t: string) => setTurnstileToken(t), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    const res = await submitLead({ kind: "checklist", data: { email, name, consent }, website, turnstileToken });
    if (res.ok) {
      track("checklist_download", { location });
      setState({ status: "done", url: res.downloadUrl });
    } else setState({ status: "error", error: res.error, fields: res.fields });
  }

  if (state.status === "done") {
    return (
      <div className="rounded-xl bg-sand p-4" role="status" data-testid="checklist-success">
        <p className="font-bold">Sent! Check your inbox.</p>
        {state.url && (
          <a href={state.url} className="btn-dark mt-3 w-full" download>
            <Download className="size-5" aria-hidden /> Download now
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3" data-testid="checklist-form">
      <div>
        <label htmlFor={`cl-name-${location}`} className="label">First name <span className="font-normal text-muted">(optional)</span></label>
        <input id={`cl-name-${location}`} className="input" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`cl-email-${location}`} className="label">Email</label>
        <input id={`cl-email-${location}`} type="email" inputMode="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(state.fields?.email)} aria-describedby={state.fields?.email ? `cl-email-err-${location}` : undefined} />
        {state.fields?.email && <p id={`cl-email-err-${location}`} className="field-error">{state.fields.email}</p>}
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-0.5 size-5 accent-[var(--accent)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Email me the checklist. I agree to the <a href="/privacy" className="underline">privacy policy</a>.</span>
      </label>
      {state.fields?.consent && <p className="field-error">{state.fields.consent}</p>}
      <Honeypot value={website} onChange={setWebsite} />
      <Turnstile onToken={onToken} />
      {state.status === "error" && !state.fields && <p className="field-error" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={state.status === "sending"}>
        {state.status === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null} {cta}
      </button>
    </form>
  );
}
