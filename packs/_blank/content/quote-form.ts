/**
 * Default wording, answer options and lead-score points for the quote form. The owner can change
 * all of it in Sanity (Quote form); the QUESTIONS themselves live in ../form.
 * - steps: one entry per step key in ../form/schema.ts (packForm.steps), in the same order.
 * - optionGroups: one per multiple-choice question (key = answer field name), plus the three
 *   shared contact questions (contactMethod, contactTime, heardAbout), which every pack must include.
 */
import type { QuoteFormSettings } from "@/lib/content/types";
import { opt } from "@/lib/content/ph";

export const quoteForm: QuoteFormSettings = {
  steps: [
    { key: "services", title: "What do you need help with?", help: "Tick everything that applies." },
    { key: "job", title: "About the job", help: "[EDITABLE PLACEHOLDER] Why you're asking these questions." },
    { key: "detail", title: "Tell us more", help: "A few sentences is plenty. Photos help us quote accurately." },
    { key: "contact", title: "Where should we send your quote?", help: "We'll only use these details to contact you about your enquiry." },
  ],
  optionGroups: [
    { key: "jobType", options: opt(["[EDITABLE PLACEHOLDER] Option A", "[EDITABLE PLACEHOLDER] Option B", "Not sure"]) },
    {
      key: "timing",
      options: [
        { value: "asap", label: "As soon as possible", points: 3 },
        { value: "1-3-months", label: "In 1–3 months", points: 2 },
        { value: "researching", label: "Just researching", points: 0 },
      ],
    },
    { key: "contactMethod", options: opt(["Phone call", "WhatsApp", "Email"]) },
    { key: "contactTime", options: opt(["Morning", "Afternoon", "Evening", "Any time"]) },
    { key: "heardAbout", options: opt(["Google", "Social media", "Recommendation", "Other"]) },
  ],
  consentText: "I agree to {businessName} storing these details and contacting me about my enquiry, as explained in the privacy policy. If I don't finish the form, the name and number I've entered may still be used to contact me about this enquiry.",
  thankYou: { heading: "Thanks, your request is in", text: "We'll call you within {hours} hours." },
  quickForm: {
    submit: "Call me back",
    success: "Thanks! We'll call you within {hours} hours.",
    addDetail: "Want a more accurate quote? Add a few details",
    consent: "By sending this you agree we can contact you about your enquiry, as explained in our privacy policy.",
  },
  /** Total points at or above which a lead is hot / warm (else cold) */
  scoring: { hot: 3, warm: 2 },
};
