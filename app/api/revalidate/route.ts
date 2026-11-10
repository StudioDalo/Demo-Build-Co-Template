import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { parseBody } from "next-sanity/webhook";

/** Sanity webhook → refresh the site immediately after the owner publishes. */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 501 });
  const { isValidSignature } = await parseBody(req, secret);
  if (!isValidSignature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: Date.now() });
}
