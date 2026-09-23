"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { CalendarCheck, PenLine, Search, KeyRound } from "lucide-react";

const ease = [0.2, 0.8, 0.2, 1] as const;
const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

/**
 * Deliverables · cosa ha in mano il cliente il giorno dieci.
 * Solo impegni concreti di processo: niente metriche o risultati stimati.
 */
const ITEMS = [
  {
    icon:   CalendarCheck,
    title:  "Sito online in 10 giorni",
    detail: "Dal brief alla messa online, con un calendario che conosci dal primo giorno.",
    accent: "bg-rosewood",
  },
  {
    icon:   PenLine,
    title:  "Due round di revisione",
    detail: "Vedi il design prima che diventi codice. Lo correggiamo insieme.",
    accent: "bg-obsidian",
  },
  {
    icon:   Search,
    title:  "Google, dal primo giorno",
    detail: "SEO di base, sitemap, Google Business Profile collegato.",
    accent: "bg-burgundy",
  },
  {
    icon:   KeyRound,
    title:  "Le chiavi di casa",
    detail: "Credenziali, dominio a tuo nome, una guida per aggiornarlo da solo.",
    accent: "bg-clay",
  },
];

export default function Deliverables() {
  return (
    <section className="relative bg-obsidian text-ivory overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <motion.div
          className="mb-12 lg:mb-16 max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="live-dot" />
            <span className="text-rosewood" style={labelStyle}>COSA TI CONSEGNIAMO</span>
          </div>
          <h2
            className="text-ivory"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(2.5rem, 6vw, 5.5rem)",
              lineHeight:    0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            Il giorno dieci,<br />
            <span className="text-ivory/40">in mano hai questo.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const n = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.4, ease, delay: i * 0.06 }}
              >
                <Card className="bg-ivory border-obsidian/0 hover:translate-y-[-3px] transition-transform duration-300 ease-out h-full">
                  <CardContent className="p-7 lg:p-8 pt-7 lg:pt-8 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-11 h-11 ${item.accent} flex items-center justify-center shrink-0`}>
                        <Icon className="size-5 text-ivory" strokeWidth={1.75} aria-hidden />
                      </div>
                      <span className="text-obsidian/30" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                        {n} / 04
                      </span>
                    </div>

                    <p
                      className="text-obsidian/15 mb-1 tabular-nums"
                      aria-hidden
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(2.5rem, 4.5vw, 4rem)",
                        lineHeight:    0.95,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {n}
                    </p>
                    <h3
                      className="text-obsidian mb-3"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.25rem, 2vw, 1.625rem)",
                        lineHeight:    1.05,
                        letterSpacing: "-0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-obsidian/60 mt-auto"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.55 }}
                    >
                      {item.detail}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
