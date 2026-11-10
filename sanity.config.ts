"use client";

import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes, singletonTypes } from "./sanity/schemaTypes";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./lib/sanity/env";
import { siteConfig } from "./config";

const singleton = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

export default defineConfig({
  name: "trade-site",
  title: siteConfig.brand.appName,
  basePath: "/studio",
  projectId: sanityProjectId || "missing",
  dataset: sanityDataset,
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, ctx) =>
      singletonTypes.has(ctx.schemaType) ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : input,
  },
  plugins: [
    structureTool({
      title: "Website",
      structure: (S) =>
        S.list()
          .title("Website content")
          .items([
            singleton(S, "siteSettings", "⚙️ Site settings (logo, phone, colours, footer)"),
            singleton(S, "homePage", "🏠 Homepage (hero videos, headings)"),
            singleton(S, "quoteFormSettings", "📝 Quote form"),
            singleton(S, "privacyPolicy", "🔒 Privacy & cookies policy"),
            S.divider(),
            S.documentTypeListItem("tiktokItem").title("🎬 TikTok gallery"),
            S.documentTypeListItem("service").title("🔨 Services"),
            S.documentTypeListItem("project").title("📁 Projects / case studies"),
            S.documentTypeListItem("beforeAfter").title("↔️ Before & after"),
            S.documentTypeListItem("review").title("⭐ Reviews"),
            S.divider(),
            S.documentTypeListItem("faq").title("❓ FAQs"),
            S.documentTypeListItem("guide").title("📘 Planning guides"),
            S.documentTypeListItem("costGuide").title("💷 Cost guides"),
            S.documentTypeListItem("area").title("📍 Areas we cover"),
            S.divider(),
            S.documentTypeListItem("teamMember").title("👷 Team"),
            S.documentTypeListItem("stat").title("📊 Stats"),
            S.documentTypeListItem("page").title("📄 Page text (About, How we work, Terms…)"),
          ]),
    }),
    visionTool({ defaultApiVersion: sanityApiVersion }),
  ],
});
