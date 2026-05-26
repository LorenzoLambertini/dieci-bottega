"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const PROJECTS = [
  {
    n: "01",
    client: "Trattoria Da Mario",
    cat: "RISTORAZIONE · BOLOGNA",
    tier: "TIER 02 · PRO",
    desc: "Sito vetrina con prenotazione diretta, menu digitale aggiornabile e Google My Business integrato. Da zero a online in 9 giorni.",
    results: ["+187% prenotazioni online", "1ª pagina Google Maps", "9 giorni di consegna"],
    bg: "#F2B8A2",
    accent: "#E63B2E",
  },
  {
    n: "02",
    client: "Studio Legale Ferretti",
    cat: "PROFESSIONALE · BOLOGNA",
    tier: "TIER 02 · PRO",
    desc: "Sito premium con lead generation qualificata, blog giuridico e SEO locale ottimizzata. Consegnato in 11 giorni.",
    results: ["+2× lead qualificati al mese", "1ª pagina Google", "11 giorni di consegna"],
    bg: "#E8E2D6",
    accent: "#1A1414",
  },
  {
    n: "03",
    client: "Immobiliare Adriatica",
    cat: "IMMOBILIARE · RIMINI",
    tier: "TIER 03 · PREMIUM",
    desc: "Landing page + CRM su misura con listings dinamici, filtri avanzati e pannello admin per gli agenti. Stack: Next.js + Supabase.",
    results: ["+2× traffico organico", "450+ immobili gestiti", "12 giorni di consegna"],
    bg: "#F4EFE6",
    accent: "#E63B2E",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Portfolio() {
  return (
    <section id="lavori" className="bg-ivory">
      {/* ── Header ── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>02 · LAVORI</span>
            </div>
            <h2
              className="text-obsidian"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.25rem, 5.5vw, 5rem)",
                lineHeight:    0.93,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              I nostri<br />lavori.
            </h2>
          </motion.div>
          <motion.p
            className="text-obsidian/45 max-w-md lg:ml-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Ogni progetto nasce da un brief chiaro. Il design segue
            la strategia, mai il contrario.
          </motion.p>
        </div>
      </div>

      {/* ── Projects list ── */}
      <div className="border-t border-obsidian/10">
        {PROJECTS.map((p, i) => (
          <motion.div
            key={p.n}
            className="border-b border-obsidian/10 group relative overflow-hidden"
            style={{ backgroundColor: p.bg }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.65, ease, delay: i * 0.08 }}
          >
            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{ background: "rgba(26,20,20,0.03)" }}
              aria-hidden
            />
            {/* Left accent on hover */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] bg-rosewood scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              aria-hidden
            />

            <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-10 lg:py-14 grid lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-16 items-start">

              {/* Number */}
              <span
                className="text-obsidian/10 hidden lg:block select-none group-hover:text-obsidian/15 transition-all duration-300 group-hover:scale-105 origin-center"
                style={{
                  fontFamily: "var(--db-archivo)",
                  fontWeight: 900,
                  fontSize:   "5rem",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  display: "block",
                }}
              >
                {p.n}
              </span>

              {/* Content */}
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span
                    className="text-obsidian/35"
                    style={{ ...labelStyle, fontSize: "0.5625rem" }}
                  >
                    {p.cat}
                  </span>
                  <span className="block w-1 h-1 rounded-full bg-obsidian/20" aria-hidden />
                  <span
                    className="text-obsidian/35"
                    style={{ ...labelStyle, fontSize: "0.5625rem" }}
                  >
                    {p.tier}
                  </span>
                </div>
                <h3
                  className="text-obsidian mb-4 group-hover:translate-x-1 transition-transform duration-300"
                  style={{
                    fontFamily:    "var(--db-archivo)",
                    fontWeight:    900,
                    fontSize:      "clamp(1.75rem, 3vw, 2.75rem)",
                    lineHeight:    1.05,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {p.client}
                </h3>
                <p
                  className="text-obsidian/55 max-w-lg"
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
                >
                  {p.desc}
                </p>
              </div>

              {/* Results */}
              <div className="flex flex-col gap-4">
                <ul className="space-y-2.5 lg:min-w-[200px]">
                  {p.results.map(r => (
                    <li key={r} className="flex items-center gap-2.5">
                      <span className="block w-1.5 h-1.5 shrink-0 rounded-sm" style={{ backgroundColor: p.accent }} />
                      <span
                        className="text-obsidian"
                        style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.875rem" }}
                      >
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contatti"
                  className="inline-flex items-center gap-1.5 text-obsidian/30 hover:text-rosewood transition-colors duration-200 group/link mt-2"
                  style={{ ...labelStyle, fontSize: "0.5625rem" }}
                >
                  PROGETTO SIMILE
                  <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">→</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6">
        <p
          className="text-obsidian/18"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          * DATI SIMULATI A SCOPO ILLUSTRATIVO — CLIENTI REALI IN ARRIVO
        </p>
      </div>
    </section>
  );
}
