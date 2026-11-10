"use client";

/**
 * THE QUOTE FORM'S QUESTIONS (what people see). Render the fields for each step key in
 * ./schema.ts. Return null for shared steps (services, detail, contact): the template renders those.
 * Use the shared field components so the form stays accessible and consistent:
 *   <Radios name label options /> (single choice from Sanity options)
 *   <Text name label /> (one line)   <TextArea name label hint rows /> (several lines)
 * `options(key)` returns the owner's answer options from Sanity (or ../content/quote-form.ts).
 */
import { Radios, Text, type PackStepProps } from "@/components/forms/fields";

export function PackStepFields({ stepKey, a, set, errors, options }: PackStepProps) {
  const f = { a, set, errors };
  switch (stepKey) {
    case "job":
      return (
        <>
          <Radios name="jobType" label="Type of job" options={options("jobType")} {...f} />
          <Radios name="timing" label="When would you like it done?" options={options("timing")} {...f} />
          <Text name="postcode" label="Postcode" {...f} autoComplete="postal-code" className="max-w-xs uppercase" />
        </>
      );
    default:
      return null;
  }
}
