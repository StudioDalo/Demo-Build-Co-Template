import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { googleAdsOfflineCsv } from "@/lib/leads/gads";
import { tryGetStores } from "@/lib/leads/store";

export const runtime = "nodejs";

/** Won jobs with a Google click ID, in Google Ads offline conversion upload format. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const stores = tryGetStores();
  if (!stores) return NextResponse.json({ error: "Lead storage is not configured" }, { status: 503 });
  const { csv } = googleAdsOfflineCsv(await stores.leads.list({ status: "won" }));
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="google-ads-offline-conversions-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
