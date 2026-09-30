"use client";

/** Commenti dell'articolo: elenco (solo approvati) e modulo con moderazione. */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PublicComment } from "@/lib/blog/comments";

const fmt = (d: string) => new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" });

function CommentItem({ c, replies }: { c: PublicComment; replies: PublicComment[] }) {
  return (
    <li className="border-t border-obsidian/10 pt-5">
      <div className="flex items-center gap-3 mb-2">
        <span className={`w-9 h-9 flex items-center justify-center font-archivo font-black text-sm ${c.is_team ? "bg-rosewood text-ivory" : "bg-obsidian/[0.07] text-obsidian/70"}`}>
          {c.is_team ? "10" : c.author_name[0]?.toUpperCase()}
        </span>
        <div>
          <p className="font-semibold text-obsidian text-sm">
            {c.author_name}
            {c.is_team && <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-rosewood">Dieci Bottega</span>}
          </p>
          <p className="font-mono text-[11px] text-obsidian/40">{fmt(c.created_at)}</p>
        </div>
      </div>
      <p className="text-obsidian/80 whitespace-pre-wrap leading-relaxed">{c.body}</p>
      {replies.length > 0 && (
        <ul className="mt-4 ml-6 pl-5 border-l-2 border-rosewood/30 space-y-4">
          {replies.map((r) => <CommentItem key={r.id} c={r} replies={[]} />)}
        </ul>
      )}
    </li>
  );
}

export function Comments({ slug, comments }: { slug: string; comments: PublicComment[] }) {
  const [form, setForm] = useState({ name: "", email: "", body: "", website: "", consent: false });
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; msg?: string }>({ status: "idle" });
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...form, startedAt: startedAt.current }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) return setState({ status: "error", msg: data.error ?? "Errore, riprova" });
      setState({ status: "done" });
      setForm({ name: "", email: "", body: "", website: "", consent: false });
    } catch {
      setState({ status: "error", msg: "Errore di connessione, riprova" });
    }
  }

  const input = "w-full bg-white/70 border border-obsidian/15 px-4 py-3 text-obsidian placeholder:text-obsidian/35 focus:outline-none focus:border-rosewood transition-colors";

  return (
    <section id="commenti" className="scroll-mt-28">
      <h2 className="font-archivo font-black uppercase tracking-tight text-2xl lg:text-3xl text-obsidian mb-2">
        Commenti {comments.length > 0 && <span className="text-obsidian/35">({comments.length})</span>}
      </h2>
      <p className="text-obsidian/55 mb-6">Domande, dubbi o la tua esperienza: rispondiamo a tutti.</p>

      {roots.length > 0 ? (
        <ul className="space-y-5 mb-10">
          {roots.map((c) => <CommentItem key={c.id} c={c} replies={repliesOf(c.id)} />)}
        </ul>
      ) : (
        <p className="text-obsidian/45 mb-8 border-t border-obsidian/10 pt-5">Ancora nessun commento. Scrivi tu il primo.</p>
      )}

      {state.status === "done" ? (
        <div className="border border-rosewood/40 bg-rosewood/[0.06] px-5 py-4 text-obsidian">
          <p className="font-semibold">Grazie, commento ricevuto.</p>
          <p className="text-obsidian/65 text-sm mt-1">Sarà visibile dopo una rapida verifica (lo facciamo per tenere lontano lo spam).</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required minLength={2} maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome *" className={input} aria-label="Nome" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (facoltativa, non verrà mostrata)" className={input} aria-label="Email" />
          </div>
          <textarea required minLength={3} maxLength={2000} rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Scrivi il tuo commento…" className={`${input} resize-y`} aria-label="Commento" />
          {/* campo trappola per i bot: nascosto alle persone */}
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden name="website" />
          <label className="flex items-start gap-2.5 text-sm text-obsidian/65">
            <input type="checkbox" required checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1 accent-[#E63B2E]" />
            <span>
              Acconsento alla pubblicazione del nome e del commento e al trattamento dei dati secondo la{" "}
              <Link href="/privacy" className="text-rosewood underline">privacy policy</Link>.
            </span>
          </label>
          <div className="flex items-center gap-4">
            <button
              disabled={state.status === "sending"}
              className="bg-rosewood text-ivory font-mono text-[11px] uppercase tracking-[0.12em] px-6 py-3.5 hover:bg-obsidian transition-colors disabled:opacity-50"
            >
              {state.status === "sending" ? "Invio…" : "Pubblica il commento"}
            </button>
            {state.status === "error" && <p className="text-rosewood text-sm">{state.msg}</p>}
          </div>
        </form>
      )}
    </section>
  );
}
