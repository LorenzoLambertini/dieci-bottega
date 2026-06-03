"use client";

import React, { useRef, useId, useEffect } from "react";
import { animate, useMotionValue, type AnimationPlaybackControls } from "framer-motion";

/**
 * EtherealShadows · sfondo atmosferico animato
 * Adattato dal Framer original, brand-allineato:
 * - Nessuna immagine esterna (mask = CSS radial-gradient inline)
 * - Colori brand (rosewood/burgundy/peach)
 * - Animazione hueRotate sulla turbolenza per effetto "respiro"
 */

interface AnimationConfig {
  scale: number;  // 1-100 → intensità del displacement
  speed: number;  // 1-100 → velocità ciclo hueRotate
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
  const reactId    = useId();
  const filterId   = `ethereal-${reactId.replace(/:/g, "")}`;
  const feMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueMV       = useMotionValue(180);
  const animationCtl = useRef<AnimationPlaybackControls | null>(null);

  const animEnabled  = animation && animation.scale > 0;
  const displaceScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
  const animDuration  = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

  useEffect(() => {
    if (!feMatrixRef.current || !animEnabled) return;
    animationCtl.current?.stop();
    hueMV.set(0);
    animationCtl.current = animate(hueMV, 360, {
      duration:   animDuration / 25,
      repeat:     Infinity,
      repeatType: "loop",
      ease:       "linear",
      onUpdate:   (v) => feMatrixRef.current?.setAttribute("values", String(v)),
    });
    return () => { animationCtl.current?.stop(); };
  }, [animEnabled, animDuration, hueMV]);

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
      <div
        style={{
          position: "absolute",
          inset:    `-${displaceScale}px`,
          filter:   animEnabled ? `url(#${filterId}) blur(4px)` : "blur(4px)",
        }}
      >
        {/* SVG filter */}
        {animEnabled && (
          <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
            <defs>
              <filter id={filterId}>
                <feTurbulence
                  result="undulation"
                  numOctaves="2"
                  baseFrequency={`${mapRange(animation!.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation!.scale, 0, 100, 0.004, 0.002)}`}
                  seed="0"
                  type="turbulence"
                />
                <feColorMatrix
                  ref={feMatrixRef}
                  in="undulation"
                  type="hueRotate"
                  values="180"
                />
                <feColorMatrix
                  in="dist"
                  result="circulation"
                  type="matrix"
                  values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                />
                <feDisplacementMap in="SourceGraphic" in2="circulation" scale={displaceScale} result="dist" />
                <feDisplacementMap in="dist" in2="undulation" scale={displaceScale} result="output" />
              </filter>
            </defs>
          </svg>
        )}

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
