/**
 * The trade's services. Each gets a page at /services/<slug>, a card on the homepage and a
 * checkbox in the quote form. `answer` is the short, direct answer shown first (Google and AI tools quote it).
 * No prices, guarantees or accreditations unless the client has confirmed them.
 */
import type { Service } from "@/lib/content/types";
import { ph } from "@/lib/content/ph";

export const services: Service[] = [
  {
    slug: "main-service",
    name: "[EDITABLE PLACEHOLDER] Main service",
    icon: "main",
    summary: "[EDITABLE PLACEHOLDER] One sentence on what this service is and who it's for.",
    image: ph("Service photo"),
    answer: "[EDITABLE PLACEHOLDER] Two or three plain sentences: what it is, when people need it, and how the business helps in {location}.",
    sections: [{ heading: "[EDITABLE PLACEHOLDER] What's involved", body: ["[EDITABLE PLACEHOLDER] Describe the steps of a typical job."] }],
    formOptions: [],
    showInForm: true,
    hidden: false,
    order: 1,
    faqs: [],
    seo: { title: "[EDITABLE PLACEHOLDER] Main service in {location} | {businessName}" },
  },
];
