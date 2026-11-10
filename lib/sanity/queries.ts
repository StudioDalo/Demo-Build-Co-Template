/** GROQ projections that turn Sanity documents into the shapes in lib/content/types.ts */

const img = `{ "url": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;
const seo = `seo{ ..., "ogImage": ogImage${img} }`;
const slug = `"slug": slug.current`;

export const q = {
  siteSettings: `*[_type == "siteSettings"][0]{ ..., "logo": logo${img}, accreditations[]{ ..., "logo": logo${img} }, ${seo} }`,
  homePage: `*[_type == "homePage"][0]{ ..., hero{ ..., videos[]{ title, placeholder, "url": coalesce(file.asset->url, url), "poster": poster${img} } }, ${seo} }`,
  quoteForm: `*[_type == "quoteFormSettings"][0]`,
  privacyPolicy: `*[_type == "privacyPolicy"][0]{ ..., ${seo} }`,
  services: `*[_type == "service" && hidden != true] | order(order asc){ ..., ${slug}, "image": image${img}, ${seo} }`,
  tiktok: `*[_type == "tiktokItem" && hidden != true] | order(order asc){ "id": _id, title, projectType, url, hidden, order, "thumbnail": thumbnail${img}, "videoUrl": video.asset->url }`,
  projects: `*[_type == "project"] | order(_createdAt desc){ ..., ${slug}, "images": images[]${img}, ${seo} }`,
  beforeAfters: `*[_type == "beforeAfter" && hidden != true] | order(_createdAt desc){ "id": _id, title, caption, hidden, "before": before${img}, "after": after${img} }`,
  reviews: `*[_type == "review" && hidden != true] | order(date desc){ ..., "id": _id }`,
  faqs: `*[_type == "faq"] | order(order asc){ ..., "id": _id }`,
  areas: `*[_type == "area"] | order(coalesce(order, 999) asc, name asc){ ..., ${slug}, "nearby": nearby[]->slug.current, ${seo} }`,
  guides: `*[_type == "guide"] | order(title asc){ ..., ${slug}, ${seo} }`,
  costGuides: `*[_type == "costGuide"] | order(title asc){ ..., ${slug}, "serviceSlug": service->slug.current, ${seo} }`,
  team: `*[_type == "teamMember"] | order(order asc){ ..., "photo": photo${img} }`,
  stats: `*[_type == "stat"] | order(order asc)`,
  pages: `*[_type == "page"]{ ..., ${slug}, ${seo} }`,
};
