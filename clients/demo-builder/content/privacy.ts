import type { PrivacyPolicy } from "@/lib/content/types";

/**
 * Starter privacy policy. Provider locations and transfer safeguards were checked against each
 * provider's own DPA / documentation on 9 November 2026 (see TRANSFER.md → "Privacy sources").
 * The owner must review it before the site goes live.
 */
export const privacyPolicy: PrivacyPolicy = {
  title: "Privacy and cookies policy",
  intro: "[OWNER TO REVIEW BEFORE PUBLISHING] How Demo Build Co Ltd collects, uses and protects your personal data when you use this website or ask us for a quote.",
  lastUpdated: "2026-11-09",
  ownerReview: true,
  whoWeAre:
    "{legalName} ('we', 'us') is the data controller for personal data collected through this website. Company number: {companyNumber}. Registered office: {registeredAddress}. ICO registration number: {icoNumber}. For anything about your data, email {privacyEmail}.",
  collect: {
    intro: "Depending on how you use the site, we collect:",
    items: [
      "**Quote and callback requests:** your name, phone number, email, postcode, the work you're interested in, your answers about the property, budget, timing, planning and access, and anything you write in the description box.",
      "**Photos and plans** you upload through the quote form.",
      "**Partial form answers:** once you've typed your name and phone number into the quote form, what you've entered so far is saved even if you don't press send (see below).",
      "**Emails we send you:** a copy of the confirmation email we send after your quote request, and the planning checklist email if you ask for it.",
      "**How you found us:** the page you first landed on, the website that sent you, and advertising details from the link you clicked: the Google Ads click identifier (gclid, gbraid or wbraid) and campaign tags (utm_source, utm_medium, utm_campaign, utm_term, utm_content). These are saved with your enquiry so we can tell which adverts lead to real jobs.",
      "**Technical data:** your IP address and browser details are processed by our hosting provider to deliver the site and keep it secure.",
      "**Cookies and analytics:** only if you accept them in the cookie banner (see 'Cookies' below).",
    ],
  },
  lawfulBasis: [
    "- **Responding to your enquiry and preparing a quote:** steps at your request before entering a contract, and our legitimate interest in replying to people who contact us.",
    "- **Following up a partial enquiry:** our legitimate interest in helping people who started asking for a quote. You can tell us to stop at any time.",
    "- **Sending the planning checklist:** your consent.",
    "- **Carrying out a job and keeping records:** performing our contract with you, and our legal obligations (tax and accounting).",
    "- **Analytics and advertising cookies:** your consent, given in the cookie banner. You can withdraw it at any time.",
  ],
  partialEnquiries:
    "If you type your name and phone number into the quote form but don't finish it, we save what you've entered so far and may contact you once about your enquiry. If you don't want us to, just tell us when we call, or email {privacyEmail}, and we'll delete it. Unfinished enquiries are deleted automatically after the period shown in the table below.",
  checklist:
    "If you ask for our free [Loft & Extension Planning Checklist](/planning-checklist), we use your email address to send it to you. We won't send you marketing emails unless you separately agree.",
  providersIntro:
    "We use the companies below to run the website and handle enquiries. They only process your data on our instructions (except where noted), under written data processing terms. We don't sell your data.",
  providers: [
    {
      name: "Vercel Inc.",
      role: "Website hosting",
      data: "Technical data (IP address, browser, pages requested) and the details you send through our forms as they pass to our database.",
      location: "USA company. Our website code runs in Exampleton, UK; pages are delivered from Vercel's network closest to you.",
      safeguard: "EU Standard Contractual Clauses with the UK International Data Transfer Addendum (Vercel's Data Processing Addendum), and Vercel's certification to the UK Extension to the EU-US Data Privacy Framework.",
    },
    {
      name: "Supabase",
      role: "Secure database and file storage for enquiries",
      data: "Everything you send in our forms, including uploaded photos and plans, and how you found us.",
      location: "Stored in Frankfurt, Germany (EU). Supabase Pte. Ltd is based in Singapore.",
      safeguard: "Germany is covered by UK adequacy regulations. Any access from outside the UK/EU is covered by EU Standard Contractual Clauses with the UK Addendum (Supabase's Data Processing Addendum).",
    },
    {
      name: "Resend (Plus Five Five, Inc.)",
      role: "Sending our emails (your confirmation email and our notification of your enquiry)",
      data: "Your name, email address and the enquiry details included in those emails.",
      location: "USA. Resend stores email data and logs in the United States.",
      safeguard: "EU Standard Contractual Clauses with the UK Addendum (Resend's Data Processing Addendum), and Resend's certification to the UK Extension to the EU-US Data Privacy Framework.",
    },
    {
      name: "Sanity (Sanity AS / Sanity US Inc.)",
      role: "Managing the text and photos on this website",
      data: "Website content only. Your enquiry details are never stored in Sanity.",
      location: "Hosted on Google Cloud in the EU (Belgium). Sanity AS is based in Norway.",
      safeguard: "Norway and Belgium are covered by UK adequacy regulations. Any other transfer uses EU Standard Contractual Clauses with the UK Addendum (Sanity's Data Processing Addendum).",
    },
    {
      name: "Google Analytics (Google LLC / Google Ireland Ltd)",
      role: "Measuring how visitors use the site (only if you accept analytics cookies)",
      data: "Pages viewed, clicks and device information. Google Analytics does not log or store IP addresses of UK users.",
      location: "Google's data centres worldwide, including the USA.",
      safeguard: "Google's certification to the UK Extension to the EU-US Data Privacy Framework, and Standard Contractual Clauses (Google Ads Data Processing Terms).",
    },
    {
      name: "Google Ads (Google LLC / Google Ireland Ltd)",
      role: "Measuring which adverts lead to enquiries (only if you accept advertising cookies)",
      data: "Ad click identifiers, and, if you accepted advertising cookies, a scrambled (hashed) copy of your email and phone number so Google can match your enquiry to an ad click. Google acts as a separate controller for Google Ads data.",
      location: "Google's data centres worldwide, including the USA.",
      safeguard: "Google's certification to the UK Extension to the EU-US Data Privacy Framework, and Standard Contractual Clauses (Google Ads Controller-Controller Data Protection Terms).",
    },
  ],
  transfers: [
    "Some of our providers are based outside the UK. Where your data goes to a country without a UK adequacy decision, we rely on the safeguards listed for each provider above: the UK International Data Transfer Addendum to the EU Standard Contractual Clauses, and/or the provider's certification to the UK Extension to the EU-US Data Privacy Framework (the 'UK-US data bridge').",
    "The EU (including Germany, Ireland and Belgium) and the EEA (including Norway) are covered by UK adequacy regulations, so no extra safeguard is needed for data stored there.",
    "To ask for a copy of the safeguards for any provider, email {privacyEmail}. [OWNER TO REVIEW]",
  ],
  cookies: {
    intro: "We only use cookies that aren't strictly necessary if you agree in the cookie banner. You can change your choice at any time using the 'Cookie settings' link at the bottom of every page.",
    rows: [
      { category: "Necessary (always on)", provider: "Demo Build Co", purpose: "Remembers your cookie choice (site_consent) and keeps your quote form answers in your browser while you fill it in.", duration: "Cookie choice: 6 months, then we ask again" },
      { category: "Analytics (optional)", provider: "Google Analytics (Google)", purpose: "Counts visits and shows which pages are used so we can improve the site (_ga cookies).", duration: "Up to 2 years in your browser; reports kept for the period below" },
      { category: "Advertising (optional)", provider: "Google Ads (Google)", purpose: "Measures which adverts lead to enquiries (_gcl cookies), and remembers how you found us (site_attr).", duration: "Google Ads: 90 days; site_attr: 90 days" },
    ],
    howToChange:
      "Use 'Cookie settings' in the footer to accept or reject each category. If you reject or withdraw consent, we remove the Google cookies set by this site. You can also delete cookies in your browser settings.",
  },
  retention: {
    intro: "We keep personal data only as long as we need it: [OWNER TO CONFIRM these periods]",
    rows: [
      { what: "Enquiries that don't go ahead (including uploaded photos and plans)", period: "24 months from the enquiry, then deleted" },
      { what: "Partial enquiries (name and phone entered, form not finished)", period: "6 months, then deleted" },
      { what: "Customers whose job goes ahead", period: "6 years after the job is completed (tax and accounting records), or the length of your written guarantee if that's longer" },
      { what: "Your cookie choice", period: "6 months, then we ask again" },
      { what: "Google Analytics data", period: "14 months (the Google Analytics data retention setting)" },
    ],
    footnote: "Deletion of old enquiries is applied automatically and checked monthly in our leads dashboard.",
  },
  retentionMonths: { enquiries: 24, partial: 6 },
  rights: [
    "Under UK data protection law you can ask us to:",
    "- give you a copy of the personal data we hold about you",
    "- correct anything that's wrong",
    "- delete your data",
    "- restrict or object to how we use it, including stopping any follow-up of a partial enquiry",
    "- transfer data you gave us to another company",
    "- withdraw consent at any time (for example, for cookies or the checklist email)",
    "Email {privacyEmail}. We'll reply within one month. It's free.",
  ],
  complaints:
    "If you're unhappy with how we've handled your data, please tell us first. You also have the right to complain to the Information Commissioner's Office: [ico.org.uk/make-a-complaint](https://ico.org.uk/make-a-complaint/) or 0303 123 1113.",
  changes: "We'll update this policy if the way we use your data changes. The date at the top shows when it was last updated.",
  seo: { title: "Privacy & Cookies Policy | Demo Build Co" },
};
