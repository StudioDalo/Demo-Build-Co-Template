import type { HomePage, SiteSettings } from "@/lib/content/types";
import { ph } from "./helpers";
import { config } from "../config";

/**
 * DEMO CLIENT settings (fictional business). Every value here is a starting point that the owner
 * replaces in Sanity → Site settings. Trust claims are OFF until the owner confirms them.
 */
export const siteSettings: SiteSettings = {
  businessName: "Demo Build Co",
  legalName: "Demo Build Co Ltd",
  tagline: "Loft conversions, extensions and landscaping in Exampleton (demo website).",
  description:
    "Demo Build Co is a fictional builder used to demonstrate this website template: loft conversions, house extensions, landscaping and refurbishments in the made-up town of Exampleton.",
  colors: { accent: config.theme.accent, dark: config.theme.dark },
  phones: [
    { label: "Office", number: "07700 900123" },
    { label: "Site team", number: "01632 960123" },
  ],
  whatsappNumber: "07700 900123",
  whatsappMessage: "Hi Demo Build Co, I'd like a free quote for my project.",
  email: "hello@example.com",
  companyNumber: "",
  registeredIn: "Registered in England & Wales",
  registeredAddress: "",
  icoNumber: "",
  privacyEmail: "",
  address: { locality: "Exampleton", region: "Exampleshire", country: "GB" },
  openingHours: [],
  social: {
    tiktok: "",
    checkatrade: "",
    instagram: "",
    facebook: "",
    googleBusiness: "",
  },
  checkatrade: { rating: undefined, reviewCount: undefined, url: "" },
  yearsTrading: undefined,
  // Trust claims default OFF: switch on only what the business can prove (Site settings → Trust & reviews)
  insured: false,
  insuranceNote: "[EDITABLE PLACEHOLDER] Fully insured: add your public liability cover level here.",
  accreditations: [],
  callbackHours: 24,
  reviewLinkUrl: "",
  announcement: {
    enabled: true,
    text: "Demo website: Demo Build Co is a fictional business. Names, numbers, reviews and photos are placeholders.",
    link: { label: "Try the quote form", href: "/get-a-quote" },
  },
  nav: [
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Reviews", href: "/reviews" },
    { label: "Areas", href: "/areas" },
    { label: "Guides", href: "/guides" },
  ],
  headerCta: { label: "Get a Free Quote", href: "/get-a-quote" },
  mobileBar: { callLabel: "Call", whatsappLabel: "WhatsApp", quoteLabel: "Free Quote" },
  trustStrip: {
    insuredLabel: "Fully insured",
    yearsLabel: "years trading",
    reviewsLabel: "reviews on Checkatrade",
    showRating: false,
    showReviewCount: false,
    showYears: false,
    showInsured: false,
    showAccreditations: false,
  },
  promise: {
    heading: "Our promise to you",
    intro: "[EDITABLE PLACEHOLDER] Confirm each promise below before publishing. Only keep what you can put in writing.",
    placeholder: true,
    items: [
      { title: "Fixed price", text: "A fixed written quote for the agreed scope, so you know the number before we start." },
      { title: "Weekly progress updates", text: "Photos and a short update every week, whether you're living in or not." },
      { title: "One named project manager", text: "One person who knows your job, answers your calls and runs the site." },
      { title: "Tidy site", text: "Protected floors, swept every day, and neighbours kept in the loop." },
      { title: "Written guarantee", text: "[EDITABLE PLACEHOLDER] Add your guarantee term, e.g. 10-year structural guarantee." },
    ],
  },
  quoteBand: {
    heading: "Ready to see what your home could become?",
    text: "Tell us about your project in about 2 minutes. We'll call you back to book a free survey visit.",
    cta: { label: "Get My Free Quote", href: "/get-a-quote" },
  },
  checklistPrompt: {
    enabled: true,
    heading: "Not ready yet?",
    text: "Get our free Loft & Extension Planning Checklist. It covers what to sort out before you speak to any builder.",
    cta: "Send me the checklist",
  },
  footer: {
    blurb: "Loft conversions, extensions, landscaping and refurbishments across Exampleton. (Demo Build Co is a fictional business used to demonstrate this website.)",
    legalLine: "",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  uiText: {
    heroEyebrow: "Exampleton builders · {businessName}",
    servicePageTitle: "{service} in {location}",
    serviceQuickFormHeading: "Get a free {service} quote",
    serviceAsideHeading: "Thinking about {service}?",
    serviceAnswerLabel: "What are {service}?",
    areaPageTitle: "Loft conversions & extensions in {area}",
    areaMetaTitle: "Builders in {area}",
    areaQuickFormHeading: "Free quote in {area}",
    areaServiceType: "Home building and renovation",
    ctaAsideHeading: "Get a free, fixed written quote",
    ctaAsideText: "Free survey visit. We call back within {hours} hours.",
    ctaAsideButton: "Get My Free Quote",
    projectAsideHeading: "Want something similar?",
    guideAsideHeading: "Not sure which route applies?",
    guideAsideText: "We check your property's planning route at the free survey visit.",
    guidesMoreHeading: "More planning guides",
    faqAsideHeading: "Still got a question?",
    faqAsideText: "Call, WhatsApp, or ask us at your free survey visit.",
    costGuideAnswer: "The cost depends mainly on {factors}. We don't guess over the phone: after a free survey you get a fixed written quote for the agreed scope.",
    contactFormHeading: "Send us a message and we'll call you back",
    thankYouCallButton: "Urgent? Call {phone}",
    thankYouGuidesButton: "Read our planning guides",
    thankYouSocialButton: "Watch our builds on TikTok",
    footerGuidesLink: "Planning guides",
    footerCostGuidesLink: "Cost guides",
    reviewsCta: "Read all our reviews on {platform}",
    reviewPlatformLink: "Review us on {platform}",
    reviewRequestMessage: "Thanks for choosing {businessName}! If you have 1 minute, we'd really appreciate a review: {url}",
  },
  cookieBanner: {
    heading: "Cookies on this website",
    text: "We'd like to use cookies to see which pages and adverts help people find us. They're only set if you accept. Rejecting doesn't affect how the site works.",
    accept: "Accept all",
    reject: "Reject all",
    manage: "Manage preferences",
    save: "Save my choices",
    settingsLabel: "Cookie settings",
    policyLinkLabel: "Privacy & cookies policy",
    necessaryText: "Remember your cookie choice and keep the quote form working. No tracking.",
    analyticsProviders: "Google Analytics (Google)",
    analyticsText: "Counts visits and shows which pages are used, so we can improve the site.",
    advertisingProviders: "Google Ads (Google)",
    advertisingText: "Measures which adverts lead to enquiries, so we only pay for adverts that work.",
  },
  seo: {
    title: "Demo Build Co | Loft Conversions & Extensions in Exampleton",
    description:
      "Exampleton builders for loft conversions, rear, side-return and wraparound extensions, landscaping and refurbishments. Fixed written quotes. Free survey visit.",
    ogImage: { url: "/placeholders/hero-1-poster.webp", alt: "Demo Build Co", width: 1080, height: 1350 },
  },
};

export const homePage: HomePage = {
  hero: {
    mode: "triple",
    videos: [
      { url: "/placeholders/hero-1.mp4", poster: { url: "/placeholders/hero-1-poster.webp", alt: "Placeholder hero video 1", width: 1080, height: 1350 }, placeholder: true, title: "Loft conversion" },
      { url: "/placeholders/hero-2.mp4", poster: { url: "/placeholders/hero-2-poster.webp", alt: "Placeholder hero video 2", width: 1080, height: 1350 }, placeholder: true, title: "Rear extension" },
      { url: "/placeholders/hero-3.mp4", poster: { url: "/placeholders/hero-3-poster.webp", alt: "Placeholder hero video 3", width: 1080, height: 1350 }, placeholder: true, title: "Garden landscaping" },
    ],
    headline: "Loft Conversions, Extensions & Landscaping Across Exampleton, Built Right, Finished On Time.",
    subheadline: "A demo of a builder's website: real-project videos, a 2-minute quote form, and every enquiry delivered straight to the owner's dashboard.",
    primaryCta: { label: "Get My Free Quote", href: "/get-a-quote" },
    secondaryCta: { label: "Watch Our Latest Builds", href: "#watch-us-build" },
    showQuickForm: true,
    quickFormHeading: "Quick quote: we'll call you back",
  },
  services: {
    heading: "What we build",
    intro: "From the first drawing to the final snag, one team handles the whole job.",
  },
  tiktok: {
    heading: "Watch us build",
    intro: "[EDITABLE PLACEHOLDER] Link your own TikTok videos in Studio. Each tile opens the post on TikTok.",
    viewLabel: "View on TikTok",
    profileCta: { label: "Follow us on TikTok", href: "https://www.tiktok.com/" },
  },
  caseStudies: {
    heading: "Featured projects",
    intro: "The brief, the build and the finished space, start to finish.",
  },
  beforeAfter: {
    heading: "Before & after",
    intro: "Drag the handle to compare.",
  },
  reviews: {
    heading: "What our customers say",
    intro: "[EDITABLE PLACEHOLDER] Real reviews appear here once you add them in Studio, word for word and with the customer's permission.",
  },
  questions: {
    heading: "Questions homeowners ask before calling",
    intro: "Straight answers to the questions we hear most. Each one links to a fuller guide.",
    items: [
      {
        question: "Will my project need planning permission?",
        answer:
          "Many loft conversions and single-storey rear extensions can be built under permitted development, which means no full planning application. Flats, conservation areas, mansards and most wraparound extensions usually need permission. We check your property at the free survey and tell you which route applies.",
        link: { label: "Read the planning permission guide", href: "/guides/planning-permission" },
      },
      {
        question: "How long will it take?",
        answer:
          "[EDITABLE PLACEHOLDER] As a general guide, many loft conversions take around 6 to 10 weeks on site and single-storey extensions around 8 to 14 weeks, after drawings and approvals. Your written quote includes a week-by-week programme for your project.",
        link: { label: "See how we work", href: "/how-we-work" },
      },
      {
        question: "Can we stay in the house during the build?",
        answer:
          "Usually, yes. Most loft conversions are built from the outside with scaffolding and only break through to the stairs near the end. With extensions we plan around the kitchen so you know which weeks will be disruptive before we start.",
        link: { label: "Living at home during a build", href: "/faqs" },
      },
      {
        question: "Roughly what will it cost?",
        answer:
          "It depends on size, structure, finish and access, so we don't guess over the phone. After a free survey you get a fixed written quote for the agreed scope. Our cost guides explain what drives the price.",
        link: { label: "Read the cost guides", href: "/cost-guides" },
      },
    ],
  },
  howItWorks: {
    heading: "How it works",
    intro: "Five clear stages, with no surprises.",
    steps: [
      { title: "Free survey visit", text: "We visit, measure up, talk through what you want and check what planning route applies." },
      { title: "Fixed written quote", text: "You get an itemised, fixed-scope quote and a programme, in writing." },
      { title: "Planning and regs handled", text: "We arrange drawings, planning or permitted development, building control and party wall notices." },
      { title: "Build with weekly updates", text: "Your named project manager runs the site and sends photos and progress every week." },
      { title: "Handover and guarantee", text: "Final walk-round, snagging, building control sign-off and your written guarantee." },
    ],
  },
  seo: {},
};

export { ph };
