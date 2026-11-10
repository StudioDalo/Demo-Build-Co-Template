import { describe, expect, it } from "vitest";
import { isValidUkPhone, telHref, toE164, whatsappHref } from "@/lib/phone";

describe("phone helpers", () => {
  it("converts UK mobiles to E.164", () => {
    expect(toE164("07700 900456")).toBe("+447700900456");
    expect(toE164("07700 900789")).toBe("+447700900789");
    expect(toE164("+44 7700 900456")).toBe("+447700900456");
  });
  it("builds tel and WhatsApp links", () => {
    expect(telHref("07700 900456")).toBe("tel:+447700900456");
    expect(whatsappHref("07700 900456", "Hi there")).toBe("https://wa.me/447700900456?text=Hi%20there");
  });
  it("validates UK numbers", () => {
    expect(isValidUkPhone("07700 900456")).toBe(true);
    expect(isValidUkPhone("+44 (0)20 7946 0018".replace("(0)", ""))).toBe(true);
    expect(isValidUkPhone("020 7946 0018")).toBe(true);
    expect(isValidUkPhone("12345")).toBe(false);
    expect(isValidUkPhone("0123")).toBe(false);
  });
});
