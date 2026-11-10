import type { MetadataRoute } from "next";
import { absoluteUrl, isLiveSite, siteUrl } from "@/lib/site";

/** Search engines AND AI answer engines are welcome on public pages (GEO/AEO). Private areas are blocked. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/studio", "/api/", "/get-a-quote/thank-you", "/leave-a-review"];
  if (!isLiveSite()) return { rules: [{ userAgent: "*", disallow: "/" }] }; // previews / vercel.app stay out of Google
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"], allow: "/", disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
