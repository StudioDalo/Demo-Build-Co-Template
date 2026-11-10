import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ATTRIBUTION_KEYS, type Attribution, type Lead, type LeadFilter } from "./types";
import { localDataDir } from "@/lib/data-dir";
import { isProductionRuntime, testFallbacksAllowed } from "@/lib/runtime";

export interface LeadStore {
  create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<Lead>;
  update(id: string, patch: Partial<Omit<Lead, "id" | "createdAt">>): Promise<Lead | null>;
  get(id: string): Promise<Lead | null>;
  list(filter?: LeadFilter): Promise<Lead[]>;
  /** Permanently delete leads (data retention). Returns how many were deleted. */
  remove(ids: string[]): Promise<number>;
}

export interface UploadStore {
  save(file: { bytes: Uint8Array; name: string; type: string }): Promise<string>;
  /** URL the admin can open. Local: proxied route. Supabase: short-lived signed URL. */
  url(storedPath: string): Promise<string>;
  read?(storedPath: string): Promise<{ bytes: Uint8Array; type: string } | null>;
  /** Permanently delete uploaded files */
  remove(storedPaths: string[]): Promise<void>;
}

const DATA_DIR = localDataDir();

function matches(l: Lead, f: LeadFilter = {}) {
  if (f.status && l.status !== f.status) return false;
  if (f.score && l.score !== f.score) return false;
  if (f.type && l.type !== f.type) return false;
  if (f.complete !== undefined && l.complete !== f.complete) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    if (![l.name, l.phone, l.email, l.postcode].some((v) => v?.toLowerCase().includes(q))) return false;
  }
  return true;
}

/* ---------------- Local JSON file (development / no Supabase) ---------------- */

let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
};

export class FileLeadStore implements LeadStore {
  private file = path.join(DATA_DIR, "leads.json");
  private async readAll(): Promise<Lead[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8")) as Lead[];
    } catch {
      return [];
    }
  }
  private async writeAll(leads: Lead[]) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = this.file + "." + process.pid + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(leads, null, 2));
    await fs.rename(tmp, this.file);
  }
  create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
    return serial(async () => {
      const now = new Date().toISOString();
      const full: Lead = { ...lead, id: randomUUID(), createdAt: now, updatedAt: now };
      const all = await this.readAll();
      all.push(full);
      await this.writeAll(all);
      return full;
    });
  }
  update(id: string, patch: Partial<Lead>) {
    return serial(async () => {
      const all = await this.readAll();
      const i = all.findIndex((l) => l.id === id);
      if (i < 0) return null;
      all[i] = { ...all[i], ...patch, id, updatedAt: new Date().toISOString() };
      await this.writeAll(all);
      return all[i];
    });
  }
  async get(id: string) {
    return (await this.readAll()).find((l) => l.id === id) ?? null;
  }
  async list(filter?: LeadFilter) {
    return (await this.readAll()).filter((l) => matches(l, filter)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  remove(ids: string[]) {
    return serial(async () => {
      const drop = new Set(ids);
      const all = await this.readAll();
      const kept = all.filter((l) => !drop.has(l.id));
      if (kept.length !== all.length) await this.writeAll(kept);
      return all.length - kept.length;
    });
  }
}

export class FileUploadStore implements UploadStore {
  private dir = path.join(DATA_DIR, "uploads");
  async save(file: { bytes: Uint8Array; name: string; type: string }) {
    await fs.mkdir(this.dir, { recursive: true });
    const ext = safeExt(file.name);
    const stored = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;
    await fs.mkdir(path.join(this.dir, path.dirname(stored)), { recursive: true });
    await fs.writeFile(path.join(this.dir, stored), file.bytes);
    await fs.writeFile(path.join(this.dir, stored + ".type"), file.type);
    return stored;
  }
  async url(storedPath: string) {
    return `/api/admin/uploads/${storedPath}`;
  }
  async remove(storedPaths: string[]) {
    for (const p of storedPaths) {
      const full = path.resolve(this.dir, p);
      if (!full.startsWith(path.resolve(this.dir) + path.sep)) continue;
      await fs.rm(full, { force: true });
      await fs.rm(full + ".type", { force: true });
    }
  }
  async read(storedPath: string) {
    const full = path.resolve(this.dir, storedPath);
    if (!full.startsWith(path.resolve(this.dir) + path.sep)) return null; // path traversal guard
    try {
      const [bytes, type] = await Promise.all([fs.readFile(full), fs.readFile(full + ".type", "utf8").catch(() => "application/octet-stream")]);
      return { bytes: new Uint8Array(bytes), type };
    } catch {
      return null;
    }
  }
}

function safeExt(name: string) {
  const m = /\.([a-z0-9]{1,5})$/i.exec(name);
  return m ? "." + m[1].toLowerCase() : "";
}

/* ---------------- Supabase ---------------- */

type Row = {
  id: string; created_at: string; updated_at: string; type: Lead["type"]; complete: boolean; status: Lead["status"];
  score: Lead["score"]; score_points: number | null; name: string; phone: string; email: string | null; postcode: string | null;
  services: string[]; answers: Record<string, unknown>; uploads: Lead["uploads"]; notes: Lead["notes"];
  source: Lead["source"]; consent: boolean; token_hash: string;
  won_value: number | string | null; won_at: string | null;
} & { [K in (typeof ATTRIBUTION_KEYS)[number]]?: string | null };

const toLead = (r: Row): Lead => ({
  id: r.id, createdAt: r.created_at, updatedAt: r.updated_at, type: r.type, complete: r.complete, status: r.status,
  score: r.score, scorePoints: r.score_points, name: r.name, phone: r.phone, email: r.email ?? "", postcode: r.postcode ?? "",
  services: r.services ?? [], answers: r.answers ?? {}, uploads: r.uploads ?? [], notes: r.notes ?? [], source: r.source ?? {},
  consent: r.consent, tokenHash: r.token_hash,
  wonValue: r.won_value === null || r.won_value === undefined ? null : Number(r.won_value),
  wonAt: r.won_at ?? null,
  attribution: Object.fromEntries(ATTRIBUTION_KEYS.filter((k) => r[k]).map((k) => [k, String(r[k])])) as Attribution,
});

function toRow(l: Partial<Lead>): Partial<Row> {
  const map: Record<string, keyof Row> = {
    type: "type", complete: "complete", status: "status", score: "score", scorePoints: "score_points", name: "name", phone: "phone",
    email: "email", postcode: "postcode", services: "services", answers: "answers", uploads: "uploads", notes: "notes",
    source: "source", consent: "consent", tokenHash: "token_hash",
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(l)) if (map[k] && v !== undefined) out[map[k]] = v;
  if (l.wonValue !== undefined) out.won_value = l.wonValue;
  if (l.wonAt !== undefined) out.won_at = l.wonAt;
  if (l.attribution) for (const k of ATTRIBUTION_KEYS) if (l.attribution[k] !== undefined) out[k] = l.attribution[k];
  return out as Partial<Row>;
}

export class SupabaseLeadStore implements LeadStore {
  constructor(private db: SupabaseClient) {}
  async create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">) {
    const { data, error } = await this.db.from("leads").insert(toRow(lead)).select().single();
    if (error) throw error;
    return toLead(data as Row);
  }
  async update(id: string, patch: Partial<Lead>) {
    const { data, error } = await this.db.from("leads").update({ ...toRow(patch), updated_at: new Date().toISOString() }).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? toLead(data as Row) : null;
  }
  async get(id: string) {
    const { data, error } = await this.db.from("leads").select().eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toLead(data as Row) : null;
  }
  async list(filter: LeadFilter = {}) {
    let query = this.db.from("leads").select().order("created_at", { ascending: false }).limit(1000);
    if (filter.status) query = query.eq("status", filter.status);
    if (filter.score) query = query.eq("score", filter.score);
    if (filter.type) query = query.eq("type", filter.type);
    if (filter.complete !== undefined) query = query.eq("complete", filter.complete);
    const { data, error } = await query;
    if (error) throw error;
    return (data as Row[]).map(toLead).filter((l) => matches(l, { q: filter.q }));
  }
  async remove(ids: string[]) {
    if (!ids.length) return 0;
    const { data, error } = await this.db.from("leads").delete().in("id", ids).select("id");
    if (error) throw error;
    return data?.length ?? 0;
  }
}

export class SupabaseUploadStore implements UploadStore {
  constructor(private db: SupabaseClient, private bucket = "lead-uploads") {}
  async save(file: { bytes: Uint8Array; name: string; type: string }) {
    const stored = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${safeExt(file.name)}`;
    const { error } = await this.db.storage.from(this.bucket).upload(stored, file.bytes, { contentType: file.type, upsert: false });
    if (error) throw error;
    return stored;
  }
  async remove(storedPaths: string[]) {
    if (!storedPaths.length) return;
    const { error } = await this.db.storage.from(this.bucket).remove(storedPaths);
    if (error) throw error;
  }
  async url(storedPath: string) {
    const { data, error } = await this.db.storage.from(this.bucket).createSignedUrl(storedPath, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
}

/* ---------------- Factory ---------------- */

/** Thrown when a deployed site has no Supabase keys: leads must never be silently written somewhere temporary. */
export class StorageNotConfiguredError extends Error {
  constructor() {
    const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !process.env[k]);
    // Names only, never values
    super(`Lead storage is not configured on this deployment (${process.env.VERCEL_ENV ?? "unknown"} environment). Missing: ${missing.join(", ")}`);
    this.name = "StorageNotConfiguredError";
  }
}

let cached: { leads: LeadStore; uploads: UploadStore; backend: "supabase" | "file" } | null = null;

/**
 * Supabase whenever keys are set (server-side service role key, never NEXT_PUBLIC_).
 * The local JSON file is a development/test convenience only: on any Vercel deployment
 * it is refused, because Vercel's disk is temporary and enquiries would be lost.
 */
export function getStores() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    cached = { leads: new SupabaseLeadStore(db), uploads: new SupabaseUploadStore(db), backend: "supabase" };
  } else if (process.env.VERCEL || (isProductionRuntime() && !testFallbacksAllowed())) {
    // Never store leads on a server's own disk in production (or on Vercel, where it's temporary)
    throw new StorageNotConfiguredError();
  } else {
    cached = { leads: new FileLeadStore(), uploads: new FileUploadStore(), backend: "file" };
  }
  return cached;
}

/** For pages that should render a notice rather than crash when storage isn't connected. */
export function tryGetStores() {
  try {
    return getStores();
  } catch (e) {
    if (e instanceof StorageNotConfiguredError) return null;
    throw e;
  }
}
