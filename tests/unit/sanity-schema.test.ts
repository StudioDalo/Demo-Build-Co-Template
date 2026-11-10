import { describe, expect, it } from "vitest";
import { schemaTypes } from "@/sanity/schemaTypes";
import { build } from "@/scripts/seed-sanity";
import { tiktokItems } from "@/clients/active/content";

type Field = { name: string; type: string; fields?: Field[]; of?: { type: string; fields?: Field[] }[] };
const types = new Map((schemaTypes as unknown as (Field & { name: string })[]).map((t) => [t.name, t]));

/** Recursively assert every key in a seeded value is a field the owner can edit in Studio. */
function check(value: unknown, field: Field, where: string, problems: string[]) {
  if (value === null || typeof value !== "object") return;
  const def = types.get(field.type) ?? field;
  if (Array.isArray(value)) {
    const member = def.of?.[0];
    if (!member) return;
    const memberField = (types.get(member.type) ?? member) as Field;
    value.forEach((v, i) => check(v, memberField, `${where}[${i}]`, problems));
    return;
  }
  if (!def.fields) return; // image/file/slug/reference internals
  const names = new Set(def.fields.map((f) => f.name));
  for (const [k, v] of Object.entries(value)) {
    if (k.startsWith("_") || ["asset", "current", "hotspot", "crop"].includes(k)) continue;
    if (!names.has(k)) problems.push(`${where}.${k}`);
    else check(v, def.fields.find((f) => f.name === k)!, `${where}.${k}`, problems);
  }
}

describe("Sanity schema covers all seeded content", () => {
  it("every seeded field exists in the Studio schema (so the owner can edit it)", async () => {
    const docs = await build(null);
    const problems: string[] = [];
    for (const d of docs) {
      const t = types.get(d._type);
      expect(t, d._type).toBeTruthy();
      check(d, t as Field, d._id, problems);
    }
    expect(problems).toEqual([]);
  });

  it("seeds every document type the site reads", async () => {
    const docTypes = new Set((await build(null)).map((d) => d._type));
    for (const t of ["siteSettings", "homePage", "quoteFormSettings", "service", "tiktokItem", "project", "beforeAfter", "review", "faq", "area", "guide", "costGuide", "teamMember", "stat", "page"]) {
      expect(docTypes.has(t), t).toBe(true);
    }
  });

  it("seeded TikTok items keep the exact post URL", async () => {
    const tt = (await build(null)).filter((d) => d._type === "tiktokItem");
    expect(tt.map((d) => d.url)).toEqual(tiktokItems.map((t) => t.url));
    expect(tt.every((d) => /^https:\/\/www\.tiktok\.com\//.test(String(d.url)))).toBe(true);
  });
});
