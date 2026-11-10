"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, FileUp, Loader2, Lock, Trash2 } from "lucide-react";
import { optionsFor, type QuoteFormSettings } from "@/lib/content/types";
import { PackStepFields } from "@/packs/active/form-ui";
import { Radios, Text, TextArea, type Answers, type FieldProps } from "./fields";
import { fieldErrors, STEP_ORDER, stepSchemas, type StepKey, type UploadRef } from "@/lib/leads/schema";
import { isValidUkPhone } from "@/lib/phone";
import { clearSavedLead, getSavedLead, saveLead, submitLead, type SavedLead } from "@/lib/forms/client";
import { hashedUserData, track } from "@/lib/track";
import { THANKS_KEY, type ThanksData } from "@/lib/tracking/thanks";
import { Honeypot, Turnstile } from "./SpamGuard";
import { storageKey } from "@/config";
import { packForm } from "@/packs/active/form";

type ServiceLite = { slug: string; name: string; formOptions: string[] };

const DRAFT_KEY = storageKey("quote-draft", "-");
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

const empty = (): Answers => ({ services: [], serviceOptions: {}, uploads: [], consent: false });

export function QuoteWizard({ form, services, callbackHours, privacyHref = "/privacy" }: { form: QuoteFormSettings; services: ServiceLite[]; callbackHours: number; privacyHref?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [formError, setFormError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [lead, setLead] = useState<SavedLead | null>(null);
  const [loaded, setLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastPartial = useRef<string>("");
  /** Latest saved lead + any save still in flight, read synchronously so a fast "Send" never creates a duplicate lead. */
  const leadRef = useRef<SavedLead | null>(null);
  const partialInFlight = useRef<Promise<unknown> | null>(null);
  const submitted = useRef(false);
  const started = useRef(false);
  /** On page load, focus without scrolling (scrolling would tuck the page heading under the sticky header). */
  const stepChanged = useRef(false);
  const onToken = useCallback((t: string) => setTurnstileToken(t), []);

  const key: StepKey = STEP_ORDER[step];
  const stepCopy = form.steps.find((s) => s.key === key) ?? { title: key, help: "" };
  const total = STEP_ORDER.length;

  // Restore draft (autosave) and any lead started from the quick form
  useEffect(() => {
    let draft: { step: number; answers: Answers } | null = null;
    try {
      draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    } catch {}
    const saved = getSavedLead();
    const resume = new URLSearchParams(window.location.search).get("resume");
    let next = draft?.answers ? { ...empty(), ...draft.answers } : empty();
    if (saved && resume) {
      leadRef.current = saved;
      setLead(saved);
      next = {
        ...next,
        name: next.name || saved.name,
        phone: next.phone || saved.phone,
        services: next.services.length ? next.services : saved.projectType ? [saved.projectType] : [],
      };
    } else if (saved && draft) {
      leadRef.current = saved;
      setLead(saved);
    }
    setA(next);
    if (draft && typeof draft.step === "number") setStep(Math.min(Math.max(draft.step, 0), total - 1));
    setLoaded(true);
  }, [total]);

  // Autosave every change
  useEffect(() => {
    if (!loaded) return;
    try {
      const { consent: _c, ...rest } = a;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, answers: rest }));
    } catch {}
  }, [a, step, loaded]);

  // Move focus to the step heading for keyboard and screen-reader users
  useEffect(() => {
    if (loaded) headingRef.current?.focus({ preventScroll: !stepChanged.current });
  }, [step, loaded]);

  const onFirstInteraction = () => {
    if (started.current) return;
    started.current = true;
    track("quote_form_start");
  };

  const canCapture = typeof a.name === "string" && a.name.trim().length >= 2 && typeof a.phone === "string" && isValidUkPhone(a.phone);

  /** Save progress server-side once we have name + phone, so abandoned forms still reach the owner. */
  const capturePartial = useCallback(
    async (opts: { keepalive?: boolean } = {}) => {
      if (!canCapture || submitted.current) return;
      const { consent: _c, ...data } = a;
      const sig = JSON.stringify(data);
      if (sig === lastPartial.current) return;
      lastPartial.current = sig;
      // Wait for an earlier save so the second one updates the same lead instead of creating another
      if (partialInFlight.current) await partialInFlight.current.catch(() => undefined);
      const current = leadRef.current;
      const run = submitLead({ kind: "partial", data, leadId: current?.leadId, token: current?.token, website }, opts).then((res) => {
        if (res.ok && res.leadId && res.token && (!current || current.leadId !== res.leadId)) {
          const l = { leadId: res.leadId, token: res.token, name: String(a.name), phone: String(a.phone) };
          leadRef.current = l;
          setLead(l);
          saveLead(l);
        }
        return res;
      });
      partialInFlight.current = run;
      await run;
    },
    [a, canCapture, website],
  );

  // Debounced partial capture while typing contact details
  useEffect(() => {
    if (!loaded || !canCapture) return;
    const t = window.setTimeout(() => void capturePartial(), 1200);
    return () => window.clearTimeout(t);
  }, [a.name, a.phone, a.email, canCapture, capturePartial, loaded]);

  // Last chance when the tab is closed or hidden
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void capturePartial({ keepalive: true });
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [capturePartial]);

  const set = (k: string, v: unknown) => {
    setA((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };

  function validateStep(): boolean {
    const parsed = stepSchemas[key].safeParse(a);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    setErrors(fieldErrors(parsed.error));
    // Focus the first invalid field
    window.setTimeout(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 0);
    return false;
  }

  function next() {
    if (!validateStep()) return;
    track("quote_form_step", { step_number: step + 1, step_name: key });
    if (lead) void capturePartial();
    stepChanged.current = true;
    setStep((s) => Math.min(s + 1, total - 1));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (key !== "contact") return next();
    if (!validateStep()) return;
    setStatus("sending");
    setFormError(undefined);
    submitted.current = true;
    // A progress save may still be running: wait so we update that lead rather than creating a second one
    if (partialInFlight.current) await partialInFlight.current.catch(() => undefined);
    const current = leadRef.current;
    const res = await submitLead({ kind: "quote", data: a, leadId: current?.leadId, token: current?.token, website, turnstileToken });
    if (res.ok) {
      track("quote_form_step", { step_number: total, step_name: key });
      // The conversion (quote_form_submit) fires once on the thank-you page, from this saved success response
      const thanks: ThanksData = {
        name: String(a.name ?? ""),
        leadId: res.leadId,
        services: a.services,
        params: packForm.conversionParams(a),
        score: res.score ?? "",
        userData: await hashedUserData(String(a.email ?? ""), String(a.phone ?? "")).catch(() => undefined),
      };
      try {
        localStorage.removeItem(DRAFT_KEY);
        sessionStorage.setItem(THANKS_KEY, JSON.stringify(thanks));
      } catch {}
      clearSavedLead();
      router.push("/get-a-quote/thank-you");
      return;
    }
    submitted.current = false;
    setStatus("error");
    if (res.fields) {
      setErrors(res.fields);
      const firstBad = STEP_ORDER.findIndex((s) => Object.keys(res.fields!).some((f) => f in stepSchemas[s].shape));
      if (firstBad >= 0 && firstBad !== step) {
        stepChanged.current = true;
        setStep(firstBad);
      }
    }
    setFormError(res.error ?? "Something went wrong. Please try again or call us.");
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_FILES - a.uploads.length;
    const chosen = Array.from(files).slice(0, room);
    const tooBig = chosen.find((f) => f.size > MAX_BYTES);
    if (tooBig) return setErrors({ uploads: `${tooBig.name} is over 10MB` });
    if (Array.from(files).length > room) setErrors({ uploads: `You can upload up to ${MAX_FILES} files` });
    const body = new FormData();
    chosen.forEach((f) => body.append("files", f));
    setUploading(true);
    try {
      const res = await fetch("/api/leads/upload", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; files?: UploadRef[]; error?: string };
      if (!json.ok || !json.files) throw new Error(json.error);
      set("uploads", [...a.uploads, ...json.files]);
    } catch (err) {
      setErrors({ uploads: (err as Error).message || "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  const progress = Math.round(((step + 1) / total) * 100);

  return (
    <form onSubmit={submit} onFocusCapture={onFirstInteraction} onPointerDownCapture={onFirstInteraction} noValidate className="relative mx-auto max-w-2xl" data-testid="quote-wizard" data-step={key}>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold">
          <span>Step {step + 1} of {total}</span>
          <span className="text-muted">{progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-stone" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Form progress">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <fieldset className="card p-5 sm:p-8">
        <legend className="sr-only">{stepCopy.title}</legend>
        <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-28 text-2xl font-extrabold outline-none sm:text-3xl lg:scroll-mt-32">{stepCopy.title}</h2>
        {stepCopy.help && <p className="mt-2 text-muted">{stepCopy.help}</p>}
        <div className="mt-6 space-y-6">
          {key === "services" && <ServicesStep a={a} services={services} set={set} errors={errors} />}
          <PackStepFields stepKey={key} a={a} set={set} errors={errors} options={(k) => optionsFor(form, k)} />
          {key === "detail" && (
            <>
              <TextArea name="description" label="Describe your project (optional)" hint="What you'd like, the rooms involved, anything you're unsure about." a={a} set={set} errors={errors} rows={6} />
              <div>
                <p className="label" id="uploads-label">Photos or plans <span className="font-normal text-muted">(optional, up to {MAX_FILES}, 10MB each)</span></p>
                <label className={clsx("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone p-6 text-center hover:border-ink", a.uploads.length >= MAX_FILES && "pointer-events-none opacity-50")}>
                  {uploading ? <Loader2 className="size-7 animate-spin" aria-hidden /> : <FileUp className="size-7" aria-hidden />}
                  <span className="font-semibold">{uploading ? "Uploading…" : "Tap to add photos or plans"}</span>
                  <input type="file" className="sr-only" multiple accept="image/*,application/pdf" aria-labelledby="uploads-label" data-testid="file-input" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} disabled={uploading || a.uploads.length >= MAX_FILES} />
                </label>
                {errors.uploads && <p className="field-error" role="alert">{errors.uploads}</p>}
                {a.uploads.length > 0 && (
                  <ul className="mt-3 space-y-2" data-testid="upload-list">
                    {a.uploads.map((u) => (
                      <li key={u.path} className="flex items-center justify-between gap-3 rounded-lg bg-sand px-3 py-2 text-sm">
                        <span className="truncate">{u.name}</span>
                        <button type="button" className="grid size-9 place-items-center rounded-md hover:bg-stone" aria-label={`Remove ${u.name}`} onClick={() => set("uploads", a.uploads.filter((x) => x.path !== u.path))}>
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
          {key === "contact" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Text name="name" label="Full name" a={a} set={set} errors={errors} autoComplete="name" />
                <Text name="phone" label="Mobile number" a={a} set={set} errors={errors} autoComplete="tel" type="tel" inputMode="tel" />
              </div>
              <Text name="email" label="Email" a={a} set={set} errors={errors} autoComplete="email" type="email" inputMode="email" />
              <Radios name="contactMethod" label="Best way to contact you" options={optionsFor(form, "contactMethod")} a={a} set={set} errors={errors} />
              <Radios name="contactTime" label="Best time" options={optionsFor(form, "contactTime")} a={a} set={set} errors={errors} />
              <Radios name="heardAbout" label="How did you hear about us?" options={optionsFor(form, "heardAbout")} a={a} set={set} errors={errors} />
              <div>
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--accent)]" checked={a.consent === true} onChange={(e) => set("consent", e.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "consent-err" : undefined} />
                  <span className="text-sm">{form.consentText} <a href={privacyHref} target="_blank" className="font-semibold underline">Privacy policy</a></span>
                </label>
                {errors.consent && <p id="consent-err" className="field-error">{errors.consent}</p>}
              </div>
              <Honeypot value={website} onChange={setWebsite} />
              <Turnstile onToken={onToken} />
              <p className="flex items-center gap-2 text-sm text-muted"><Lock className="size-4" aria-hidden /> We&apos;ll call you within {callbackHours} hours. No spam, ever.</p>
            </>
          )}
        </div>
      </fieldset>

      {formError && <p className="field-error mt-4 text-center" role="alert">{formError}</p>}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button type="button" className="btn-outline" onClick={() => { setErrors({}); stepChanged.current = true; setStep((s) => s - 1); }}>
            <ArrowLeft className="size-5" aria-hidden /> Back
          </button>
        )}
        {key !== "contact" ? (
          <button type="button" className="btn-primary flex-1" onClick={next} data-testid="next">
            Next <ArrowRight className="size-5" aria-hidden />
          </button>
        ) : (
          <button type="submit" className="btn-primary flex-1" disabled={status === "sending" || uploading} data-testid="submit">
            {status === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Check className="size-5" aria-hidden />} Send my quote request
          </button>
        )}
      </div>
    </form>
  );
}

/* ----------------------------- shared steps ----------------------------- */

function ServicesStep({ a, services, set, errors }: { a: Answers; services: ServiceLite[]; set: FieldProps["set"]; errors: Record<string, string> }) {
  const all = useMemo(() => [...services, { slug: "other", name: "Something else", formOptions: [] }], [services]);
  const toggle = (slug: string) => {
    const on = a.services.includes(slug);
    set("services", on ? a.services.filter((s) => s !== slug) : [...a.services, slug]);
  };
  const toggleOpt = (slug: string, opt: string) => {
    const cur = a.serviceOptions[slug] ?? [];
    set("serviceOptions", { ...a.serviceOptions, [slug]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] });
  };
  return (
    <div role="group" aria-label="Services" aria-describedby={errors.services ? "services-err" : undefined}>
      <div className="grid gap-2 sm:grid-cols-2">
        {all.map((s, i) => {
          const on = a.services.includes(s.slug);
          return (
            <div key={s.slug} className={clsx("rounded-xl border-2 transition-colors", on ? "border-ink bg-accent/15" : "border-stone hover:border-ink/40", on && s.formOptions.length > 0 && "sm:col-span-2")}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-3 font-semibold">
                <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={on} onChange={() => toggle(s.slug)} aria-invalid={i === 0 && Boolean(errors.services)} />
                {s.name}
              </label>
              {on && s.formOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-4" role="group" aria-label={`${s.name} type`}>
                  {s.formOptions.map((o) => {
                    const sel = (a.serviceOptions[s.slug] ?? []).includes(o);
                    return (
                      <button key={o} type="button" aria-pressed={sel} onClick={() => toggleOpt(s.slug, o)} className={clsx("min-h-10 rounded-full border-2 px-4 text-sm font-semibold", sel ? "border-ink bg-ink text-white" : "border-stone bg-white")}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {a.services.includes("other") && (
        <div className="mt-4">
          <label htmlFor="f-otherService" className="label">What else would you like built?</label>
          <input id="f-otherService" className="input" value={String(a.otherService ?? "")} onChange={(e) => set("otherService", e.target.value)} />
        </div>
      )}
      {errors.services && <p id="services-err" className="field-error">{errors.services}</p>}
    </div>
  );
}
