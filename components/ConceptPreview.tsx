"use client";

/**
 * Anteprima dal vivo dei siti concept (iframe delle demo /concept/<slug>/prima|dopo), scalata per entrare nella pagina.
 * - ConceptPreview: confronto trascinabile prima/dopo, oppure un solo sito da provare; computer o telefono
 * - ConceptPhone: il sito nuovo in una cornice da telefono, provabile
 * - ConceptThumb: anteprima non interattiva per le card
 */
import { useCallback, useEffect, useRef, useState } from "react";

const DESKTOP = { w: 1280, h: 800 };
const PHONE = { w: 390, h: 780 };
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

function Frame({ src, title, size, width, interactive, eager }: { src: string; title: string; size: { w: number; h: number }; width: number; interactive: boolean; eager?: boolean }) {
  const scale = width > 0 ? Math.min(1, width / size.w) : 0;
  return (
    <div style={{ width: size.w * scale, height: size.h * scale }} className="relative overflow-hidden mx-auto">
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          loading={eager ? "eager" : "lazy"}
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

export function ConceptPhone({ slug, name, width = 300 }: { slug: string; name: string; width?: number }) {
  return (
    <div className="mx-auto rounded-[34px] border-[7px] border-[#0d0d0d] overflow-hidden bg-[#0d0d0d] shadow-[0_30px_80px_-20px_rgba(0,0,0,.55)]" style={{ width: width + 14 }}>
      <Frame src={`/concept/${slug}/dopo`} title={`Il sito nuovo di ${name}, da provare`} size={PHONE} width={width} interactive eager />
    </div>
  );
}

/** Confronto: il "prima" sotto, il "dopo" sopra ritagliato dalla maniglia. */
function Compare({ slug, name, primaLabel, size, width, accent }: { slug: string; name: string; primaLabel: string; size: { w: number; h: number }; width: number; accent: string }) {
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const scale = width > 0 ? Math.min(1, width / size.w) : 0;

  const fromX = useCallback((x: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)));
  }, []);

  // Un piccolo invito a trascinare la prima volta che il confronto entra in vista.
  useEffect(() => {
    const el = box.current;
    if (!el || touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1800);
        setPos(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [touched]);

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - d));
    else if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + d));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
    else return;
    e.preventDefault();
    setTouched(true);
  };

  return (
    <div
      ref={box}
      className="relative mx-auto select-none touch-none cursor-ew-resize overflow-hidden"
      style={{ width: size.w * scale, height: size.h * scale }}
      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setTouched(true); fromX(e.clientX); }}
      onPointerMove={(e) => { if (e.buttons) fromX(e.clientX); }}
    >
      {scale > 0 && (
        <>
          <div className="absolute inset-0"><Frame src={`/concept/${slug}/prima`} title={`${primaLabel} di ${name}`} size={size} width={width} interactive={false} /></div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <Frame src={`/concept/${slug}/dopo`} title={`Il sito nuovo di ${name}`} size={size} width={width} interactive={false} />
          </div>
        </>
      )}
      <span className={`${label} absolute left-3 bottom-3 bg-[#1A1414]/85 text-[#F4EFE6] px-2.5 py-1.5 pointer-events-none transition-opacity duration-200 ${pos < 12 ? "opacity-0" : ""}`}>Prima</span>
      <span className={`${label} absolute right-3 bottom-3 bg-[#1A1414]/85 text-[#F4EFE6] px-2.5 py-1.5 pointer-events-none transition-opacity duration-200 ${pos > 88 ? "opacity-0" : ""}`}>Dopo</span>
      <div className="absolute top-0 bottom-0 w-[3px] -ml-[1.5px] pointer-events-none" style={{ left: `${pos}%`, background: accent }}>
        <button
          type="button"
          role="slider"
          aria-label="Confronta prima e dopo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(100 - pos)}% sito nuovo`}
          onKeyDown={onKey}
          className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full grid place-items-center text-white text-lg shadow-[0_8px_24px_rgba(0,0,0,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ background: accent }}
        >
          <span aria-hidden>‹›</span>
        </button>
      </div>
    </div>
  );
}

type Mode = "confronta" | "dopo" | "prima";

export default function ConceptPreview({ slug, name, primaLabel, accent = "#E63B2E" }: { slug: string; name: string; primaLabel: string; accent?: string }) {
  const [mode, setMode] = useState<Mode>("confronta");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [ref, w] = useWidth<HTMLDivElement>();
  const src = `/concept/${slug}/${mode === "prima" ? "prima" : "dopo"}`;
  const tab = (on: boolean) =>
    `${label} px-3 py-2 border transition-colors duration-200 ${on ? "bg-obsidian text-ivory border-obsidian" : "border-obsidian/20 text-obsidian/70 hover:border-obsidian/50"}`;
  const phoneW = Math.min(PHONE.w, Math.max(0, w - 32));
  const title = mode === "prima" ? primaLabel : "Il sito nuovo";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2" role="group" aria-label="Cosa vedere">
          <button type="button" aria-pressed={mode === "confronta"} onClick={() => setMode("confronta")} className={tab(mode === "confronta")}>Confronta</button>
          <button type="button" aria-pressed={mode === "dopo"} onClick={() => setMode("dopo")} className={tab(mode === "dopo")}>Prova il dopo</button>
          <button type="button" aria-pressed={mode === "prima"} onClick={() => setMode("prima")} className={tab(mode === "prima")}>Il prima</button>
        </div>
        <div className="flex gap-2" role="group" aria-label="Dispositivo">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")} className={tab(device === "desktop")}>Computer</button>
          <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")} className={tab(device === "phone")}>Telefono</button>
        </div>
      </div>
      <div ref={ref} className={device === "desktop" ? "rounded-lg border border-obsidian/15 bg-obsidian overflow-hidden shadow-atelier-lg" : "py-6 bg-[#E8E2D6] rounded-lg"}>
        {device === "desktop" && (
          <div className="flex items-center gap-1.5 px-3 h-8 bg-obsidian" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-ivory/25" /><span className="w-2.5 h-2.5 rounded-full bg-ivory/25" /><span className="w-2.5 h-2.5 rounded-full bg-ivory/25" />
            <span className="ml-3 font-mono text-[10px] text-ivory/50 truncate">{mode === "confronta" ? `${name} · prima e dopo` : `${name} · ${title.toLowerCase()}`}</span>
          </div>
        )}
        {device === "desktop" ? (
          mode === "confronta"
            ? <Compare slug={slug} name={name} primaLabel={primaLabel} size={DESKTOP} width={w} accent={accent} />
            : <Frame key={src} src={src} title={`${title} di ${name}, anteprima dal vivo`} size={DESKTOP} width={w} interactive />
        ) : (
          <div className="mx-auto rounded-[28px] border-[6px] border-obsidian overflow-hidden bg-obsidian" style={{ width: phoneW + 12 }}>
            {mode === "confronta"
              ? <Compare slug={slug} name={name} primaLabel={primaLabel} size={PHONE} width={phoneW} accent={accent} />
              : <Frame key={src} src={src} title={`${title} di ${name}, anteprima da telefono`} size={PHONE} width={phoneW} interactive />}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-obsidian/55 text-sm">
        <p>{mode === "confronta" ? "Trascina la maniglia: a sinistra com'era, a destra il sito nuovo." : "È il sito vero: puoi scorrere, filtrare e provare i pulsanti qui dentro."}</p>
        <a href={src} target="_blank" rel="noopener" className={`${label} text-rosewood hover:underline underline-offset-4`}>Apri a tutto schermo ↗</a>
      </div>
    </div>
  );
}
