"use client";

/**
 * Anteprima dal vivo dei siti concept (iframe delle demo /concept/<slug>/prima|dopo),
 * scalata per entrare nella pagina. Versione completa con schede Prima/Dopo e Computer/Telefono,
 * versione "thumb" non interattiva per le card.
 */
import { useEffect, useRef, useState } from "react";

const DESKTOP = { w: 1280, h: 800 };
const PHONE = { w: 390, h: 760 };
const label = "font-mono text-[11px] uppercase tracking-[0.14em]";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Frame({ src, title, size, width, interactive }: { src: string; title: string; size: { w: number; h: number }; width: number; interactive: boolean }) {
  const scale = width > 0 ? Math.min(1, width / size.w) : 0;
  return (
    <div style={{ width: size.w * scale, height: size.h * scale }} className="relative overflow-hidden mx-auto">
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{ width: size.w, height: size.h, transform: `scale(${scale})`, transformOrigin: "0 0", pointerEvents: interactive ? "auto" : "none" }}
          className="absolute left-0 top-0 border-0 bg-white"
        />
      )}
    </div>
  );
}

export function ConceptThumb({ slug, name }: { slug: string; name: string }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  return (
    <div ref={ref} className="absolute inset-0">
      <Frame src={`/concept/${slug}/dopo`} title={`Anteprima del sito di ${name}`} size={DESKTOP} width={w} interactive={false} />
    </div>
  );
}

export default function ConceptPreview({ slug, name, primaLabel }: { slug: string; name: string; primaLabel: string }) {
  const [version, setVersion] = useState<"dopo" | "prima">("dopo");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [ref, w] = useWidth<HTMLDivElement>();
  const src = `/concept/${slug}/${version}`;
  const tab = (on: boolean) =>
    `${label} px-3 py-2 border transition-colors duration-200 ${on ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/20 text-obsidian/70 hover:border-obsidian/50"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2" role="group" aria-label="Versione">
          <button type="button" aria-pressed={version === "dopo"} onClick={() => setVersion("dopo")} className={tab(version === "dopo")}>Dopo</button>
          <button type="button" aria-pressed={version === "prima"} onClick={() => setVersion("prima")} className={tab(version === "prima")}>Prima</button>
        </div>
        <div className="flex gap-2" role="group" aria-label="Dispositivo">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} className={tab(device === "desktop")}>Computer</button>
          <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")} className={tab(device === "phone")}>Telefono</button>
          <a href={src} target="_blank" rel="noopener" className={`${label} px-3 py-2 text-rosewood hover:underline underline-offset-4`}>Apri ↗</a>
        </div>
      </div>
      <div ref={ref} className={device === "desktop" ? "rounded-lg border border-obsidian/15 bg-obsidian overflow-hidden shadow-atelier-lg" : "py-6 bg-[#E8E2D6] rounded-lg"}>
        {device === "desktop" && (
          <div className="flex items-center gap-1.5 px-3 h-8 bg-obsidian" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-ivory/25" /><span className="w-2.5 h-2.5 rounded-full bg-ivory/25" /><span className="w-2.5 h-2.5 rounded-full bg-ivory/25" />
            <span className="ml-3 font-mono text-[10px] text-ivory/50 truncate">{version === "dopo" ? `${name} · sito nuovo` : primaLabel}</span>
          </div>
        )}
        {device === "desktop" ? (
          <Frame key={src} src={src} title={`${version === "dopo" ? "Il sito nuovo" : primaLabel} di ${name}, anteprima dal vivo`} size={DESKTOP} width={w} interactive />
        ) : (
          <div className="mx-auto rounded-[28px] border-[6px] border-obsidian overflow-hidden bg-obsidian" style={{ width: Math.min(PHONE.w, Math.max(0, w - 32)) + 12 }}>
            <Frame key={src} src={src} title={`${version === "dopo" ? "Il sito nuovo" : primaLabel} di ${name}, anteprima da telefono`} size={PHONE} width={Math.min(PHONE.w, Math.max(0, w - 32))} interactive />
          </div>
        )}
      </div>
      <p className="mt-3 text-obsidian/50 text-sm">Anteprima dal vivo: puoi scorrere e provare il sito qui dentro.</p>
    </div>
  );
}
