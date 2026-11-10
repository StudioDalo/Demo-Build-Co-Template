/**
 * Generates the lead-magnet PDF for the ACTIVE client (CLIENT=<slug>), from its trade pack's
 * checklist (packs/<pack>/checklist.ts), branded with the client's name, numbers and colours.
 * Output: public/<client config leadMagnet.pdfPath>
 *
 *   CLIENT=demo-builder npm run make:pdf
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { config } from "../clients/active/config";
import { siteSettings } from "../clients/active/content";
import { checklist } from "../packs/active/checklist";

const hex = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const ACCENT = hex(config.theme.accent);
const INK = hex(config.theme.dark);
const MUTED = hex(config.theme.muted);

async function main() {
  if (!config.leadMagnet) throw new Error(`clients/${config.slug}/config.ts has no leadMagnet`);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${checklist.title} | ${siteSettings.businessName}`);
  pdf.setAuthor(siteSettings.legalName);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const W = 595, H = 842, M = 50;
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const header = () => {
    page.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: INK });
    page.drawText(siteSettings.businessName, { x: M, y: H - 52, size: 24, font: bold, color: rgb(1, 1, 1) });
    const phones = siteSettings.phones.map((p) => p.number).join("  ·  ");
    if (phones) page.drawText(phones, { x: M, y: H - 75, size: 10, font: reg, color: rgb(1, 1, 1) });
    y = H - 125;
  };
  const ensure = (h: number) => {
    if (y - h < M + 30) {
      page = pdf.addPage([W, H]);
      header();
    }
  };
  header();
  page.drawText(checklist.title, { x: M, y, size: 22, font: bold, color: INK });
  y -= 22;
  page.drawText(checklist.subtitle, { x: M, y, size: 12, font: reg, color: MUTED });
  y -= 30;

  for (const s of checklist.sections) {
    ensure(40);
    page.drawRectangle({ x: M, y: y - 4, width: 4, height: 18, color: ACCENT });
    page.drawText(s.title, { x: M + 12, y, size: 14, font: bold, color: INK });
    y -= 24;
    for (const it of s.items) {
      ensure(20);
      page.drawRectangle({ x: M + 2, y: y - 2, width: 10, height: 10, borderColor: INK, borderWidth: 1 });
      page.drawText(it, { x: M + 20, y, size: 10.5, font: reg, color: INK, maxWidth: W - 2 * M - 20 });
      y -= 18;
    }
    y -= 12;
  }
  ensure(70);
  page.drawText(checklist.closing, { x: M, y, size: 11, font: bold, color: INK });
  y -= 30;
  page.drawText(checklist.disclaimer, { x: M, y, size: 8, font: reg, color: MUTED, maxWidth: W - 2 * M, lineHeight: 10 });
  pdf.getPages().forEach((p, i) => p.drawText(`Page ${i + 1}`, { x: W - M - 30, y: 25, size: 8, font: reg, color: MUTED }));
  const out = path.join("public", config.leadMagnet.pdfPath);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, await pdf.save());
  console.log(`Wrote ${out}`);
}
main();
