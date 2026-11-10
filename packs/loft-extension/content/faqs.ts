import type { Faq } from "@/lib/content/types";

/** [OWNER TO REVIEW] Starter FAQs for loft and extension builders. {location} is filled in from the client config. */
export const faqs: Faq[] = [
  { id: "faq-survey", category: "Quotes", question: "Is the survey visit really free?", answer: "Yes. We visit, measure up and talk through your project with no charge and no obligation. You then get a fixed written quote.", link: { label: "Book a free survey", href: "/get-a-quote" } },
  { id: "faq-fixed", category: "Quotes", question: "What does a fixed-scope quote mean?", answer: "Your quote lists exactly what's included. The price doesn't change unless you change the scope, or something genuinely unforeseeable is found, and we agree any change in writing before doing it." },
  { id: "faq-stay", category: "During the build", question: "Can we live at home during a loft conversion or extension?", answer: "Usually, yes. Lofts are mostly built from the outside, and we plan extension work around your kitchen so you know which weeks will be disruptive." },
  { id: "faq-updates", category: "During the build", question: "How will I know how the build is going?", answer: "Your named project manager sends photos and a short progress update every week, and you can call them directly." },
  { id: "faq-planning", category: "Planning", question: "Do you handle planning and building regulations?", answer: "Yes. We arrange drawings, structural calculations, planning or permitted development, building control and party wall notices.", link: { label: "Planning guides", href: "/guides" } },
  { id: "faq-insured", category: "Trust", question: "Are you insured?", answer: "[EDITABLE PLACEHOLDER] Yes. Add your insurer and cover level here. We're happy to show certificates at the survey." },
  { id: "faq-areas", category: "Areas", question: "Which areas do you cover?", answer: "We work across {location}. See our areas page for the boroughs we cover most often.", link: { label: "Areas we cover", href: "/areas" } },
  { id: "faq-cost", category: "Quotes", question: "Roughly how much will my project cost?", answer: "It depends on size, structure, finish and access, so we quote after a free survey rather than guessing. Our cost guides explain what drives the price.", link: { label: "Cost guides", href: "/cost-guides" } },
];
