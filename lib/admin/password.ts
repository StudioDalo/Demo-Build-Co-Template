/** Admin password rules (pure, shared by the login code and the startup check). */
export const MIN_ADMIN_PASSWORD = 12;
const WEAK = ["password", "password123", "admin", "admin123", "changeme", "letmein", "preview-password-123", "123456789012", "qwertyuiop12"];

/** Too short, a common password, or the business name. */
export function isWeakAdminPassword(pw: string | undefined, businessName = ""): boolean {
  const p = (pw ?? "").toLowerCase();
  const name = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return p.length < MIN_ADMIN_PASSWORD || WEAK.includes(p) || (name.length > 0 && p.replace(/[^a-z0-9]/g, "") === name);
}
