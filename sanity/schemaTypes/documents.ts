import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt } from "./objects";
import { siteConfig } from "../../config";
import { meta } from "../../packs/active/pack";

const slugField = (source = "title") =>
  defineField({ name: "slug", title: "Web address (slug)", type: "slug", options: { source, maxLength: 80 }, validation: (r) => r.required() });
const hidden = defineField({ name: "hidden", title: "Hide from website", type: "boolean", initialValue: false });
const order = defineField({ name: "order", title: "Display order (1 = first)", type: "number" });
const seo = defineField({ name: "seo", type: "seo" });
const sections = defineField({ name: "sections", type: "array", of: [defineArrayMember({ type: "section" })] });
const faqs = defineField({ name: "faqs", title: "FAQs (shown on the page + Google FAQ markup)", type: "array", of: [defineArrayMember({ type: "faqItem" })] });

/** Service icons offered by the active trade pack */
const ICONS = [...meta.iconKeys];

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "icon", type: "string", options: { list: ICONS } }),
    defineField({ name: "summary", title: "Card summary (1 sentence)", type: "text", rows: 2 }),
    imageWithAlt("image", "Main photo"),
    defineField({ name: "answer", title: "Direct answer (2–3 sentences, shown first)", type: "text", rows: 4, description: "What is it, who is it for, does it need planning? Google and AI tools quote this." }),
    sections,
    defineField({ name: "formOptions", title: "Sub-options in the quote form (e.g. Dormer, Mansard)", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "showInForm", title: "Show in quote form", type: "boolean", initialValue: true }),
    hidden, order, faqs, seo,
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", media: "image", hidden: "hidden" }, prepare: ({ title, media, hidden }) => ({ title, media, subtitle: hidden ? "Hidden" : "" }) },
});

export const tiktokItem = defineType({
  name: "tiktokItem",
  title: "TikTok video",
  type: "document",
  description: "Upload the video file or a thumbnail image, then paste the link to the TikTok post.",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "projectType", title: "Project type", type: "string" }),
    defineField({
      name: "url", title: "TikTok post link", type: "url",
      description: "Open the video on TikTok → Share → Copy link, and paste it here.",
      validation: (r) => r.required().uri({ scheme: ["https"] }).custom((v) => (!v || /tiktok\.com\//i.test(v) ? true : "Must be a tiktok.com link")),
    }),
    imageWithAlt("thumbnail", "Thumbnail image"),
    defineField({ name: "video", title: "Video file (optional, plays silently as a preview)", type: "file", options: { accept: "video/mp4,video/webm" } }),
    hidden, order,
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "projectType", media: "thumbnail" } },
});

export const project = defineType({
  name: "project",
  title: "Project / case study",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slugField(),
    defineField({ name: "serviceSlug", title: "Service (slug, e.g. the service web address)", type: "string" }),
    defineField({ name: "area", title: "Area (e.g. Northside, ZZ2)", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "brief", title: "The brief", type: "text", rows: 4 }),
    defineField({ name: "build", title: "The build", type: "text", rows: 4 }),
    defineField({ name: "finished", title: "The finished space", type: "text", rows: 4 }),
    defineField({ name: "facts", title: "Key facts", type: "array", of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "value", type: "string" })] })] }),
    defineField({ name: "images", title: "Photos (first = cover)", type: "array", of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alt text" })] })] }),
    defineField({ name: "featured", title: "Feature on homepage", type: "boolean" }),
    seo,
  ],
  preview: { select: { title: "title", subtitle: "area", media: "images.0" } },
});

export const beforeAfter = defineType({
  name: "beforeAfter",
  title: "Before & after",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "caption", type: "string" }),
    imageWithAlt("before", "Before photo", { required: true, description: "Use the same angle and crop as the after photo" }),
    imageWithAlt("after", "After photo", { required: true }),
    hidden,
  ],
  preview: { select: { title: "title", media: "after" } },
});

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Customer first name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "area", type: "string" }),
    defineField({ name: "projectType", type: "string" }),
    defineField({ name: "rating", title: "Stars (1–5)", type: "number", validation: (r) => r.min(1).max(5) }),
    defineField({ name: "text", title: "Review text (word for word)", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "source", type: "string", options: { list: [...new Set([siteConfig.reviewPlatform.name, "Google", "TikTok", "Other"])] } }),
    defineField({ name: "date", type: "date" }),
    defineField({ name: "confirmed", title: "I confirm this is a real review and the customer agreed to it being shown", type: "boolean", initialValue: false, validation: (r) => r.required() }),
    hidden,
  ],
  preview: { select: { title: "name", subtitle: "text" } },
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "link", type: "link" }),
    order,
  ],
  preview: { select: { title: "question", subtitle: "category" } },
});

export const area = defineType({
  name: "area",
  title: "Area / borough",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    slugField("name"),
    defineField({ name: "borough", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 3, description: "Make every area page unique: mention neighbourhoods, house types and real local projects." }),
    sections,
    defineField({ name: "postcodes", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "nearby", title: "Nearby areas", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "area" }] })] }),
    order,
    seo,
  ],
});

export const guide = defineType({
  name: "guide",
  title: "Planning & regulations guide",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    slugField(),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "answer", title: "Short answer (shown first)", type: "text", rows: 4 }),
    defineField({ name: "lastReviewed", title: "Last reviewed", type: "date" }),
    defineField({ name: "ownerReviewed", title: "I have reviewed this guide and it's ready to publish", type: "boolean", initialValue: false }),
    sections, faqs, seo,
  ],
});

export const costGuide = defineType({
  name: "costGuide",
  title: "Cost guide",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    slugField(),
    defineField({ name: "service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "ranges", title: "Price ranges", type: "array", of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "from", title: "From (e.g. £45,000)", type: "string" }), defineField({ name: "note", type: "string" })] })] }),
    defineField({ name: "factors", title: "What affects the price", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "ownerApproved", title: "I approve these figures for publishing", type: "boolean", initialValue: false }),
    seo,
  ],
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    imageWithAlt("photo", "Photo"),
    order,
  ],
});

export const stat = defineType({
  name: "stat",
  title: "Stat",
  type: "document",
  fields: [defineField({ name: "value", type: "string" }), defineField({ name: "label", type: "string" }), order],
  preview: { select: { title: "value", subtitle: "label" } },
});

export const page = defineType({
  name: "page",
  title: "Page text",
  type: "document",
  description: "Text for pages such as About, How we work, Privacy and Terms.",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", readOnly: true, description: "Fixed: matches the page address" }),
    defineField({ name: "intro", type: "text", rows: 3 }),
    sections,
    defineField({ name: "ownerReview", title: "Still needs owner review", type: "boolean" }),
    seo,
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const documents = [service, tiktokItem, project, beforeAfter, review, faq, area, guide, costGuide, teamMember, stat, page];
