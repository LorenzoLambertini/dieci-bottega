"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Search, Users, Clock } from "lucide-react";

const ease = [0.2, 0.8, 0.2, 1] as const;
const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

/**
 * Growth · 4 metriche di impatto stimate dopo che un cliente lavora con noi.
 * I valori sono target medi su PMI italiane locali (settori ristorazione, studi, artigiani).
 */
const METRICS = [
  {
    icon:    Search,
    value:   "+187%",
    label:   "Visibilità organica",
    detail:  "Clienti che ti trovano su Google entro 6 mesi dalla messa online (settore ristorazione, settore servizi locali).",
    accent:  "bg-rosewood",
  },
  {
    icon:    Users,
    value:   "2×",
    label:   "Lead qualificati",
    detail:  "Più contatti reali ogni mese, grazie a form ottimizzati per la conversione e a un CRM che non perde nessuno.",
    accent:  "bg-obsidian",
  },
  {
    icon:    Clock,
    value:   "−40%",
    label:   "Tempo amministrativo",
    detail:  "Ore restituite ogni settimana: prenotazioni automatiche, fatturazione integrata, email che si scrivono da sole.",
    accent:  "bg-burgundy",
  },
  {
    icon:    TrendingUp,
    value:   "10 gg",
    label:   "Consegna garantita",
    detail:  "Da brief a sito online: dieci giorni netti. Un'agenzia tradizionale ne impiega 60–90. La differenza la fa l'AI.",
    accent:  "bg-clay",
  },
];

export default function Growth() {
  return (
    <section className="relative bg-obsidian text-ivory overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-12 lg:mb-16">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="live-dot" />
              <span className="text-rosewood" style={labelStyle}>IMPATTO · STIMATO</span>
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
              Cosa cambia<br />
              <span className="text-ivory/40">dopo i dieci giorni.</span>
            </h2>
          </motion.div>
          <motion.p
            className="lg:col-span-5 lg:pl-8 text-ivory/55"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)", lineHeight: 1.4 }}
          >
            Stime medie su clienti reali del nostro segmento — PMI italiane locali.
            Non promettiamo miracoli: promettiamo lavoro che si vede.
          </motion.p>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.65, ease, delay: i * 0.08 }}
              >
                <Card className="bg-ivory border-obsidian/0 hover:translate-y-[-3px] transition-transform duration-400 h-full">
                  <CardContent className="p-7 lg:p-8 pt-7 lg:pt-8 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className={`w-11 h-11 ${m.accent} flex items-center justify-center shrink-0`}>
                        <Icon className="size-5 text-ivory" strokeWidth={1.75} />
                      </div>
                      <span className="text-obsidian/30" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                        {String(i + 1).padStart(2, "0")} / 04
                      </span>
                    </div>

                    <p
                      className="text-obsidian mb-2 tabular-nums"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(2.5rem, 4.5vw, 4rem)",
                        lineHeight:    0.95,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {m.value}
                    </p>
                    <p
                      className="text-rosewood mb-4"
                      style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}
                    >
                      {m.label}
                    </p>
                    <p
                      className="text-obsidian/55 mt-auto"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.55 }}
                    >
                      {m.detail}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p
          className="text-ivory/30 mt-10 text-center"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          * STIME MEDIE SU 6 MESI · INDICATIVE, NON GARANTITE
        </p>
      </div>
    </section>
  );
}
