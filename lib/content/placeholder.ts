import { hidePlaceholders as hide } from "@/lib/site";

/**
 * True for values that are still a placeholder: empty, "[EDITABLE PLACEHOLDER]…", "[00]",
 * example.com-style addresses or a zero company number. Use on short settings fields only
 * (not on page body text, where [square brackets] are markdown links).
 */
export function isPlaceholderValue(v?: string | null): boolean {
  if (!v || !v.trim()) return true;
  const t = v.trim();
  // Any "[bracketed text]" that isn't a markdown link, e.g. [EDITABLE PLACEHOLDER], [00], [Customer first name]
  return /\[[^\]]+\](?!\()/.test(t) || /\.example\b/i.test(t) || /^0+$/.test(t) || /\b00000000\b/.test(t);
}

/** The value, or "" when it's still a placeholder. */
export const realValue = (v?: string | null) => (isPlaceholderValue(v) ? "" : v!.trim());

/**
 * Placeholders are visible on previews and the vercel.app address (so the owner can see what to fill in),
 * and hidden on the real domain in production.
 */
export const hidePlaceholders = hide;
