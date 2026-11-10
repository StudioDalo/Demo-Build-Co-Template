import path from "node:path";
import { siteConfig } from "@/config";

/**
 * Where the local fallbacks (leads, uploads, email outbox) write when Supabase/Resend aren't configured.
 * On Vercel only /tmp is writable, and it is temporary per server instance: fine for a preview, not for production.
 */
export const localDataDir = () =>
  process.env.LOCAL_DATA_DIR || (process.env.VERCEL ? `/tmp/${siteConfig.storagePrefix}-data` : path.join(process.cwd(), ".data"));
