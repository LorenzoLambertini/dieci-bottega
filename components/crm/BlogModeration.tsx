"use client";

/** Riga di moderazione di un commento del blog (approva, spam, rispondi, elimina). */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteComment, replyToComment, setCommentStatus } from "@/app/crm/(app)/blog/actions";

export interface ModComment {
  id: string;
  post_slug: string;
  post_title: string;
  author_name: string;
  author_email: string | null;
  body: string;
  status: string;
  is_team: boolean;
  created_at: string;
}

const fmt = (d: string) => new Date(d).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });

export function BlogCommentRow({ c, isAdmin }: { c: ModComment; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reply, setReply] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setErr(r.error ?? "Errore");
      else {
        setErr(null);
        setReply(null);
        router.refresh();
      }
    });
  const btn = "text-xs rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40";
  return (
    <div className="px-5 py-4 space-y-2">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-white/85 text-sm font-medium">
            {c.author_name}
            {c.is_team && <span className="ml-2 text-[10px] text-[#E63B2E] uppercase">team</span>}
            {c.author_email && <span className="ml-2 text-white/30 text-xs">{c.author_email}</span>}
          </p>
          <a href={`/blog/${c.post_slug}#commenti`} target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white/70 text-xs truncate block">
            {c.post_title} · {fmt(c.created_at)}
          </a>
        </div>
        <span className={`text-[10px] uppercase font-semibold rounded-full px-2 py-0.5 ${c.status === "approved" ? "bg-green-500/10 text-green-400" : c.status === "spam" ? "bg-white/[0.06] text-white/40" : "bg-yellow-500/10 text-yellow-400"}`}>
          {c.status === "approved" ? "Pubblicato" : c.status === "spam" ? "Spam" : "In attesa"}
        </span>
      </div>
      <p className="text-white/70 text-sm whitespace-pre-wrap">{c.body}</p>
      <div className="flex flex-wrap gap-2">
        {c.status !== "approved" && <button disabled={pending} onClick={() => run(() => setCommentStatus(c.id, "approved"))} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>✓ Approva</button>}
        {c.status !== "spam" && !c.is_team && <button disabled={pending} onClick={() => run(() => setCommentStatus(c.id, "spam"))} className={`${btn} bg-white/[0.06] text-white/60 hover:bg-white/[0.12]`}>Spam</button>}
        {!c.is_team && <button disabled={pending} onClick={() => setReply(reply === null ? "" : null)} className={`${btn} bg-white/[0.06] text-white/60 hover:bg-white/[0.12]`}>Rispondi</button>}
        {isAdmin && <button disabled={pending} onClick={() => confirm("Eliminare il commento?") && run(() => deleteComment(c.id))} className={`${btn} text-white/30 hover:text-[#E63B2E]`}>Elimina</button>}
      </div>
      {reply !== null && (
        <div className="space-y-2">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} autoFocus placeholder="La tua risposta (pubblicata subito, approva anche il commento)" className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-lg px-3 py-2 text-white/85 text-sm focus:outline-none focus:border-[#E63B2E]/50" />
          <button disabled={pending || reply.trim().length < 2} onClick={() => run(() => replyToComment(c.id, reply))} className={`${btn} bg-[#E63B2E] text-white hover:bg-[#C44A38]`}>Pubblica risposta</button>
        </div>
      )}
      {err && <p className="text-[#E63B2E] text-xs">{err}</p>}
    </div>
  );
}
