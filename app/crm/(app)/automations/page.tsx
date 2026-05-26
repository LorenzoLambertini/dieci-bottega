import { createClient } from "@/lib/supabase/server";
import type { Workflow } from "@/lib/supabase/types";

const TRIGGER_LABEL: Record<string, string> = {
  lead_created: "Lead creato",
  stage_changed: "Stage cambiato",
  tag_added: "Tag aggiunto",
};

const ACTION_LABEL: Record<string, string> = {
  send_email: "✉️ Invia email",
  assign_to: "👤 Assegna a",
  add_tag: "🏷 Aggiungi tag",
  webhook: "🔗 Webhook",
};

export default async function AutomationsPage() {
  const supabase = await createClient();
  const { data: workflows } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  const wfs = (workflows ?? []) as Workflow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Automazioni</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {wfs.length} workflow configurati
          </p>
        </div>
        <button className="bg-[#E63B2E] hover:bg-[#C44A38] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors opacity-60 cursor-not-allowed" disabled>
          + Nuovo workflow
        </button>
      </div>

      {wfs.length === 0 ? (
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#E63B2E]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-white/70 font-semibold mb-2">
            Nessun workflow ancora
          </h3>
          <p className="text-white/30 text-sm max-w-xs mx-auto">
            Le automazioni ti permettono di automatizzare azioni ripetitive —
            email, assegnazioni, tag — basate su trigger.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wfs.map((wf) => {
            const actions = Array.isArray(wf.actions) ? wf.actions : [];
            return (
              <div
                key={wf.id}
                className="bg-[#141414] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      wf.is_active ? "bg-green-400" : "bg-white/20"
                    }`}
                  />

                  <div className="min-w-0">
                    <p className="text-white/80 font-medium text-sm truncate">
                      {wf.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-white/30 text-xs">
                        Trigger:{" "}
                        <span className="text-white/50">
                          {TRIGGER_LABEL[wf.trigger] ?? wf.trigger}
                        </span>
                      </span>
                      <span className="text-white/15">·</span>
                      <span className="text-white/30 text-xs">
                        Azioni:{" "}
                        <span className="text-white/50">
                          {actions
                            .map(
                              (a: unknown) =>
                                ACTION_LABEL[
                                  (a as Record<string, string>).type
                                ] ?? (a as Record<string, string>).type
                            )
                            .join(", ") || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-white/25 text-xs tabular-nums">
                    {wf.run_count}x eseguito
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      wf.is_active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-white/[0.06] text-white/30"
                    }`}
                  >
                    {wf.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
