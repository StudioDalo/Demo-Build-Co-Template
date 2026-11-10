/**
 * Wording for customer emails (lib/email/templates.ts fills in names, numbers and links).
 * Keep it factual: no promises the business hasn't confirmed. [OWNER TO REVIEW]
 */
export const emailCopy = {
  /** "We'll call you within N hours <nextStep>." */
  nextStep: "to talk through your job",
  /** "While you wait, have a look at our <guidesLabel> or <socialLabel>." */
  guidesLabel: "guides",
  socialLabel: "latest work",
  /** Lead-magnet (checklist) email. Only used if the client config has a leadMagnet. */
  checklistIntro: "[EDITABLE PLACEHOLDER] Here's the free guide you asked for.",
  checklistNextStepHtml: "ask us for a quote",
  checklistNextStepAfter: ".",
  checklistNextStepText: "Ask for a quote",
};
