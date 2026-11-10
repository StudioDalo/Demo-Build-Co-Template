/** UK number → E.164 (+44…). Leaves already-international numbers alone. */
export function toE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0044")) return "+" + digits.slice(2);
  if (digits.startsWith("44")) return "+" + digits;
  if (digits.startsWith("0")) return "+44" + digits.slice(1);
  return digits;
}

export const telHref = (raw: string) => `tel:${toE164(raw)}`;

export function whatsappHref(raw: string, message?: string): string {
  const n = toE164(raw).replace("+", "");
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** Normalise user-entered UK phone numbers for validation/storage. */
export function normaliseUkPhone(raw: string): string {
  return raw.replace(/[\s().-]/g, "");
}

export function isValidUkPhone(raw: string): boolean {
  const n = normaliseUkPhone(raw);
  return /^(?:\+44|0044|0)(?:7\d{9}|[1-689]\d{8,9})$/.test(n);
}
