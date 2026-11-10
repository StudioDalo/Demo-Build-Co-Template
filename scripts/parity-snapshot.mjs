#!/usr/bin/env node
/**
 * Parity check: fetch the rendered HTML of key routes from a running server and store a
 * normalised copy (build hashes, React payload scripts and other per-build noise removed).
 *
 *   node scripts/parity-snapshot.mjs http://localhost:3200 out/dir
 *   diff -r baseline/ current/      # no output = no visible change
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [base = "http://localhost:3200", out = ".parity/current"] = process.argv.slice(2);
const ROUTES = [
  "/", "/services", "/services/loft-conversions", "/services/landscaping", "/areas",
  "/projects", "/projects/example-project-1", "/reviews", "/before-and-after", "/how-we-work", "/about", "/faqs",
  "/guides", "/guides/permitted-development", "/cost-guides", "/cost-guides/loft-conversion-cost", "/contact",
  "/get-a-quote", "/get-a-quote/thank-you", "/planning-checklist", "/privacy", "/terms", "/leave-a-review",
  "/sitemap.xml", "/robots.txt", "/llms.txt", "/llms-full.txt", "/this-page-does-not-exist", "/admin/login",
];

const normalise = (html) =>
  html
    .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, "<script/>") // RSC payload + chunks
    .replace(/\/_next\/static\/[^"' )]+/g, "/_next/static/X")
    .replace(/\b(nonce|data-precedence|data-n-href)="[^"]*"/g, "")
    .replace(/<link[^>]+rel="(preload|modulepreload|stylesheet)"[^>]*>/g, "<link/>")
    .replace(/<(link|meta)[^>]+(as="script"|fetchPriority)[^>]*>/g, "")
    .replace(/>\s*</g, ">\n<");

// Area pages differ per client: take the first two from the sitemap
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const areaRoutes = [...sitemap.matchAll(/<loc>[^<]*?(\/areas\/[a-z0-9-]+)<\/loc>/g)].map((m) => m[1]).slice(0, 2);
ROUTES.splice(6, 0, ...areaRoutes);

mkdirSync(out, { recursive: true });
let n = 0;
for (const r of ROUTES) {
  const res = await fetch(base + r, { redirect: "manual" });
  const body = res.status >= 300 && res.status < 400 ? `REDIRECT ${res.headers.get("location")}` : await res.text();
  const file = path.join(out, (r === "/" ? "home" : r.slice(1).replace(/\//g, "__")) + ".txt");
  writeFileSync(file, `STATUS ${res.status}\nX-ROBOTS ${res.headers.get("x-robots-tag") ?? ""}\n\n${normalise(body)}\n`);
  n++;
}
console.log(`[parity] ${n} routes saved to ${out}`);
