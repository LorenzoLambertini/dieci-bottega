"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const SERVICES = [
  {
    idx: "01",
    title: "Sito\nVetrina",
    tagline: "Il tuo spazio digitale.",
    desc: "Design su misura per il brand, performance elevate, SEO on-page. Ogni pixel guadagna il suo posto.",
    features: [
      "Design personalizzato al brand",
      "Responsive mobile-first",
      "SEO on-page ottimizzata",
      "Form contatto avanzato",
      "Deploy su Vercel",
    ],
    time: "7–14 gg",
    from: "da 800 €",
  },
  {
    idx: "02",
    title: "Landing\nPage",
    tagline: "Una pagina, un obiettivo.",
    desc: "Conversioni al centro. Copy AI-assistito, struttura focalizzata, zero distrazioni per il visitatore.",
    features: [
      "Struttura orientata alla conversione",
      "Copy AI-assistito + revisione umana",
      "Analytics e tracking eventi",
      "Form lead generation",
      "Lighthouse 95+ garantito",
    ],
    time: "5–7 gg",
    from: "da 800 €",
  },
  {
    idx: "03",
    title: "Automazioni\n& CRM",
    tagline: "AI che moltiplica, non sostituisce.",
    desc: "CRM su misura, email sequences, integrazioni con i tool che già usi. L'artigiano con lo strumento giusto.",
    features: [
      "CRM su misura (n8n + Supabase)",
      "Email sequences automatiche",
      "Integrazione strumenti esistenti",
      "Dashboard analytics",
      "Supporto e manutenzione",
    ],
    time: "10–21 gg",
    from: "su preventivo",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Services() {
  return (
    <section id="servizi" className="bg-obsidian">
      {/* Header */}
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
              <span className="text-rosewood" style={labelStyle}>01 · SERVIZI</span>
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
              Cosa<br />costruiamo.
            </h2>
          </motion.div>
          <motion.p
            className="text-ivory/45 max-w-md lg:ml-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Tre servizi core per le PMI italiane. Zero fronzoli, zero gergo.
            Solo mestiere e risultati concreti.
          </motion.p>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="grid lg:grid-cols-3 border-t border-ivory/8"
        style={{ borderLeft: "1px solid rgba(244,239,230,0.08)" }}
      >
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.idx}
            className="relative flex flex-col gap-8 p-8 lg:p-10 border-r border-b border-ivory/8 group overflow-hidden"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.65, ease, delay: i * 0.1 }}
            style={{ transition: "background 0.35s ease" }}
          >
            {/* Hover background fill */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, rgba(74,56,56,0.25) 0%, rgba(74,56,56,0.08) 100%)" }}
              aria-hidden
            />
            {/* Left accent border on hover */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] bg-rosewood scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
              aria-hidden
            />

            {/* Index + time */}
            <div className="relative flex items-center justify-between">
              <span className="text-ivory/20" style={{ ...labelStyle, letterSpacing: "0.12em" }}>{svc.idx}</span>
              <span className="text-ivory/20 bg-ivory/5 px-2.5 py-1" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.08em" }}>{svc.time}</span>
            </div>

            {/* Title */}
            <div className="relative">
              <h3
                className="text-ivory group-hover:text-ivory transition-colors duration-200"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(1.75rem, 2.5vw, 2.5rem)",
                  lineHeight:    1,
                  letterSpacing: "-0.02em",
                  textTransform: "uppercase",
                  whiteSpace:    "pre-line",
                }}
              >
                {svc.title}
              </h3>
              <p
                className="text-rosewood mt-2"
                style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.4 }}
              >
                {svc.tagline}
              </p>
            </div>

            {/* Desc */}
            <p
              className="relative text-ivory/45 flex-1 group-hover:text-ivory/60 transition-colors duration-300"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
            >
              {svc.desc}
            </p>

            {/* Features */}
            <ul className="relative space-y-2.5">
              {svc.features.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    className="mt-[5px] shrink-0 text-rosewood"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", lineHeight: 1 }}
                    aria-hidden
                  >
                    ◆
                  </span>
                  <span
                    className="text-ivory/55 group-hover:text-ivory/70 transition-colors duration-300"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.5 }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="relative pt-5 border-t border-ivory/10 flex items-center justify-between">
              <span
                className="text-ivory/25 group-hover:text-ivory/40 transition-colors duration-200"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
              >
                {svc.from}
              </span>
              <a
                href="#contatti"
                className="flex items-center gap-1 text-rosewood hover:text-ivory transition-colors duration-200"
                style={{ ...labelStyle, fontSize: "0.625rem" }}
              >
                PARLACI
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-16 lg:h-20" />
    </section>
  );
}
