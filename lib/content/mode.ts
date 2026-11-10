import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Public pages are STRICT in production: if Sanity can't be reached they fail, so Next.js keeps serving
 * the last good version of the page instead of starter/demo content (U1).
 * Lead handling and /admin are LENIENT: a Sanity outage must never stop a quote being saved or
 * the owner reading leads, so they fall back to the client's starter settings.
 */
const lenient = new AsyncLocalStorage<boolean>();
export const withLenientContent = <T,>(fn: () => Promise<T>): Promise<T> => lenient.run(true, fn);
export const isLenientContent = () => lenient.getStore() === true;

/** Thrown on public pages in production when Sanity is unreachable. */
export class ContentUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Sanity is unreachable: keeping the last good version of this page (starter content is never shown in production).");
    this.name = "ContentUnavailableError";
    this.cause = cause;
  }
}
