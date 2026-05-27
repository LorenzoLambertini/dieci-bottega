"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

type Service = {
  name:    string;
  target:  string;
  time:    string;
  price:   string;
  impact:  string;
};

type Category = {
  id:    string;
  index: string;
  title: string;
  blurb: string;
  count: string;
  services: Service[];
};

const CATEGORIES: Category[] = [
  {
    id:    "siti",
    index: "01",
    title: "Siti Web",
    blurb: "Vetrine, landing, e-commerce snelli. Costruiti a mano, consegnati in dieci giorni.",
    count: "3 SERVIZI",
    services: [
      {
        name:   "Sito Vetrina",
        target: "PMI locali, studi, attività di quartiere",
        time:   "10 giorni",
        price:  "da €1.200",
        impact: "Presenza digitale credibile, indicizzata, gestibile",
      },
      {
        name:   "Landing Page",
        target: "Un prodotto, un servizio, una campagna",
        time:   "5–7 giorni",
        price:  "da €800",
        impact: "Conversioni misurate, ottimizzate, ripetibili",
      },
      {
        name:   "E-commerce Light",
        target: "Brand artigiani, prodotti curati, catalogo piccolo",
        time:   "12–15 giorni",
        price:  "da €1.800",
        impact: "Vendita diretta, controllo del margine, niente intermediari",
      },
    ],
  },
  {
    id:    "crm",
    index: "02",
    title: "CRM & Infrastrutture",
    blurb: "Strumenti interni su misura. Niente abbonamenti software, codice tuo.",
    count: "3 SERVIZI",
    services: [
      {
        name:   "CRM Su Misura",
        target: "Team commerciali piccoli stanchi di Excel",
        time:   "14–21 giorni",
        price:  "da €2.500",
        impact: "Pipeline visibile, lead tracciati, niente più fogli persi",
      },
      {
        name:   "Dashboard Custom",
        target: "Founder che vogliono vedere i numeri al volo",
        time:   "10–14 giorni",
        price:  "da €1.500",
        impact: "Decisioni dati alla mano, in tempo reale",
      },
      {
        name:   "Integrazione tool",
        target: "Chi usa già 4 strumenti che non si parlano",
        time:   "5–10 giorni",
        price:  "da €800",
        impact: "Tutto comunica, niente data entry doppio",
      },
    ],
  },
  {
    id:    "ai",
    index: "03",
    title: "Automazioni AI",
    blurb: "Workflow che fanno il lavoro ripetitivo. AI che moltiplica, non sostituisce.",
    count: "3 SERVIZI",
    services: [
      {
        name:   "Lead Capture & Routing",
        target: "Chi riceve contatti da form, WhatsApp, email",
        time:   "5–7 giorni",
        price:  "da €700",
        impact: "Ogni lead trovato, qualificato, instradato",
      },
      {
        name:   "Email Sequences",
        target: "Servizi, consulenza, e-commerce",
        time:   "7–10 giorni",
        price:  "da €900",
        impact: "Follow-up automatico, copia umana, niente template",
      },
      {
        name:   "Workflow Builder",
        target: "Operations stanche di processi manuali",
        time:   "14–21 giorni",
        price:  "su preventivo",
        impact: "Ore restituite alla settimana, errori azzerati",
      },
    ],
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Soluzioni() {
  const [open, setOpen] = useState<string>("siti");

  return (
    <section id="soluzioni" className="relative bg-obsidian text-ivory overflow-hidden">
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
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>01 · SOLUZIONI</span>
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
              Tre mestieri.<br />
              <span className="text-ivory/40">Una bottega.</span>
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
              className="text-ivory/65"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.125rem, 1.8vw, 1.5rem)",
                lineHeight: 1.35,
              }}
            >
              Lavoriamo su tre filoni complementari. Quasi sempre,
              il progetto ne tocca più di uno.
            </p>
            <p
              className="text-ivory/45"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.7 }}
            >
              Niente cataloghi infiniti né servizi gonfiati. Solo
              ciò che sappiamo fare bene — e ti diciamo quando non
              è il caso.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="relative">
        <div className="section-divider-dark" />
        {CATEGORIES.map((cat, i) => {
          const isOpen = open === cat.id;
          return (
            <motion.div
              key={cat.id}
              className="relative border-b border-ivory/8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
            >
              {/* Header row — clickable */}
              <button
                onClick={() => setOpen(isOpen ? "" : cat.id)}
                className="w-full text-left group"
                aria-expanded={isOpen}
              >
                <div className="mx-auto max-w-[1480px] px-6 lg:px-12 py-9 lg:py-12 grid grid-cols-[auto_1fr_auto] gap-6 lg:gap-12 items-center">

                  {/* Index */}
                  <span
                    className="text-ivory/30 group-hover:text-rosewood transition-colors duration-400 shrink-0"
                    style={{
                      fontFamily:    "var(--db-archivo)",
                      fontWeight:    900,
                      fontSize:      "clamp(1.25rem, 1.8vw, 1.625rem)",
                      letterSpacing: "-0.02em",
                      transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
                    }}
                  >
                    {cat.index}
                  </span>

                  {/* Title + blurb */}
                  <div className="min-w-0 flex flex-col gap-2">
                    <h3
                      className="text-ivory transition-transform duration-500 origin-left"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.75rem, 4vw, 3.75rem)",
                        lineHeight:    1,
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                        transform:     isOpen ? "translateX(4px)" : "translateX(0)",
                        transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
                      }}
                    >
                      {cat.title}
                    </h3>
                    <p
                      className="text-ivory/45 max-w-2xl hidden md:block"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.55 }}
                    >
                      {cat.blurb}
                    </p>
                  </div>

                  {/* Right: count + chevron */}
                  <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                    <span
                      className="hidden md:block text-ivory/30 group-hover:text-ivory/50 transition-colors duration-300"
                      style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                    >
                      {cat.count}
                    </span>
                    <span
                      className="w-9 h-9 border border-ivory/20 flex items-center justify-center transition-all duration-500"
                      style={{
                        transform:    isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        background:   isOpen ? "#E63B2E" : "transparent",
                        borderColor:  isOpen ? "#E63B2E" : "rgba(244,239,230,0.20)",
                        transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
                      }}
                      aria-hidden
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1V11M1 6H11" stroke="#F4EFE6" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded services */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-ivory/8">
                      <div className="mx-auto max-w-[1480px] grid md:grid-cols-3">
                        {cat.services.map((svc, k) => (
                          <motion.article
                            key={svc.name}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease, delay: 0.1 + k * 0.08 }}
                            className="relative p-8 lg:p-10 md:border-r border-ivory/8 last:border-r-0 group/card hover:bg-ivory/[0.02] transition-colors duration-300"
                          >
                            {/* Service name */}
                            <h4
                              className="text-ivory mb-1"
                              style={{
                                fontFamily:    "var(--db-archivo)",
                                fontWeight:    900,
                                fontSize:      "1.5rem",
                                lineHeight:    1.05,
                                letterSpacing: "-0.02em",
                                textTransform: "uppercase",
                              }}
                            >
                              {svc.name}
                            </h4>
                            <p
                              className="text-ivory/35 mb-6"
                              style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                            >
                              {cat.title.toUpperCase()} · {String(k + 1).padStart(2, "0")}
                            </p>

                            {/* Meta rows */}
                            <dl className="space-y-3.5 mb-6 pb-6 border-b border-ivory/8">
                              {[
                                { k: "Per chi",        v: svc.target },
                                { k: "Consegna",       v: svc.time   },
                                { k: "Investimento",   v: svc.price  },
                              ].map(row => (
                                <div key={row.k} className="grid grid-cols-[88px_1fr] gap-3 items-start">
                                  <dt
                                    className="text-ivory/30 mt-0.5"
                                    style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
                                  >
                                    {row.k}
                                  </dt>
                                  <dd
                                    className="text-ivory/75"
                                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.5 }}
                                  >
                                    {row.v}
                                  </dd>
                                </div>
                              ))}
                            </dl>

                            {/* Impact */}
                            <p
                              className="text-ivory/60 mb-6"
                              style={{
                                fontFamily: "var(--db-cardo)",
                                fontStyle:  "italic",
                                fontSize:   "1rem",
                                lineHeight: 1.4,
                              }}
                            >
                              &ldquo;{svc.impact}.&rdquo;
                            </p>

                            {/* CTA */}
                            <a
                              href="#contatti"
                              className="inline-flex items-center gap-1.5 text-rosewood hover:text-ivory transition-colors duration-300 link-underline"
                              style={{ ...labelStyle, fontSize: "0.625rem" }}
                            >
                              <span>Parlane con noi</span>
                              <span className="group-hover/card:translate-x-0.5 transition-transform duration-300">→</span>
                            </a>
                          </motion.article>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
