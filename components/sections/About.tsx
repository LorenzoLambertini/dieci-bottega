"use client";

import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const VALUES = [
  { n: "01", title: "Mestiere",   body: "Non vendiamo \"soluzioni digitali\". Vendiamo lavoro fatto bene. Ogni font, ogni microcopy, ogni millisecondo è una scelta consapevole." },
  { n: "02", title: "Velocità",   body: "Consegnare in dieci giorni è dire al cliente: il tuo tempo conta quanto il nostro. La velocità non è scorciatoia, è metodo." },
  { n: "03", title: "Onestà",     body: "Prezzi pubblici, tempi reali, limiti chiari. Mai sovrapromettere per chiudere. Meglio perdere un cliente che mentirgli." },
  { n: "04", title: "Prossimità", body: "Parliamo italiano, lavoriamo da Bologna, conosciamo le PMI. La distanza zero è il nostro vantaggio competitivo." },
  { n: "05", title: "Dettagli",   body: "\"È tutto nei dettagli\" non è una tagline: è un protocollo. Spaziature, microcopy, performance, accessibilità. Tutto curato." },
];

const TEAM = [
  {
    role:      "CO-FOUNDER · DESIGN & WEB",
    firstName: "Lorenzo",
    lastName:  "Lambertini",
    bio:       "Sviluppa siti e design per PMI italiane dal 2024. Crede che ogni pixel debba guadagnarsi il proprio posto.",
    email:     "lorenzo@diecibottega.it",
    cv:        ["Front-end · Next.js", "Brand systems", "AI co-working"],
  },
  {
    role:      "CO-FOUNDER · STRATEGY & SALES",
    firstName: "Tommaso",
    lastName:  "Villa",
    bio:       "Consulente commerciale per agenzie digitali. Trasforma un brief in un piano d'azione concreto.",
    email:     "tommaso@diecibottega.it",
    cv:        ["Sales discovery", "Account growth", "Operations"],
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Studio() {
  return (
    <section id="studio" className="relative bg-rosewood text-ivory overflow-hidden">
      <div className="grain-soft" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)",
        }}
      />

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
              <span className="block w-8 h-px bg-ivory/40" />
              <span className="text-ivory/55" style={labelStyle}>04 · STUDIO</span>
            </div>
            <h2
              className="text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.5rem, 7vw, 6.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Nati da un<br />
              <span className="text-ivory/55">caffè</span><br />
              a Bologna.
            </h2>
          </motion.div>

          <motion.div
            className="lg:col-span-5 flex flex-col gap-6 lg:pl-8 lg:mt-2"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            <p
              className="text-ivory/85"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.25rem, 2vw, 1.75rem)",
                lineHeight: 1.3,
              }}
            >
              &ldquo;Veloci, ma non frettolosi.<br />
              È tutto nei dettagli.&rdquo;
            </p>
            <p
              className="text-ivory/65"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.7 }}
            >
              Dieci Bottega nasce dall&apos;incontro di due percorsi:
              chi sa fare design e codice (Lorenzo) e chi sa parlare
              con i clienti (Tommaso). Entrambi convinti che le PMI
              italiane meritino di meglio.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Values */}
      <div className="relative">
        <div className="section-divider-dark" />
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
          style={{ borderLeft: "1px solid rgba(244,239,230,0.15)" }}
        >
          {VALUES.map((v, i) => (
            <motion.div
              key={v.n}
              className="relative p-7 lg:p-8 border-r border-b flex flex-col gap-4 group overflow-hidden"
              style={{ borderColor: "rgba(244,239,230,0.15)" }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: "rgba(122,24,24,0.40)" }}
                aria-hidden
              />
              <div
                className="absolute left-0 top-0 h-px bg-ivory scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 w-full"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                aria-hidden
              />
              <span
                className="relative text-ivory/35 group-hover:text-ivory/55 transition-colors duration-300"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
              >
                {v.n}
              </span>
              <h3
                className="relative text-ivory"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}
              >
                {v.title}
              </h3>
              <p
                className="relative text-ivory/55 group-hover:text-ivory/75 transition-colors duration-400"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.65 }}
              >
                {v.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div
        className="grid md:grid-cols-2 border-t"
        style={{ borderColor: "rgba(244,239,230,0.15)" }}
      >
        {TEAM.map((person, i) => (
          <motion.div
            key={person.firstName}
            className="relative p-8 lg:p-12 border-r border-b flex flex-col gap-5 group overflow-hidden"
            style={{ borderColor: "rgba(244,239,230,0.15)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.7, ease, delay: i * 0.12 }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
              style={{ background: "rgba(122,24,24,0.30)" }}
              aria-hidden
            />
            {/* Ghost initial */}
            <span
              className="absolute right-6 -bottom-2 select-none pointer-events-none text-ivory/[0.04] group-hover:text-ivory/[0.07] transition-colors duration-500"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "12rem",
                lineHeight:    0.9,
                letterSpacing: "-0.06em",
              }}
              aria-hidden
            >
              {person.firstName[0]}
            </span>

            <span
              className="relative text-ivory/40"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              {person.role}
            </span>
            <h3
              className="relative text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2rem, 3.2vw, 2.75rem)",
                lineHeight:    1,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              {person.firstName}<br />{person.lastName}
            </h3>
            <p
              className="relative text-ivory/65 max-w-md"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
            >
              {person.bio}
            </p>

            {/* CV tags */}
            <div className="relative flex flex-wrap gap-2 mt-1">
              {person.cv.map(tag => (
                <span
                  key={tag}
                  className="text-ivory/70 border border-ivory/15 px-2.5 py-1"
                  style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={`mailto:${person.email}`}
              className="relative text-ivory/35 hover:text-ivory transition-colors duration-300 mt-auto inline-flex items-center gap-1.5 group/link link-underline"
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.5625rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {person.email.toUpperCase()}
              <span className="group-hover/link:translate-x-0.5 transition-transform duration-300">→</span>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
