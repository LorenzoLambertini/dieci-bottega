"use client";

import { motion } from "framer-motion";
import DisplayCards from "@/components/ui/DisplayCards";

const ease = [0.2, 0.8, 0.2, 1] as const;
const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Promise() {
  return (
    <section className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-32 lg:pt-32 lg:pb-44">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>I NOSTRI VALORI</span>
            </div>
            <h2
              className="text-obsidian mb-6"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.5rem, 6vw, 5.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Tre cose<br />
              <span className="text-obsidian/40">che pretendiamo<br />da noi stessi.</span>
            </h2>
            <p
              className="text-obsidian/60 max-w-md"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)", lineHeight: 1.4 }}
            >
              Non venderemo mai veloce a chi vuole approfondito. Non venderemo mai
              approfondito a chi vuole veloce. Queste tre regole le rispettiamo o non lavoriamo.
            </p>
            <p
              className="text-obsidian/45 mt-5 max-w-md"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
            >
              Hover sulle card per vederle a fuoco — sono tre, non quattro.
            </p>
          </motion.div>

          {/* RIGHT — stacked cards */}
          <motion.div
            className="relative h-[260px] lg:h-[300px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
          >
            <DisplayCards />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
