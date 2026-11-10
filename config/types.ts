/**
 * Everything that varies per client and is NOT owner-editable lives in `clients/<slug>/config.ts`
 * with this shape. Owner-editable values (contact details, social links, trust strip, colours,
 * UI text…) live in Sanity Site settings, with `clients/<slug>/content/settings.ts` as the fallback.
 */
export type ClientConfig = {
  /** Folder name under /clients */
  slug: string;
  /** Trade pack under /packs (Stage 3) */
  pack: string;
  brand: {
    /** Used in the browser tab, Studio title, admin pages and emails */
    appName: string;
    /** Short name for tight spaces (admin header) */
    shortName: string;
  };
  /** Design tokens. Sanity Site settings → Brand colours can override accent/dark. */
  theme: {
    accent: string;
    dark: string;
    paper: string;
    sand: string;
    stone: string;
    muted: string;
    /** Corner radius scale */
    radius: { lg: string; xl: string; "2xl": string };
  };
  location: {
    /** Main town/city named in page titles, e.g. "{service} in Exampleton" */
    primary: string;
    /** ISO 3166-2 region for the geo meta tag, e.g. GB-LND */
    geoRegion: string;
    country: string;
    timeZone: string;
    locale: string;
    currency: string;
  };
  /** Main review site (trust strip, review badge, click tracking) */
  reviewPlatform: { name: string; host: string };
  /** Overrides for the trade pack's structured-data defaults (packs/<pack>/meta.ts) */
  seo?: {
    /** schema.org LocalBusiness subtype, e.g. HomeAndConstructionBusiness, RoofingContractor */
    businessType?: string;
    knowsAbout?: string[];
  };
  /** Free downloadable lead magnet (checklist PDF). null = feature off. */
  leadMagnet: { pdfPath: string; emailSubject: string; title: string } | null;
  /** Prefix for this site's cookies and browser storage keys (keep it stable once live) */
  storagePrefix: string;
  /** Fallback "From" for emails in development only (production must set EMAIL_FROM) */
  devEmailFrom: string;
};
