/**
 * THE QUOTE FORM'S QUESTIONS (validation + scoring + reporting). Browser and server both use this,
 * so validation is identical. Shared steps ("services", "detail", "contact") are provided by the
 * template: list them in `steps` where you want them, but don't define them in stepSchemas.
 */
import { z } from "zod";
import { choice, ukPostcode, type PackFormDefinition } from "@/lib/leads/fields";

const stepSchemas = {
  /** Field names here = answer keys = option group keys in ../content/quote-form.ts */
  job: z.object({
    jobType: choice("Choose a type of job"),
    timing: choice("Choose when you'd like to start"),
    postcode: ukPostcode, // `postcode` is saved to the lead's postcode column
  }),
};

export const packForm = {
  /** Full step order. Must start with "services" and end with "detail", "contact". */
  steps: ["services", "job", "detail", "contact"],
  stepSchemas,
  /** Answer keys whose option points add up to the lead score (hot/warm/cold thresholds are in Sanity) */
  scoreFields: ["timing"],
  /** Rows in the owner email and the /admin lead page, between "Services" and "Description" */
  answerRows: (lead, label) => [
    ["Job", label("jobType", lead.answers.jobType)],
    ["Postcode", lead.postcode],
    ["Start", label("timing", lead.answers.timing)],
  ],
  /** Extra columns in the /admin CSV export: [heading, answer key] */
  csvColumns: [["Timing", "timing"]],
  /** Values sent with the quote_form_submit analytics event. No names, emails, phones or free text. */
  conversionParams: (a) => ({ timescale: String(a.timing ?? "") }),
} satisfies PackFormDefinition;
