import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isTestMode, requireEnv } from './env';

export type ApplicationRow = {
  kind: 'work_in' | 'work_with' | 'back';
  role: string | null;
  about: Record<string, unknown>;
  details: Record<string, unknown>;
  answers: Record<string, unknown>;
  resume_path: string | null;
  consent_at: string;
  source_query: string | null;
  is_test: boolean;
};

export type StoredObject = { name: string; createdAt: string };

export interface Store {
  countEvents(ipHash: string, sinceIso: string): Promise<number>;
  addEvent(ipHash: string): Promise<void>;
  insertApplication(row: ApplicationRow): Promise<string>;
  createUploadUrl(bucket: string, path: string): Promise<string>;
  getObject(bucket: string, path: string): Promise<Uint8Array | null>;
  removeObjects(bucket: string, paths: string[]): Promise<void>;
  listObjects(bucket: string): Promise<StoredObject[]>;
}

let client: SupabaseClient | null = null;
const db = () =>
  (client ??= createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  }));

export const supabaseStore: Store = {
  async countEvents(ipHash, sinceIso) {
    const { count, error } = await db()
      .from('submission_events')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', sinceIso);
    if (error) throw new Error('rate count failed');
    return count ?? 0;
  },
  async addEvent(ipHash) {
    const { error } = await db().from('submission_events').insert({ ip_hash: ipHash });
    if (error) throw new Error('rate insert failed');
  },
  async insertApplication(row) {
    const { data, error } = await db().from('applications').insert(row).select('id').single();
    if (error || !data) throw new Error('insert failed');
    return data.id as string;
  },
  async createUploadUrl(bucket, path) {
    const { data, error } = await db().storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) throw new Error('upload url failed');
    return data.signedUrl;
  },
  async getObject(bucket, path) {
    const { data, error } = await db().storage.from(bucket).download(path);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  },
  async removeObjects(bucket, paths) {
    if (!paths.length) return;
    const { error } = await db().storage.from(bucket).remove(paths);
    if (error) throw new Error('remove failed');
  },
  async listObjects(bucket) {
    const out: StoredObject[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db().storage.from(bucket).list('', { limit: 1000, offset, sortBy: { column: 'created_at', order: 'asc' } });
      if (error) throw new Error('list failed');
      out.push(...(data ?? []).filter((o) => o.id).map((o) => ({ name: o.name, createdAt: o.created_at ?? new Date(0).toISOString() })));
      if (!data || data.length < 1000) return out;
    }
  },
};

/** In-memory stand-in for local tests. Lives on globalThis so every route in the process shares it. */
type Memory = {
  events: { ipHash: string; at: string }[];
  applications: (ApplicationRow & { id: string; created_at: string })[];
  objects: Map<string, { bytes: Uint8Array; createdAt: string }>;
  emails: { subject: string; text: string }[];
};
const g = globalThis as unknown as { __homMemory?: Memory };
export const memory = (): Memory => (g.__homMemory ??= { events: [], applications: [], objects: new Map(), emails: [] });

export const memoryStore: Store = {
  async countEvents(ipHash, sinceIso) {
    return memory().events.filter((e) => e.ipHash === ipHash && e.at >= sinceIso).length;
  },
  async addEvent(ipHash) {
    memory().events.push({ ipHash, at: new Date().toISOString() });
  },
  async insertApplication(row) {
    const id = crypto.randomUUID();
    memory().applications.push({ ...row, id, created_at: new Date().toISOString() });
    return id;
  },
  async createUploadUrl(bucket, path) {
    return `/api/test-upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;
  },
  async getObject(bucket, path) {
    return memory().objects.get(`${bucket}/${path}`)?.bytes ?? null;
  },
  async removeObjects(bucket, paths) {
    for (const p of paths) memory().objects.delete(`${bucket}/${p}`);
  },
  async listObjects(bucket) {
    return [...memory().objects.entries()]
      .filter(([k]) => k.startsWith(`${bucket}/`))
      .map(([k, v]) => ({ name: k.slice(bucket.length + 1), createdAt: v.createdAt }));
  },
};

export const store = (): Store => (isTestMode ? memoryStore : supabaseStore);
export const supabaseAdmin = db;
