import type { Area, Section, Seo } from "./types";

/** One area as a client lists it. The trade pack turns it into page text. */
export type AreaSeed = {
  name: string;
  /** Official borough/district name (defaults to the client's `defaultBorough(name)`) */
  borough?: string;
  /** How the planning authority is usually referred to (defaults to "<name> Council") */
  council?: string;
  /** Typical housing, e.g. "Victorian and Edwardian terraces and 1930s semis" */
  housing: string;
  neighbourhoods: string;
  postcodes: string[];
  nearby: string[];
};

export type AreaContext = { businessName: string; location: string };

/** A trade pack's area-page template: intro, sections and SEO for one area. */
export type AreaTemplate = (a: AreaSeed & { council: string }, ctx: AreaContext) => { intro: string; sections: Section[]; seo: Seo };

export function slugify(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function buildAreas(seeds: AreaSeed[], template: AreaTemplate, ctx: AreaContext & { defaultBorough: (name: string) => string }): Area[] {
  return seeds.map((a, i) => {
    const council = a.council ?? `${a.name} Council`;
    const page = template({ ...a, council }, ctx);
    return {
      slug: slugify(a.name),
      name: a.name,
      borough: a.borough ?? ctx.defaultBorough(a.name),
      intro: page.intro,
      sections: page.sections,
      postcodes: a.postcodes,
      order: i + 1,
      nearby: a.nearby.map(slugify),
      seo: page.seo,
    };
  });
}
