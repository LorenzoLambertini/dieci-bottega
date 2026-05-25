import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StatusBadge } from "@/components/crm/Badge";
import type { Lead, PipelineStage, Profile } from "@/lib/supabase/types";

interface SearchParams {
  q?: string;
  status?: string;
  stage?: string;
  assigned?: string;
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
      id, name, email, company, phone, status, score, created_at, updated_at,
      stage:pipeline_stages(id, name, color),
      assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.or(
      `name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%,company.ilike.%${searchParams.q}%`
    );
  }
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.stage) {
    query = query.eq("stage_id", searchParams.stage);
  }
  if (searchParams.assigned) {
    query = query.eq("assigned_to", searchParams.assigned);
  }

  const [leadsRes, stagesRes] = await Promise.all([
    query,
    supabase.from("pipeline_stages").select("*").order("position"),
  ]);

  const leads = (leadsRes.data ?? []) as (Lead & {
    stage: PipelineStage | null;
    assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  })[];
  const total = leadsRes.count ?? 0;
  const stages = (stagesRes.data ?? []) as PipelineStage[];
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Lead</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {total} lead totali
          </p>
        </div>
        <Link
          href="/crm/leads/new"
          className="bg-[#E63B2E] hover:bg-[#C44A38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nuovo lead
        </Link>
      </div>

      {/* Filters bar */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
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
              {s.charAt(0).toUpperCase() + s.slice(1)}
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
        <button
          type="submit"
          className="bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Filtra
        </button>
        {(searchParams.q || searchParams.status || searchParams.stage) && (
          <Link
            href="/crm/leads"
            className="text-white/30 hover:text-white/60 text-sm px-3 py-2 transition-colors"
          >
            ✕ Reset
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
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
                      <p className="text-white/30 text-xs">{lead.email}</p>
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

        {/* Pagination */}
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
