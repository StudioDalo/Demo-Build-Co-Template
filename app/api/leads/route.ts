import { NextResponse, type NextRequest } from "next/server";
import { submissionSchema } from "@/lib/leads/schema";
import { handleSubmission } from "@/lib/leads/service";
import { rateLimited } from "@/lib/spam";
import { StorageNotConfiguredError } from "@/lib/leads/store";
import { getSiteSettings } from "@/lib/content";
import { withLenientContent } from "@/lib/content/mode";

export const runtime = "nodejs";

const clientIp = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

async function handlePost(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(`lead:${ip}`, 30)) return NextResponse.json({ ok: false, error: "Too many requests. Please call us instead." }, { status: 429 });
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const parsed = submissionSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  try {
    const { status, ...body } = await handleSubmission(parsed.data, ip);
    return NextResponse.json(body, { status });
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      console.error(`[api/leads] LEAD NOT SAVED. ${err.message}`);
      const phone = (await getSiteSettings()).phones[0]?.number;
      return NextResponse.json(
        { ok: false, code: "storage_unavailable", error: `Sorry, we couldn't send your enquiry just now. Your answers are kept on this device, so please try again shortly${phone ? `, or call us on ${phone}` : ""}.` },
        { status: 503 },
      );
    }
    console.error("[api/leads] failed", err);
    return NextResponse.json({ ok: false, error: "Sorry, something went wrong. Please call us." }, { status: 500 });
  }
}

/** A Sanity outage must never stop a quote being saved: lead handling uses lenient content. */
export function POST(req: NextRequest) {
  return withLenientContent(() => handlePost(req));
}
