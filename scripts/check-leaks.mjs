#!/usr/bin/env node
/**
 * Leak checker for the template.
 *
 *   node scripts/check-leaks.mjs                 # scan every tracked file (and the active client's PDFs)
 *   node scripts/check-leaks.mjs --build .next   # also scan a PRODUCTION build's pre-rendered pages
 *
 * Fails (exit 1) if it finds:
 *  - the previous client's identifiers (name, domain, social handle, phone numbers, "tbl" storage prefix)
 *  - real-looking UK phone numbers (anything outside Ofcom's reserved drama ranges)
 *  - email addresses outside reserved example domains
 *  - in --build mode: placeholder content in pages of a production build (legal pages are reported, not failed,
 *    because the owner must fill in their company/ICO details before go-live)
 * Values are reported by file and line, never printed in full.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/** Identifiers of the client this template was built from. Kept as patterns, not literal strings. */
export const CLIENT_PATTERNS = [
  { name: "previous client name", re: /top[\s._-]?build/i },
  { name: "previous client domain/handle", re: /topbuild|top\.build\.london|top-build-london/i },
  { name: "previous client phone", re: /0\s?7\s?4\s?7\s?4\s?5\s?8\s?0\s?0\s?0\s?5|0\s?7\s?9\s?5\s?0\s?7\s?1\s?0\s?0\s?6\s?4|44\s?7474\s?580005|44\s?7950\s?710064/ },
  { name: "previous client storage prefix", re: /\btbl[_:-]|__tbl/i },
];

/** Ofcom reserved numbers for drama/examples: never allocated to real people. */
const FAKE_PHONE = [/^07700900\d{3}$/, /^01632960\d{3}$/, /^0207946[0]\d{3}$/, /^01[1-9]1496[0]\d{3}$/, /^0306999[0]\d{3}$/, /^02896496\d{3}$/, /^0808157[0]\d{3}$/, /^0909879[0]\d{3}$/];
/** Real public numbers that belong in every privacy policy (not personal data). */
const PUBLIC_NUMBERS = new Set(["03031231113" /* ICO helpline */]);
const PHONE_RE = /(?<![\d.])(?:\+44\s?(?:\(0\)\s?)?|0044\s?|0)(?:\d[\s-]?){9,10}(?![\d])/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g;
const OK_EMAIL_DOMAIN = /(^|\.)(example\.(com|org|net)|example|resend\.dev)$/i;

const SKIP = new Set(["scripts/check-leaks.mjs", "tests/unit/leaks.test.ts", "package-lock.json"]);
const BINARY = /\.(png|jpe?g|webp|gif|ico|mp4|webm|woff2?|ttf|otf|pdf)$/i;

export function scanText(text, file) {
  const findings = [];
  text.split("\n").forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    for (const p of CLIENT_PATTERNS) if (p.re.test(line)) findings.push({ at, kind: p.name });
    for (const m of line.matchAll(PHONE_RE)) {
      let d = m[0].replace(/\D/g, "");
      if (d.startsWith("0044")) d = "0" + d.slice(4);
      else if (d.startsWith("44")) d = "0" + d.slice(2);
      if (d.length < 10 || d.length > 11) continue;
      if (!FAKE_PHONE.some((r) => r.test(d)) && !PUBLIC_NUMBERS.has(d)) findings.push({ at, kind: `real-looking phone number (…${d.slice(-3)})` });
    }
    for (const m of line.matchAll(EMAIL_RE)) {
      const domain = m[0].split("@")[1];
      if (!OK_EMAIL_DOMAIN.test(domain)) findings.push({ at, kind: `email address outside example domains (@${domain})` });
    }
  });
  return findings;
}

/** PDF text is often compressed: decode FlateDecode streams before scanning. */
async function pdfText(file) {
  const { inflateSync } = await import("node:zlib");
  const buf = readFileSync(file);
  let out = buf.toString("latin1");
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(out))) {
    const start = m.index + m[0].length;
    const end = buf.indexOf("endstream", start);
    if (end < 0) break;
    try {
      out += "\n" + inflateSync(buf.subarray(start, end)).toString("latin1");
    } catch {}
  }
  // PDF text operators keep strings in (…) or <hex>
  return out.replace(/<([0-9A-Fa-f]{4,})>/g, (_, h) => Buffer.from(h, "hex").toString("latin1"));
}

export async function scanRepo(root = process.cwd()) {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split("\n").filter(Boolean);
  const findings = [];
  for (const f of files) {
    if (SKIP.has(f) || !existsSync(path.join(root, f))) continue;
    for (const p of CLIENT_PATTERNS) if (p.re.test(f)) findings.push({ at: f, kind: `${p.name} (in the file name)` });
    if (f.endsWith(".pdf")) findings.push(...scanText(await pdfText(path.join(root, f)), f));
    else if (!BINARY.test(f)) findings.push(...scanText(readFileSync(path.join(root, f), "utf8"), f));
  }
  return findings;
}

const PLACEHOLDER_RE = /\[EDITABLE PLACEHOLDER|data-placeholder="true"|\[OWNER TO |\/placeholders\/hero-/;
const LEGAL_ROUTES = /^\/(privacy|terms)$/;

export function scanBuild(dir) {
  const appDir = path.join(dir, "server", "app");
  if (!existsSync(appDir)) throw new Error(`No production build at ${dir} (run next build first)`);
  const errors = [];
  const legal = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html")) {
        const route = "/" + path.relative(appDir, full).replace(/\.html$/, "").replace(/(^|\/)index$/, "").replace(/\([^)]+\)\/?/g, "");
        if (/^\/_/.test(route)) continue;
        const raw = readFileSync(full, "utf8");
        const html = raw.replace(/<script[\s\S]*?<\/script>/g, "");
        for (const f of scanText(html, route)) errors.push(f);
        // Placeholders are checked in the visible HTML AND the serialised page data (<script> payloads)
        if (PLACEHOLDER_RE.test(raw)) (LEGAL_ROUTES.test(route) ? legal : errors).push({ at: route, kind: "placeholder content in a production page" });
      }
    }
  };
  walk(appDir);
  return { errors, legal };
}

async function main() {
  const args = process.argv.slice(2);
  const findings = await scanRepo();
  let legal = [];
  const b = args.indexOf("--build");
  if (b >= 0) {
    const r = scanBuild(args[b + 1] || ".next");
    findings.push(...r.errors);
    legal = r.legal;
  }
  for (const f of findings) console.log(`LEAK  ${f.at}  ${f.kind}`);
  for (const f of legal) console.log(`OWNER ${f.at}  still has placeholders (fill in company / ICO details before go-live)`);
  console.log(findings.length ? `[leaks] FAIL: ${findings.length} finding(s)` : "[leaks] OK: no client data, real contact details or production placeholders found");
  process.exit(findings.length ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
