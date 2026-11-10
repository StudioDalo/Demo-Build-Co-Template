import { NextResponse, type NextRequest } from "next/server";
import { tryGetStores } from "@/lib/leads/store";
import { rateLimited } from "@/lib/spam";

export const runtime = "nodejs";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"]);

/** Check the file's real signature, not just the browser-supplied type. */
function sniff(b: Uint8Array): string | null {
  const s = (o: number, sig: number[]) => sig.every((v, i) => b[o + i] === v);
  if (s(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (s(0, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (s(0, [0x52, 0x49, 0x46, 0x46]) && s(8, [0x57, 0x45, 0x42, 0x50])) return "image/webp";
  if (s(0, [0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  if (s(4, [0x66, 0x74, 0x79, 0x70])) return "image/heic";
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`upload:${ip}`, 20)) return NextResponse.json({ ok: false, error: "Too many uploads" }, { status: 429 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload" }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ ok: false, error: "No files" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: `Up to ${MAX_FILES} files` }, { status: 400 });
  const stores = tryGetStores();
  if (!stores) return NextResponse.json({ ok: false, error: "Uploads aren't available just now. You can send photos after we call you." }, { status: 503 });
  const { uploads } = stores;
  const out = [];
  for (const f of files) {
    if (f.size > MAX_BYTES) return NextResponse.json({ ok: false, error: `${f.name} is over 10MB` }, { status: 400 });
    const bytes = new Uint8Array(await f.arrayBuffer());
    const type = sniff(bytes);
    if (!type || !ALLOWED.has(type)) return NextResponse.json({ ok: false, error: `${f.name}: only photos (JPG, PNG, WebP, HEIC) or PDF` }, { status: 400 });
    const path = await uploads.save({ bytes, name: f.name, type });
    out.push({ path, name: f.name.slice(0, 200), size: f.size, type });
  }
  return NextResponse.json({ ok: true, files: out });
}
