import type { Metadata } from "next";
import type { Seo } from "@/lib/content/types";
import { getSiteSettings } from "@/lib/content";
import { absoluteUrl, isLiveSite } from "@/lib/site";
import { hidePlaceholders } from "@/lib/site";

/** Per-page metadata: CMS SEO fields first, then sensible fallbacks. Canonical always set. */
export async function pageMetadata(opts: { path: string; title: string; description?: string; seo?: Seo }): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = opts.seo?.title || `${opts.title} | ${s.businessName}`;
  const description = opts.seo?.description || opts.description || s.seo.description;
  const candidate = opts.seo?.ogImage?.url || s.seo.ogImage?.url;
  // Placeholder media is never used as a share image in production
  const image = candidate && !(hidePlaceholders() && /\/placeholders\//.test(candidate)) ? candidate : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(opts.path) },
    robots: !isLiveSite() ? { index: false, follow: false } : opts.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: s.businessName,
      url: absoluteUrl(opts.path),
      title,
      description,
      images: image ? [{ url: absoluteUrl(image), alt: opts.seo?.ogImage?.alt || s.businessName }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [absoluteUrl(image)] : undefined },
  };
}
