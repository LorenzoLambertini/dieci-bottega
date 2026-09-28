"use client";

/** Ricerca globale: Ctrl/Cmd+K oppure il pulsante 🔍. Invio su "Chiedi all'AI" per le domande a parole. */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aiSearch, globalSearch, type SearchHit } from "@/app/crm/(app)/search-actions";

const ICON: Record<SearchHit["type"], string> = { lead: "👤", quote: "📄", project: "📁", tag: "🏷" };

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [sel, setSel] = useState(0);
  const [pending, start] = useTransition();
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("crm:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("crm:search", onOpen);
    };
  }, []);

  const search = useCallback((v: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () =>
        start(async () => {
          try {
            setHits(await globalSearch(v));
          } catch {
            setHits([]);
          }
          setSel(0);
        }),
      200
    );
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    setHits([]);
    router.push(href);
  };
  const askAi = () =>
    start(async () => {
      setAiMsg("Sto cercando…");
      const r = await aiSearch(q).catch(() => ({ ok: false as const, error: "Ricerca non disponibile, riprova", href: undefined }));
      if (!r.ok || !r.href) return setAiMsg(r.error ?? "Errore");
      setAiMsg(null);
      go(r.href);
    });

  if (!open) return null;
  const total = hits.length + (q.trim().length > 3 ? 1 : 0);
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-3" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setAiMsg(null); search(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(total - 1, s + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
            if (e.key === "Enter") {
              e.preventDefault();
              if (sel < hits.length && hits[sel]) go(hits[sel].href);
              else if (q.trim().length > 3) askAi();
            }
          }}
          placeholder="Cerca un contatto, preventivo, progetto… o chiedi a parole"
          className="w-full bg-transparent px-5 py-4 text-white text-base placeholder:text-white/25 focus:outline-none border-b border-white/[0.06]"
        />
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {hits.map((h, i) => (
            <button key={`${h.href}-${i}`} type="button" onMouseEnter={() => setSel(i)} onClick={() => go(h.href)} className={`w-full flex items-center gap-3 px-5 py-2.5 text-left ${sel === i ? "bg-white/[0.06]" : ""}`}>
              <span aria-hidden>{ICON[h.type]}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-white/85 text-sm truncate">{h.title}</span>
                {h.sub && <span className="block text-white/35 text-xs truncate">{h.sub}</span>}
              </span>
            </button>
          ))}
          {q.trim().length > 3 && (
            <button type="button" onMouseEnter={() => setSel(hits.length)} onClick={askAi} className={`w-full flex items-center gap-3 px-5 py-3 text-left ${sel === hits.length ? "bg-white/[0.06]" : ""}`}>
              <span aria-hidden>✨</span>
              <span className="text-white/75 text-sm">Chiedi all&apos;AI: <span className="text-white">&quot;{q}&quot;</span></span>
            </button>
          )}
          {!q && (
            <p className="px-5 py-4 text-white/30 text-xs leading-relaxed">
              Prova: <span className="text-white/50">&quot;Rossi&quot;</span>, <span className="text-white/50">&quot;2026-003&quot;</span>, oppure a parole:{" "}
              <span className="text-white/50">&quot;lead caldi senza prossima azione&quot;</span>, <span className="text-white/50">&quot;clienti fermi da un mese&quot;</span>.
            </p>
          )}
          {(pending || aiMsg) && <p className="px-5 py-2 text-white/40 text-xs">{aiMsg ?? "…"}</p>}
        </div>
      </div>
    </div>
  );
}

/** Pulsante che apre la ricerca (per barra laterale e menu da telefono). */
export function SearchButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("crm:search"))} className={className} aria-label="Cerca">
      🔍
    </button>
  );
}
