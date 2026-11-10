/**
 * Copies the built-in starter content (clients/<active client>/content) into Sanity so the owner can edit everything in Studio.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx NEXT_PUBLIC_SANITY_DATASET=production SANITY_API_WRITE_TOKEN=sk... npm run seed:sanity
 *
 * Safe to re-run: documents use fixed IDs and are replaced. Pass --dry-run to print without writing.
 * Local media (logo, placeholder videos/posters) is uploaded as Sanity assets.
 * Placeholder images are left empty so Studio shows "upload a photo".
 */
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import * as seed from "../clients/active/content";
import type { ImageRef } from "../lib/content/types";

const dry = process.argv.includes("--dry-run");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

type Doc = Record<string, unknown> & { _id: string; _type: string };

let n = 0;
/** Sanity needs a unique _key on every object inside an array. */
function keyed<T>(v: T): T {
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" && !Array.isArray(x) ? { _key: `k${(n++).toString(36)}`, ...keyed(x) } : keyed(x))) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, keyed(x)])) as T;
  return v;
}
const slug = (current: string) => ({ _type: "slug", current });
const ref = (_ref: string) => ({ _type: "reference", _ref });

const uploaded = new Map<string, string>();
async function asset(client: SanityClient | null, kind: "image" | "file", publicUrl?: string) {
  if (!publicUrl || !publicUrl.startsWith("/")) return undefined;
  const file = path.join(process.cwd(), "public", publicUrl);
  if (!existsSync(file)) return undefined;
  if (!uploaded.has(file)) {
    if (!client) uploaded.set(file, `dry-${path.basename(file)}`);
    else uploaded.set(file, (await client.assets.upload(kind, createReadStream(file), { filename: path.basename(file) }))._id);
  }
  return { _type: kind, asset: ref(uploaded.get(file)!) };
}
async function img(client: SanityClient | null, i?: ImageRef) {
  if (!i || i.placeholder || !i.url) return undefined;
  const a = await asset(client, "image", i.url);
  return a ? { ...a, alt: i.alt } : undefined;
}
const strip = <T extends Record<string, unknown>>(o: T, ...keys: string[]) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

async function build(client: SanityClient | null): Promise<Doc[]> {
  const s = seed.siteSettings;
  const h = seed.homePage;
  const docs: Doc[] = [];

  docs.push({
    _id: "siteSettings", _type: "siteSettings",
    ...strip(s, "logo", "seo"),
    logo: await img(client, s.logo),
    accreditations: s.accreditations.map((a) => strip(a, "placeholder", "logo")),
    seo: { ...strip(s.seo, "ogImage"), ogImage: await img(client, s.seo.ogImage) },
  });

  docs.push({
    _id: "homePage", _type: "homePage",
    ...h,
    hero: {
      ...h.hero,
      videos: await Promise.all(h.hero.videos.map(async (v) => ({ _type: "heroVideo", title: v.title, file: await asset(client, "file", v.url), poster: await img(client, v.poster) }))),
    },
  });

  docs.push({ _id: "quoteFormSettings", _type: "quoteFormSettings", ...seed.quoteForm });
  docs.push({ _id: "privacyPolicy", _type: "privacyPolicy", ...seed.privacyPolicy });

  for (const sv of seed.services) {
    docs.push({ _id: `service-${sv.slug}`, _type: "service", ...strip(sv, "slug", "image"), slug: slug(sv.slug), image: await img(client, sv.image) });
  }
  for (const t of seed.tiktokItems) {
    docs.push({ _id: t.id, _type: "tiktokItem", title: t.title, projectType: t.projectType, url: t.url, hidden: t.hidden, order: t.order, thumbnail: await img(client, t.thumbnail), video: await asset(client, "file", t.videoUrl) });
  }
  for (const p of seed.projects) {
    docs.push({ _id: `project-${p.slug}`, _type: "project", ...strip(p, "slug", "images", "placeholder"), slug: slug(p.slug), images: [], seo: { ...p.seo, noindex: true } });
  }
  for (const b of seed.beforeAfters) {
    docs.push({ _id: b.id, _type: "beforeAfter", title: b.title, caption: b.caption, hidden: b.hidden });
  }
  for (const r of seed.reviews) {
    docs.push({ _id: r.id, _type: "review", ...strip(r, "id", "placeholder", "rating"), confirmed: false });
  }
  seed.faqs.forEach((f, i) => docs.push({ _id: f.id, _type: "faq", ...strip(f, "id"), order: i + 1 }));
  for (const a of seed.areas) {
    docs.push({ _id: `area-${a.slug}`, _type: "area", ...strip(a, "slug", "nearby"), slug: slug(a.slug), nearby: a.nearby.map((x) => ref(`area-${x}`)) });
  }
  for (const g of seed.guides) docs.push({ _id: `guide-${g.slug}`, _type: "guide", ...strip(g, "slug"), slug: slug(g.slug) });
  for (const c of seed.costGuides) {
    docs.push({ _id: `cost-${c.slug}`, _type: "costGuide", ...strip(c, "slug", "serviceSlug"), slug: slug(c.slug), service: ref(`service-${c.serviceSlug}`) });
  }
  seed.team.forEach((m, i) => docs.push({ _id: `team-${i + 1}`, _type: "teamMember", ...strip(m, "photo", "placeholder"), order: i + 1 }));
  seed.stats.forEach((st, i) => docs.push({ _id: `stat-${i + 1}`, _type: "stat", value: st.value, label: st.label, order: i + 1 }));
  for (const p of seed.pages) docs.push({ _id: `page-${p.slug}`, _type: "page", ...strip(p, "slug"), slug: slug(p.slug) });

  // Remove undefined values and add array keys
  return docs.map((d) => keyed(JSON.parse(JSON.stringify(d)) as Doc));
}

export { build };

async function main() {
  if (!dry && (!projectId || !token)) {
    console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (an Editor token from sanity.io/manage → API → Tokens).");
    process.exit(1);
  }
  const client = dry ? null : createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
  const docs = await build(client);
  if (dry || !client) {
    console.log(JSON.stringify(docs.slice(0, 3), null, 2));
    console.log(`\n[dry run] ${docs.length} documents would be written.`);
    return;
  }
  const tx = client.transaction();
  docs.forEach((d) => tx.createOrReplace(d));
  await tx.commit();
  console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}.`);
}

if (process.argv[1]?.includes("seed-sanity")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
