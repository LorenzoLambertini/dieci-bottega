import { createClient } from "@/lib/supabase/server";
import { createSocialClient } from "@/lib/social-ai/db";
import { getCrmUser } from "@/lib/social-ai/auth";
import type { Workflow } from "@/lib/supabase/types";
import { AutomationDelete, AutomationToggle, NewAutomationForm } from "@/components/crm/Automations";
import { STATUS_LABEL_IT } from "@/lib/crm/lead-filters";

export const dynamic = "force-dynamic";

const TRIGGER_LABEL: Record<string, string> = {
  lead_created: "Lead creato",
  stage_changed: "Stage cambiato",
  tag_added: "Tag aggiunto",
};

const ACTION_LABEL: Record<string, string> = {
  send_email: "✉️ Invia email",
  assign_to: "👤 Assegna a",
  add_tag: "🏷 Aggiungi tag",
  set_score: "🎯 Punteggio",
  webhook: "🔗 Webhook",
};

interface CrmAutomation {
  id: string;
  name: string;
  trigger: string;
  conditions: { status?: string; stage_name?: string; source_in?: string[] };
  action: { type: string; days?: number; note?: string; tag?: string; user_id?: string };
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
}

function describe(a: CrmAutomation): string {
  const when =
    a.trigger === "lead_created"
      ? `Nuovo contatto${a.conditions.source_in?.length ? ` da ${a.conditions.source_in.join(", ")}` : ""}`
      : a.trigger === "status_changed"
        ? `Stato → ${STATUS_LABEL_IT[a.conditions.status ?? ""] ?? a.conditions.status}`
        : `Stage → ${a.conditions.stage_name}`;
  const then =
    a.action.type === "follow_up"
      ? `promemoria tra ${a.action.days} giorn${a.action.days === 1 ? "o" : "i"} alle 9 (“${a.action.note}”)`
      : a.action.type === "add_tag"
        ? `tag #${a.action.tag}`
        : a.action.type === "create_project"
          ? "crea il progetto"
          : a.action.type === "assign"
            ? "assegna a una persona"
            : a.action.type;
  return `${when} → ${then}`;
}

export default async function AutomationsPage() {
  const supabase = await createClient();
  const sdb = await createSocialClient();
  const [{ data: workflows }, autoRes, stagesRes, user, peopleRes] = await Promise.all([
    supabase.from("workflows").select("*").order("created_at", { ascending: false }),
    sdb.from("crm_automations").select("*").order("created_at"),
    sdb.from("pipeline_stages").select("name").order("position"),
    getCrmUser(),
    sdb.from("profiles").select("id, full_name, email").order("full_name"),
  ]);
  const people = ((peopleRes.data ?? []) as { id: string; full_name: string | null; email: string }[]).map((p) => ({ id: p.id, name: p.full_name ?? p.email }));
  const wfs = (workflows ?? []) as Workflow[];
  const autos = (autoRes.data ?? []) as CrmAutomation[];
  const stages = ((stagesRes.data ?? []) as { name: string }[]).map((s) => s.name);
  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold">Automazioni</h1>
        <p className="text-white/40 text-sm mt-0.5">Regole che lavorano da sole su ogni contatto, da qualsiasi canale arrivi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {autos.length === 0 && <p className="text-white/30 text-sm">Nessuna automazione.</p>}
          {autos.map((a) => (
            <div key={a.id} className="bg-[#141414] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white/85 text-sm font-medium">{a.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{describe(a)}</p>
                <p className="text-white/25 text-[11px] mt-1">
                  {a.run_count} esecuzion{a.run_count === 1 ? "e" : "i"}
                  {a.last_run_at ? ` · ultima ${new Date(a.last_run_at).toLocaleString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
                  {isAdmin && <> · <AutomationDelete id={a.id} /></>}
                </p>
              </div>
              {isAdmin && <AutomationToggle id={a.id} active={a.is_active} />}
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">{isAdmin ? <NewAutomationForm stages={stages} people={people} /> : <p className="text-white/30 text-sm">Solo gli admin possono creare automazioni.</p>}</div>
      </div>

      {wfs.length > 0 && (
        <div className="mt-10">
          <h2 className="text-white font-semibold text-sm mb-1">Email automatiche dal sito</h2>
          <p className="text-white/35 text-xs mb-3">Partono quando arriva un contatto dal sito (benvenuto al cliente, avviso al team).</p>
          <div className="space-y-2">
            {wfs.map((wf) => {
              const actions = Array.isArray(wf.actions) ? wf.actions : [];
              return (
                <div key={wf.id} className="bg-[#141414] border border-white/[0.06] rounded-xl px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{wf.name}</p>
                    <p className="text-white/35 text-xs">
                      {TRIGGER_LABEL[wf.trigger] ?? wf.trigger} → {actions.map((x: unknown) => ACTION_LABEL[(x as Record<string, string>).type] ?? (x as Record<string, string>).type).join(", ") || "—"} · {wf.run_count}x
                    </p>
                  </div>
                  {isAdmin && <AutomationToggle id={wf.id} active={wf.is_active} table="workflows" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
