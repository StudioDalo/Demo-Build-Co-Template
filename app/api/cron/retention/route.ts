import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getPrivacyPolicy } from "@/lib/content";
import { deleteLeads, dueForDeletion } from "@/lib/leads/retention";
import { tryGetStores } from "@/lib/leads/store";
import { withLenientContent } from "@/lib/content/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily retention job (vercel.json → crons). Vercel calls it with "Authorization: Bearer $CRON_SECRET".
 * It only deletes when RETENTION_AUTO_DELETE=1; otherwise it just reports what is due
 * (the owner can delete from the /admin dashboard instead).
 */
async function handleGet(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || got.length !== want.length || !timingSafeEqual(got, want)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const stores = tryGetStores();
  if (!stores) return NextResponse.json({ error: "Lead storage is not configured" }, { status: 503 });
  const policy = await getPrivacyPolicy();
  const due = dueForDeletion(await stores.leads.list(), policy.retentionMonths);
  const auto = process.env.RETENTION_AUTO_DELETE === "1";
  const deleted = auto ? await deleteLeads(stores, due.all) : 0;
  console.info(`[retention] due: ${due.partial.length} partial, ${due.enquiries.length} enquiries; deleted: ${deleted}${auto ? "" : " (auto-delete off)"}`);
  return NextResponse.json({ partialDue: due.partial.length, enquiriesDue: due.enquiries.length, deleted, autoDelete: auto });
}

export function GET(req: NextRequest) {
  return withLenientContent(() => handleGet(req));
}
