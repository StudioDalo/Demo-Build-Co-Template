import { csvCell } from "./csv";
import type { Lead } from "./types";

export const CONVERSION_NAME = "Won Job";

/** "yyyy-MM-dd HH:mm:ss" in UK time, matching the "Parameters:TimeZone=Europe/London" header row. */
export function londonTime(iso: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/**
 * Google Ads "offline conversions" upload file (Tools → Conversions → Uploads).
 * Only Won leads that came from a Google Ads click (gclid) are included.
 */
export function googleAdsOfflineCsv(leads: Lead[]): { csv: string; count: number } {
  const rows = leads
    .filter((l) => l.status === "won" && l.attribution?.gclid)
    .map((l) => [l.attribution.gclid, CONVERSION_NAME, londonTime(l.wonAt ?? l.updatedAt), (l.wonValue ?? 0).toFixed(2), "GBP"].map(csvCell).join(","));
  const header = ["Google Click ID", "Conversion Name", "Conversion Time", "Conversion Value", "Conversion Currency"].join(",");
  return { csv: ["Parameters:TimeZone=Europe/London", header, ...rows].join("\r\n") + "\r\n", count: rows.length };
}
