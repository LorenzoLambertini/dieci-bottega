"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Lead, PipelineStage, Profile, ActivityType, LeadStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Nuovo",
  contacted: "Contattato",
  qualified: "Qualificato",
  proposal: "Proposta inviata",
  won: "Vinto",
  lost: "Perso",
};

const LOST_REASONS = ["Prezzo", "Ha scelto un altro", "Non risponde più", "Tempi", "Non in target", "Rimandato", "Altro"];

interface LeadActionsProps {
  lead: Lead & { stage: PipelineStage | null; assigned_profile: Profile | null };
  stages: PipelineStage[];
  profiles: Pick<Profile, "id" | "full_name" | "email">[];
}

export function LeadActions({ lead, stages, profiles }: LeadActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<ActivityType>("note");
  const [saving, setSaving] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");

  async function updateField(field: keyof Lead, value: string | null) {
    startTransition(async () => {
      const supabase = createClient();
      // Dynamic key update — cast needed for Supabase generic constraint
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("leads") as any)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", lead.id);
      router.refresh();
    });
  }

  async function addActivity() {
    if (!noteText.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("activities") as any).insert({
      lead_id: lead.id,
      user_id: user?.id ?? null,
      type: noteType,
      body: noteText.trim(),
    });
    setNoteText("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Azioni rapide
        </h3>

        {/* Status */}
        <div>
          <label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">
            Stato
          </label>
          <select
            key={lead.status}
            defaultValue={lead.status}
            onChange={(e) => {
              // "Perso": prima chiediamo il motivo, serve per capire dove si perdono i clienti
              if (e.target.value === "lost") setLostOpen(true);
              else updateField("status", e.target.value);
            }}
            disabled={isPending}
            className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors disabled:opacity-50"
          >
            {(["new", "contacted", "qualified", "proposal", "won", "lost"] as LeadStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              )
            )}
          </select>
        </div>

        {lostOpen && (
          <div className="bg-[#E63B2E]/[0.06] border border-[#E63B2E]/25 rounded-lg p-3 space-y-2">
            <p className="text-white/75 text-xs font-semibold">Perché è perso?</p>
            <div className="flex flex-wrap gap-1.5">
              {LOST_REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setLostReason(r)} className={`text-[11px] rounded-full px-2.5 py-1 border ${lostReason === r ? "bg-[#E63B2E] border-[#E63B2E] text-white" : "border-white/15 text-white/60"}`}>{r}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!lostReason || isPending}
                onClick={() =>
                  startTransition(async () => {
                    const supabase = createClient();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from("leads") as any)
                      .update({ status: "lost", lost_reason: lostReason, next_action_at: null, next_action_note: null, updated_at: new Date().toISOString() })
                      .eq("id", lead.id);
                    setLostOpen(false);
                    router.refresh();
                  })
                }
                className="flex-1 bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-xs font-semibold rounded-lg py-1.5"
              >
                Segna come perso
              </button>
              <button type="button" onClick={() => { setLostOpen(false); setLostReason(""); router.refresh(); }} className="text-white/40 text-xs px-2">Annulla</button>
            </div>
          </div>
        )}

        {/* Stage */}
        <div>
          <label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">
            Stage pipeline
          </label>
          <select
            defaultValue={lead.stage_id ?? ""}
            onChange={(e) => updateField("stage_id", e.target.value || null)}
            disabled={isPending}
            className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors disabled:opacity-50"
          >
            <option value="">— Nessuno —</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned to */}
        <div>
          <label className="text-white/30 text-xs uppercase tracking-wider block mb-1.5">
            Assegnato a
          </label>
          <select
            defaultValue={lead.assigned_to ?? ""}
            onChange={(e) => updateField("assigned_to", e.target.value || null)}
            disabled={isPending}
            className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/80 text-sm focus:outline-none focus:border-[#E63B2E]/50 transition-colors disabled:opacity-50"
          >
            <option value="">— Non assegnato —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name ?? p.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add activity */}
      <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Aggiungi attività
        </h3>

        <div className="flex gap-2">
          {(["note", "call", "email", "meeting"] as ActivityType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setNoteType(t)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                noteType === t
                  ? "bg-[#E63B2E] text-white"
                  : "bg-white/[0.05] text-white/40 hover:text-white/60"
              }`}
            >
              {t === "note" ? "📝" : t === "call" ? "📞" : t === "email" ? "✉️" : "🗓"}
            </button>
          ))}
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          placeholder={`Aggiungi ${noteType === "note" ? "una nota" : noteType === "call" ? "una chiamata" : noteType === "email" ? "un'email" : "un meeting"}…`}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#E63B2E]/50 transition-colors resize-none"
        />

        <button
          type="button"
          onClick={addActivity}
          disabled={!noteText.trim() || saving}
          className="w-full bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {saving ? "Salvataggio…" : "Salva attività"}
        </button>
      </div>
    </div>
  );
}
