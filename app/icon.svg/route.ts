import { faviconSvg } from "@/clients/active/brand";

export const dynamic = "force-static";

/** The active client's favicon (clients/<slug>/brand.tsx → faviconSvg). */
export function GET() {
  return new Response(faviconSvg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
