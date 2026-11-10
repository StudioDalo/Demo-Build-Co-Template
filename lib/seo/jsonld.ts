import type { Area, Faq, Guide, Review, Service, SiteSettings } from "@/lib/content/types";
import { absoluteUrl, siteUrl } from "@/lib/site";
import { toE164 } from "@/lib/phone";
import { siteConfig } from "@/config";
import { meta } from "@/packs/active/pack";

type Json = Record<string, unknown>;
export const ORG_ID = () => `${siteUrl()}/#business`;

const isPlaceholder = (s?: string) => !s || /\[(EDITABLE|OWNER|Customer|Area)/i.test(s);

/** Real, owner-confirmed reviews only. Placeholders never reach structured data. */
export const publishableReviews = (reviews: Review[]) =>
  reviews.filter((r) => r.confirmed && !r.placeholder && !isPlaceholder(r.text) && !isPlaceholder(r.name));

export function businessJsonLd(s: SiteSettings, areas: Area[], reviews: Review[], services: Service[]): Json {
  const real = publishableReviews(reviews);
  const sameAs = Object.values(s.social).filter((u): u is string => Boolean(u));
  const data: Json = {
    "@context": "https://schema.org",
    "@type": siteConfig.seo?.businessType ?? meta.businessType,
    "@id": ORG_ID(),
    name: s.businessName,
    legalName: s.legalName,
    description: s.description,
    url: siteUrl(),
    logo: s.logo?.url ? absoluteUrl(s.logo.url) : undefined,
    image: s.seo.ogImage?.url ? absoluteUrl(s.seo.ogImage.url) : undefined,
    telephone: s.phones[0] ? toE164(s.phones[0].number) : undefined,
    email: s.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address.streetAddress || undefined,
      addressLocality: s.address.locality,
      addressRegion: s.address.region,
      postalCode: s.address.postalCode || undefined,
      addressCountry: s.address.country,
    },
    geo: s.geo ? { "@type": "GeoCoordinates", latitude: s.geo.lat, longitude: s.geo.lng } : undefined,
    areaServed: [{ "@type": "City", name: siteConfig.location.primary }, ...areas.map((a) => ({ "@type": "AdministrativeArea", name: a.borough || a.name }))],
    openingHours: s.openingHours.length ? s.openingHours.map((h) => h.schema) : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: s.phones.map((p) => ({ "@type": "ContactPoint", telephone: toE164(p.number), contactType: "customer service", areaServed: siteConfig.location.country, availableLanguage: "en" })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Building services",
      itemListElement: services.map((sv) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: sv.name, url: absoluteUrl(`/services/${sv.slug}`) } })),
    },
    knowsAbout: siteConfig.seo?.knowsAbout ?? [...meta.knowsAbout],
  };
  // Aggregate rating only from a real, owner-entered review-platform score, or real confirmed reviews.
  if (s.checkatrade.rating && s.checkatrade.reviewCount) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: s.checkatrade.rating, bestRating: 10, worstRating: 0, ratingCount: s.checkatrade.reviewCount };
  } else if (real.length) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: +(real.reduce((t, r) => t + r.rating, 0) / real.length).toFixed(1), bestRating: 5, ratingCount: real.length };
  }
  if (real.length) data.review = real.slice(0, 10).map(reviewJsonLd);
  return prune(data);
}

export const reviewJsonLd = (r: Review): Json => ({
  "@type": "Review",
  author: { "@type": "Person", name: r.name },
  reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
  reviewBody: r.text,
  datePublished: r.date,
});

export function websiteJsonLd(s: SiteSettings): Json {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl()}/#website`, url: siteUrl(), name: s.businessName, publisher: { "@id": ORG_ID() }, inLanguage: siteConfig.location.locale };
}

export function serviceJsonLd(sv: Service, areas: Area[]): Json {
  return prune({
    "@context": "https://schema.org",
    "@type": "Service",
    name: sv.name,
    serviceType: sv.name,
    description: sv.answer || sv.summary,
    url: absoluteUrl(`/services/${sv.slug}`),
    provider: { "@id": ORG_ID() },
    areaServed: areas.map((a) => ({ "@type": "AdministrativeArea", name: a.borough || a.name })),
  });
}

export function faqJsonLd(faqs: Pick<Faq, "question" | "answer">[]): Json | null {
  const real = faqs.filter((f) => !isPlaceholder(f.answer) && !isPlaceholder(f.question));
  if (!real.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: real.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: stripMarkup(f.answer) } })),
  };
}

export function howToJsonLd(name: string, steps: { title: string; text: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((st, i) => ({ "@type": "HowToStep", position: i + 1, name: st.title.replace(/^\d+\.\s*/, ""), text: stripMarkup(st.text) })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function articleJsonLd(g: Guide): Json {
  return prune({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.summary,
    dateModified: g.lastReviewed,
    author: { "@id": ORG_ID() },
    publisher: { "@id": ORG_ID() },
    mainEntityOfPage: absoluteUrl(`/guides/${g.slug}`),
    inLanguage: siteConfig.location.locale,
  });
}

export const stripMarkup = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^- /gm, "");

function prune<T>(v: T): T {
  if (Array.isArray(v)) return v.map(prune) as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) if (val !== undefined && val !== null && val !== "") out[k] = prune(val);
    return out as T;
  }
  return v;
}
