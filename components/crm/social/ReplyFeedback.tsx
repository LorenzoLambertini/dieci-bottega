"use client";

/**
 * Voto (1-5 stelle) su una risposta dell'AI, con risposta ideale e "lezione"
 * facoltative: dalle risposte successive l'AI ne tiene conto.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rateAiReply } from "@/app/crm/(app)/social/actions";

export interface FeedbackValue {
  rating: number;
  better_reply: string | null;
  lesson: string | null;
  use_for_training: boolean;
}

const input =
  "w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#E63B2E]/50";

export function ReplyFeedback({ kind, id, aiText, initial }: { kind: "message" | "comment"; id: string; aiText: string; initial?: FeedbackValue | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [open, setOpen] = useState(false);
  const [better, setBetter] = useState(initial?.better_reply ?? "");
  const [lesson, setLesson] = useState(initial?.lesson ?? "");
  const [training, setTraining] = useState(initial?.use_for_training ?? true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = (r: number, extra = true) =>
    start(async () => {
      setMsg(null);
      const res = await rateAiReply({ kind, id, rating: r, betterReply: extra ? better : initial?.better_reply, lesson: extra ? lesson : initial?.lesson, useForTraining: training });
      if (!res.ok) return setMsg({ ok: false, text: res.error ?? "Errore" });
      setMsg({ ok: true, text: extra && (lesson.trim() || better.trim()) ? "Salvato: l'AI ne terrà conto dalle prossime risposte" : "Voto salvato" });
      if (extra) setOpen(false);
      router.refresh();
    });

  const pick = (r: number) => {
    setRating(r);
    // voto basso: si apre subito la correzione, con la risposta dell'AI come base
    if (r <= 3) {
      if (!better) setBetter(aiText);
      setOpen(true);
    }
    save(r, false);
  };

  return (
    <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/35 text-[11px]">Voto</span>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={pending}
              onMouseEnter={() => setHover(n)}
              onClick={() => pick(n)}
              aria-label={`${n} stelle`}
              className={`text-lg leading-none px-0.5 transition-colors ${(hover || rating) >= n ? "text-yellow-400" : "text-white/20 hover:text-white/40"}`}
            >
              ★
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { if (!better) setBetter(aiText); setOpen((o) => !o); }} className="text-[11px] text-white/45 hover:text-white underline underline-offset-2">
          {open ? "Chiudi" : initial?.lesson || initial?.better_reply ? "Modifica correzione" : "Correggi / insegna"}
        </button>
        {initial?.lesson && !open && <span className="text-[11px] text-green-400/80">✓ lezione salvata</span>}
      </div>
      {open && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-white/35 text-[10px] uppercase tracking-wider">Come avresti risposto tu</span>
            <textarea value={better} onChange={(e) => setBetter(e.target.value)} rows={4} className={`${input} resize-y mt-1`} />
          </label>
          <label className="block">
            <span className="text-white/35 text-[10px] uppercase tracking-wider">Cosa deve imparare l&apos;AI (regola per il futuro)</span>
            <input
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Es. «Non dare prezzi nel primo messaggio: prima chiedi che attività ha»"
              className={`${input} mt-1`}
            />
          </label>
          <label className="flex items-center gap-2 text-[11px] text-white/50">
            <input type="checkbox" checked={training} onChange={(e) => setTraining(e.target.checked)} className="accent-[#E63B2E]" />
            Usa per educare l&apos;AI
          </label>
          <button
            type="button"
            disabled={pending || !rating}
            onClick={() => save(rating)}
            className="bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white text-xs font-semibold rounded-lg px-3 py-1.5"
          >
            {pending ? "Salvo…" : !rating ? "Prima dai un voto" : "Salva"}
          </button>
        </div>
      )}
      {msg && <p className={`text-[11px] ${msg.ok ? "text-green-400" : "text-[#E63B2E]"}`}>{msg.text}</p>}
    </div>
  );
}
