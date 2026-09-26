"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeConversation, markConversationRead, resumeAi, retryFailed, sendManualReply, takeOverConversation, type ActionResult } from "@/app/crm/(app)/social/actions";
import { btnGhost, btnPrimary, inputCls } from "./ui";

function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>, onOk?: () => void) =>
    start(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Errore");
      else {
        onOk?.();
        router.refresh();
      }
    });
  return { pending, error, run };
}

export function ConversationActions({ id, aiEnabled, humanTakeover, status }: { id: string; aiEnabled: boolean; humanTakeover: boolean; status: string }) {
  const { pending, error, run } = useAction();
  return (
    <div className="space-y-2">
      {(!aiEnabled || humanTakeover) && (
        <button type="button" disabled={pending} onClick={() => run(() => resumeAi(id))} className={`${btnPrimary} w-full`}>
          Riprendi AI
        </button>
      )}
      {!humanTakeover && (
        <button type="button" disabled={pending} onClick={() => run(() => takeOverConversation(id))} className={`${aiEnabled ? btnPrimary : btnGhost} w-full`}>
          Prendi conversazione
        </button>
      )}
      {status !== "closed" && (
        <button type="button" disabled={pending} onClick={() => run(() => closeConversation(id))} className={`${btnGhost} w-full`}>
          Chiudi
        </button>
      )}
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}

export function Composer({ id, canDm, canComment, windowOpen }: { id: string; canDm: boolean; canComment: boolean; windowOpen: boolean }) {
  const [text, setText] = useState("");
  const { pending, error, run } = useAction();
  if (!canDm && !canComment) {
    return <p className="text-white/30 text-xs">La piattaforma non consente risposte tramite API per questa conversazione.</p>;
  }
  return (
    <div className="space-y-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Scrivi una risposta…" className={`${inputCls} resize-none`} />
      <div className="flex flex-wrap items-center gap-2">
        {canDm && (
          <button type="button" disabled={pending || !text.trim() || !windowOpen} onClick={() => run(() => sendManualReply(id, text, "dm"), () => setText(""))} className={btnPrimary}
            title={windowOpen ? "" : "Finestra di 24h chiusa: la piattaforma non consente DM"}>
            Invia DM
          </button>
        )}
        {canComment && (
          <button type="button" disabled={pending || !text.trim()} onClick={() => run(() => sendManualReply(id, text, "comment"), () => setText(""))} className={btnGhost}>
            Rispondi al commento
          </button>
        )}
        {canDm && !windowOpen && <span className="text-white/30 text-xs">DM disabilitati: nessun messaggio dell&apos;utente nelle ultime 24h.</span>}
      </div>
      {error && <p className="text-[#E63B2E] text-xs">{error}</p>}
    </div>
  );
}

export function RetryButton({ kind, id }: { kind: "message" | "comment"; id: string }) {
  const { pending, error, run } = useAction();
  return (
    <>
      <button type="button" disabled={pending} onClick={() => run(() => retryFailed(kind, id))} className="text-[11px] text-white/60 underline hover:text-white disabled:opacity-40">
        {pending ? "Riprovo…" : "Riprova"}
      </button>
      {error && <span className="text-[#E63B2E]/70 text-[11px]">{error}</span>}
    </>
  );
}

export function MarkReadOnOpen({ id, unread }: { id: string; unread: number }) {
  useEffect(() => {
    if (unread > 0) void markConversationRead(id);
  }, [id, unread]);
  return null;
}
