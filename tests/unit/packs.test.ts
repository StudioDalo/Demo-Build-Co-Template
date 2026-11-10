import { describe, expect, it } from "vitest";
import * as loft from "@/packs/loft-extension/form/schema";
import * as loftContent from "@/packs/loft-extension/content";
import { meta as loftMeta } from "@/packs/loft-extension/meta";
import { icons as loftIcons } from "@/packs/loft-extension/icons";
import * as blank from "@/packs/_blank/form/schema";
import * as blankContent from "@/packs/_blank/content";
import { meta as blankMeta } from "@/packs/_blank/meta";
import { icons as blankIcons } from "@/packs/_blank/icons";

const SHARED_STEPS = ["services", "detail", "contact"];
const SHARED_GROUPS = ["contactMethod", "contactTime", "heardAbout"];

const packs = [
  { name: "loft-extension", form: loft.packForm, content: loftContent, meta: loftMeta, icons: loftIcons },
  { name: "_blank", form: blank.packForm, content: blankContent, meta: blankMeta, icons: blankIcons },
];

describe.each(packs)("trade pack $name is consistent", ({ form, content, meta, icons }) => {
  it("starts with services and ends with detail + contact; every other step has a schema", () => {
    expect(form.steps[0]).toBe("services");
    expect(form.steps.slice(-2)).toEqual(["detail", "contact"]);
    for (const s of form.steps) if (!SHARED_STEPS.includes(s)) expect(Object.keys(form.stepSchemas)).toContain(s);
    for (const s of Object.keys(form.stepSchemas)) expect(SHARED_STEPS).not.toContain(s);
  });
  it("has step wording for every step, in the same order", () => {
    expect(content.quoteForm.steps.map((s) => s.key)).toEqual([...form.steps]);
  });
  it("has answer options for every declared question, including the shared contact questions", () => {
    const groups = content.quoteForm.optionGroups.map((g) => g.key);
    for (const g of meta.optionGroups) expect(groups).toContain(g.key);
    for (const g of SHARED_GROUPS) expect(groups).toContain(g);
    for (const g of content.quoteForm.optionGroups) expect(g.options.length).toBeGreaterThan(0);
  });
  it("scores only declared, scored questions that have points", () => {
    for (const f of form.scoreFields) {
      expect(meta.optionGroups.find((g) => g.key === f && "scored" in g && g.scored)).toBeTruthy();
      expect(content.quoteForm.optionGroups.find((g) => g.key === f)!.options.some((o) => (o.points ?? 0) > 0)).toBe(true);
    }
  });
  it("only uses icon keys it defines", () => {
    expect(Object.keys(icons).sort()).toEqual([...meta.iconKeys].sort());
    for (const s of content.services) expect(meta.iconKeys).toContain(s.icon);
  });
  it("conversion params never contain personal data", () => {
    const p = form.conversionParams({ name: "Jo", phone: "07700900000", email: "jo@example.com", description: "secret" });
    expect(JSON.stringify(p)).not.toMatch(/Jo|0700|example|secret/);
  });
});
