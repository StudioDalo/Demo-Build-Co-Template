import { buildLlmsTxt } from "@/lib/seo/llms";

export const revalidate = 3600;
export async function GET() {
  return new Response(await buildLlmsTxt(false), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
