import { afterEach, describe, expect, it } from "vitest";
import { isLiveSite, siteUrl } from "@/lib/site";

const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});

describe("site URL + indexing gate", () => {
  it("stays out of search engines on vercel.app / without a real domain", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_ENV = "production";
    expect(isLiveSite()).toBe(false);
    process.env.NEXT_PUBLIC_SITE_URL = "https://example-site.vercel.app";
    expect(isLiveSite()).toBe(false);
  });
  it("is live only on the real domain in production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.example.com";
    process.env.VERCEL_ENV = "production";
    expect(isLiveSite()).toBe(true);
    process.env.VERCEL_ENV = "preview";
    expect(isLiveSite()).toBe(false);
  });
  it("prefers the stable production URL over a one-off deployment URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "example-site.vercel.app";
    process.env.VERCEL_URL = "example-site-abc123.vercel.app";
    expect(siteUrl()).toBe("https://example-site.vercel.app");
  });
});
