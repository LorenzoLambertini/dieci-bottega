"use client";

import React from "react";

/**
 * EtherealShadows · sfondo atmosferico animato
 * Adattato dal Framer original, brand-allineato:
 * - Nessuna immagine esterna (mask = CSS radial-gradient inline)
 * - Colori brand (rosewood/burgundy/peach)
 * - Movimento "respiro" dei blob con sole animazioni CSS di transform:
 *   niente filtri SVG animati, che su Safari iOS lasciavano riquadri
 *   di colore diverso dietro ai testi e pesavano sui telefoni
 */

interface AnimationConfig {
  scale: number;  // 1-100 → ampiezza del movimento dei blob
  speed: number;  // 1-100 → velocità del ciclo
}

interface NoiseConfig {
  opacity: number; // 0-1
  scale:   number; // moltiplicatore size grain
}

interface EtherealShadowsProps {
  color?:     string;             // colore principale blob
  blobs?:     Array<{ color: string; cx: string; cy: string; rx: string; ry: string; intensity?: number }>;
  animation?: AnimationConfig;
  noise?:     NoiseConfig;
  className?: string;
  style?:     React.CSSProperties;
}

function mapRange(v: number, fLow: number, fHigh: number, tLow: number, tHigh: number): number {
  if (fLow === fHigh) return tLow;
  return tLow + ((v - fLow) / (fHigh - fLow)) * (tHigh - tLow);
}

export default function EtherealShadows({
  color     = "rgba(122, 24, 24, 0.55)", // burgundy translucent default
  blobs,
  animation = { scale: 60, speed: 30 },
  noise     = { opacity: 0.6, scale: 1 },
  className,
  style,
}: EtherealShadowsProps) {
  const animEnabled = !!animation && animation.scale > 0;
  const drift       = animation ? mapRange(animation.scale, 1, 100, 2, 12) : 0;   // % di spostamento
  const duration    = animation ? mapRange(animation.speed, 1, 100, 40, 8) : 0;   // secondi per ciclo

  // Default blobs (3 in punti diversi, profondità diverse)
  const finalBlobs = blobs ?? [
    { color: "rgba(122, 24, 24, 0.55)", cx: "25%", cy: "35%", rx: "55%", ry: "45%", intensity: 1.0 },
    { color: "rgba(196, 74, 56, 0.40)", cx: "75%", cy: "65%", rx: "50%", ry: "40%", intensity: 0.85 },
    { color: "rgba(242, 184, 162, 0.30)",cx: "55%", cy: "20%", rx: "40%", ry: "30%", intensity: 0.7 },
  ];

  return (
    <div
      className={className}
      style={{
        overflow:  "hidden",
        position:  "absolute",
        inset:     0,
        ...style,
      }}
      aria-hidden
    >
      {/* Keyframes locali: sempre emesse, indipendenti da Tailwind */}
      {animEnabled && (
        <style>{`
          @keyframes ethereal-drift-0 { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(${drift}%, ${drift * 0.6}%, 0) scale(1.08); } }
          @keyframes ethereal-drift-1 { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(-${drift}%, -${drift * 0.5}%, 0) scale(0.97); } }
          @keyframes ethereal-drift-2 { from { transform: translate3d(0,0,0) scale(0.98); } to { transform: translate3d(${drift * 0.5}%, -${drift}%, 0) scale(1.06); } }
        `}</style>
      )}

      <div style={{ position: "absolute", inset: "-15%" }}>
        {/* Layered radial gradients (CSS, niente immagini esterne) */}
        {finalBlobs.map((b, i) => (
          <div
            key={i}
            style={{
              position:   "absolute",
              inset:      0,
              background: `radial-gradient(ellipse ${b.rx} ${b.ry} at ${b.cx} ${b.cy}, ${b.color} 0%, ${b.color.replace(/[\d.]+\)$/, "0)")} 70%)`,
              opacity:    b.intensity ?? 1,
              mixBlendMode: "screen",
              animation:  animEnabled
                ? `ethereal-drift-${i % 3} ${duration * (1 + i * 0.15)}s ease-in-out ${-i * 3}s infinite alternate`
                : undefined,
              willChange: animEnabled ? "transform" : undefined,
            }}
          />
        ))}

        {/* Base color tint (rosewood subtle) */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: color,
            opacity:    0.0, // disabled by default since we use base bg-rosewood from parent
          }}
        />
      </div>

      {/* Optional film grain */}
      {noise && noise.opacity > 0 && (
        <div
          style={{
            position:         "absolute",
            inset:            0,
            backgroundImage:  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize:   `${noise.scale * 200}px ${noise.scale * 200}px`,
            backgroundRepeat: "repeat",
            opacity:          noise.opacity / 2,
            mixBlendMode:     "overlay",
            pointerEvents:    "none",
          }}
        />
      )}
    </div>
  );
}
