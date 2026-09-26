"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, inputCls, labelCls } from "./ui";

const EXAMPLES = [
  { kind: "comment", text: "GUIDA" },
  { kind: "message", text: "Quanto costa un sito?" },
  { kind: "message", text: "Mi mandate la guida?" },
  { kind: "message", text: "Vorrei parlare con qualcuno." },
  { kind: "message", text: "Potete farmi un preventivo?" },
  { kind: "message", text: "Avete esempi di ecommerce?" },
  { kind: "message", text: "Sono arrabbiato, il sito non funziona!" },
  { kind: "message", text: "Non mi interessa." },
];

/** Simulatore: prova l'intera pipeline senza piattaforme collegate (solo admin). */
export function Simulator() {
  const router = useRouter();
  const [platform, setPlatform] = useState("instagram");
  const [kind, setKind] = useState("message");
  const [sender, setSender] = useState("mario.rossi");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, kind, sender, text }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json.outcome ?? json, null, 2));
      router.refresh();
    } catch (e) {
      setResult((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 space-y-3">
      <div>
        <h2 className="text-white font-semibold text-sm">Simulatore</h2>
        <p className="text-white/30 text-xs mt-0.5">Prova la pipeline reale (CRM + regole + Claude). Nessun invio sui social.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Piattaforma</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Tipo</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            <option value="message">DM</option>
            <option value="comment">Commento</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Utente</label>
        <input value={sender} onChange={(e) => setSender(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Testo</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Scrivi un messaggio…" />
        <div className="flex flex-wrap gap-1 mt-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              type="button"
              onClick={() => {
                setText(ex.text);
                setKind(ex.kind);
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-white/40 hover:text-white/70"
            >
              {ex.text}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={run} disabled={busy || !text.trim()} className={`${btnPrimary} w-full`}>
        {busy ? "Elaborazione…" : "Simula evento"}
      </button>
      {result && <pre className="text-[11px] text-white/50 bg-black/30 rounded-lg p-3 overflow-auto max-h-64 whitespace-pre-wrap">{result}</pre>}
    </div>
  );
}
