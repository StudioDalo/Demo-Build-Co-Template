import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { tryGetStores } from "@/lib/leads/store";

export const runtime = "nodejs";

/** Serves locally stored uploads to the logged-in admin only. (Supabase uploads use signed URLs instead.) */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { path } = await params;
  const file = await tryGetStores()?.uploads.read?.(path.join("/"));
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(Buffer.from(file.bytes), {
    headers: { "Content-Type": file.type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" },
  });
}
