"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptQuote } from "./actions";

export function AcceptQuote({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="rounded-xl bg-white border border-black/10 p-5 space-y-3">
      <p className="font-semibold">Ti convince? Accettalo online</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome e cognome" className="w-full border border-black/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#E63B2E]" />
      <label className="flex items-start gap-2 text-sm text-black/70">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#E63B2E]" />
        Accetto il preventivo e le condizioni indicate.
      </label>
      {error && <p className="text-sm text-[#E63B2E]">{error}</p>}
      <button
        type="button"
        disabled={!agree || name.trim().length < 3 || pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await acceptQuote(token, name);
            if (!r.ok) return setError(r.error ?? "Errore, riprova");
            router.refresh();
          })
        }
        className="w-full sm:w-auto bg-[#E63B2E] hover:bg-[#C44A38] disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        {pending ? "Un attimo…" : "Accetto il preventivo"}
      </button>
      <p className="text-xs text-black/45">Hai domande prima di accettare? Rispondi all&apos;email o scrivici su WhatsApp.</p>
    </div>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="text-sm text-black/55 hover:text-black underline underline-offset-4">
      Scarica PDF / stampa
    </button>
  );
}
