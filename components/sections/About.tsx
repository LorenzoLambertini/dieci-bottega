"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const VALUES = [
  { n: "01", title: "Mestiere", body: "Non vendiamo \"soluzioni digitali\". Vendiamo lavoro fatto bene. Ogni font, ogni microcopy, ogni millisecondo è una scelta consapevole." },
  { n: "02", title: "Velocità", body: "Consegnare in 10 giorni è dire al cliente: il tuo tempo conta quanto il nostro. La velocità non è scorciatoia, è metodo." },
  { n: "03", title: "Onestà", body: "Prezzi pubblici, tempi reali, limiti chiari. Mai soprapromettere per chiudere. Meglio perdere un cliente che mentirgli." },
  { n: "04", title: "Prossimità", body: "Parliamo italiano, lavoriamo da Bologna, conosciamo le PMI. La distanza zero è il nostro vantaggio competitivo." },
  { n: "05", title: "Dettagli", body: "\"È tutto nei dettagli\" non è una tagline: è un protocollo. Spaziature, microcopy, performance, accessibilità. Tutto curato." },
];

const TEAM = [
  {
    role: "CO-FOUNDER · DESIGN & WEB",
    firstName: "Lorenzo",
    lastName: "Lambertini",
    bio: "Sviluppa siti e design per PMI italiane dal 2024. Crede che ogni pixel debba guadagnarsi il proprio posto.",
    email: "lorenzo@diecibottega.it",
  },
  {
    role: "CO-FOUNDER · STRATEGY & SALES",
    firstName: "Tommaso",
    lastName: "Villa",
    bio: "Consulente commerciale per agenzie digitali. Trasforma un brief in un piano d'azione concreto.",
    email: "tommaso@diecibottega.it",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function About() {
  return (
    <section id="bottega" style={{ backgroundColor: "#E63B2E" }}>

      <div className="noise-overlay" aria-hidden />

      {/* ── Header ── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-ivory/40" />
              <span
                className="text-ivory/50"
                style={labelStyle}
              >
                04 · BOTTEGA
              </span>
            </div>
            <h2
              className="text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.25rem, 5.5vw, 5rem)",
                lineHeight:    0.93,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Nati da un<br />caffè a<br />Bologna.
            </h2>
          </motion.div>

          <motion.div
            className="flex flex-col gap-8 lg:ml-auto max-w-md"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
          >
            <p
              className="text-ivory/85"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.2rem, 2vw, 1.6rem)",
                lineHeight: 1.35,
              }}
            >
              &ldquo;Veloci, ma non frettolosi.
              <br />È tutto nei dettagli.&rdquo;
            </p>
            <p
              className="text-ivory/60"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
            >
              Dieci Bottega nasce dall&apos;incontro di due percorsi: chi sa fare
              design e codice (Lorenzo) e chi sa parlare con i clienti (Tommaso).
              Entrambi convinti che le PMI italiane meritino di meglio.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Values ── */}
      <div
        className="border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
        style={{
          borderColor: "rgba(244,239,230,0.15)",
          borderLeft:  "1px solid rgba(244,239,230,0.15)",
        }}
      >
        {VALUES.map((v, i) => (
          <motion.div
            key={v.n}
            className="relative p-7 lg:p-8 border-r border-b flex flex-col gap-4 group overflow-hidden"
            style={{ borderColor: "rgba(244,239,230,0.15)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.55, ease, delay: i * 0.07 }}
          >
            {/* Hover fill */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(122,24,24,0.35)" }}
              aria-hidden
            />
            <span
              className="relative text-ivory/30 group-hover:text-ivory/50 transition-colors duration-200"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
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
              className="relative text-ivory/50 group-hover:text-ivory/70 transition-colors duration-300"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.65 }}
            >
              {v.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Team ── */}
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
            transition={{ duration: 0.6, ease, delay: i * 0.1 }}
          >
            {/* Hover fill */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(122,24,24,0.25)" }}
              aria-hidden
            />
            {/* Ghost initial */}
            <span
              className="absolute right-8 bottom-6 select-none pointer-events-none text-ivory/[0.04] group-hover:text-ivory/[0.06] transition-colors duration-300"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "8rem",
                lineHeight:    1,
                letterSpacing: "-0.06em",
              }}
              aria-hidden
            >
              {person.firstName[0]}
            </span>

            <span
              className="relative text-ivory/35"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              {person.role}
            </span>
            <h3
              className="relative text-ivory"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(1.75rem, 3vw, 2.5rem)",
                lineHeight:    1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {person.firstName}<br />{person.lastName}
            </h3>
            <p
              className="relative text-ivory/55 group-hover:text-ivory/70 transition-colors duration-300"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "26rem" }}
            >
              {person.bio}
            </p>
            <a
              href={`mailto:${person.email}`}
              className="relative text-ivory/30 hover:text-ivory transition-colors duration-200 mt-auto inline-flex items-center gap-1.5 group/link"
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.5625rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              {person.email.toUpperCase()}
              <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">→</span>
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
