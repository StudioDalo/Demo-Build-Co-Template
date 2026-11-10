import { describe, expect, it } from "vitest";
import { csvCell, leadsToCsv } from "@/lib/leads/csv";
import type { Lead } from "@/lib/leads/types";

const lead: Lead = {
  id: "1", createdAt: "2026-11-05T10:00:00Z", updatedAt: "2026-11-05T10:00:00Z", type: "quote", complete: true, status: "survey_booked",
  score: "hot", scorePoints: 9, name: 'Jo "JJ" Bloggs', phone: "07700900456", email: "jo@example.com", postcode: "SW16 3AA",
  services: ["loft-conversions", "landscaping"], answers: { timing: "asap", description: "Line 1\nLine, 2" }, uploads: [],
  notes: [{ at: "2026-11-06T09:00:00Z", text: "Called back" }], source: { page: "/" }, consent: true, tokenHash: "x", wonValue: null, wonAt: null, attribution: {},
};

describe("CSV export", () => {
  it("escapes quotes, commas and newlines", () => {
    expect(csvCell('a "b"')).toBe('"a ""b"""');
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell("a\nb")).toBe('"a\nb"');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+44")).toBe("'+44");
  });
  it("produces a header plus one row per lead with readable status", () => {
    const csv = leadsToCsv([lead]).trim().split("\r\n");
    expect(csv).toHaveLength(2);
    expect(csv[0]).toMatch(/^Created,Status,Complete/);
    expect(csv[1]).toContain("Survey booked");
    expect(csv[1]).toContain('"Jo ""JJ"" Bloggs"');
    expect(csv[1]).toContain("loft-conversions; landscaping");
    expect(csv[1]).toContain("[2026-11-06] Called back");
  });
});
