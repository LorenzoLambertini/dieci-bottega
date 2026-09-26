import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { Card, fmtDate, isMissingTable, MigrationNotice, PageHeader, Pill, PlatformBadge, SocialTabs } from "@/components/crm/social/ui";

export const dynamic = "force-dynamic";

const PAGE = 50;

interface LogRow {
  id: string;
  created_at: string;
  platform: string | null;
  action_type: string;
  actor: string;
  summary: string | null;
  status: string;
  error: string | null;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  conversation_id: string | null;
  contact: { name: string } | null;
}

export default async function AiLogsPage({ searchParams }: { searchParams: Promise<{ actor?: string; status?: string; platform?: string; page?: string }> }) {
  const sp = await searchParams;
  const supabase = await createSocialClient();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  let q = supabase
    .from("ai_actions")
    .select("id, created_at, platform, action_type, actor, summary, status, error, input, output, conversation_id, contact:leads(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (sp.actor) q = q.eq("actor", sp.actor);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.platform) q = q.eq("platform", sp.platform);

  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [{ data, count, error }, { data: runs }, { data: events }] = await Promise.all([
    q,
    supabase.from("ai_runs").select("model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, latency_ms, error").gte("created_at", since),
    supabase.from("social_webhook_events").select("id, platform, event_type, status, attempts, last_error, received_at").in("status", ["failed", "dead"]).order("received_at", { ascending: false }).limit(10),
  ]);
  const rows = (data ?? []) as unknown as LogRow[];
  const runList = (runs ?? []) as { model: string; input_tokens: number; output_tokens: number; cache_read_tokens: number; cache_write_tokens: number; latency_ms: number; error: string | null }[];
  const byModel = new Map<string, { n: number; in: number; out: number; cr: number; cw: number; lat: number; err: number }>();
  for (const r of runList) {
    const m = byModel.get(r.model) ?? { n: 0, in: 0, out: 0, cr: 0, cw: 0, lat: 0, err: 0 };
    m.n++; m.in += r.input_tokens; m.out += r.output_tokens; m.cr += r.cache_read_tokens; m.cw += r.cache_write_tokens; m.lat += r.latency_ms; if (r.error) m.err++;
    byModel.set(r.model, m);
  }
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/crm/social/logs?${p}`;
  };
  const totalPages = Math.ceil((count ?? 0) / PAGE);

  return (
    <div>
      <PageHeader title="AI Logs" subtitle="Audit log di ogni azione AI, regola, sistema e operatore." />
      <SocialTabs active="/crm/social/logs" />
      {isMissingTable(error) && <MigrationNotice error={error!.message} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card title="Consumo Claude · 30 giorni">
          <div className="divide-y divide-white/[0.04]">
            {byModel.size === 0 && <p className="px-5 py-6 text-white/20 text-sm text-center">Nessuna chiamata.</p>}
            {[...byModel.entries()].map(([model, m]) => (
              <div key={model} className="px-5 py-3 text-xs text-white/50">
                <p className="text-white/80 text-sm font-mono">{model}</p>
                {m.n} chiamate · {m.in.toLocaleString("it-IT")} token input · {m.out.toLocaleString("it-IT")} output · cache {m.cr.toLocaleString("it-IT")} letti / {m.cw.toLocaleString("it-IT")} scritti · latenza media {Math.round(m.lat / m.n)} ms{m.err ? ` · ${m.err} errori` : ""}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Eventi webhook falliti">
          <div className="divide-y divide-white/[0.04]">
            {(events ?? []).length === 0 && <p className="px-5 py-6 text-white/20 text-sm text-center">Nessun evento fallito.</p>}
            {((events ?? []) as { id: string; platform: string; event_type: string; status: string; attempts: number; last_error: string | null; received_at: string }[]).map((e) => (
              <div key={e.id} className="px-5 py-2.5 flex items-start gap-3">
                <PlatformBadge platform={e.platform} />
                <div className="min-w-0 flex-1">
                  <p className="text-white/60 text-xs">{e.event_type} · {e.attempts} tentativi · {fmtDate(e.received_at)}</p>
                  <p className="text-[#E63B2E]/70 text-[11px] truncate" title={e.last_error ?? ""}>{e.last_error}</p>
                </div>
                <Pill tone={e.status === "dead" ? "red" : "yellow"}>{e.status}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {[undefined, "ai", "rule", "human", "system"].map((a) => (
          <Link key={a ?? "all"} href={qs({ actor: a, page: undefined })} className={`px-3 py-1.5 rounded-full border ${sp.actor === a ? "bg-[#E63B2E] border-[#E63B2E] text-white" : "border-white/[0.08] text-white/40 hover:text-white/70"}`}>
            {a ?? "Tutti"}
          </Link>
        ))}
        <span className="w-px bg-white/10 mx-1" />
        {["success", "error", "skipped"].map((st) => (
          <Link key={st} href={qs({ status: sp.status === st ? undefined : st, page: undefined })} className={`px-3 py-1.5 rounded-full border ${sp.status === st ? "bg-white/[0.1] border-white/20 text-white" : "border-white/[0.08] text-white/40 hover:text-white/70"}`}>
            {st}
          </Link>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-white/[0.04]">
          {rows.length === 0 && <p className="px-5 py-12 text-center text-white/20 text-sm">Nessun log.</p>}
          {rows.map((r) => {
            const guide = (r.input as { guide?: string } | null)?.guide;
            return (
              <details key={r.id} className="group">
                <summary className="px-5 py-3 flex items-start gap-3 cursor-pointer list-none hover:bg-white/[0.02]">
                  <span className="text-white/30 text-xs tabular-nums w-28 shrink-0">{fmtDate(r.created_at)}</span>
                  <span className="w-8 shrink-0">{r.platform ? <PlatformBadge platform={r.platform} /> : null}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/75 text-sm">{r.summary ?? r.action_type}</p>
                    <p className="text-white/30 text-xs">
                      {r.contact?.name ?? "—"} · <span className="font-mono">{r.action_type}</span>{guide ? ` · guida ${guide}` : ""} · {r.actor}
                    </p>
                  </div>
                  <Pill tone={r.status === "success" ? "green" : r.status === "error" ? "red" : "gray"}>{r.status}</Pill>
                </summary>
                <div className="px-5 pb-4 pl-[10.5rem] space-y-2">
                  {r.error && <p className="text-[#E63B2E] text-xs">Errore: {r.error}</p>}
                  {r.conversation_id && <Link href={`/crm/social/inbox?c=${r.conversation_id}`} className="text-xs text-white/40 underline">Apri conversazione</Link>}
                  {r.input && <pre className="text-[11px] text-white/40 bg-black/30 rounded p-2 overflow-auto max-h-48">Input: {JSON.stringify(r.input, null, 2)}</pre>}
                  {r.output && <pre className="text-[11px] text-white/40 bg-black/30 rounded p-2 overflow-auto max-h-48">Output: {JSON.stringify(r.output, null, 2)}</pre>}
                </div>
              </details>
            );
          })}
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          {page > 1 && <Link href={qs({ page: String(page - 1) })} className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] rounded-lg">← Precedente</Link>}
          {page < totalPages && <Link href={qs({ page: String(page + 1) })} className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] rounded-lg">Successiva →</Link>}
        </div>
      )}
    </div>
  );
}
