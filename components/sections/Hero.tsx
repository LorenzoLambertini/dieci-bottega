"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const ticker = [
  "SITO VETRINA", "·", "LANDING PAGE", "·",
  "AUTOMAZIONI", "·", "AI-POWERED", "·",
  "10 GIORNI", "·", "MADE IN BO", "·",
  "MESTIERE", "·", "DETTAGLI", "·",
];

const stats = [
  { n: "10",  unit: " gg",  sub: "Consegna media" },
  { n: "800", unit: "€",   sub: "Prezzo base"     },
  { n: "AI+", unit: "",     sub: "Mestiere umano"  },
  { n: "BO",  unit: "→IT", sub: "Made in Bologna" },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--db-jetbrains)",
  fontSize: "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#E63B2E" }}
    >
      {/* Noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Nav spacer */}
      <div className="h-16 lg:h-20 shrink-0" />

      {/* Main content */}
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 flex-1 flex flex-col justify-center py-16 lg:py-24">

        {/* Tag */}
        <motion.div
          className="flex items-center gap-3 mb-10 lg:mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
        >
          <span className="block w-8 h-px bg-ivory/40" />
          <span className="text-ivory/60" style={labelStyle}>
            MICRO-AGENZIA DIGITALE · BOLOGNA · EST. 2026
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          className="text-ivory"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(3.5rem, 11vw, 10.5rem)",
            lineHeight:    0.92,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
          }}
        >
          Il sito<br />
          che ti<br />
          serve.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-ivory/80 mt-6 lg:mt-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.35 }}
          style={{
            fontFamily: "var(--db-cardo)",
            fontStyle:  "italic",
            fontSize:   "clamp(1.5rem, 3.2vw, 2.75rem)",
            lineHeight: 1.2,
          }}
        >
          In dieci giorni.
        </motion.p>

        {/* Body + CTAs */}
        <motion.div
          className="mt-12 lg:mt-16 grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-20 items-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
        >
          <p
            className="text-ivory/65 max-w-lg"
            style={{
              fontFamily: "var(--db-archivo)",
              fontSize:   "clamp(0.9375rem, 1.4vw, 1.0625rem)",
              lineHeight: 1.65,
            }}
          >
            Siti professionali per PMI italiane in 7–14 giorni,
            al prezzo di un template, con la cura di un&apos;agenzia.{" "}
            <em className="not-italic text-ivory" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic" }}>
              Veloci, ma non frettolosi.
            </em>
          </p>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[220px]">
            <a
              href="#contatti"
              className="flex items-center justify-center gap-2 bg-ivory text-rosewood hover:bg-ash transition-colors duration-200"
              style={{ ...labelStyle, letterSpacing: "0.08em", padding: "1rem 1.75rem", whiteSpace: "nowrap" }}
            >
              INIZIA IL PROGETTO →
            </a>
            <a
              href="#lavori"
              className="flex items-center justify-center gap-2 border border-ivory/30 text-ivory hover:border-ivory/70 transition-colors duration-200"
              style={{ ...labelStyle, letterSpacing: "0.08em", padding: "1rem 1.75rem", whiteSpace: "nowrap" }}
            >
              VEDI I LAVORI
            </a>
          </div>
        </motion.div>
      </div>

      {/* Ticker strip */}
      <motion.div
        className="border-t border-ivory/15 overflow-hidden py-3 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 0.9 }}
      >
        <div
          className="flex gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {[...ticker, ...ticker].map((item, i) => (
            <span
              key={i}
              className="text-ivory/30"
              style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em" }}
            >
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        className="border-t border-ivory/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease, delay: 0.7 }}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-ivory/15">
            {stats.map((s, i) => (
              <div
                key={i}
                className="py-5 lg:py-7 flex flex-col gap-1"
                style={{
                  paddingLeft:  i > 0 ? "2rem" : undefined,
                  paddingRight: i < 3 ? "2rem" : undefined,
                }}
              >
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-ivory"
                    style={{
                      fontFamily: "var(--db-archivo)",
                      fontWeight: 900,
                      fontSize:   "clamp(1.375rem, 2.5vw, 1.875rem)",
                      lineHeight: 1,
                    }}
                  >
                    {s.n}
                  </span>
                  <span
                    className="text-ivory/60"
                    style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.875rem" }}
                  >
                    {s.unit}
                  </span>
                </div>
                <span className="text-ivory/40" style={{ ...labelStyle, fontSize: "0.625rem" }}>
                  {s.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
