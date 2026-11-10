import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { leadsToCsv } from "@/lib/leads/csv";
import { tryGetStores } from "@/lib/leads/store";
import { parseFilter } from "@/lib/admin/filter";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const stores = tryGetStores();
  if (!stores) return NextResponse.json({ error: "Lead storage is not configured" }, { status: 503 });
  const leads = await stores.leads.list(parseFilter(Object.fromEntries(req.nextUrl.searchParams)));
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + leadsToCsv(leads), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
