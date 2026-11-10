/** Replace {location}, {businessName}… in every string of a content object (pack starter content). */
export function fillTokens<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === "string") return value.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m) as T;
  if (Array.isArray(value)) return value.map((v) => fillTokens(v, vars)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillTokens(v, vars)])) as T;
  return value;
}
