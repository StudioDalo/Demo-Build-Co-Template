import type { NextConfig } from "next";
import { isLiveSite } from "./lib/site";
import { enforceSettings } from "./lib/env-check";

// Vercel production build: stop here (keeping the last good deployment live) if settings are missing or unsafe
if (process.env.VERCEL_ENV === "production") enforceSettings("build");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      { source: "/((?!studio).*)", headers: securityHeaders },
      { source: "/placeholders/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800" }] },
      // Never indexed: the thank-you page, private areas, and every page on previews / the vercel.app address
      { source: "/get-a-quote/thank-you", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/:dir(admin|studio|api)/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      ...(isLiveSite() ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]),
    ];
  },
};

export default nextConfig;
