"use client";

import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const STEPS = [
  {
    n: "01",
    title: "Brief",
    time: "Giorno 1–2",
    desc: "Una call di 45 minuti e un questionario sostanza. Capiamo brand, obiettivi e pubblico. Zero burocrazia.",
    quote: "Ascoltiamo prima di costruire.",
  },
  {
    n: "02",
    title: "Design",
    time: "Giorno 3–5",
    desc: "Wireframe e mockup su Figma. Palette, tipografia, struttura delle pagine. Due round di revisione inclusi.",
    quote: "AI-assisted. Curato a mano.",
  },
  {
    n: "03",
    title: "Sviluppo",
    time: "Giorno 6–12",
    desc: "Il design prende vita in Next.js. Stack moderno, performance elevate. Nessun compromesso.",
    quote: "Codice pulito. Performance vere.",
  },
  {
    n: "04",
    title: "Deploy",
    time: "Giorno 13–14",
    desc: "Go-live su Vercel. SEO finale, test cross-device, analytics, handover credenziali. Online.",
    quote: "Online. In tempi record.",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Process() {
  return (
    <section id="processo" className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="section-divider" />

      {/* Header */}
      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-16 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-end">

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
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
                fontSize:      "clamp(2.5rem, 7vw, 6.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Da zero<br />
              <span className="text-obsidian/40">a online.</span>
            </h2>
          </motion.div>

          <motion.div
            className="lg:col-span-5 flex flex-col gap-5 lg:pl-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            <p
              className="text-obsidian/65"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.125rem, 1.8vw, 1.5rem)",
                lineHeight: 1.35,
              }}
            >
              Quattordici giorni dal brief al deploy. Un processo
              rodato, veloce, e completamente trasparente.
            </p>
            <p
              className="text-obsidian/45"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.7 }}
            >
              Aggiornamenti regolari, anteprime live, due round di
              revisione. Niente sorprese alla consegna.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Connector + Steps */}
      <div className="relative border-t border-obsidian/10">

        {/* Animated connector — desktop only */}
        <motion.div
          className="hidden lg:block absolute left-0 right-0 top-[88px] h-px bg-obsidian/5 origin-left z-0"
          aria-hidden
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-rosewood"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1.8, ease, delay: 0.2 }}
          />
        </motion.div>

        <div
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ borderLeft: "1px solid rgba(26,20,20,0.10)" }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className="relative p-8 lg:p-10 border-r border-b border-obsidian/10 flex flex-col gap-5 group overflow-hidden hover:bg-ash/40 transition-colors duration-500"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease, delay: 0.2 + i * 0.12 }}
              style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
            >
              {/* Ghost number */}
              <span
                className="absolute right-4 bottom-2 select-none pointer-events-none text-obsidian/[0.04] group-hover:text-obsidian/[0.07] transition-colors duration-500"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "8rem",
                  lineHeight:    1,
                  letterSpacing: "-0.06em",
                }}
                aria-hidden
              >
                {step.n}
              </span>

              {/* Step indicator dot — sits on the connector line */}
              <div className="relative flex items-center justify-between -mt-px">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="block w-2.5 h-2.5 bg-rosewood rounded-full shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease, delay: 0.6 + i * 0.15 }}
                  />
                  <span
                    className="text-rosewood"
                    style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                  >
                    {step.n}
                  </span>
                </div>
                <span
                  className="text-obsidian/20 bg-obsidian/[0.04] px-2 py-0.5"
                  style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.12em" }}
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
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                }}
              >
                {step.title}
              </h3>

              <p
                className="relative text-obsidian/50 flex-1 group-hover:text-obsidian/70 transition-colors duration-500"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
              >
                {step.desc}
              </p>

              <p
                className="relative text-obsidian/40 group-hover:text-obsidian/60 transition-colors duration-500"
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
      </div>

      {/* CTA strip */}
      <motion.div
        className="border-t border-obsidian/10 relative overflow-hidden"
        style={{ backgroundColor: "#E63B2E" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="grain-soft" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 py-14 lg:py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h3
              className="text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2rem, 4vw, 3.5rem)",
                lineHeight:    1,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Pronto a partire?
            </h3>
            <p
              className="text-ivory/70 mt-3"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "1.0625rem", lineHeight: 1.55 }}
            >
              Trenta minuti di call. Senza impegno, senza preventivi
              gonfiati. Capisci se siamo i giusti per te.
            </p>
          </div>
          <a
            href="#contatti"
            className="shrink-0 relative flex items-center justify-center gap-2.5 bg-ivory text-rosewood overflow-hidden group press"
            style={{ ...labelStyle, padding: "1.125rem 2rem", whiteSpace: "nowrap" }}
          >
            <span
              className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
              aria-hidden
            />
            <span className="relative flex items-center gap-2 group-hover:text-ivory transition-colors duration-150">
              <span className="live-dot" />
              Prenota la call
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
