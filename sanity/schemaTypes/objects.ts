import { defineArrayMember, defineField, defineType } from "sanity";

export const imageWithAlt = (name: string, title: string, opts: { required?: boolean; description?: string } = {}) =>
  defineField({
    name,
    title,
    type: "image",
    description: opts.description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text (describe the photo for Google and screen readers)",
        type: "string",
        validation: (r) => r.required().warning("Alt text helps SEO and accessibility"),
      }),
    ],
    validation: opts.required ? (r) => r.required() : undefined,
  });

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Link (e.g. /get-a-quote or https://…)", type: "string", validation: (r) => r.required() }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "SEO title (≈50–60 characters)", type: "string", validation: (r) => r.max(70).warning("Keep under 60 characters") }),
    defineField({ name: "description", title: "Meta description (≈140–160 characters)", type: "text", rows: 3, validation: (r) => r.max(170).warning("Keep under 160 characters") }),
    imageWithAlt("ogImage", "Social share image (1200×630)"),
    defineField({ name: "noindex", title: "Hide from Google", type: "boolean", initialValue: false }),
  ],
});

export const section = defineType({
  name: "section",
  title: "Text section",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string", description: "Tip: phrase headings as the question people search for", validation: (r) => r.required() }),
    defineField({
      name: "body",
      title: "Paragraphs",
      description: "One box per paragraph. Start a line with “- ” for a bullet. Use **bold** and [link text](/page).",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
    }),
  ],
  preview: { select: { title: "heading" } },
});

export const faqItem = defineType({
  name: "faqItem",
  title: "Question & answer",
  type: "object",
  fields: [
    defineField({ name: "id", title: "ID", type: "string", hidden: true }),
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "text", rows: 4, description: "Answer in 2–3 plain sentences. AI search tools quote these directly.", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "question" } },
});

export const option = defineType({
  name: "option",
  title: "Option",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "value", title: "Internal value (don't change once live)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "points", title: "Lead score points", type: "number", description: "Higher = hotter lead" }),
  ],
  preview: { select: { title: "label", subtitle: "points" } },
});

export const titledText = defineType({
  name: "titledText",
  title: "Title + text",
  type: "object",
  fields: [defineField({ name: "title", type: "string" }), defineField({ name: "text", type: "text", rows: 3 })],
});

export const heroVideo = defineType({
  name: "heroVideo",
  title: "Hero video",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "file", title: "Video file (MP4, muted, under ~8MB, 10–20 seconds)", type: "file", options: { accept: "video/mp4,video/webm" } }),
    defineField({ name: "url", title: "…or video URL", type: "url" }),
    imageWithAlt("poster", "Poster image (shown while the video loads)"),
    defineField({ name: "placeholder", title: "Still a placeholder video (hidden on the live website)", type: "boolean", initialValue: false, description: "Untick once this is a real video of your work." }),
  ],
});

export const objects = [link, seo, section, faqItem, option, titledText, heroVideo];
