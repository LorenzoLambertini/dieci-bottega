"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";

/**
 * BeforeAfter · slider "prima / dopo" su screenshot statici.
 * - Desktop (≥ md) usa gli screenshot 1440×900, mobile quelli 390×844
 * - Pointer events: mouse, touch e penna con la stessa logica
 * - Tastiera: frecce ←/→ (Shift = passo lungo), Home/End
 */

interface Shot {
  desktop: string;
  mobile:  string;
  alt:     string;
}

interface BeforeAfterProps {
  before:      Shot;
  after:       Shot;
  beforeLabel: string;
  afterLabel:  string;
}

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.5625rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight:    700,
  transition:    "opacity 0.3s ease-out",
};

function Screens({ shot, priority }: { shot: Shot; priority?: boolean }) {
  return (
    <>
      <Image
        src={shot.desktop}
        alt={shot.alt}
        fill
        priority={priority}
        sizes="(min-width: 1480px) 1384px, 100vw"
        className="hidden md:block object-cover object-top"
      />
      <Image
        src={shot.mobile}
        alt={shot.alt}
        fill
        priority={priority}
        sizes="360px"
        className="md:hidden object-cover object-top"
      />
    </>
  );
}

export default function BeforeAfter({ before, after, beforeLabel, afterLabel }: BeforeAfterProps) {
  const [inset, setInset] = useState(50);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const moveTo = useCallback((clientX: number) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    setInset(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft"  ? inset - step :
      e.key === "ArrowRight" ? inset + step :
      e.key === "Home"       ? 0 :
      e.key === "End"        ? 100 : null;
    if (next === null) return;
    e.preventDefault();
    setInset(Math.max(0, Math.min(100, next)));
  };

  return (
    <div
      ref={boxRef}
      className="relative w-full max-w-[360px] md:max-w-none mx-auto aspect-[390/844] md:aspect-[16/10] overflow-hidden rounded-xl select-none border border-obsidian/10 shadow-atelier-lg bg-obsidian cursor-ew-resize"
      // pan-y: su mobile lo scroll verticale resta libero, il trascinamento orizzontale muove lo slider
      style={{ touchAction: "pan-y" }}
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => { if (dragging) moveTo(e.clientX); }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {/* DOPO (sotto, sempre visibile) */}
      <div className="absolute inset-0 z-0">
        <Screens shot={after} />
      </div>

      {/* PRIMA (sopra, mascherato via clipPath) */}
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - inset}% 0 0)` }}>
        <Screens shot={before} priority />
      </div>

      {/* Divider + maniglia (è lei lo slider accessibile) */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-rosewood z-20 shadow-[0_0_12px_rgba(230,59,46,0.5)]"
        style={{ left: `${inset}%`, transform: "translateX(-1px)" }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Confronta il sito di prima con il nuovo sito"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(inset)}
          aria-valuetext={`${Math.round(inset)}% sito di prima`}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-rosewood text-ivory hover:scale-110 transition-transform duration-200 ease-out flex items-center justify-center shadow-atelier-lg outline-none focus-visible:ring-2 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-rosewood"
        >
          <GripVertical className="w-4 h-4" aria-hidden />
        </div>
      </div>

      {/* Etichette */}
      <div
        className="absolute top-3 left-3 md:top-4 md:left-4 z-30 bg-obsidian/85 text-ivory px-3 py-1.5 pointer-events-none"
        style={{ ...labelStyle, opacity: inset > 8 ? 1 : 0 }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute bottom-3 right-3 md:bottom-auto md:top-4 md:right-4 z-30 bg-rosewood text-ivory px-3 py-1.5 pointer-events-none"
        style={{ ...labelStyle, opacity: inset < 92 ? 1 : 0 }}
      >
        {afterLabel}
      </div>
    </div>
  );
}
