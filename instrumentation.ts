/** Runs once when a server instance starts: refuse to serve production with missing or unsafe settings. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { enforceSettings } = await import("./lib/env-check");
  enforceSettings("server");
}
