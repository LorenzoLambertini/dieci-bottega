"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";

/**
 * BeforeAfter · drag slider che mostra "sito vecchio" vs "sito nuovo"
 * Mockup brand-allineati inline (no immagini esterne) — niente network call.
 */

export default function BeforeAfter() {
  const [inset, setInset] = useState<number>(50);
  const [onMouseDown, setOnMouseDown] = useState<boolean>(false);

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onMouseDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;
    if ("touches" in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
    } else if ("clientX" in e) {
      x = e.clientX - rect.left;
    }
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setInset(percentage);
  };

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl select-none border border-obsidian/10 shadow-atelier-lg"
      onMouseMove={onMouseMove}
      onMouseUp={() => setOnMouseDown(false)}
      onMouseLeave={() => setOnMouseDown(false)}
      onTouchMove={onMouseMove}
      onTouchEnd={() => setOnMouseDown(false)}
    >
      {/* AFTER (sotto, sempre visibile) — sito Dieci Bottega */}
      <div className="absolute inset-0 z-0">
        <NewSiteMockup />
      </div>

      {/* BEFORE (sopra, mascherato via clipPath) — sito vecchio anni 2000 */}
      <div
        className="absolute inset-0 z-10"
        style={{ clipPath: `inset(0 ${100 - inset}% 0 0)` }}
      >
        <OldSiteMockup />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-rosewood z-20 select-none shadow-[0_0_12px_rgba(230,59,46,0.5)]"
        style={{ left: `${inset}%`, transform: "translateX(-1px)" }}
      >
        <button
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-rosewood text-ivory hover:scale-110 transition-transform z-30 cursor-ew-resize flex items-center justify-center shadow-atelier-lg"
          style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
          onTouchStart={(e) => { setOnMouseDown(true); onMouseMove(e); }}
          onMouseDown={(e) => { setOnMouseDown(true); onMouseMove(e); }}
          aria-label="Trascina per confrontare"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 z-30 bg-obsidian/85 text-ivory backdrop-blur-sm px-3 py-1.5 pointer-events-none"
        style={{
          fontFamily:    "var(--db-jetbrains)",
          fontSize:      "0.5625rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight:    700,
          opacity:       inset > 5 ? 1 : 0,
          transition:    "opacity 0.3s",
        }}
      >
        ◆ PRIMA
      </div>
      <div
        className="absolute top-4 right-4 z-30 bg-rosewood text-ivory px-3 py-1.5 pointer-events-none"
        style={{
          fontFamily:    "var(--db-jetbrains)",
          fontSize:      "0.5625rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight:    700,
          opacity:       inset < 95 ? 1 : 0,
          transition:    "opacity 0.3s",
        }}
      >
        ◆ DOPO
      </div>
    </div>
  );
}

/* ─── Mockup "vecchio sito" (stile anni 2000) ──────────── */

function OldSiteMockup() {
  return (
    <div className="w-full h-full bg-[#f0e8d4] flex flex-col font-[Times,serif] text-[#1a1a1a]">
      {/* Header tradizionale */}
      <div className="bg-gradient-to-b from-[#8b4513] to-[#654321] text-[#fdfdfd] p-3 lg:p-4 border-b-4 border-[#3a2510]">
        <p className="text-[10px] lg:text-xs underline">www.trattoriadamario.it</p>
        <h2 className="text-xl lg:text-3xl font-bold italic mt-1">★ Trattoria Da Mario ★</h2>
        <p className="text-[10px] lg:text-xs italic">~ La tradizione bolognese dal 1962 ~</p>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-2 p-2 lg:p-3 text-[8px] lg:text-[10px]">
        {/* Sidebar */}
        <div className="col-span-3 bg-[#d4c8a8] border border-[#8b4513] p-2 space-y-1">
          <p className="font-bold underline">MENU:</p>
          <p className="text-[#0000ee] underline">→ Home</p>
          <p className="text-[#0000ee] underline">→ Menù</p>
          <p className="text-[#0000ee] underline">→ Foto</p>
          <p className="text-[#0000ee] underline">→ Contatti</p>
          <p className="text-[#0000ee] underline">→ Mappa</p>
          <div className="mt-3 bg-[#fffacd] border border-[#cc0000] p-1 text-center text-[#cc0000] font-bold animate-pulse">
            🔥 OFFERTA! 🔥
          </div>
        </div>
        {/* Body */}
        <div className="col-span-9 bg-[#fdfaf0] border border-[#8b4513] p-2 lg:p-3 space-y-2 overflow-hidden">
          <h3 className="text-base lg:text-lg font-bold text-[#8b0000]">Benvenuti nel nostro sito!</h3>
          <p>Siamo lieti di darvi il benvenuto nella nostra trattoria...</p>
          <p>...cucina tipica bolognese, ambiente familiare...</p>
          <div className="flex gap-2 mt-2">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#a0a0a0] border-2 border-[#8b4513] flex items-center justify-center text-[#fff] text-[8px]">IMG</div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#a0a0a0] border-2 border-[#8b4513] flex items-center justify-center text-[#fff] text-[8px]">IMG</div>
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-[#a0a0a0] border-2 border-[#8b4513] flex items-center justify-center text-[#fff] text-[8px]">IMG</div>
          </div>
          <p className="text-[#cc0000] font-bold text-center mt-2 text-[8px] lg:text-[10px]">
            ★★★ PRENOTA AL 051-XXXXXXX ★★★
          </p>
          <div className="mt-1 text-center text-[7px] lg:text-[9px] text-[#666] italic">
            © 2008 - Best viewed at 1024x768 - IE6 compatible
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup "sito nuovo Dieci Bottega" ──────────────── */

function NewSiteMockup() {
  return (
    <div className="w-full h-full bg-ivory flex flex-col relative overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-3 lg:px-4 py-2 border-b border-obsidian/8 bg-ivory">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-rosewood" />
          <span className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-obsidian/15" />
          <span className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-obsidian/15" />
        </div>
        <div
          className="flex-1 mx-3 lg:mx-4 bg-obsidian/[0.04] rounded-md px-2 lg:px-3 py-0.5 text-center text-obsidian/45"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.08em" }}
        >
          trattoriadamario.it
        </div>
      </div>

      {/* Hero rosewood */}
      <div className="bg-rosewood text-ivory p-4 lg:p-6 relative overflow-hidden">
        <div className="grain-soft" aria-hidden />
        <div className="relative flex items-center gap-2 mb-2 lg:mb-3">
          <span className="live-dot" style={{ background: "#F4EFE6" }} />
          <span style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
            TRATTORIA · BOLOGNA
          </span>
        </div>
        <h3
          className="relative text-ivory"
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(1.5rem, 3vw, 2.5rem)",
            lineHeight:    0.95,
            letterSpacing: "-0.035em",
            textTransform: "uppercase",
          }}
        >
          Il pranzo<br />di famiglia.
        </h3>
        <p
          className="relative text-ivory/75 mt-2"
          style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.875rem" }}
        >
          Cucina bolognese, due tavolate in cortile, vino sfuso.
        </p>
        <div className="relative flex gap-2 mt-3">
          <span className="bg-ivory text-rosewood px-3 py-1.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 700 }}>
            PRENOTA →
          </span>
          <span className="border border-ivory/40 text-ivory px-3 py-1.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.10em", textTransform: "uppercase" }}>
            MENU
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-obsidian text-ivory px-4 lg:px-6 py-3 grid grid-cols-3 gap-2 border-t border-ivory/10">
        {[
          { n: "+187%", l: "Prenotazioni" },
          { n: "1°",    l: "Su Google" },
          { n: "9 gg",  l: "Consegna" },
        ].map(s => (
          <div key={s.l}>
            <p className="text-rosewood" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)", letterSpacing: "-0.02em" }}>
              {s.n}
            </p>
            <p className="text-ivory/40 mt-0.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.4375rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
