import { describe, expect, it } from "vitest";
// @ts-ignore: plain ESM script, no type declarations
import { scanRepo, scanText } from "../../scripts/check-leaks.mjs";

describe("leak checker", () => {
  it("finds no previous-client data, real phone numbers or real emails anywhere in the template", async () => {
    const findings = (await scanRepo()) as { at: string; kind: string }[];
    expect(findings.map((f) => `${f.at} ${f.kind}`)).toEqual([]);
  }, 30_000);

  it("catches client identifiers, real numbers and real emails, and allows reserved examples", () => {
    const kinds = (t: string) => (scanText(t, "x") as { kind: string }[]).map((f) => f.kind);
    // previous client, written in pieces so this test file never contains the literal
    expect(kinds(["Top", "Build"].join(" ") + " Ltd")).toContain("previous client name");
    expect(kinds(["tbl", "consent"].join("_"))).toContain("previous client storage prefix");
    expect(kinds("call 07911 123456")[0]).toMatch(/real-looking phone number/);
    expect(kinds("mail jo@gmail.com")[0]).toMatch(/email address outside example domains/);
    expect(kinds("call 07700 900123 or 01632 960123, mail hello@example.com or onboarding@resend.dev")).toEqual([]);
  });
});
