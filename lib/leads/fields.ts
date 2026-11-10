/** Reusable Zod field builders for quote-form steps (shared by the template and trade packs). */
import { z } from "zod";
import { isValidUkPhone, normaliseUkPhone } from "@/lib/phone";

export const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export const name = z.string({ error: "Please enter your name" }).trim().min(2, "Please enter your name").max(80);
export const phone = z
  .string({ error: "Please enter a valid UK phone number" })
  .trim()
  .refine(isValidUkPhone, "Please enter a valid UK phone number")
  .transform(normaliseUkPhone);
export const email = z.string({ error: "Please enter a valid email address" }).trim().toLowerCase().email("Please enter a valid email address").max(200);
/** A required single choice (radio group), validated against the Sanity options on the server. */
export const choice = (msg: string) => z.string({ error: msg }).trim().min(1, msg).max(80);
export const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
export const ukPostcode = z.string({ error: "Please enter a valid UK postcode" }).trim().toUpperCase().regex(UK_POSTCODE, "Please enter a valid UK postcode");

/** What a pack's form definition must provide. */
export type PackFormDefinition = {
  /** Full step order. "services", "detail" and "contact" are shared steps the template provides. */
  steps: readonly string[];
  /** Zod schema for each trade-specific step (keys = step names in `steps`, except the shared ones). */
  stepSchemas: Record<string, z.ZodObject<z.ZodRawShape>>;
  /** Answer fields whose option points add up to the lead score. */
  scoreFields: readonly string[];
  /** Owner email / admin rows for the trade-specific answers. `label(key, value)` turns a stored value into its option label. */
  answerRows: (lead: { postcode: string; answers: Record<string, unknown> }, label: (key: string, value: unknown) => string) => [string, string][];
  /** Extra CSV export columns: [heading, answer key] (raw stored values). */
  csvColumns: readonly (readonly [string, string])[];
  /** Values sent with the quote_form_submit conversion event (no personal data). */
  conversionParams: (answers: Record<string, unknown>) => Record<string, string>;
};
