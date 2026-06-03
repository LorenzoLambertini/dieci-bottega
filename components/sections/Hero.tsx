"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="grain-soft" aria-hidden />

      {/* Cinematic radial highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 35%, rgba(255,255,255,0.10) 0%, transparent 60%)",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(26,20,20,0.22) 100%)",
        }}
      />

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-[72px] shrink-0" />

      {/* Main content — leggero, statico, scorrevole */}
      <div className="relative mx-auto w-full max-w-[1480px] px-6 lg:px-12 pt-10 lg:pt-14 pb-14 lg:pb-20">

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ── Left: editorial copy ── */}
          <div className="lg:col-span-7 flex flex-col">

            {/* Meta tag */}
            <motion.div
              className="flex items-center gap-3 mb-8 lg:mb-10"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
            >
              <span className="live-dot" style={{ background: "#F4EFE6" }} />
              <span className="text-ivory/70" style={labelStyle}>
                BOTTEGA APERTA · DISPONIBILITÀ NOVEMBRE
              </span>
            </motion.div>

            {/* H1 staggered */}
            <h1
              className="text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(3rem, 10vw, 8.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.045em",
                textTransform: "uppercase",
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
              className="text-ivory/85 mt-5 lg:mt-7 max-w-2xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.375rem, 2.6vw, 2.25rem)",
                lineHeight: 1.25,
              }}
            >
              In dieci giorni. Fatto bene.
            </motion.p>

            {/* Body */}
            <motion.p
              className="text-ivory/65 mt-6 lg:mt-7 max-w-md"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.65 }}
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize:   "clamp(0.9375rem, 1.4vw, 1.0625rem)",
                lineHeight: 1.65,
              }}
            >
              Micro-agenzia di Bologna. Costruiamo siti, CRM e automazioni per
              chi non ha tempo da perdere e vuole un lavoro che si veda.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-9 lg:mt-10 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.8 }}
            >
              <Link
                href="/inizia-progetto"
                className="relative flex items-center justify-center gap-2.5 bg-ivory text-rosewood overflow-hidden group press"
                style={{ ...labelStyle, padding: "1rem 1.75rem", whiteSpace: "nowrap" }}
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
                className="relative flex items-center justify-center gap-2.5 border border-ivory/30 text-ivory overflow-hidden group press hover:border-ivory/60 transition-colors duration-300"
                style={{ ...labelStyle, padding: "1rem 1.75rem", whiteSpace: "nowrap" }}
              >
                <span
                  className="absolute inset-0 bg-ivory/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                  style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                  aria-hidden
                />
                <span className="relative">Sfoglia il catalogo</span>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: floating UI fragments (statici, niente scroll-bound) ── */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 lg:pl-8 xl:pl-12 mt-2">

            {/* Card · In bottega */}
            <motion.div
              className="border border-ivory/15 bg-ivory/[0.06] backdrop-blur-sm p-5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.55 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-ivory/65" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                  <span className="live-dot" style={{ background: "#F4EFE6" }} />
                  IN BOTTEGA · OGGI
                </span>
                <span className="text-ivory/40" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                  W47
                </span>
              </div>
              <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1rem", lineHeight: 1.35 }}>
                Trattoria Da Mario — sito vetrina
              </p>
              <p className="text-ivory/55 mt-1" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.4 }}>
                Giorno 6 di 9 · Sviluppo interfaccia menu
              </p>
              <div className="mt-4 h-px bg-ivory/15 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-ivory"
                  initial={{ width: 0 }}
                  animate={{ width: "66.6%" }}
                  transition={{ duration: 1.4, ease, delay: 1.1 }}
                />
              </div>
            </motion.div>

            {/* Card · Next slot */}
            <motion.div
              className="border border-ivory/15 bg-ivory/[0.04] backdrop-blur-sm p-5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-ivory/65" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                  PROSSIMO SLOT
                </span>
                <span className="text-ivory/30" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                  CALENDARIO
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  03
                </span>
                <span className="text-ivory/60" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "1rem" }}>
                  novembre
                </span>
              </div>
              <p className="text-ivory/50 mt-2" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.875rem" }}>
                Due posti rimasti questo trimestre.
              </p>
            </motion.div>

            {/* Card · Pricing */}
            <motion.div
              className="border border-ivory/15 bg-ivory/[0.04] backdrop-blur-sm p-5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.85 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-ivory/65" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                  LISTINO TRASPARENTE
                </span>
                <span className="text-ivory/30" style={{ ...labelStyle, fontSize: "0.5rem" }}>↗</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tier: "BASIC",   price: "800" },
                  { tier: "PRO",     price: "1.500" },
                  { tier: "PREMIUM", price: "2.500" },
                ].map((p, i) => (
                  <div key={p.tier} className={i === 1 ? "border-l border-r border-ivory/15 px-3" : "px-1"}>
                    <p className={i === 1 ? "text-rosewood" : "text-ivory/40"} style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                      {p.tier}
                    </p>
                    <p className="text-ivory mt-1" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                      €{p.price}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <motion.div
        className="relative border-t border-ivory/15 overflow-hidden py-3.5 cursor-default"
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
              className="text-ivory/35 flex items-center gap-12"
              style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.18em" }}
            >
              <span>{item}</span>
              <span className="text-ivory/15">◆</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
