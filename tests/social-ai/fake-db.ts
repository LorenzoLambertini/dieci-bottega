/**
 * Fake in-memory del client Supabase (sottoinsieme usato da lib/social-ai).
 * Supporta vincoli UNIQUE, default di colonna, upsert con onConflict /
 * ignoreDuplicates e iniezione di errori per i test di failure.
 */
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;

const UNIQUE: Record<string, string[][]> = {
  social_webhook_events: [["event_key"]],
  social_identities: [["platform", "platform_user_id"]],
  social_conversations: [["platform", "external_conversation_id"]],
  social_messages: [["platform", "external_message_id"]],
  social_comments: [["platform", "external_comment_id"]],
  social_accounts: [["platform", "account_id"]],
  social_account_secrets: [["account_id"]],
  tags: [["name"]],
  lead_tags: [["lead_id", "tag_id"]],
  leads: [["email"]],
  guides: [["slug"]],
  social_ai_settings: [["id"]],
};

const DEFAULTS: Record<string, () => Row> = {
  leads: () => ({ status: "new", score: 0, interests: [], notes: null, temperature: null, phone: null, company: null, website: null, metadata: null }),
  social_conversations: () => ({
    status: "open", ai_enabled: true, human_takeover: false, handoff_reason: null, lead_score: 0, temperature: "cold",
    intent: null, signals: [], unread_count: 0, last_message_at: null, last_inbound_at: null, summary: null, summarized_count: 0, account_id: null,
  }),
  social_messages: () => ({ retry_count: 0, ai_generated: false, delivery_status: "received", error: null, reply_to_comment_id: null, external_message_id: null }),
  social_comments: () => ({ retry_count: 0, response_sent: false, ai_processed: false, delivery_status: "received", error: null, external_comment_id: null }),
  social_webhook_events: () => ({ status: "received", attempts: 0, last_error: null, next_retry_at: null }),
  social_automation_rules: () => ({ run_count: 0, enabled: true, priority: 100, configuration: {}, platform: "all", guide_id: null }),
  guides: () => ({ active: true, trigger_keywords: [], platforms: ["instagram", "facebook", "linkedin", "tiktok"], description: null }),
  ai_knowledge: () => ({ active: true, position: 100 }),
  social_identities: () => ({ lead_id: null, username: null, display_name: null, avatar_url: null }),
  social_accounts: () => ({ status: "connected", scopes: [], page_id: null, webhook_status: "unknown" }),
};

export class FakeDb {
  tables = new Map<string, Row[]>();
  /** tabella → errore da restituire alla prossima insert */
  failNextInsert = new Map<string, string>();
  clock: () => Date = () => new Date();

  t(name: string): Row[] {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name)!;
  }

  seed(table: string, row: Row): Row {
    const full = { id: randomUUID(), created_at: this.clock().toISOString(), ...(DEFAULTS[table]?.() ?? {}), ...row };
    this.t(table).push(full);
    return full;
  }

  rows(table: string, where: Row = {}): Row[] {
    return this.t(table).filter((r) => Object.entries(where).every(([k, v]) => r[k] === v));
  }

  conflict(table: string, row: Row, ignoreId?: unknown): Row | null {
    for (const cols of UNIQUE[table] ?? []) {
      if (cols.some((c) => row[c] === null || row[c] === undefined)) continue;
      const hit = this.t(table).find((r) => r.id !== ignoreId && cols.every((c) => r[c] === row[c]));
      if (hit) return hit;
    }
    return null;
  }

  client(): SupabaseClient {
    return { from: (table: string) => new Query(this, table) } as unknown as SupabaseClient;
  }
}

type Filter = (r: Row) => boolean;

class Query implements PromiseLike<{ data: unknown; error: { message: string; code?: string } | null; count?: number | null }> {
  private filters: Filter[] = [];
  private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private payload: Row[] = [];
  private patch: Row = {};
  private upsertOpts: { onConflict?: string; ignoreDuplicates?: boolean } = {};
  private returning = false;
  private orderBy: { col: string; asc: boolean }[] = [];
  private lim: number | null = null;
  private offset = 0;
  private mode: "many" | "single" | "maybe" = "many";
  private countMode = false;
  private head = false;

  constructor(private db: FakeDb, private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === "select") this.op = "select";
    else this.returning = true;
    if (opts?.count) this.countMode = true;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(v: Row | Row[]) {
    this.op = "insert";
    this.payload = Array.isArray(v) ? v : [v];
    return this;
  }
  upsert(v: Row | Row[], opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
    this.op = "upsert";
    this.payload = Array.isArray(v) ? v : [v];
    this.upsertOpts = opts;
    return this;
  }
  update(p: Row) {
    this.op = "update";
    this.patch = p;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(c: string, v: unknown) { this.filters.push((r) => r[c] === v); return this; }
  neq(c: string, v: unknown) { this.filters.push((r) => r[c] !== v); return this; }
  gt(c: string, v: never) { this.filters.push((r) => (r[c] as never) > v); return this; }
  gte(c: string, v: never) { this.filters.push((r) => (r[c] as never) >= v); return this; }
  lt(c: string, v: never) { this.filters.push((r) => (r[c] as never) < v); return this; }
  lte(c: string, v: never) { this.filters.push((r) => r[c] != null && (r[c] as never) <= v); return this; }
  in(c: string, vs: unknown[]) { this.filters.push((r) => vs.includes(r[c])); return this; }
  is(c: string, v: unknown) { this.filters.push((r) => (r[c] ?? null) === v); return this; }
  or() { return this; }
  order(col: string, o: { ascending?: boolean } = {}) { this.orderBy.push({ col, asc: o.ascending !== false }); return this; }
  limit(n: number) { this.lim = n; return this; }
  range(a: number, b: number) { this.offset = a; this.lim = b - a + 1; return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }

  private matches(): Row[] {
    return this.db.t(this.table).filter((r) => this.filters.every((f) => f(r)));
  }

  private shape(rows: Row[]) {
    let out = [...rows];
    for (const o of [...this.orderBy].reverse()) {
      out.sort((a, b) => {
        const x = a[o.col] as never, y = b[o.col] as never;
        if (x === y) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x < y ? -1 : 1) * (o.asc ? 1 : -1);
      });
    }
    const total = out.length;
    out = out.slice(this.offset, this.lim != null ? this.offset + this.lim : undefined);
    const clone = out.map((r) => structuredClone(r));
    if (this.mode === "single") {
      if (clone.length !== 1) return { data: null, error: { message: `expected 1 row, got ${clone.length}`, code: "PGRST116" }, count: total };
      return { data: clone[0], error: null, count: total };
    }
    if (this.mode === "maybe") return { data: clone[0] ?? null, error: null, count: total };
    return { data: this.head ? null : clone, error: null, count: this.countMode ? total : null };
  }

  private exec() {
    const db = this.db;
    const now = db.clock().toISOString();
    if (this.op === "select") return this.shape(this.matches());

    if (this.op === "insert") {
      const failure = db.failNextInsert.get(this.table);
      if (failure) {
        db.failNextInsert.delete(this.table);
        return { data: null, error: { message: failure } };
      }
      const inserted: Row[] = [];
      for (const p of this.payload) {
        const row = { id: randomUUID(), created_at: now, ...(DEFAULTS[this.table]?.() ?? {}), ...p };
        if (db.conflict(this.table, row)) return { data: null, error: { message: "duplicate key value violates unique constraint", code: "23505" } };
        db.t(this.table).push(row);
        inserted.push(row);
      }
      return this.returning ? this.shapeReturn(inserted) : { data: null, error: null };
    }

    if (this.op === "upsert") {
      const out: Row[] = [];
      for (const p of this.payload) {
        const cols = this.upsertOpts.onConflict?.split(",").map((s) => s.trim());
        const existing = cols
          ? db.t(this.table).find((r) => cols.every((c) => r[c] === p[c]))
          : db.conflict(this.table, p);
        if (existing) {
          if (this.upsertOpts.ignoreDuplicates) continue;
          Object.assign(existing, p);
          out.push(existing);
        } else {
          const row = { id: randomUUID(), created_at: now, ...(DEFAULTS[this.table]?.() ?? {}), ...p };
          db.t(this.table).push(row);
          out.push(row);
        }
      }
      return this.returning ? this.shapeReturn(out) : { data: null, error: null };
    }

    if (this.op === "update") {
      const rows = this.matches();
      for (const r of rows) Object.assign(r, this.patch);
      return this.returning ? this.shapeReturn(rows) : { data: null, error: null };
    }

    // delete
    const rows = this.matches();
    db.tables.set(this.table, db.t(this.table).filter((r) => !rows.includes(r)));
    return { data: null, error: null };
  }

  private shapeReturn(rows: Row[]) {
    const clone = rows.map((r) => structuredClone(r));
    if (this.mode === "single") return clone.length === 1 ? { data: clone[0], error: null } : { data: null, error: { message: "expected 1 row" } };
    if (this.mode === "maybe") return { data: clone[0] ?? null, error: null };
    return { data: clone, error: null };
  }

  then<A, B>(onF?: ((v: { data: unknown; error: { message: string; code?: string } | null; count?: number | null }) => A | PromiseLike<A>) | null, onR?: ((e: unknown) => B | PromiseLike<B>) | null) {
    try {
      return Promise.resolve(this.exec()).then(onF, onR);
    } catch (e) {
      return Promise.reject(e).then(onF, onR);
    }
  }
}
