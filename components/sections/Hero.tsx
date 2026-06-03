"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EtherealShadows from "@/components/ui/EtherealShadows";

const ease = [0.2, 0.8, 0.2, 1] as const;

const ticker = [
  "MICRO-AGENZIA",
  "BOLOGNA",
  "DIECI GIORNI",
  "MESTIERE",
  "AI ASSISTITA",
  "ONESTÀ RADICALE",
  "CODICE PULITO",
  "DETTAGLI",
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Hero() {
  return (
    <section className="relative bg-rosewood text-ivory overflow-hidden">

      {/* ── Sfondo etereo animato (brand-allineato) ── */}
      <EtherealShadows
        blobs={[
          { color: "rgba(122, 24, 24, 0.65)",  cx: "20%", cy: "30%", rx: "55%", ry: "50%", intensity: 1.0 },
          { color: "rgba(196, 74, 56, 0.50)",  cx: "75%", cy: "70%", rx: "55%", ry: "45%", intensity: 0.85 },
          { color: "rgba(242, 184, 162, 0.35)",cx: "55%", cy: "20%", rx: "40%", ry: "30%", intensity: 0.7 },
          { color: "rgba(26, 20, 20, 0.40)",   cx: "85%", cy: "30%", rx: "35%", ry: "30%", intensity: 0.6 },
        ]}
        animation={{ scale: 55, speed: 25 }}
        noise={{ opacity: 0.5, scale: 1 }}
      />

      {/* Vignette overlay sopra blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(26,20,20,0.30) 100%)",
        }}
      />

      {/* Spacer for fixed nav */}
      <div className="relative z-10 h-16 lg:h-[72px]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 lg:px-12 pt-10 lg:pt-16 pb-16 lg:pb-24">

        <div className="max-w-4xl">

          {/* Meta tag */}
          <motion.div
            className="flex items-center gap-3 mb-8 lg:mb-10"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
          >
            <span className="live-dot" style={{ background: "#F4EFE6" }} />
            <span className="text-ivory/75" style={labelStyle}>
              BOTTEGA APERTA · DISPONIBILITÀ NOVEMBRE
            </span>
          </motion.div>

          {/* H1 staggered */}
          <h1
            className="text-ivory"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(3rem, 11vw, 9.5rem)",
              lineHeight:    0.9,
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
              textShadow:    "0 4px 24px rgba(26,20,20,0.25)",
            }}
          >
            {["Il sito", "che ti", "serve."].map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, ease, delay: 0.18 + i * 0.09 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            className="text-ivory/90 mt-5 lg:mt-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
            style={{
              fontFamily: "var(--db-cardo)",
              fontStyle:  "italic",
              fontSize:   "clamp(1.375rem, 2.8vw, 2.5rem)",
              lineHeight: 1.25,
              textShadow: "0 2px 12px rgba(26,20,20,0.20)",
            }}
          >
            In dieci giorni. Fatto bene.
          </motion.p>

          {/* Body */}
          <motion.p
            className="text-ivory/75 mt-6 lg:mt-7 max-w-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.65 }}
            style={{
              fontFamily: "var(--db-archivo)",
              fontSize:   "clamp(1rem, 1.5vw, 1.1875rem)",
              lineHeight: 1.65,
            }}
          >
            Micro-agenzia di Bologna. Costruiamo siti, CRM e automazioni per
            chi non ha tempo da perdere e vuole un lavoro che si veda.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-9 lg:mt-11 flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.8 }}
          >
            <Link
              href="/inizia-progetto"
              className="relative flex items-center justify-center gap-2.5 bg-ivory text-rosewood overflow-hidden group press shadow-atelier-lg"
              style={{ ...labelStyle, padding: "1.0625rem 1.875rem", whiteSpace: "nowrap" }}
            >
              <span
                className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                aria-hidden
              />
              <span className="relative flex items-center gap-2 group-hover:text-ivory transition-colors duration-150">
                Il tuo sito gratis
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
            <Link
              href="/servizi"
              className="relative flex items-center justify-center gap-2.5 border border-ivory/40 text-ivory backdrop-blur-sm overflow-hidden group press hover:border-ivory/70 transition-colors duration-300"
              style={{ ...labelStyle, padding: "1.0625rem 1.875rem", whiteSpace: "nowrap" }}
            >
              <span
                className="absolute inset-0 bg-ivory/15 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                aria-hidden
              />
              <span className="relative">Sfoglia il catalogo</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Ticker */}
      <motion.div
        className="relative z-10 border-t border-ivory/15 overflow-hidden py-3.5 cursor-default backdrop-blur-sm bg-rosewood/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 1.0 }}
      >
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: "marquee 40s linear infinite" }}
        >
          {[...ticker, ...ticker, ...ticker].map((item, i) => (
            <span
              key={i}
              className="text-ivory/45 flex items-center gap-12"
              style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.18em" }}
            >
              <span>{item}</span>
              <span className="text-ivory/20">◆</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
