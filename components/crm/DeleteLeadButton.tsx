"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/crm/(app)/leads/[id]/actions";

const WORD = "ELIMINA";

/** Eliminazione definitiva del contatto: si abilita solo scrivendo ELIMINA. */
export function DeleteLeadButton({ leadId, name }: { leadId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ready = text.trim().toUpperCase() === WORD;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-xs text-[#E63B2E]/80 hover:text-[#E63B2E] border border-[#E63B2E]/20 hover:border-[#E63B2E]/40 rounded-lg px-3 py-2 transition-colors"
      >
        Elimina contatto
      </button>
    );
  }

  return (
    <div className="bg-[#E63B2E]/[0.06] border border-[#E63B2E]/25 rounded-xl p-4 space-y-3">
      <p className="text-white/80 text-sm font-semibold">Eliminare {name}?</p>
      <p className="text-white/45 text-xs leading-relaxed">
        Vengono cancellati per sempre il contatto, le attività, i tag, le opportunità e le conversazioni social collegate.
        Scrivi <span className="font-mono text-white/80">{WORD}</span> per confermare.
      </p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={WORD}
        autoFocus
        autoCapitalize="characters"
        autoComplete="off"
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white placeholder:text-white/20 text-sm font-mono focus:outline-none focus:border-[#E63B2E]/60"
      />
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!ready || pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await deleteLead(leadId, text);
              if (!r.ok) return setError(r.error ?? "Errore");
              router.push("/crm/leads");
              router.refresh();
            })
          }
          className="flex-1 bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
        >
          {pending ? "Eliminazione…" : "Elimina definitivamente"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setText(""); setError(null); }}
          className="text-white/50 hover:text-white text-xs px-3 py-2"
        >
          Annulla
        </button>
      </div>
    </div>
  );
}
