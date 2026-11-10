import type { Lead } from "./types";
import { STATUS_LABELS } from "./types";
import { packForm } from "@/packs/active/form";

const COLUMNS: [string, (l: Lead) => unknown][] = [
  ["Created", (l) => l.createdAt],
  ["Status", (l) => STATUS_LABELS[l.status]],
  ["Complete", (l) => (l.complete ? "Yes" : "Partial")],
  ["Type", (l) => l.type],
  ["Score", (l) => l.score ?? ""],
  ["Name", (l) => l.name],
  ["Phone", (l) => l.phone],
  ["Email", (l) => l.email],
  ["Postcode", (l) => l.postcode],
  ["Services", (l) => l.services.join("; ")],
  // Trade-specific answer columns from the active pack
  ...packForm.csvColumns.map(([heading, key]): [string, (l: Lead) => unknown] => [heading, (l) => l.answers[key]]),
  ["Description", (l) => l.answers.description],
  ["Heard about", (l) => l.answers.heardAbout],
  ["Won value (GBP)", (l) => l.wonValue ?? ""],
  ["Won at", (l) => l.wonAt ?? ""],
  ["Source", (l) => l.attribution?.utm_source ?? ""],
  ["Campaign", (l) => l.attribution?.utm_campaign ?? ""],
  ["Google click ID", (l) => (l.attribution?.gclid ? "yes" : "")],
  ["Notes", (l) => l.notes.map((n) => `[${n.at.slice(0, 10)}] ${n.text}`).join(" | ")],
  ["Source page", (l) => l.source.page],
  ["Lead ID", (l) => l.id],
];

export function csvCell(value: unknown): string {
  let s = value === undefined || value === null ? "" : Array.isArray(value) ? value.join("; ") : String(value);
  // Neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = COLUMNS.map(([h]) => csvCell(h)).join(",");
  const rows = leads.map((l) => COLUMNS.map(([, get]) => csvCell(get(l))).join(","));
  return [header, ...rows].join("\r\n") + "\r\n";
}
