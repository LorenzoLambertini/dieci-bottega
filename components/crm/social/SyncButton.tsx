"use client";

/**
 * "Sincronizza ora": legge commenti e DM da Instagram/Facebook via API ufficiale.
 * Con `auto` si sincronizza anche da solo mentre la pagina è aperta (ogni 3 minuti,
 * il server comunque non rilegge più spesso di ogni 2).
 */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncSocialNow, type SyncActionResult } from "@/app/crm/(app)/social/actions";

const AUTO_EVERY_MS = 3 * 60_000;

export function SyncButton({ auto = true }: { auto?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [res, setRes] = useState<SyncActionResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const busy = useRef(false);

  const run = useCallback(
    (isAuto: boolean) => {
      if (busy.current) return;
      busy.current = true;
      start(async () => {
        try {
          const r = await syncSocialNow(isAuto);
          // Le sync automatiche "saltate" non cancellano l'esito dell'ultima vera
          if (!(isAuto && r.skipped)) setRes(r);
          if (r.queued) router.refresh();
        } catch {
          if (!isAuto) setRes({ ok: false, error: "Sincronizzazione non riuscita (rete)" });
        } finally {
          busy.current = false;
        }
      });
    },
    [router]
  );

  useEffect(() => {
    if (!auto) return;
    run(true);
    const t = setInterval(() => document.visibilityState === "visible" && run(true), AUTO_EVERY_MS);
    return () => clearInterval(t);
  }, [auto, run]);

  const errors = res?.accounts?.flatMap((a) => a.errors.map((e) => `${a.name}: ${e}`)) ?? [];
  const info = res?.accounts?.flatMap((a) => (a.info ?? []).map((e) => `${a.name}: ${e}`)) ?? [];
  const visible = res?.accounts?.filter((a) => a.platform === "instagram" || (a.dmVisible ?? []).length) ?? [];
  const time = res?.at ? new Date(res.at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className="flex flex-col items-end gap-1 max-w-full">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(false)}
        className="bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-xs font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
      >
        {pending ? "Sincronizzo…" : "↻ Sincronizza ora"}
      </button>
      {res && (
        <div className="text-right text-[11px] max-w-md">
          {!res.ok ? (
            <p className="text-[#E63B2E]">{res.error}</p>
          ) : res.skipped ? (
            <p className="text-white/35">{res.skipped}{time ? ` · ${time}` : ""}</p>
          ) : (
            <p className="text-white/40">
              {time && `Ultima lettura ${time} · `}
              {res.queued ? <span className="text-green-400">{res.queued} nuovi</span> : "nessun messaggio nuovo"}
              <button type="button" onClick={() => setShowDetails((v) => !v)} className={`ml-2 underline underline-offset-2 ${errors.length ? "text-yellow-400" : "text-white/40"}`}>
                {errors.length ? `${errors.length} avvisi Meta` : "dettagli"}
              </button>
            </p>
          )}
          {showDetails && (
            <div className="mt-1 space-y-2 text-left bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-2.5 text-white/60">
              {errors.length > 0 && <ul className="space-y-1 text-yellow-400/90">{errors.map((e) => <li key={e} className="break-words">⚠️ {e}</li>)}</ul>}
              {visible.map((a) => (
                <p key={a.accountId} className="break-words">
                  <span className="text-white/80">{a.name}</span> · Meta mostra {(a.dmVisible ?? []).length} conversazioni DM
                  {(a.dmVisible ?? []).length > 0 && <>: {(a.dmVisible ?? []).slice(0, 12).join(", ")}</>}
                </p>
              ))}
              <p className="text-white/35">Se una persona che ti ha scritto non è in questo elenco, Meta non la rende visibile all&apos;app (app non ancora pubblicata): aggiungila come tester o attendi la pubblicazione.</p>
              {info.length > 0 && <ul className="space-y-1 text-white/35">{info.map((e) => <li key={e} className="break-words">ℹ️ {e}</li>)}</ul>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
