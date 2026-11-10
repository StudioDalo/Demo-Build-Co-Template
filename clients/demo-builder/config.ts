import type { ClientConfig } from "../../config/types";

/**
 * DEMO CLIENT: a fictional builder used to show the template to prospects.
 * Everything here is made up: "Exampleton" is not a real town, the phone numbers are in Ofcom's
 * reserved drama ranges (never connected), and the ZZ postcodes don't exist.
 */
export const config: ClientConfig = {
  slug: "demo-builder",
  pack: "loft-extension",
  brand: { appName: "Demo Build Co", shortName: "Demo Build" },
  theme: {
    accent: "#4FD1C5",
    dark: "#1F2933",
    paper: "#ffffff",
    sand: "#f3f5f7",
    stone: "#e1e6eb",
    muted: "#52606d",
    radius: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem" },
  },
  location: { primary: "Exampleton", geoRegion: "GB", country: "GB", timeZone: "Europe/London", locale: "en-GB", currency: "GBP" },
  reviewPlatform: { name: "Checkatrade", host: "checkatrade.com" },
  leadMagnet: {
    pdfPath: "/downloads/planning-checklist.pdf",
    emailSubject: "Your Loft & Extension Planning Checklist",
    title: "Loft & Extension Planning Checklist",
  },
  storagePrefix: "site",
  devEmailFrom: "Demo Build Co <onboarding@resend.dev>",
};
