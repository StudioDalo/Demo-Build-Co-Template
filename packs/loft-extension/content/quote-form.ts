import type { QuoteFormSettings } from "@/lib/content/types";
import { opt } from "@/lib/content/ph";

/**
 * Loft & extension quote form: default wording, answer options and lead-score points.
 * Everything here is editable in Sanity (Quote form). The questions themselves are code (./form/).
 * `points` on an option count towards the hot/warm/cold score when the group is listed in form.scoreFields.
 */
export const quoteForm: QuoteFormSettings = {
  steps: [
    { key: "services", title: "What would you like built?", help: "Tick everything you're considering. You can choose more than one." },
    { key: "property", title: "About your property", help: "This helps us check the planning route before we visit." },
    { key: "timing", title: "When would you like work to start?", help: "No pressure. 'Just researching' is fine." },
    { key: "budget", title: "Do you have a budget range in mind?", help: "A rough range helps us suggest the right spec. 'Not sure yet' is fine." },
    { key: "planning", title: "Where are you with planning?", help: "Don't worry if you haven't started. We can arrange everything." },
    { key: "living", title: "Living arrangements during the build", help: "So we can plan access and keep disruption down." },
    { key: "detail", title: "Tell us about the project", help: "A few sentences is plenty. Photos or plans help us quote accurately." },
    { key: "contact", title: "Where should we send your quote?", help: "We'll only use these details to contact you about your project." },
  ],
  optionGroups: [
    { key: "propertyType", options: opt(["Terraced", "Semi-detached", "Detached", "Flat / maisonette", "Other"]) },
    { key: "propertyAge", options: opt(["Pre-1900 (Victorian)", "1900–1939", "1940–1979", "1980 or newer", "Not sure"]) },
    { key: "ownership", options: opt(["I own it", "I'm buying it", "Other"]) },
    {
      key: "timing",
      options: [
        { value: "asap", label: "As soon as possible", points: 3 },
        { value: "1-3-months", label: "In 1–3 months", points: 3 },
        { value: "3-6-months", label: "In 3–6 months", points: 2 },
        { value: "6-plus-months", label: "In 6+ months", points: 1 },
        { value: "researching", label: "Just researching", points: 0 },
      ],
    },
    {
      key: "budget",
      options: [
        { value: "under-25k", label: "Under £25,000", points: 1 },
        { value: "25k-50k", label: "£25,000 – £50,000", points: 2 },
        { value: "50k-100k", label: "£50,000 – £100,000", points: 3 },
        { value: "100k-plus", label: "£100,000+", points: 3 },
        { value: "not-sure", label: "Not sure yet", points: 1 },
      ],
    },
    {
      key: "drawings",
      options: [
        { value: "yes", label: "Yes, drawings are done", points: 2 },
        { value: "in-progress", label: "In progress", points: 1 },
        { value: "no", label: "Not yet", points: 0 },
      ],
    },
    {
      key: "planningStatus",
      options: [
        { value: "granted", label: "Permission granted / LDC approved", points: 2 },
        { value: "applied", label: "Applied, waiting for a decision", points: 1 },
        { value: "not-needed", label: "Not needed (permitted development)", points: 1 },
        { value: "not-applied", label: "Not applied yet", points: 0 },
        { value: "not-sure", label: "Not sure", points: 0 },
      ],
    },
    {
      key: "architect",
      options: [
        { value: "yes", label: "Yes, please arrange drawings", points: 1 },
        { value: "no", label: "No, I have an architect", points: 1 },
        { value: "not-sure", label: "Not sure", points: 0 },
      ],
    },
    { key: "partyWall", options: opt(["Yes", "No", "Not sure"]) },
    { key: "staying", options: opt(["Yes, we'll stay in", "No, we'll move out", "Not sure yet"]) },
    { key: "parking", options: opt(["Driveway", "On-street (permit)", "On-street (free)", "No parking nearby", "Not sure"]) },
    // Shared contact-step groups (every pack has these)
    { key: "contactMethod", options: opt(["Phone call", "WhatsApp", "Email"]) },
    { key: "contactTime", options: opt(["Morning", "Afternoon", "Evening", "Any time"]) },
    { key: "heardAbout", options: opt(["Google", "Social media", "Recommendation", "Other"]) },
  ],
  consentText:
    "I agree to {businessName} storing these details and contacting me about my project, as explained in the privacy policy. If I don't finish the form, the name and number I've entered may still be used to contact me about this enquiry.",
  thankYou: {
    heading: "Thanks, your request is in",
    text: "We'll call you within {hours} hours to book your free survey visit. A copy of your answers is on its way to your inbox.",
  },
  quickForm: {
    submit: "Call me back",
    success: "Thanks! We'll call you within {hours} hours.",
    addDetail: "Want a more accurate quote? Add a few details (2 minutes)",
    consent: "By sending this you agree we can contact you about your project, as explained in our privacy policy.",
  },
  scoring: { hot: 7, warm: 4 },
};
