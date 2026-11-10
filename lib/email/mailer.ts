import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import { localDataDir } from "@/lib/data-dir";
import { siteConfig } from "@/config";
import { isProductionRuntime, testFallbacksAllowed } from "@/lib/runtime";

export type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

export interface Mailer {
  send(email: Email): Promise<{ id: string | null }>;
}

const FROM = () => process.env.EMAIL_FROM || siteConfig.devEmailFrom;

class ResendMailer implements Mailer {
  private client: Resend;
  constructor(key: string) {
    this.client = new Resend(key);
  }
  async send(e: Email) {
    const { data, error } = await this.client.emails.send({ from: FROM(), to: e.to, subject: e.subject, html: e.html, text: e.text, replyTo: e.replyTo });
    if (error) throw new Error(`Resend: ${error.message}`);
    return { id: data?.id ?? null };
  }
}

/** Without RESEND_API_KEY, emails are written to .data/outbox.json so they can be inspected and tested. */
class OutboxMailer implements Mailer {
  private queue: Promise<unknown> = Promise.resolve();
  private file = path.join(localDataDir(), "outbox.json");
  send(e: Email) {
    // Serialise writes so concurrent sends (owner + customer) never overwrite each other
    const run = this.queue.then(() => this.write(e));
    this.queue = run.catch(() => undefined);
    return run;
  }
  private async write(e: Email) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    let all: unknown[] = [];
    try {
      all = JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {}
    all.push({ ...e, from: FROM(), at: new Date().toISOString() });
    await fs.writeFile(this.file, JSON.stringify(all, null, 2));
    console.info(`[email:outbox] ${e.subject} → ${e.to}`);
    return { id: null };
  }
}

/** Deployed without RESEND_API_KEY: the lead is still saved; the email is skipped loudly in the logs. */
class MissingMailer implements Mailer {
  async send(e: Email) {
    console.error(`[email] NOT SENT (RESEND_API_KEY missing): ${e.subject} → ${e.to}`);
    return { id: null };
  }
}

let mailer: Mailer | null = null;
export function getMailer(): Mailer {
  if (!mailer) {
    if (process.env.RESEND_API_KEY) mailer = new ResendMailer(process.env.RESEND_API_KEY);
    else if (process.env.VERCEL || (isProductionRuntime() && !testFallbacksAllowed())) mailer = new MissingMailer();
    else mailer = new OutboxMailer();
  }
  return mailer;
}
