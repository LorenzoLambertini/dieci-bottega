"use client";

import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

// Solo progetti reali. Niente orari: sono estratti, non un feed live.
const COMMITS = [
  { what: "Selettore lingua IT/EN/ES/FR",               project: "Virtus Welcome Kit" },
  { what: "WhatsApp con messaggio precompilato",        project: "Villa Pet Sitter"   },
  { what: "Embed SoundCloud dei set",                   project: "LAMBO"              },
  { what: "Slider prima/dopo accessibile da tastiera",  project: "diecibottega.it"    },
];

const STACK = [
  { tool: "Next.js",   role: "App framework"     },
  { tool: "TypeScript",role: "Tipizzazione"      },
  { tool: "Tailwind",  role: "Design tokens"     },
  { tool: "Framer",    role: "Motion"            },
  { tool: "Supabase",  role: "Database & auth"   },
  { tool: "Vercel",    role: "Deploy & edge"     },
  { tool: "Resend",    role: "Email transazionali"},
  { tool: "Claude",    role: "Co-pilot"          },
];

export default function BottegaAperta() {
  return (
    <section id="bottega-aperta" className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="grain-soft" aria-hidden />

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
              <span className="live-dot" />
              <span className="text-rosewood" style={labelStyle}>02 · BOTTEGA APERTA</span>
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
              Codice<br />
              <span className="text-obsidian/40">acceso.</span>
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
              La nostra bottega è aperta. Non vendiamo magia —
              ti facciamo vedere come lavoriamo.
            </p>
            <p
              className="text-obsidian/45"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.7 }}
            >
              Niente testimonial inventati. Solo estratti reali dai
              nostri progetti: codice, workflow, snippet di prompt,
              scelte di design.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 pb-16 lg:pb-24">
        <div className="grid grid-cols-12 gap-3 lg:gap-4">

          {/* ── Card 1: Ultimo lavoro ── */}
          <motion.div
            className="col-span-12 lg:col-span-7 bg-obsidian text-ivory p-6 lg:p-8 relative overflow-hidden card-tactile shadow-atelier flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="grain-soft" aria-hidden />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className="flex items-center gap-2 text-ivory/70" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                  <span className="live-dot" />
                  ULTIMO LAVORO
                </span>
                <span className="text-ivory/30" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                  SITO VETRINA · BOLOGNA
                </span>
              </div>

              <h3
                className="text-ivory mb-3"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(1.5rem, 2.6vw, 2.25rem)",
                  lineHeight:    1.05,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                }}
              >
                Villa Pet Sitter
              </h3>
              <p
                className="text-ivory/60 max-w-xl"
                style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.125rem", lineHeight: 1.45 }}
              >
                Pet sitter professionale a Bologna. Dal vecchio sito WordPress a un
                sito vetrina multipagina: servizi, prezzi, attestati, recensioni,
                galleria, WhatsApp a un tocco.
              </p>

              <div className="mt-8 lg:mt-auto lg:pt-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  {["Sito Vetrina", "SEO locale", "Mobile-first"].map(l => (
                    <span
                      key={l}
                      className="text-ivory/70 border border-ivory/15 px-2.5 py-1"
                      style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <a
                  href="https://villa-pet-sitter.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-peach hover:text-ivory transition-colors duration-200 ease-out"
                  style={{ ...labelStyle, fontWeight: 700 }}
                >
                  Guarda il progetto
                  <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* ── Card 2: Stack ── */}
          <motion.div
            className="col-span-12 lg:col-span-5 border border-obsidian/10 p-6 lg:p-8 relative overflow-hidden card-tactile bg-ivory hover:border-obsidian/20 transition-colors duration-400"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-obsidian/55" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                STACK · ATTREZZI DEL MESTIERE
              </span>
              <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                {STACK.length} TOOLS
              </span>
            </div>
            <ul className="space-y-3">
              {STACK.map((s, i) => (
                <motion.li
                  key={s.tool}
                  className="flex items-baseline justify-between gap-4 border-b border-obsidian/8 pb-3 last:border-b-0 last:pb-0 group/row"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: 0.2 + i * 0.05 }}
                >
                  <span
                    className="text-obsidian group-hover/row:text-rosewood transition-colors duration-300"
                    style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}
                  >
                    {s.tool}
                  </span>
                  <span
                    className="text-obsidian/35"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem" }}
                  >
                    {s.role}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Card 3: Code snippet ── */}
          <motion.div
            className="col-span-12 lg:col-span-7 bg-charcoal text-ivory p-0 relative overflow-hidden card-tactile shadow-atelier"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
            style={{ backgroundColor: "#2A2020" }}
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-ivory/8">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E63B2E" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-ivory/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-ivory/20" />
              </div>
              <span className="text-ivory/40" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                components/Hero.tsx · LIVE
              </span>
              <span className="text-ivory/40" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem" }}>
                42 ↓
              </span>
            </div>

            {/* Code body */}
            <pre
              className="p-5 lg:p-6 overflow-x-auto"
              style={{
                fontFamily: "var(--db-jetbrains)",
                fontSize:   "0.78rem",
                lineHeight: 1.7,
                color:      "#E8E2D6",
              }}
            >
{`<motion.h1
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  transition={{
    duration: 0.9,
    ease: [0.2, 0.8, 0.2, 1],
    delay: 0.18,
  }}
  className="text-display"
>
  Il sito che ti serve.
</motion.h1>`}
            </pre>
            <div className="px-5 py-3 border-t border-ivory/8 flex items-center justify-between">
              <span className="text-ivory/30" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem" }}>
                <span style={{ color: "#E63B2E" }}>—</span> 3 righe · <span style={{ color: "#F2B8A2" }}>+</span> 11 righe
              </span>
              <span className="text-ivory/25" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                COMMIT 74D00DF
              </span>
            </div>
          </motion.div>

          {/* ── Card 4: Prompt note ── */}
          <motion.div
            className="col-span-12 lg:col-span-5 border border-obsidian/10 bg-sand/40 p-6 lg:p-8 relative overflow-hidden card-tactile"
            style={{ backgroundColor: "rgba(217,205,184,0.35)" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-obsidian/55" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                PROMPT · QUADERNO TECNICO
              </span>
              <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                / 14
              </span>
            </div>
            <p
              className="text-obsidian mb-4"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "1.0625rem",
                lineHeight: 1.5,
              }}
            >
              &ldquo;Genera 8 varianti di microcopy per un bottone CTA italiano,
              registro: artigianale ma diretto. Niente esclamativi.
              Massimo 3 parole.&rdquo;
            </p>
            <div className="space-y-1.5 pt-4 border-t border-obsidian/10">
              {[
                "Parliamone",
                "Scrivici subito",
                "Iniziamo",
                "Apri un dialogo",
                "Vieni in bottega",
              ].map((c, i) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="text-obsidian/30" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-obsidian/75"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                  >
                    {c}
                  </span>
                  {i === 2 && (
                    <span
                      className="ml-auto text-rosewood"
                      style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
                    >
                      SCELTO
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Card 5: Commit feed ── */}
          <motion.div
            className="col-span-12 lg:col-span-5 border border-obsidian/10 p-6 lg:p-8 relative overflow-hidden card-tactile bg-ivory"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-obsidian/55 flex items-center gap-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                <span className="live-dot" />
                COMMIT · RECENTI
              </span>
              <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                MAIN
              </span>
            </div>
            <ul className="space-y-4">
              {COMMITS.map((c, i) => (
                <motion.li
                  key={i}
                  className="grid grid-cols-[16px_1fr] gap-3 pb-4 border-b border-obsidian/8 last:border-b-0 last:pb-0"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: 0.3 + i * 0.06 }}
                >
                  <span
                    className="text-rosewood/60 pt-px"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem" }}
                    aria-hidden
                  >
                    ◆
                  </span>
                  <div>
                    <p
                      className="text-obsidian"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.5 }}
                    >
                      {c.what}
                    </p>
                    <p
                      className="text-obsidian/35 mt-0.5"
                      style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.12em" }}
                    >
                      {c.project}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ── Card 6: Editorial note ── */}
          <motion.div
            className="col-span-12 lg:col-span-7 bg-rosewood text-ivory p-6 lg:p-10 relative overflow-hidden card-tactile shadow-atelier"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
          >
            <div className="grain-soft" aria-hidden />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-ivory/70" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                  LEZIONE · QUESTA SETTIMANA
                </span>
                <span className="text-ivory/30" style={{ ...labelStyle, fontSize: "0.5rem" }}>
                  N° 023
                </span>
              </div>
              <blockquote
                className="text-ivory"
                style={{
                  fontFamily: "var(--db-cardo)",
                  fontStyle:  "italic",
                  fontSize:   "clamp(1.5rem, 2.6vw, 2.25rem)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                &ldquo;Un&apos;animazione che non serve la storia
                è solo un effetto. Ed è quello che facciamo di
                meno.&rdquo;
              </blockquote>
              <p
                className="text-ivory/65 mt-6"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.55 }}
              >
                Lorenzo, mentre rivedeva il reveal della sezione Soluzioni.
                Cinque secondi tagliati. Tre microcurve sostituite.
                Tre pixel di spazio guadagnati.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="text-ivory/40" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                  — DALLA BOTTEGA
                </span>
                <span className="block w-8 h-px bg-ivory/30" />
                <span className="text-ivory/40" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                  EST. MMXXVI
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 pb-16">
        <p
          className="text-obsidian/30"
          style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
        >
          * ESTRATTI REALI DAI NOSTRI PROGETTI
        </p>
      </div>
    </section>
  );
}
