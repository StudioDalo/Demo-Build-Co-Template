"use client";

import clsx from "clsx";
import type { Option } from "@/lib/content/types";
import type { UploadRef } from "@/lib/leads/schema";

/**
 * Accessible quote-form field components, shared by the template's own steps and by trade packs'
 * step components (packs/<pack>/form/StepFields.tsx).
 */
export type Answers = Record<string, unknown> & { services: string[]; serviceOptions: Record<string, string[]>; uploads: UploadRef[] };

/** Props every pack step component receives. `options(key)` returns the Sanity answer options for a field. */
export type PackStepProps = {
  stepKey: string;
  a: Answers;
  set: (k: string, v: unknown) => void;
  errors: Record<string, string>;
  options: (key: string) => Option[];
};

export type FieldProps = { name: string; label: string; a: Answers; set: (k: string, v: unknown) => void; errors: Record<string, string> };

export function Radios({ name, label, options, hideLabel, a, set, errors }: FieldProps & { options: Option[]; hideLabel?: boolean }) {
  const err = errors[name];
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} aria-describedby={err ? `${name}-err` : undefined}>
      <p id={`${name}-label`} className={clsx("label", hideLabel && "sr-only")}>{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o, i) => {
          const checked = a[name] === o.value;
          return (
            <label key={o.value} className={clsx("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-semibold transition-colors", checked ? "border-ink bg-accent/15" : "border-stone hover:border-ink/40")}>
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => set(name, o.value)} className="size-5 accent-[var(--accent)]" aria-invalid={i === 0 && Boolean(err)} />
              {o.label}
            </label>
          );
        })}
      </div>
      {err && <p id={`${name}-err`} className="field-error">{err}</p>}
    </div>
  );
}

export function Text({ name, label, a, set, errors, className, ...rest }: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const err = errors[name];
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}</label>
      <input id={`f-${name}`} name={name} className={clsx("input", className)} value={String(a[name] ?? "")} onChange={(e) => set(name, e.target.value)} aria-invalid={Boolean(err)} aria-describedby={err ? `${name}-err` : undefined} {...rest} />
      {err && <p id={`${name}-err`} className="field-error">{err}</p>}
    </div>
  );
}

export function TextArea({ name, label, hint, a, set, errors, rows }: FieldProps & { hint?: string; rows: number }) {
  const err = errors[name];
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}</label>
      {hint && <p id={`${name}-hint`} className="mb-2 text-sm text-muted">{hint}</p>}
      <textarea id={`f-${name}`} name={name} rows={rows} className="input" value={String(a[name] ?? "")} onChange={(e) => set(name, e.target.value)} aria-invalid={Boolean(err)} aria-describedby={[hint && `${name}-hint`, err && `${name}-err`].filter(Boolean).join(" ") || undefined} />
      {err && <p id={`${name}-err`} className="field-error">{err}</p>}
    </div>
  );
}
