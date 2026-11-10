#!/usr/bin/env node
/**
 * Compare two parity snapshots (see parity-snapshot.mjs).
 *   node scripts/parity-compare.mjs .parity/baseline .parity/current
 * Fails if any page's VISIBLE TEXT changed. Markup-only differences (React text markers,
 * theme variables on <html>, favicon URL, equivalent colour syntax) are reported but allowed.
 */
import { readdirSync, readFileSync } from "node:fs";

const [a = ".parity/baseline", b = ".parity/current"] = process.argv.slice(2);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const visible = (t) =>
  decode(t.replace(/<lastmod>[^<]*<\/lastmod>/g, "").replace(/<!-- -->/g, "").replace(/<script[^>]*application\/ld\+json[^>]*>/g, "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const markup = (t) =>
  t
    .replace(/<!-- -->/g, "")
    .replace(/<lastmod>[^<]*<\/lastmod>/g, "")
    .replace(/rgba\(245,163,0,0\.(\d\d)\)/g, (_, p) => `color-mix(in_srgb,var(--accent)_${Number(p)}%,transparent)`)
    .replace(/<html([^>]*?) style="[^"]*"/g, "<html$1")
    .replace(/<link rel="icon"[^>]*>/g, '<link rel="icon"/>')
    .replace(/\s+/g, "");

let textChanged = 0;
for (const f of readdirSync(a)) {
  const x = readFileSync(`${a}/${f}`, "utf8");
  let y;
  try {
    y = readFileSync(`${b}/${f}`, "utf8");
  } catch {
    console.log(`MISSING  ${f}`);
    textChanged++;
    continue;
  }
  if (visible(x) !== visible(y)) {
    textChanged++;
    console.log(`TEXT     ${f}`);
  } else if (markup(x) !== markup(y)) console.log(`markup   ${f}`);
}
console.log(textChanged ? `[parity] FAIL: ${textChanged} page(s) with visible changes` : "[parity] OK: no visible text changes");
process.exit(textChanged ? 1 : 0);
