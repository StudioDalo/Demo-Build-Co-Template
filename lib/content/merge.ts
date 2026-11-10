const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Overlay `override` on `base`. Plain objects merge recursively; arrays and primitives
 * from `override` win; null/undefined/"" in `override` keep the base value.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined || override === "") return base;
  if (Array.isArray(override)) return override as T;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(override)) {
      if (k.startsWith("_")) continue;
      out[k] = deepMerge((base as Record<string, unknown>)[k], v);
    }
    return out as T;
  }
  return override as T;
}
