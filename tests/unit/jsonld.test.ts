import { describe, expect, it } from "vitest";
import { businessJsonLd, faqJsonLd, howToJsonLd, publishableReviews } from "@/lib/seo/jsonld";
import { siteSettings } from "@/clients/active/content";
import { areas } from "@/clients/active/content";
import { reviews, faqs } from "@/clients/active/content";
import { services } from "@/clients/active/content";
import type { Review } from "@/lib/content/types";
import { meta } from "@/packs/active/meta";
import { toE164 } from "@/lib/phone";

const real: Review = { id: "r", name: "Priya", area: "Streatham", projectType: "Loft", rating: 5, text: "Brilliant job.", source: "Checkatrade", confirmed: true, hidden: false };

describe("JSON-LD", () => {
  it("never includes placeholder or unconfirmed reviews", () => {
    expect(publishableReviews(reviews)).toHaveLength(0);
    expect(publishableReviews([{ ...real, confirmed: false }])).toHaveLength(0);
    const ld = businessJsonLd(siteSettings, areas, reviews, services);
    expect(ld.review).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
  });
  it("adds rating + reviews only from confirmed real reviews", () => {
    const ld = businessJsonLd(siteSettings, areas, [real], services) as Record<string, any>;
    expect(ld.aggregateRating).toMatchObject({ ratingValue: 5, ratingCount: 1 });
    expect(ld.review[0].author.name).toBe("Priya");
  });
  it("builds a LocalBusiness with consistent NAP and areas", () => {
    const ld = businessJsonLd(siteSettings, areas, [], services) as Record<string, any>;
    expect(ld["@type"]).toBe(meta.businessType);
    expect(ld.telephone).toBe(toE164(siteSettings.phones[0].number));
    expect(ld.email).toBe(siteSettings.email || undefined);
    expect(ld.areaServed.length).toBe(areas.length + 1);
    for (const url of Object.values(siteSettings.social).filter(Boolean)) expect(ld.sameAs).toContain(url);
    // A placeholder email (e.g. hello@…example) is never published
    const withPlaceholder = businessJsonLd({ ...siteSettings, email: "" }, areas, [], services) as Record<string, any>;
    expect(withPlaceholder.email).toBeUndefined();
    expect(JSON.stringify(ld)).not.toMatch(/undefined|null/);
  });
  it("FAQ schema skips placeholder answers and strips markup", () => {
    const ld = faqJsonLd([...faqs, { id: "x", question: "Q?", answer: "**Bold** and [link](/x)" }]) as Record<string, any>;
    const names = ld.mainEntity.map((q: any) => q.name);
    expect(names).not.toContain("Are you insured?");
    expect(ld.mainEntity.at(-1).acceptedAnswer.text).toBe("Bold and link");
  });
  it("HowTo numbers steps", () => {
    const ld = howToJsonLd("How it works", [{ title: "1. Survey", text: "a" }, { title: "Quote", text: "b" }]) as Record<string, any>;
    expect(ld.step[0]).toMatchObject({ position: 1, name: "Survey" });
  });
});

describe("service areas", () => {
  it("are in the client's order, each with its own text, and nearby links that exist", () => {
    expect(areas.map((a) => a.order)).toEqual(areas.map((_, i) => i + 1));
    for (const a of areas) expect(a.intro).toContain(a.name);
    expect(new Set(areas.map((a) => a.intro)).size).toBe(areas.length);
    const slugs = new Set(areas.map((a) => a.slug));
    for (const a of areas) for (const n of a.nearby) expect(slugs.has(n), `${a.slug} → ${n}`).toBe(true);
  });
});
