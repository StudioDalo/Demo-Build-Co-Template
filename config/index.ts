import { config } from "../clients/active/config";
import type { ClientConfig } from "./types";

/** The active client's config (chosen at build time by CLIENT=<slug>, see scripts/select-client.mjs). */
export const siteConfig: ClientConfig = config;
export type { ClientConfig };

/** Fill "{name}" tokens in owner-editable text, e.g. fmt("{service} in {location}", { service, location }). */
export function fmt(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : String(vars[k])));
}

/** Namespaced key for cookies / localStorage / sessionStorage. */
export const storageKey = (name: string, sep: "-" | "_" = "_") => `${siteConfig.storagePrefix}${sep}${name}`;
