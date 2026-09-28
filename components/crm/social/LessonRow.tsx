"use client";

/** Una lezione/correzione data all'AI: si può sospendere o eliminare. */
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFeedback, setFeedbackTraining } from "@/app/crm/(app)/social/actions";

export function LessonRow({
  id,
  lesson,
  betterReply,
  customerText,
  rating,
  active,
}: {
  id: string;
  lesson: string | null;
  betterReply: string | null;
  customerText: string | null;
  rating: number;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.error ?? "Errore");
      router.refresh();
    });

  return (
    <div className={`px-5 py-3 space-y-1.5 ${active ? "" : "opacity-50"}`}>
      {lesson && <p className="text-white/85 text-sm">📌 {lesson}</p>}
      {betterReply && (
        <details className="text-xs">
          <summary className="cursor-pointer text-white/45 hover:text-white/70">Risposta ideale{customerText ? " (esempio)" : ""}</summary>
          {customerText && <p className="text-white/40 mt-1">Cliente: {customerText}</p>}
          <p className="text-white/65 mt-1 whitespace-pre-wrap">{betterReply}</p>
        </details>
      )}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-yellow-400/80">{"★".repeat(rating)}</span>
        <button type="button" disabled={pending} onClick={() => run(() => setFeedbackTraining(id, !active))} className="text-white/45 hover:text-white">
          {active ? "Sospendi" : "Riattiva"}
        </button>
        <button type="button" disabled={pending} onClick={() => confirm("Eliminare questa lezione?") && run(() => deleteFeedback(id))} className="text-white/30 hover:text-[#E63B2E]">
          Elimina
        </button>
      </div>
    </div>
  );
}
