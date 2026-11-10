import { describe, expect, it } from "vitest";
import { checklistSchema, fieldErrors, partialSchema, quickSchema, quoteSchema, stepSchemas, STEP_ORDER } from "@/lib/leads/schema";

export const validQuote = {
  services: ["loft-conversions"], serviceOptions: { "loft-conversions": ["Dormer"] }, otherService: "",
  propertyType: "terraced", propertyAge: "pre-1900-victorian", ownership: "i-own-it", postcode: "sw16 3aa",
  timing: "asap", budget: "50k-100k",
  drawings: "no", planningStatus: "not-sure", architect: "yes", partyWall: "not-sure",
  staying: "yes-we-ll-stay-in", access: "Side gate", parking: "driveway",
  description: "Rear dormer with en-suite", uploads: [],
  name: "Sam Test", phone: "07700 900456", email: "Sam@Example.com", contactMethod: "phone-call", contactTime: "any-time", heardAbout: "tiktok", consent: true,
};

describe("lead schemas", () => {
  it("has 8 steps in the right order", () => {
    expect(STEP_ORDER).toEqual(["services", "property", "timing", "budget", "planning", "living", "detail", "contact"]);
  });
  it("accepts a complete quote and normalises fields", () => {
    const r = quoteSchema.parse(validQuote);
    expect(r.postcode).toBe("SW16 3AA");
    expect(r.phone).toBe("07700900456");
    expect(r.email).toBe("sam@example.com");
  });
  it("requires at least one service", () => {
    const r = stepSchemas.services.safeParse({ services: [] });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).services).toMatch(/at least one/);
  });
  it("rejects bad postcodes, phones and emails", () => {
    expect(stepSchemas.property.safeParse({ ...validQuote, postcode: "NOTAPOSTCODE" }).success).toBe(false);
    expect(stepSchemas.contact.safeParse({ ...validQuote, phone: "123" }).success).toBe(false);
    expect(stepSchemas.contact.safeParse({ ...validQuote, email: "nope" }).success).toBe(false);
  });
  it("requires GDPR consent", () => {
    const r = stepSchemas.contact.safeParse({ ...validQuote, consent: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).consent).toMatch(/agree/);
  });
  it("limits uploads to 5", () => {
    const up = { path: "a", name: "a.jpg", size: 1, type: "image/jpeg" };
    expect(stepSchemas.detail.safeParse({ uploads: Array(6).fill(up) }).success).toBe(false);
    expect(stepSchemas.detail.safeParse({ uploads: Array(5).fill(up) }).success).toBe(true);
  });
  it("quick form needs name, phone and project type", () => {
    expect(quickSchema.safeParse({ name: "Al", phone: "07700900789", projectType: "landscaping" }).success).toBe(true);
    expect(quickSchema.safeParse({ name: "Al", phone: "07700900789", projectType: "" }).success).toBe(false);
  });
  it("partial capture needs only name + phone and keeps other answers", () => {
    const r = partialSchema.parse({ name: "Al Smith", phone: "07700 900789", timing: "asap" });
    expect((r as Record<string, unknown>).timing).toBe("asap");
    expect(partialSchema.safeParse({ name: "Al Smith" }).success).toBe(false);
  });
  it("checklist needs email + consent", () => {
    expect(checklistSchema.safeParse({ email: "a@example.com", consent: true }).success).toBe(true);
    expect(checklistSchema.safeParse({ email: "a@example.com" }).success).toBe(false);
  });
});

describe("friendly messages for missing fields", () => {
  it("uses our wording, not zod defaults, when fields are absent", () => {
    const r = stepSchemas.property.safeParse({});
    expect(r.success).toBe(false);
    if (!r.success) {
      const f = fieldErrors(r.error);
      expect(f.propertyType).toBe("Choose a property type");
      expect(f.postcode).toBe("Please enter a valid UK postcode");
    }
    const c = stepSchemas.contact.safeParse({});
    if (!c.success) {
      const f = fieldErrors(c.error);
      expect(f.name).toBe("Please enter your name");
      expect(f.phone).toBe("Please enter a valid UK phone number");
      expect(f.email).toBe("Please enter a valid email address");
    }
    const s = stepSchemas.services.safeParse({});
    if (!s.success) expect(fieldErrors(s.error).services).toBe("Choose at least one option");
  });
});
