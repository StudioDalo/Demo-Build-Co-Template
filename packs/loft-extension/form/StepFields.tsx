"use client";

import { Radios, Text, TextArea, type PackStepProps } from "@/components/forms/fields";

/**
 * The loft & extension questions. Render the fields for `stepKey`; return null for steps this
 * pack doesn't own (services, detail and contact are shared steps the template renders).
 * Field names must match ./schema.ts and the option group keys in ../content/quote-form.ts.
 */
export function PackStepFields({ stepKey, a, set, errors, options }: PackStepProps) {
  const f = { a, set, errors };
  switch (stepKey) {
    case "property":
      return (
        <>
          <Radios name="propertyType" label="Property type" options={options("propertyType")} {...f} />
          <Radios name="propertyAge" label="Approximate age" options={options("propertyAge")} {...f} />
          <Radios name="ownership" label="Do you own the property?" options={options("ownership")} {...f} />
          <Text name="postcode" label="Postcode" {...f} autoComplete="postal-code" className="max-w-xs uppercase" />
        </>
      );
    case "timing":
      return <Radios name="timing" label="Start date" hideLabel options={options("timing")} {...f} />;
    case "budget":
      return <Radios name="budget" label="Budget range" hideLabel options={options("budget")} {...f} />;
    case "planning":
      return (
        <>
          <Radios name="drawings" label="Do you have drawings?" options={options("drawings")} {...f} />
          <Radios name="planningStatus" label="Planning permission" options={options("planningStatus")} {...f} />
          <Radios name="architect" label="Should we arrange an architect / drawings?" options={options("architect")} {...f} />
          <Radios name="partyWall" label="Any party wall issues with neighbours?" options={options("partyWall")} {...f} />
        </>
      );
    case "living":
      return (
        <>
          <Radios name="staying" label="Will you stay in the house during the works?" options={options("staying")} {...f} />
          <Radios name="parking" label="Parking for the team" options={options("parking")} {...f} />
          <TextArea name="access" label="Access notes (optional)" hint="e.g. side gate, narrow hallway, shared driveway" {...f} rows={3} />
        </>
      );
    default:
      return null;
  }
}
