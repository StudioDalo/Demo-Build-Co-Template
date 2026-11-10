import { z } from "zod";
import { packForm } from "@/packs/active/form";
import { choice, email, name, optionalText, phone } from "./fields";

export { UK_POSTCODE } from "./fields";

export const uploadRef = z.object({
  path: z.string().min(1).max(300),
  name: z.string().max(200),
  size: z.number().int().nonnegative(),
  type: z.string().max(100),
});
export type UploadRef = z.infer<typeof uploadRef>;

/** Steps every pack shares: what they want built, project detail + uploads, and contact details. */
const sharedSteps = {
  services: z.object({
    services: z.array(z.string().min(1), { error: "Choose at least one option" }).min(1, "Choose at least one option"),
    serviceOptions: z.record(z.string(), z.array(z.string())).optional().default({}),
    otherService: optionalText(200),
  }),
  detail: z.object({
    description: optionalText(3000),
    uploads: z.array(uploadRef).max(5, "Up to 5 files").optional().default([]),
  }),
  contact: z.object({
    name,
    phone,
    email,
    contactMethod: choice("Choose how we should contact you"),
    contactTime: choice("Choose a time"),
    heardAbout: choice("Let us know how you heard about us"),
    consent: z.literal(true, { error: "Please tick to agree so we can contact you" }),
  }),
};

/** One schema per form step (shared + the active trade pack's), so the browser and the server validate identically. */
export const stepSchemas: Record<string, z.ZodObject<z.ZodRawShape>> = { ...sharedSteps, ...packForm.stepSchemas };

export type StepKey = string;
export const STEP_ORDER: StepKey[] = [...packForm.steps];

export const quoteSchema = STEP_ORDER.reduce<z.ZodObject<z.ZodRawShape>>((acc, key) => acc.extend(stepSchemas[key].shape), z.object({}));
export type QuoteAnswers = Record<string, unknown> & { name: string; phone: string; email: string; services: string[]; uploads: UploadRef[]; consent: true; postcode?: string };

export const quickSchema = z.object({ name, phone, projectType: choice("Choose a project type") });
export type QuickAnswers = z.infer<typeof quickSchema>;

/** Partial capture: only name + phone are required, everything else is whatever the user has filled in so far. */
export const partialSchema = z.object({ name, phone }).passthrough();

export const checklistSchema = z.object({
  email,
  name: z.string().trim().max(80).optional().default(""),
  consent: z.literal(true, { error: "Please tick to agree" }),
});

export const sourceSchema = z
  .object({
    page: z.string().max(300).optional(),
    referrer: z.string().max(500).optional(),
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional(),
  })
  .partial()
  .optional()
  .default({});

const attr = (max: number) => z.string().trim().max(max).optional();
/** Ad click IDs + campaign tags captured on landing (see lib/tracking/attribution.ts). */
export const attributionSchema = z
  .object({
    gclid: attr(300), gbraid: attr(300), wbraid: attr(300),
    utm_source: attr(150), utm_medium: attr(150), utm_campaign: attr(150), utm_term: attr(150), utm_content: attr(150),
    landing_page: attr(300), referrer: attr(500),
    first_seen_at: z.string().datetime({ offset: true }).optional().catch(undefined),
  })
  .partial()
  .optional()
  .catch({})
  .default({});

export const submissionSchema = z.object({
  kind: z.enum(["quick", "partial", "quote", "checklist"]),
  leadId: z.string().uuid().optional(),
  token: z.string().max(100).optional(),
  data: z.record(z.string(), z.unknown()),
  website: z.string().optional().default(""), // honeypot
  turnstileToken: z.string().max(4000).optional(),
  source: sourceSchema,
  attribution: attributionSchema,
});
export type Submission = z.infer<typeof submissionSchema>;

/** Flatten zod issues to { field: message } for the UI. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
