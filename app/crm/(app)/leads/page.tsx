import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StatusBadge } from "@/components/crm/Badge";
import type { Lead, PipelineStage, Profile } from "@/lib/supabase/types";
import { applyLeadFilters, LEAD_STATUSES, SAVED_VIEWS, STATUS_LABEL_IT, tagFilterSelect } from "@/lib/crm/lead-filters";
import { TagPill } from "@/components/crm/LeadTools";
import { getCrmUser } from "@/lib/social-ai/auth";

interface SearchParams {
  q?: string;
  status?: string;
  stage?: string;
  assigned?: string;
  channel?: string;
  follow?: string;
  tag?: string;
  view?: string;
  page?: string;
}

const PAGE_SIZE = 20;

export default async function LeadsPage({
  searchParams: rawSearch,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await rawSearch;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build query with filters
  let query = supabase
    .from("leads")
    .select(
      `
      id, name, email, company, phone, status, score, source, next_action_at, created_at, updated_at,
      stage:pipeline_stages(id, name, color),
      assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, avatar_url),
      taglist:lead_tags(tag:tags(id, name, color))${tagFilterSelect(searchParams)}
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // Filtri condivisi con l'export CSV (ricerca ripulita, promemoria, canale social)
  query = applyLeadFilters(query, searchParams);

  const [leadsRes, stagesRes, currentUser, tagsRes] = await Promise.all([
    query,
    supabase.from("pipeline_stages").select("*").order("position"),
    getCrmUser(),
    supabase.from("tags").select("id, name").order("name"),
  ]);
  const tagOptions = (tagsRes.data ?? []) as { id: string; name: string }[];
  const tagsOf = (l: unknown) =>
    (((l as { taglist?: { tag: { id: string; name: string; color: string } | null }[] }).taglist) ?? [])
      .map((x) => x.tag)
      .filter((t): t is { id: string; name: string; color: string } => !!t);

  const leads = (leadsRes.data ?? []) as (Lead & {
    stage: PipelineStage | null;
    assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  })[];
  const total = leadsRes.count ?? 0;
  const stages = (stagesRes.data ?? []) as PipelineStage[];
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUSES = LEAD_STATUSES;
  const now = Date.now();
  const filterQs = new URLSearchParams(
    Object.entries(searchParams).filter(([k, v]) => k !== "page" && typeof v === "string" && v) as [string, string][]
  ).toString();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Lead</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {total} {searchParams.channel === "social" ? "contatti dai social" : searchParams.follow === "due" ? "da ricontattare" : "lead totali"}
          </p>
        </div>
        <div className="flex items-center gap-2">
        {currentUser?.role === "admin" && (
          <Link href="/crm/leads/import" className="hidden sm:inline-block text-white/50 hover:text-white text-sm px-3 py-2 border border-white/[0.08] hover:border-white/20 rounded-lg transition-colors">
            ⬆ Importa
          </Link>
        )}
        {currentUser?.role === "admin" && (
          <a
            href={`/api/crm/leads/export${filterQs ? `?${filterQs}` : ""}`}
            className="text-white/50 hover:text-white text-sm px-3 py-2 border border-white/[0.08] hover:border-white/20 rounded-lg transition-colors"
          >
            ⬇ CSV
          </a>
        )}
        <Link
          href="/crm/leads/new"
          className="bg-[#E63B2E] hover:bg-[#C44A38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nuovo lead
        </Link>
        </div>
      </div>

      {/* Viste rapide */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        {SAVED_VIEWS.map((v) => {
          const active = Object.entries(v.params).every(([k, val]) => (searchParams as Record<string, string | undefined>)[k] === val);
          return (
            <Link
              key={v.label}
              href={active ? "/crm/leads" : `/crm/leads?${new URLSearchParams(v.params)}`}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${active ? "bg-[#E63B2E]/15 border-[#E63B2E]/40 text-white" : "bg-[#141414] border-white/[0.08] text-white/55 hover:text-white"}`}
            >
              {v.label}
            </Link>
          );
        })}
      </div>

      {/* Filters bar */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        {searchParams.channel && <input type="hidden" name="channel" value={searchParams.channel} />}
        {searchParams.view && <input type="hidden" name="view" value={searchParams.view} />}
        <input
          name="q"
          type="search"
          defaultValue={searchParams.q}
          placeholder="Cerca per nome, email, azienda…"
          className="flex-1 min-w-[240px] bg-[#141414] border border-white/[0.08] rounded-lg px-3.5 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#E63B2E]/50 transition-colors"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors"
        >
          <option value="">Tutti gli stati</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL_IT[s]}
            </option>
          ))}
        </select>
        <select
          name="stage"
          defaultValue={searchParams.stage ?? ""}
          className="bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors"
        >
          <option value="">Tutti gli stage</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {tagOptions.length > 0 && (
          <select
            name="tag"
            defaultValue={searchParams.tag ?? ""}
            className="bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors"
          >
            <option value="">Tutti i tag</option>
            {tagOptions.map((t) => (
              <option key={t.id} value={t.id}>#{t.name}</option>
            ))}
          </select>
        )}
        <select
          name="follow"
          defaultValue={searchParams.follow ?? ""}
          className="bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-white/70 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors"
        >
          <option value="">Tutti i promemoria</option>
          <option value="due">Da ricontattare oggi</option>
          <option value="planned">Con promemoria</option>
          <option value="none">Senza prossima azione</option>
        </select>
        <button
          type="submit"
          className="bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Filtra
        </button>
        {(searchParams.q || searchParams.status || searchParams.stage || searchParams.channel || searchParams.follow || searchParams.tag || searchParams.view) && (
          <Link
            href="/crm/leads"
            className="text-white/30 hover:text-white/60 text-sm px-3 py-2 transition-colors"
          >
            ✕ Reset
          </Link>
        )}
      </form>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2 mb-4">
        {leads.length === 0 && (
          <p className="text-white/20 text-sm text-center py-8">Nessun lead trovato.</p>
        )}
        {leads.map((lead) => (
          <Link
            key={lead.id}
            href={`/crm/leads/${lead.id}`}
            className="flex items-center gap-3 bg-[#141414] border border-white/[0.06] rounded-xl px-4 py-3.5 active:bg-white/[0.04]"
          >
            <div className="w-9 h-9 rounded-full bg-[#E63B2E]/10 flex items-center justify-center shrink-0 text-[#E63B2E] text-sm font-bold">
              {(lead.name?.[0] ?? "?").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">{lead.name}</p>
              <p className="text-white/30 text-xs truncate">{lead.company ?? lead.email ?? lead.phone ?? lead.source}</p>
              {tagsOf(lead).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tagsOf(lead).slice(0, 3).map((t) => <TagPill key={t.id} tag={t} />)}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={lead.status} />
              {lead.next_action_at && new Date(lead.next_action_at).getTime() <= now && (
                <span className="text-[10px] font-semibold text-[#E63B2E]">⏰ da ricontattare</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Paginazione mobile */}
      {totalPages > 1 && (
        <div className="md:hidden flex items-center justify-between mb-4">
          <p className="text-white/30 text-xs">{from + 1}–{Math.min(to + 1, total)} di {total}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/crm/leads?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`} className="text-white/60 text-sm px-3 py-2 bg-white/[0.05] rounded-lg">←</Link>
            )}
            {page < totalPages && (
              <Link href={`/crm/leads?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`} className="text-white/60 text-sm px-3 py-2 bg-white/[0.05] rounded-lg">→</Link>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider hidden md:table-cell">
                Azienda
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider">
                Stato
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider hidden lg:table-cell">
                Stage
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider hidden lg:table-cell">
                Score
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider hidden xl:table-cell">
                Assegnato a
              </th>
              <th className="px-4 py-3.5 text-left text-[10px] text-white/30 font-semibold uppercase tracking-wider hidden xl:table-cell">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-white/20 text-sm">
                  Nessun lead trovato.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/crm/leads/${lead.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 text-white/40 text-xs font-semibold group-hover:bg-[#E63B2E]/10 group-hover:text-[#E63B2E] transition-colors">
                      {(lead.name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-white/30 text-xs">
                        {lead.email ?? lead.phone ?? ""}
                        {lead.next_action_at && new Date(lead.next_action_at).getTime() <= now && (
                          <span className="text-[#E63B2E] font-semibold"> · ⏰ da ricontattare</span>
                        )}
                      </p>
                      {tagsOf(lead).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tagsOf(lead).slice(0, 4).map((t) => <TagPill key={t.id} tag={t} />)}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className="text-white/50 text-sm">{lead.company ?? "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  {lead.stage ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: lead.stage.color + "22",
                        color: lead.stage.color,
                      }}
                    >
                      {lead.stage.name}
                    </span>
                  ) : (
                    <span className="text-white/20 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-1 rounded-full bg-white/10 w-16 overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full bg-[#E63B2E]"
                        style={{ width: `${lead.score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-white/30 text-xs tabular-nums">
                      {lead.score}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden xl:table-cell">
                  {lead.assigned_profile ? (
                    <span className="text-white/50 text-sm">
                      {lead.assigned_profile.full_name ?? "—"}
                    </span>
                  ) : (
                    <span className="text-white/20 text-sm">Non assegnato</span>
                  )}
                </td>
                <td className="px-4 py-3.5 hidden xl:table-cell">
                  <span className="text-white/30 text-xs">
                    {new Date(lead.created_at).toLocaleDateString("it-IT", {
                    timeZone: "Europe/Rome",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination (desktop) */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-white/30 text-xs">
              {from + 1}–{Math.min(to + 1, total)} di {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/crm/leads?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors"
                >
                  ← Precedente
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/crm/leads?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="text-white/40 hover:text-white/70 text-sm px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors"
                >
                  Successiva →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
