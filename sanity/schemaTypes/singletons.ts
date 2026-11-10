import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt } from "./objects";
import { siteConfig } from "../../config";
import { meta } from "../../packs/active/pack";

const platform = siteConfig.reviewPlatform.name;

const str = (name: string, title?: string, description?: string) => defineField({ name, title, type: "string", description });
const txt = (name: string, title?: string, description?: string) => defineField({ name, title, type: "text", rows: 3, description });
const lnk = (name: string, title?: string) => defineField({ name, title, type: "link" });
/** Answer-option groups: the active trade pack's questions plus the shared contact-step questions. */
const OPTION_GROUPS = [
  ...meta.optionGroups,
  { key: "contactMethod", title: "Best way to contact you" },
  { key: "contactTime", title: "Best time" },
  { key: "heardAbout", title: "How did you hear about us?" },
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "business", title: "Business details", default: true },
    { name: "trust", title: "Trust & reviews" },
    { name: "header", title: "Header & announcement" },
    { name: "sections", title: "Shared sections" },
    { name: "footer", title: "Footer" },
    { name: "uiText", title: "UI text" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ ...str("businessName", "Business name"), group: "business" }),
    defineField({ ...str("legalName", "Legal company name"), group: "business" }),
    defineField({ ...str("tagline"), group: "business" }),
    defineField({ ...txt("description", "Who we are (1–2 sentences)", "Used for Google, AI search and social shares. Say who, where and what."), group: "business" }),
    defineField({ ...imageWithAlt("logo", "Logo (light version for dark header)"), group: "business" }),
    defineField({
      name: "colors", title: "Brand colours", type: "object", group: "business",
      fields: [
        defineField({ name: "accent", title: "Button colour (hex, e.g. #F5A300)", type: "string", validation: (r) => r.regex(/^#[0-9a-fA-F]{6}$/) }),
        defineField({ name: "dark", title: "Header/footer colour (hex)", type: "string", validation: (r) => r.regex(/^#[0-9a-fA-F]{6}$/) }),
      ],
    }),
    defineField({
      name: "phones", title: "Phone numbers", type: "array", group: "business",
      of: [defineArrayMember({ type: "object", fields: [str("label"), str("number")], preview: { select: { title: "number", subtitle: "label" } } })],
    }),
    defineField({ ...str("whatsappNumber", "WhatsApp number"), group: "business" }),
    defineField({ ...str("whatsappMessage", "WhatsApp pre-filled message"), group: "business" }),
    defineField({ ...str("email", "Email", "Shown in the footer and contact page. Leave blank to hide it."), group: "business" }),
    defineField({ ...str("companyNumber", "Company number", "Companies House number. The footer hides it until filled in."), group: "business" }),
    defineField({ ...str("registeredIn", "Registered in", "e.g. Registered in England & Wales. Shown next to the company number."), group: "business" }),
    defineField({ ...txt("registeredAddress", "Registered office address", "A limited company must show this on its website. Hidden until filled in."), group: "business" }),
    defineField({
      ...str("icoNumber", "ICO registration number", "Most businesses that handle customer details must pay the ICO data protection fee (ico.org.uk/fee). Check whether it applies to you, then add the number here. Shown in the privacy policy."),
      group: "business",
    }),
    defineField({ ...str("privacyEmail", "Email for privacy / data requests", "Shown in the privacy policy. Uses the contact email if blank."), group: "business" }),
    defineField({
      name: "address", type: "object", group: "business",
      fields: [str("streetAddress", "Street (leave blank if you don't want it shown)"), str("locality", "Town/City"), str("region"), str("postalCode", "Postcode"), str("country", "Country code (GB)")],
    }),
    defineField({ name: "geo", title: "Map location", type: "object", group: "business", fields: [defineField({ name: "lat", type: "number" }), defineField({ name: "lng", type: "number" })] }),
    defineField({
      name: "openingHours", title: "Opening hours", type: "array", group: "business",
      of: [defineArrayMember({ type: "object", fields: [str("days", "Days, e.g. Monday to Friday"), str("hours", "Hours, e.g. 8am to 6pm"), str("schema", "Google format, e.g. Mo-Fr 08:00-18:00")] })],
    }),
    defineField({
      name: "social", title: "Social & profile links", type: "object", group: "business",
      fields: ["tiktok", "checkatrade", "instagram", "facebook", "googleBusiness"].map((n) => defineField({ name: n, type: "url" })),
    }),
    defineField({ ...defineField({ name: "callbackHours", title: "We'll call back within (hours)", type: "number" }), group: "business" }),
    defineField({
      name: "checkatrade", title: `${platform} (your main review site)`, type: "object", group: "trust",
      fields: [defineField({ name: "rating", title: "Rating (out of 10)", type: "number" }), defineField({ name: "reviewCount", title: "Number of reviews", type: "number" }), defineField({ name: "url", title: "Profile URL", type: "url" })],
    }),
    defineField({ name: "yearsTrading", title: "Years trading", type: "number", group: "trust" }),
    defineField({
      name: "reviewLinkUrl", title: "Review link for customers", type: "url", group: "trust",
      description: `Your ${platform} 'leave a review' page or Google review link. The leads dashboard copies this for you to send after handover.`,
    }),
    defineField({ name: "insured", title: "We hold public liability insurance (confirmed)", type: "boolean", group: "trust", initialValue: false, description: "Only tick if true. 'Fully insured' also needs Trust strip → Show 'Fully insured'." }),
    defineField({ ...txt("insuranceNote", "Insurance note"), group: "trust" }),
    defineField({
      name: "accreditations", type: "array", group: "trust",
      of: [defineArrayMember({ type: "object", fields: [str("name"), imageWithAlt("logo", "Logo"), defineField({ name: "url", type: "url" })] })],
    }),
    defineField({
      name: "announcement", title: "Announcement bar", type: "object", group: "header",
      fields: [defineField({ name: "enabled", type: "boolean" }), str("text"), lnk("link")],
    }),
    defineField({ name: "nav", title: "Main menu", type: "array", group: "header", of: [defineArrayMember({ type: "link" })] }),
    defineField({ ...lnk("headerCta", "Header button"), group: "header" }),
    defineField({ name: "mobileBar", title: "Mobile bottom bar labels", type: "object", group: "header", fields: [str("callLabel"), str("whatsappLabel"), str("quoteLabel")] }),
    defineField({
      name: "trustStrip", title: "Trust strip", type: "object", group: "trust",
      description: "Every claim is OFF until you switch it on. Only switch on claims you can prove. Items still showing a placeholder are hidden automatically in production.",
      fields: [
        str("insuredLabel"), str("yearsLabel"), str("reviewsLabel"),
        defineField({ name: "showRating", title: `Show ${platform} rating`, type: "boolean", initialValue: false }),
        defineField({ name: "showReviewCount", title: "Show number of reviews", type: "boolean", initialValue: false }),
        defineField({ name: "showYears", title: "Show years trading", type: "boolean", initialValue: false }),
        defineField({ name: "showInsured", title: "Show 'Fully insured'", type: "boolean", initialValue: false }),
        defineField({ name: "showAccreditations", title: "Show accreditations", type: "boolean", initialValue: false }),
      ],
    }),
    defineField({
      name: "promise", title: "Our promise", type: "object", group: "sections",
      fields: [str("heading"), txt("intro"), defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "titledText" })] }), defineField({ name: "placeholder", title: "Still a placeholder (shows a warning)", type: "boolean" })],
    }),
    defineField({ name: "quoteBand", title: "Quote call-to-action band", type: "object", group: "sections", fields: [str("heading"), txt("text"), lnk("cta")] }),
    defineField({ name: "checklistPrompt", title: "'Not ready?' checklist pop-up", type: "object", group: "sections", fields: [defineField({ name: "enabled", type: "boolean" }), str("heading"), txt("text"), str("cta")] }),
    defineField({
      name: "cookieBanner", title: "Cookie banner", type: "object", group: "sections",
      description: "Only shown once Google Analytics / Ads IDs are set up. Keep 'Accept all' and 'Reject all' equally clear (UK law).",
      fields: [
        str("heading"), txt("text"), str("accept", "Accept button"), str("reject", "Reject button"), str("manage", "Manage preferences button"),
        str("save", "Save choices button"), str("settingsLabel", "Footer link text"), str("policyLinkLabel", "Privacy policy link text"),
        txt("necessaryText", "Necessary cookies: what they do"),
        str("analyticsProviders", "Analytics: named companies", "e.g. Google Analytics (Google)"), txt("analyticsText", "Analytics: why"),
        str("advertisingProviders", "Advertising: named companies", "e.g. Google Ads (Google)"), txt("advertisingText", "Advertising: why"),
      ],
    }),
    defineField({
      name: "uiText", title: "Buttons, headings and short text", type: "object", group: "uiText",
      description: "Words in {braces} are filled in automatically: {businessName} {location} {service} {area} {hours} {phone} {platform} {factors} {url}. Leave a field empty to use the default.",
      options: { collapsible: true, collapsed: false },
      fields: [
        str("heroEyebrow", "Homepage: small line above the headline"),
        str("servicePageTitle", "Service page: main heading"), str("serviceQuickFormHeading", "Service page: quick form heading"),
        str("serviceAsideHeading", "Service page: sidebar heading"), str("serviceAnswerLabel", "Service page: short answer label"),
        str("areaPageTitle", "Area page: main heading"), str("areaMetaTitle", "Area page: Google title"), str("areaQuickFormHeading", "Area page: quick form heading"),
        str("areaServiceType", "Area page: service type (Google structured data)"),
        str("ctaAsideHeading", "Sidebar: heading"), txt("ctaAsideText", "Sidebar: text"), str("ctaAsideButton", "Sidebar: button"),
        str("projectAsideHeading", "Project page: sidebar heading"),
        str("guideAsideHeading", "Guide page: sidebar heading"), txt("guideAsideText", "Guide page: sidebar text"), str("guidesMoreHeading", "Guide page: 'more guides' heading"),
        str("faqAsideHeading", "FAQ page: sidebar heading"), txt("faqAsideText", "FAQ page: sidebar text"),
        txt("costGuideAnswer", "Cost guide: short answer"),
        str("contactFormHeading", "Contact page: form heading"),
        str("thankYouCallButton", "Thank-you page: call button"), str("thankYouGuidesButton", "Thank-you page: guides button"), str("thankYouSocialButton", "Thank-you page: social button"),
        str("footerGuidesLink", "Footer: guides link"), str("footerCostGuidesLink", "Footer: cost guides link"),
        str("reviewsCta", "Reviews: button to your review platform"), str("reviewPlatformLink", "Leave-a-review page: review platform button"),
        txt("reviewRequestMessage", "Review request message (sent from the leads dashboard)"),
      ],
    }),
    defineField({ name: "footer", type: "object", group: "footer", fields: [txt("blurb"), str("legalLine", "Extra legal line (optional)"), defineField({ name: "links", type: "array", of: [defineArrayMember({ type: "link" })] })] }),
    defineField({ name: "seo", title: "Default SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "hero", type: "object",
      fields: [
        defineField({ name: "mode", title: "Video layout", type: "string", options: { list: [{ title: "1 video", value: "single" }, { title: "3 videos (swipe)", value: "triple" }], layout: "radio" } }),
        defineField({ name: "videos", type: "array", of: [defineArrayMember({ type: "heroVideo" })], validation: (r) => r.max(3) }),
        str("headline", "Headline (H1)"), txt("subheadline"), lnk("primaryCta", "Primary button"), lnk("secondaryCta", "Secondary button"),
        defineField({ name: "showQuickForm", title: "Show quick quote form", type: "boolean" }), str("quickFormHeading"),
      ],
    }),
    defineField({ name: "services", title: "Services section", type: "object", fields: [str("heading"), txt("intro")] }),
    defineField({ name: "tiktok", title: "TikTok gallery section", type: "object", fields: [str("heading"), txt("intro"), str("viewLabel"), lnk("profileCta")] }),
    defineField({ name: "caseStudies", title: "Case studies section", type: "object", fields: [str("heading"), txt("intro")] }),
    defineField({ name: "beforeAfter", title: "Before & after section", type: "object", fields: [str("heading"), txt("intro")] }),
    defineField({ name: "reviews", title: "Reviews section", type: "object", fields: [str("heading"), txt("intro")] }),
    defineField({
      name: "questions", title: "Questions homeowners ask", type: "object",
      fields: [str("heading"), txt("intro"), defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "object", fields: [str("question"), txt("answer"), lnk("link")] })] })],
    }),
    defineField({ name: "howItWorks", title: "How it works", type: "object", fields: [str("heading"), txt("intro"), defineField({ name: "steps", type: "array", of: [defineArrayMember({ type: "titledText" })] })] }),
    defineField({ name: "seo", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Homepage" }) },
});

export const quoteFormSettings = defineType({
  name: "quoteFormSettings",
  title: "Quote form",
  type: "document",
  fields: [
    defineField({ name: "steps", title: "Step titles & help text", type: "array", of: [defineArrayMember({ type: "object", fields: [str("key", "Step key (don't change)"), str("title"), txt("help")] })] }),
    defineField({
      name: "optionGroups", title: "Answer options", type: "array",
      description: "The answers people can pick for each question, and their lead-score points. Questions marked ★ count towards the hot/warm/cold score. Any question you leave out here uses the built-in answers.",
      of: [defineArrayMember({
        type: "object", name: "optionGroup",
        fields: [
          defineField({
            name: "key", title: "Question", type: "string", validation: (r) => r.required(),
            options: { list: OPTION_GROUPS.map((g) => ({ value: g.key, title: `${g.title}${"scored" in g && g.scored ? " ★" : ""}` })) },
          }),
          defineField({ name: "options", title: "Answers", type: "array", of: [defineArrayMember({ type: "option" })], validation: (r) => r.min(1) }),
        ],
        preview: {
          select: { key: "key", options: "options" },
          prepare: ({ key, options }: { key?: string; options?: unknown[] }) => ({ title: OPTION_GROUPS.find((g) => g.key === key)?.title ?? key, subtitle: `${options?.length ?? 0} answers` }),
        },
      })],
      validation: (r) => r.custom((groups?: { key?: string }[]) => {
        const keys = (groups ?? []).map((g) => g.key);
        return new Set(keys).size === keys.length ? true : "Each question can only appear once";
      }),
    }),
    txt("consentText", "GDPR consent text"),
    defineField({ name: "thankYou", type: "object", fields: [str("heading"), txt("text", "Text ({hours} = callback hours)")] }),
    defineField({ name: "quickForm", type: "object", fields: [str("submit"), str("success"), str("addDetail"), txt("consent", "Text under the quick form (a privacy policy link is added after it)")] }),
    defineField({ name: "scoring", title: "Lead score thresholds", type: "object", fields: [defineField({ name: "hot", title: "Hot at or above", type: "number" }), defineField({ name: "warm", title: "Warm at or above", type: "number" })] }),
  ],
  preview: { prepare: () => ({ title: "Quote form" }) },
});

const tokenHelp = "You can use {legalName}, {companyNumber}, {registeredAddress}, {icoNumber} and {privacyEmail}: they're filled in from Site settings.";

export const privacyPolicy = defineType({
  name: "privacyPolicy",
  title: "Privacy & cookies policy",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "providers", title: "Providers & transfers" },
    { name: "cookies", title: "Cookies" },
    { name: "retention", title: "Retention" },
    { name: "rights", title: "Rights & contact" },
  ],
  fields: [
    defineField({ ...str("title"), group: "main" }),
    defineField({ ...txt("intro"), group: "main" }),
    defineField({ name: "lastUpdated", title: "Last updated", type: "date", group: "main", description: "Change this whenever you edit the policy.", validation: (r) => r.required() }),
    defineField({ name: "ownerReview", title: "Still needs owner review (shows a warning box)", type: "boolean", group: "main" }),
    defineField({
      ...txt("whoWeAre", "Who we are", tokenHelp + " Company number, registered office and ICO number are set in Site settings → Business details. Check whether you need to pay the ICO data protection fee: ico.org.uk/fee."),
      group: "main",
    }),
    defineField({ name: "collect", title: "What we collect", type: "object", group: "main", fields: [txt("intro"), defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "text", rows: 3 })] })] }),
    defineField({ name: "lawfulBasis", title: "Why we use it (lawful basis): one line each, start with '- '", type: "array", group: "main", of: [defineArrayMember({ type: "text", rows: 2 })] }),
    defineField({ ...txt("partialEnquiries", "Partial enquiries (name + phone entered, form not finished)", tokenHelp), group: "main" }),
    defineField({ ...txt("checklist", "Planning checklist", "Only keep this if the checklist download is on the site."), group: "main" }),
    defineField({ ...txt("providersIntro", "Who we share it with: intro"), group: "providers" }),
    defineField({
      name: "providers", title: "Providers (name each one)", type: "array", group: "providers",
      of: [defineArrayMember({
        type: "object",
        fields: [str("name"), str("role", "What they do for us"), txt("data", "What data they receive"), txt("location", "Where data is processed"), txt("safeguard", "Transfer safeguard")],
        preview: { select: { title: "name", subtitle: "role" } },
      })],
    }),
    defineField({ name: "transfers", title: "International transfers: paragraphs", type: "array", group: "providers", description: tokenHelp, of: [defineArrayMember({ type: "text", rows: 3 })] }),
    defineField({
      name: "cookies", type: "object", group: "cookies",
      fields: [
        txt("intro"),
        defineField({
          name: "rows", title: "Cookie table", type: "array",
          of: [defineArrayMember({ type: "object", fields: [str("category"), str("provider"), txt("purpose"), str("duration")], preview: { select: { title: "category", subtitle: "provider" } } })],
        }),
        txt("howToChange", "How to change your choice"),
      ],
    }),
    defineField({
      name: "retention", title: "How long we keep data", type: "object", group: "retention",
      fields: [
        txt("intro"),
        defineField({ name: "rows", title: "Retention table [OWNER TO CONFIRM each period]", type: "array", of: [defineArrayMember({ type: "object", fields: [str("what"), str("period")], preview: { select: { title: "what", subtitle: "period" } } })] }),
        txt("footnote"),
      ],
    }),
    defineField({
      name: "retentionMonths", title: "Automatic clean-up (must match the table above)", type: "object", group: "retention",
      description: "The leads dashboard deletes enquiries older than these periods. Won jobs are never deleted automatically.",
      fields: [
        defineField({ name: "enquiries", title: "Enquiries that didn't go ahead: delete after (months)", type: "number", validation: (r) => r.min(1).max(120) }),
        defineField({ name: "partial", title: "Unfinished enquiries: delete after (months)", type: "number", validation: (r) => r.min(1).max(120) }),
      ],
    }),
    defineField({ name: "rights", title: "Your rights: paragraphs (lines starting '- ' become bullets)", type: "array", group: "rights", description: tokenHelp, of: [defineArrayMember({ type: "text", rows: 2 })] }),
    defineField({ ...txt("complaints"), group: "rights" }),
    defineField({ ...txt("changes", "Changes to this policy"), group: "rights" }),
    defineField({ name: "seo", type: "seo", group: "main" }),
  ],
  preview: { prepare: () => ({ title: "Privacy & cookies policy" }) },
});

export const singletons = [siteSettings, homePage, quoteFormSettings, privacyPolicy];
export const singletonTypes = new Set<string>(singletons.map((s) => s.name));
