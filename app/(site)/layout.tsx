import type { Metadata } from "next";
import { getAreas, getReviews, getServices, getSiteSettings } from "@/lib/content";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar, Footer, MobileBar } from "@/components/layout/Chrome";
import { ExitPrompt } from "@/components/layout/ExitPrompt";
import { Tracking } from "@/components/tracking/Tracking";
import { JsonLd } from "@/components/ui/misc";
import { businessJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { absoluteUrl, isLiveSite } from "@/lib/site";
import { consentDefaultsScript, trackingConfig } from "@/lib/tracking/config";
import { siteConfig } from "@/config";

/** Re-check CMS content at most every 5 minutes (the Sanity webhook refreshes instantly when configured). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { default: s.seo.title || s.businessName, template: `%s | ${s.businessName}` },
    description: s.seo.description,
    openGraph: { siteName: s.businessName, locale: "en_GB", type: "website", images: s.seo.ogImage?.url ? [absoluteUrl(s.seo.ogImage.url)] : undefined },
    other: { "geo.region": siteConfig.location.geoRegion, "geo.placename": siteConfig.location.primary },
    // Until the real domain is set, keep every page out of search results
    robots: isLiveSite() ? undefined : { index: false, follow: false },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, areas, services, reviews] = await Promise.all([getSiteSettings(), getAreas(), getServices(), getReviews()]);
  const tracking = trackingConfig();
  const hex = (v: string, d: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
  return (
    <div style={{ "--accent": hex(s.colors.accent, siteConfig.theme.accent), "--dark": hex(s.colors.dark, siteConfig.theme.dark) } as React.CSSProperties}>
      {/* Google Consent Mode v2 defaults: must run before any tag. No network, no cookies. */}
      <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: consentDefaultsScript() }} />
      <a href="#main" className="sr-only z-[80] rounded-lg bg-accent px-4 py-3 font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <AnnouncementBar a={s.announcement} />
      {/* Only the fields the (browser) header needs, so nothing else is serialised into the page */}
      <Header s={{ logo: s.logo, nav: s.nav, headerCta: s.headerCta, phones: s.phones, businessName: s.businessName }} />
      <main id="main">{children}</main>
      <Footer s={s} areas={areas} services={services} cookieSettings={tracking.configured} />
      <MobileBar s={s} />
      <ExitPrompt {...s.checklistPrompt} />
      <Tracking banner={s.cookieBanner} config={tracking} />
      <JsonLd data={businessJsonLd(s, areas, reviews, services)} />
      <JsonLd data={websiteJsonLd(s)} />
    </div>
  );
}
