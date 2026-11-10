/**
 * ENTRY POINT (required). scripts/select-client.mjs checks this file exists, then points
 * packs/active/pack.ts at it. Keep it free of page content: it's imported by the browser,
 * the server and Sanity Studio.
 */
export { meta } from "./meta";
export { icons, fallbackIcon } from "./icons";
export { emailCopy } from "./email";
