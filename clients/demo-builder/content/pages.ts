import type { Page } from "@/lib/content/types";

const p = (slug: string, title: string, intro: string, sections: Page["sections"] = [], extra: Partial<Page> = {}): Page => ({
  slug,
  title,
  intro,
  sections,
  seo: {},
  ...extra,
});

export const pages: Page[] = [
  p("services", "Our building services in Exampleton", "Loft conversions, extensions, landscaping, kitchens, bathrooms and full refurbishments, with one team from survey to handover.", [], {
    seo: { title: "Building Services in Exampleton | Lofts, Extensions, Landscaping", description: "Loft conversions, rear, side-return, wraparound and double-storey extensions, landscaping, kitchens, bathrooms and refurbishments across Exampleton." },
  }),
  p("projects", "Our projects", "Case studies from our own sites: the brief, the build and the finished space.", [], {
    seo: { title: "Projects & Case Studies | Demo Build Co", description: "Loft conversion, extension and landscaping case studies from Demo Build Co's own sites." },
  }),
  p("before-and-after", "Before & after", "Drag the handle on each photo to see the transformation.", [], {
    seo: { title: "Before & After Photos | Demo Build Co", description: "Before and after photos of loft conversions, extensions and gardens built by Demo Build Co." },
  }),
  p("how-we-work", "How we work", "From the free survey to the final handover, here's exactly what happens and when.", [
    { heading: "1. Free survey visit", body: ["We visit at a time that suits you, measure up, look at the structure and talk through what you want. We check whether permitted development applies or whether you'll need planning permission."] },
    { heading: "2. Fixed written quote", body: ["Within a few days you get an itemised, fixed-scope quote with a programme. The price only changes if the scope changes, and any change is agreed in writing first."] },
    { heading: "3. Planning and regulations handled", body: ["We arrange drawings, structural calculations, planning or a Lawful Development Certificate, building control and party wall notices. See our [planning guides](/guides)."] },
    { heading: "4. Build with weekly updates", body: ["Your named project manager runs the site, keeps it tidy and sends you photos and a short update every week."] },
    { heading: "5. Handover and guarantee", body: ["We walk round together, fix any snags, hand over the building control completion certificate and your written guarantee. [EDITABLE PLACEHOLDER: guarantee terms]"] },
  ], {
    seo: { title: "How We Work: From Free Survey to Handover | Demo Build Co", description: "Our five-step process for loft conversions and extensions in Exampleton: free survey, fixed quote, planning handled, weekly updates and a written guarantee." },
  }),
  p("about", "About Demo Build Co", "[EDITABLE PLACEHOLDER] Demo Build Co Ltd is a fictional Exampleton building company specialising in loft conversions, extensions and landscaping. Add your story here: how the company started, who runs it and what you stand for.", [
    { heading: "Why homeowners choose us", body: ["- Fixed written quotes for an agreed scope", "- One named project manager for your job", "- Weekly progress updates with photos", "- Planning, building control and party wall handled for you"] },
    { heading: "Who we are", body: ["[EDITABLE PLACEHOLDER] Introduce the team, years trading, accreditations and insurance."] },
  ], {
    seo: { title: "About Demo Build Co | Exampleton Loft & Extension Builders", description: "Who we are, how we work, and how Demo Build Co works with their loft conversions and extensions." },
  }),
  p("reviews", "Customer reviews", "Real reviews from Exampleton homeowners, shared with permission. You'll find all our reviews on Checkatrade.", [], {
    seo: { title: "Reviews | Demo Build Co", description: "Customer reviews of Demo Build Co loft conversions, extensions and landscaping." },
  }),
  p("faqs", "Frequently asked questions", "Plain-English answers to what Exampleton homeowners ask us most.", [], {
    seo: { title: "FAQs: Loft Conversions & Extensions in Exampleton | Demo Build Co", description: "Answers to common questions about loft conversions, extensions, planning, costs and living at home during a build." },
  }),
  p("areas", "Areas we cover", "We build across Exampleton. These are the neighbourhoods we work in most often. Not listed? Ask us anyway.", [], {
    seo: { title: "Areas We Cover | Loft Conversions & Extensions Across Exampleton", description: "Demo Build Co builds loft conversions, extensions and gardens across Exampleton and the surrounding neighbourhoods, from Northside to Parkview." },
  }),
  p("guides", "Planning & regulations guides", "Plain-English guides to permitted development, planning permission, building regulations and party walls. General information only: always check with your own council for your property.", [], {
    seo: { title: "Planning & Building Regulations Guides for Exampleton Homeowners", description: "Plain-English guides to permitted development, planning permission, building regulations and party wall notices for loft conversions and extensions." },
  }),
  p("cost-guides", "Cost guides", "What drives the price of a loft conversion, extension or garden in Exampleton, and how we turn that into a fixed written quote.", [], {
    seo: { title: "Loft Conversion & Extension Cost Guides (Exampleton)", description: "What affects the cost of loft conversions, extensions and landscaping in Exampleton, with guide price ranges." },
  }),
  p("get-a-quote", "Get your free quote", "Answer a few quick questions, about 2 minutes. We'll call you back to book a free survey visit.", [], {
    seo: { title: "Get a Free Quote | Demo Build Co", description: "Request a free survey visit and fixed written quote for your loft conversion, extension or landscaping project in Exampleton." },
  }),
  p("contact", "Contact us", "Call, WhatsApp or send us a message. We'll get back to you quickly.", [], {
    seo: { title: "Contact Demo Build Co", description: "Call, WhatsApp or email Demo Build Co about your loft conversion, extension or landscaping project." },
  }),
  p("planning-checklist", "Free Loft & Extension Planning Checklist", "Everything to sort out before you speak to any builder: planning route, drawings, party wall, budget and questions to ask. Enter your email and we'll send it straight over.", [
    { heading: "What's inside", body: ["- Permitted development or planning permission? A quick checker", "- The drawings and documents you'll need", "- Party wall notices: who, when and how", "- Budget planning and contingency", "- 12 questions to ask any builder before you sign"] },
  ], {
    seo: { title: "Free Loft & Extension Planning Checklist (PDF)", description: "Download our free planning checklist for loft conversions and extensions in Exampleton." },
  }),
  p("leave-a-review", "Leave us a review", "Thank you for choosing Demo Build Co. A short review helps other Exampleton homeowners find a builder they can trust.", [], {
    seo: { title: "Leave a Review | Demo Build Co", noindex: true },
  }),
  p("terms", "Website terms of use", "[OWNER TO REVIEW BEFORE PUBLISHING] These terms apply to your use of this website.", [
    { heading: "Information on this site", body: ["Guides on this website are general information, not professional or legal advice. Planning and building regulations depend on your property, so always check with your own council."] },
    { heading: "Quotes and prices", body: ["Any guide prices are indicative only. A binding price is only given in a written quote after a survey visit."] },
    { heading: "Content", body: ["Photos and videos on this site are of Demo Build Co's own projects unless clearly labelled otherwise. Don't reuse them without permission."] },
    { heading: "Contact", body: ["Questions about these terms? Contact us using the details on our contact page."] },
  ], { ownerReview: true, seo: { title: "Terms of Use | Demo Build Co" } }),
];
