/**
 * Content model shared by the local seed content and the Sanity queries.
 * Every user-facing string on the site comes from one of these shapes so the
 * owner can edit it in Sanity Studio.
 */

export type ImageRef = {
  url?: string;
  alt: string;
  width?: number;
  height?: number;
  /** true = no real photo yet, render a branded placeholder labelled as such */
  placeholder?: boolean;
  placeholderLabel?: string;
};

export type VideoRef = {
  url?: string;
  poster?: ImageRef;
  title?: string;
  /** Still a placeholder clip: hidden on the live domain */
  placeholder?: boolean;
};

export type LinkRef = { label: string; href: string };

export type Seo = {
  title?: string;
  description?: string;
  ogImage?: ImageRef;
  noindex?: boolean;
};

/** A simple text section: heading + paragraphs (supports **bold**, [links](/x) and "- " bullet lines). */
export type Section = { heading: string; body: string[] };

export type Faq = { id: string; question: string; answer: string; category?: string; link?: LinkRef };

export type Phone = { label: string; number: string };

export type SiteSettings = {
  businessName: string;
  legalName: string;
  tagline: string;
  description: string;
  logo?: ImageRef;
  /** Brand colours (hex). accent = buttons/highlights, dark = header/footer background */
  colors: { accent: string; dark: string };
  phones: Phone[];
  whatsappNumber: string;
  whatsappMessage: string;
  /** Public contact email. Leave blank to hide it everywhere. */
  email: string;
  /** Companies House number, e.g. 12345678. Hidden in the footer until set. */
  companyNumber?: string;
  /** e.g. "Registered in England & Wales" (shown with the company number) */
  registeredIn?: string;
  /** Registered office address (needed on the website for a limited company) */
  registeredAddress?: string;
  /** ICO data protection registration number, if the business is registered */
  icoNumber?: string;
  /** Email for privacy / data requests (falls back to the contact email) */
  privacyEmail?: string;
  address: {
    streetAddress?: string;
    locality: string;
    region: string;
    postalCode?: string;
    country: string;
  };
  geo?: { lat: number; lng: number };
  openingHours: { days: string; hours: string; schema: string }[];
  social: {
    tiktok?: string;
    checkatrade?: string;
    instagram?: string;
    facebook?: string;
    googleBusiness?: string;
  };
  checkatrade: { rating?: number; reviewCount?: number; url?: string };
  yearsTrading?: number;
  insured: boolean;
  insuranceNote: string;
  accreditations: { name: string; logo?: ImageRef; url?: string; placeholder?: boolean }[];
  callbackHours: number;
  /** Link sent to customers after handover (review-platform or Google review page) */
  reviewLinkUrl?: string;
  announcement: { enabled: boolean; text: string; link?: LinkRef };
  nav: LinkRef[];
  headerCta: LinkRef;
  mobileBar: { callLabel: string; whatsappLabel: string; quoteLabel: string };
  trustStrip: {
    insuredLabel: string;
    yearsLabel: string;
    reviewsLabel: string;
    /** Show/hide each claim. Only switch on what's true. */
    showRating?: boolean;
    showReviewCount?: boolean;
    showYears?: boolean;
    showInsured?: boolean;
    showAccreditations?: boolean;
  };
  promise: { heading: string; intro: string; items: { title: string; text: string }[]; placeholder?: boolean };
  quoteBand: { heading: string; text: string; cta: LinkRef };
  checklistPrompt: { heading: string; text: string; cta: string; enabled: boolean };
  footer: { blurb: string; legalLine: string; links: LinkRef[] };
  /**
   * Short UI text that used to be hard-coded. Tokens in {braces} are filled in by the page:
   * {businessName} {location} {service} {area} {hours} {phone} {platform} {factors} {url}
   */
  uiText: UiText;
  cookieBanner: {
    heading: string;
    text: string;
    accept: string;
    reject: string;
    manage: string;
    save: string;
    /** Footer link that reopens the banner */
    settingsLabel: string;
    policyLinkLabel: string;
    necessaryText: string;
    /** Named third parties, e.g. "Google Analytics (Google)" */
    analyticsProviders: string;
    analyticsText: string;
    advertisingProviders: string;
    advertisingText: string;
  };
  seo: Seo;
};

export type UiText = {
  heroEyebrow: string;
  servicePageTitle: string;
  serviceQuickFormHeading: string;
  serviceAsideHeading: string;
  serviceAnswerLabel: string;
  areaPageTitle: string;
  areaMetaTitle: string;
  areaQuickFormHeading: string;
  areaServiceType: string;
  ctaAsideHeading: string;
  ctaAsideText: string;
  ctaAsideButton: string;
  projectAsideHeading: string;
  guideAsideHeading: string;
  guideAsideText: string;
  guidesMoreHeading: string;
  faqAsideHeading: string;
  faqAsideText: string;
  costGuideAnswer: string;
  contactFormHeading: string;
  thankYouCallButton: string;
  thankYouGuidesButton: string;
  thankYouSocialButton: string;
  footerGuidesLink: string;
  footerCostGuidesLink: string;
  reviewsCta: string;
  reviewPlatformLink: string;
  reviewRequestMessage: string;
};

export type HomePage = {
  hero: {
    mode: "single" | "triple";
    videos: VideoRef[];
    headline: string;
    subheadline: string;
    primaryCta: LinkRef;
    secondaryCta: LinkRef;
    showQuickForm: boolean;
    quickFormHeading: string;
  };
  services: { heading: string; intro: string };
  tiktok: { heading: string; intro: string; viewLabel: string; profileCta: LinkRef };
  caseStudies: { heading: string; intro: string };
  beforeAfter: { heading: string; intro: string };
  reviews: { heading: string; intro: string };
  questions: { heading: string; intro: string; items: { question: string; answer: string; link: LinkRef }[] };
  howItWorks: { heading: string; intro: string; steps: { title: string; text: string }[] };
  seo: Seo;
};

/** Icon key from the active trade pack (packs/<pack>/icons.ts) */
export type ServiceIcon = string;

export type Service = {
  slug: string;
  name: string;
  icon: ServiceIcon;
  summary: string;
  image: ImageRef;
  /** Direct 2-3 sentence answer used at the top of the page (AEO). */
  answer: string;
  sections: Section[];
  /** Sub-options shown in the quote form, e.g. Dormer / Hip-to-gable */
  formOptions: string[];
  showInForm: boolean;
  hidden: boolean;
  order: number;
  faqs: Faq[];
  seo: Seo;
};

export type TikTokItem = {
  id: string;
  title: string;
  projectType: string;
  url: string;
  thumbnail?: ImageRef;
  videoUrl?: string;
  hidden: boolean;
  order: number;
};

export type Project = {
  slug: string;
  title: string;
  serviceSlug: string;
  area: string;
  summary: string;
  brief: string;
  build: string;
  finished: string;
  facts: { label: string; value: string }[];
  images: ImageRef[];
  featured: boolean;
  placeholder?: boolean;
  seo: Seo;
};

export type BeforeAfter = {
  id: string;
  title: string;
  caption: string;
  before: ImageRef;
  after: ImageRef;
  hidden: boolean;
};

export type Review = {
  id: string;
  name: string;
  area: string;
  projectType: string;
  rating: number;
  text: string;
  /** Review site name, e.g. Checkatrade, Google, TikTok, Other */
  source: string;
  date?: string;
  /** Owner has confirmed this is a real review and consented to publish. Only confirmed reviews go into Review schema. */
  confirmed: boolean;
  placeholder?: boolean;
  hidden: boolean;
};

export type Area = {
  slug: string;
  name: string;
  borough: string;
  intro: string;
  sections: Section[];
  postcodes: string[];
  nearby: string[];
  /** Display order (1 = first). Lists are sorted by this, then by name. */
  order?: number;
  seo: Seo;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  /** Plain-English direct answer shown first (AEO). */
  answer: string;
  lastReviewed: string;
  ownerReviewed: boolean;
  sections: Section[];
  faqs: Faq[];
  seo: Seo;
};

export type CostGuide = {
  slug: string;
  title: string;
  serviceSlug: string;
  summary: string;
  ranges: { label: string; from: string; note: string }[];
  factors: string[];
  ownerApproved: boolean;
  seo: Seo;
};

export type TeamMember = { name: string; role: string; bio: string; photo: ImageRef; placeholder?: boolean };
export type Stat = { label: string; value: string; placeholder?: boolean };

export type Page = {
  slug: string;
  title: string;
  intro: string;
  sections: Section[];
  ownerReview?: boolean;
  seo: Seo;
};

export type Option = { value: string; label: string; points?: number };

/** A list of answer options for one question, keyed by the answer field name (e.g. "timing"). */
export type OptionGroup = { key: string; options: Option[] };

export type QuoteFormSettings = {
  steps: { key: string; title: string; help: string }[];
  /** Answer options per question. Which groups exist is decided by the active trade pack. */
  optionGroups: OptionGroup[];
  consentText: string;
  thankYou: { heading: string; text: string };
  quickForm: { submit: string; success: string; addDetail: string; /** Shown under the quick form, followed by a privacy policy link */ consent: string };
  scoring: { hot: number; warm: number };
};

/** Options for one answer field ([] if the group is missing). */
export const optionsFor = (form: Pick<QuoteFormSettings, "optionGroups">, key: string): Option[] =>
  form.optionGroups.find((g) => g.key === key)?.options ?? [];

/** Privacy policy: every part editable in Sanity (Privacy policy singleton). */
export type PrivacyProvider = { name: string; role: string; data: string; location: string; safeguard: string };
export type PrivacyPolicy = {
  title: string;
  intro: string;
  /** YYYY-MM-DD */
  lastUpdated: string;
  ownerReview: boolean;
  /** Supports {legalName}, {companyNumber}, {registeredAddress}, {icoNumber}, {privacyEmail} */
  whoWeAre: string;
  collect: { intro: string; items: string[] };
  lawfulBasis: string[];
  partialEnquiries: string;
  checklist: string;
  providersIntro: string;
  providers: PrivacyProvider[];
  transfers: string[];
  cookies: { intro: string; rows: { category: string; provider: string; purpose: string; duration: string }[]; howToChange: string };
  retention: { intro: string; rows: { what: string; period: string }[]; footnote: string };
  /** Used by the automatic clean-up in /admin and the daily job */
  retentionMonths: { enquiries: number; partial: number };
  rights: string[];
  complaints: string;
  changes: string;
  seo: Seo;
};
