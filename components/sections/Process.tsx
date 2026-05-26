"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    n: "01",
    title: "Brief",
    time: "Giorno 1–2",
    desc: "Una call di 45 minuti e un questionario strutturato. Capiamo il brand, gli obiettivi, il pubblico. Zero burocrazia, massima sostanza.",
    quote: "Ascoltiamo prima di costruire.",
  },
  {
    n: "02",
    title: "Design",
    time: "Giorno 3–5",
    desc: "Wireframe e mockup su Figma. Palette colori, tipografia, struttura delle pagine. AI-assistito, curato da noi. Due round di revisioni inclusi.",
    quote: "AI-assisted, curato da noi.",
  },
  {
    n: "03",
    title: "Sviluppo",
    time: "Giorno 6–12",
    desc: "Il design prende vita in codice pulito con Next.js. Stack moderno, performance elevate. Nessun compromesso sulla qualità.",
    quote: "Stack moderno. Performance elevate.",
  },
  {
    n: "04",
    title: "Deploy",
    time: "Giorno 13–14",
    desc: "Go-live su Vercel. SEO finale, test cross-device, analytics, consegna credenziali. Sei online, in tempi record.",
    quote: "Online. In tempi record.",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Process() {
  return (
    <section id="processo" className="bg-ivory">

      {/* ── Divider ── */}
      <div className="section-divider" />

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
              <span className="text-rosewood" style={labelStyle}>03 · PROCESSO</span>
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
              Da zero<br />a online.
            </h2>
          </motion.div>
          <motion.div
            className="flex items-end"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
          >
            <p
              className="text-obsidian/60 max-w-md lg:ml-auto"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.25rem, 2.2vw, 1.75rem)",
                lineHeight: 1.3,
              }}
            >
              In quattordici giorni. Un processo rodato, veloce e trasparente.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Steps ── */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-obsidian/10"
        style={{ borderLeft: "1px solid rgba(26,20,20,0.10)" }}
      >
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            className="relative p-8 lg:p-10 border-r border-b border-obsidian/10 flex flex-col gap-6 group overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.6, ease, delay: i * 0.08 }}
          >
            {/* Background fill on hover */}
            <div
              className="absolute inset-0 bg-ash/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-hidden
            />
            {/* Large ghost number */}
            <span
              className="absolute right-4 bottom-4 select-none pointer-events-none text-obsidian/4 group-hover:text-obsidian/6 transition-colors duration-300"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "7rem",
                lineHeight:    1,
                letterSpacing: "-0.06em",
              }}
              aria-hidden
            >
              {step.n}
            </span>

            <div className="relative flex items-center justify-between">
              <span
                className="text-rosewood"
                style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.12em" }}
              >
                {step.n}
              </span>
              <span
                className="text-obsidian/20 bg-obsidian/5 px-2 py-0.5"
                style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.08em" }}
              >
                {step.time}
              </span>
            </div>

            <h3
              className="relative text-obsidian"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2rem, 3vw, 2.75rem)",
                lineHeight:    1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {step.title}
            </h3>

            <p
              className="relative text-obsidian/50 flex-1 group-hover:text-obsidian/65 transition-colors duration-300"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
            >
              {step.desc}
            </p>

            <p
              className="relative text-obsidian/40 group-hover:text-obsidian/60 transition-colors duration-300"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "1rem",
                lineHeight: 1.4,
              }}
            >
              &ldquo;{step.quote}&rdquo;
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── CTA strip ── */}
      <motion.div
        className="border-t border-obsidian/10 relative overflow-hidden"
        style={{ backgroundColor: "#E63B2E" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="noise-overlay" aria-hidden />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h3
              className="text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(1.75rem, 3vw, 2.75rem)",
                lineHeight:    1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Pronto a partire?
            </h3>
            <p
              className="text-ivory/65 mt-2"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.6 }}
            >
              Una call di 30 minuti. Senza impegno, senza preventivi gonfiati.
            </p>
          </div>
          <a
            href="#contatti"
            className="shrink-0 relative flex items-center justify-center gap-2 bg-ivory text-rosewood overflow-hidden group"
            style={{
              fontFamily:    "var(--db-jetbrains)",
              fontSize:      "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding:       "1rem 2rem",
              whiteSpace:    "nowrap",
            }}
          >
            <span
              className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              aria-hidden
            />
            <span className="relative flex items-center gap-2 group-hover:text-ivory transition-colors duration-100">
              INIZIAMO IL PROGETTO
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </span>
          </a>
        </div>
      </motion.div>

      <div className="h-16 lg:h-20" />
    </section>
  );
}
