import type { MetadataRoute } from "next";
import { getAreas, getCostGuides, getGuides, getProjects, getServices } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, areas, guides, costGuides] = await Promise.all([getServices(), getProjects(), getAreas(), getGuides(), getCostGuides()]);
  const now = new Date();
  const page = (path: string, priority: number, lastModified: Date = now): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), lastModified, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/get-a-quote", 0.9),
    page("/services", 0.9),
    ...services.map((s) => page(`/services/${s.slug}`, 0.9)),
    page("/projects", 0.8),
    ...projects.filter((p) => !p.placeholder && !p.seo.noindex).map((p) => page(`/projects/${p.slug}`, 0.7)),
    page("/before-and-after", 0.6),
    page("/how-we-work", 0.7),
    page("/guides", 0.7),
    ...guides.map((g) => page(`/guides/${g.slug}`, 0.7, new Date(g.lastReviewed))),
    page("/cost-guides", 0.7),
    ...costGuides.map((g) => page(`/cost-guides/${g.slug}`, 0.7)),
    page("/reviews", 0.7),
    page("/about", 0.6),
    page("/faqs", 0.7),
    page("/areas", 0.8),
    ...areas.map((a) => page(`/areas/${a.slug}`, 0.8)),
    page("/contact", 0.6),
    page("/planning-checklist", 0.5),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
