"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/ContainerScroll";

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

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 35%, rgba(255,255,255,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-[72px]" />

      <ContainerScroll
        titleComponent={
          <div className="px-4 pb-8">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
            >
              <span className="live-dot" style={{ background: "#F4EFE6" }} />
              <span className="text-ivory/70" style={labelStyle}>
                BOTTEGA APERTA · DISPONIBILITÀ NOVEMBRE
              </span>
            </motion.div>

            <div className="overflow-hidden">
              {["Il sito", "che ti", "serve."].map((line, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    className="block text-ivory"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.09 }}
                    style={{
                      fontFamily:    "var(--db-archivo)",
                      fontWeight:    900,
                      fontSize:      "clamp(3rem, 9vw, 8rem)",
                      lineHeight:    0.9,
                      letterSpacing: "-0.045em",
                      textTransform: "uppercase",
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </div>

            <motion.p
              className="text-ivory/85 mt-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.55 }}
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.25rem, 2.6vw, 2rem)",
                lineHeight: 1.25,
              }}
            >
              In dieci giorni. Fatto bene.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.75 }}
            >
              <Link
                href="/inizia-progetto"
                className="relative inline-flex items-center justify-center gap-2 bg-ivory text-rosewood overflow-hidden group press"
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
                className="relative inline-flex items-center justify-center gap-2 border border-ivory/30 text-ivory overflow-hidden group press hover:border-ivory/60 transition-colors duration-300"
                style={{ ...labelStyle, padding: "1rem 1.75rem", whiteSpace: "nowrap" }}
              >
                Sfoglia il catalogo
              </Link>
            </motion.div>
          </div>
        }
      >
        {/* MOCKUP DEL SITO — preview composito brand */}
        <BrowserMockup />
      </ContainerScroll>

      {/* Ticker */}
      <motion.div
        className="relative border-t border-ivory/15 overflow-hidden py-3.5 cursor-default"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
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

/* ─── Browser-style mockup inside the tilted card ─── */

function BrowserMockup() {
  return (
    <div className="relative h-full w-full flex flex-col bg-ivory">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-obsidian/8 bg-ivory/90 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rosewood" />
          <span className="w-2.5 h-2.5 rounded-full bg-obsidian/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-obsidian/15" />
        </div>
        <div
          className="flex-1 mx-4 bg-obsidian/[0.04] rounded-md px-3 py-1 text-center text-obsidian/45"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem", letterSpacing: "0.08em" }}
        >
          diecibottega.it
        </div>
        <div className="w-12" />
      </div>

      {/* Mockup content */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 overflow-hidden">

        {/* LEFT: Sample landing preview */}
        <div className="md:col-span-7 bg-obsidian text-ivory rounded-xl p-5 md:p-7 relative overflow-hidden">
          <div className="grain-soft" aria-hidden />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="live-dot" />
              <span className="text-ivory/65" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                TRATTORIA DA MARIO
              </span>
            </div>
            <h3
              className="text-ivory mb-3"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(1.5rem, 3vw, 2.5rem)",
                lineHeight:    0.95,
                letterSpacing: "-0.035em",
                textTransform: "uppercase",
              }}
            >
              Il pranzo di<br />famiglia.
            </h3>
            <p className="text-ivory/55 max-w-md mb-5" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.9375rem", lineHeight: 1.4 }}>
              Cucina bolognese, vino sfuso, due tavolate in cortile.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-rosewood text-ivory px-3 py-1.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                PRENOTA →
              </span>
              <span className="border border-ivory/20 text-ivory/70 px-3 py-1.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}>
                MENU
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-ivory/15">
              {[
                { n: "187%", l: "PRENOTAZIONI" },
                { n: "9 gg", l: "CONSEGNA" },
                { n: "1°",   l: "GOOGLE MAPS" },
              ].map(s => (
                <div key={s.l}>
                  <p className="text-rosewood" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)", letterSpacing: "-0.02em" }}>
                    +{s.n}
                  </p>
                  <p className="text-ivory/45 mt-0.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.4375rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: stacked widget cards */}
        <div className="md:col-span-5 flex flex-col gap-3 md:gap-4">

          {/* In bottega · oggi */}
          <div className="bg-rosewood text-ivory rounded-xl p-4 md:p-5 relative overflow-hidden">
            <div className="grain-soft" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-ivory/85" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
                  <span className="live-dot" style={{ background: "#F4EFE6" }} />
                  IN BOTTEGA · OGGI
                </span>
              </div>
              <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "0.9375rem", letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                Sito Studio Ferretti
              </p>
              <p className="text-ivory/65 mt-0.5" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.6875rem" }}>
                Giorno 7 di 10
              </p>
              <div className="mt-3 h-px bg-ivory/25 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-ivory" style={{ width: "70%" }} />
              </div>
            </div>
          </div>

          {/* Pricing snapshot */}
          <div className="bg-ivory border border-obsidian/10 rounded-xl p-4 md:p-5">
            <p className="text-rosewood mb-3" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
              ◆ LISTINO TRASPARENTE
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { t: "BASIC",   p: "800",   sub: "7 gg" },
                { t: "PRO",     p: "1.500", sub: "10–14", highlight: true },
                { t: "PREMIUM", p: "2.500", sub: "3–4 sett." },
              ].map(p => (
                <div key={p.t} className={p.highlight ? "border-x border-rosewood/30 px-1" : "px-1"}>
                  <p className={p.highlight ? "text-rosewood" : "text-obsidian/40"} style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.4375rem", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
                    {p.t}
                  </p>
                  <p className="text-obsidian mt-1" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    €{p.p}
                  </p>
                  <p className="text-obsidian/35 mt-0.5" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.4375rem" }}>
                    {p.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CRM card */}
          <div className="bg-obsidian text-ivory rounded-xl p-4 md:p-5 flex-1">
            <p className="text-rosewood mb-2" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
              ◆ CRM · PIPELINE
            </p>
            {[
              { name: "Mario R.", stage: "Nuovo",         color: "bg-rosewood/80" },
              { name: "Studio F.", stage: "Appuntamento", color: "bg-peach" },
              { name: "Da Mario",  stage: "Vinto",        color: "bg-ivory/70" },
            ].map(l => (
              <div key={l.name} className="flex items-center justify-between py-1.5 border-b border-ivory/8 last:border-0">
                <span className="text-ivory/85" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.75rem" }}>
                  {l.name}
                </span>
                <span className={`text-ivory px-2 py-0.5 rounded ${l.color}`} style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.4375rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#1A1414" }}>
                  {l.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
