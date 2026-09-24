"use client";

import { motion } from "framer-motion";
import BeforeAfter from "@/components/ui/BeforeAfter";

const ease = [0.2, 0.8, 0.2, 1] as const;
const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function Transformation() {
  return (
    <section className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>PRIMA · DOPO</span>
            </div>
            <h2
              className="text-obsidian"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.5rem, 6vw, 5.5rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Da un sito<br />
              <span className="text-obsidian/40">dimenticato</span>
              <br />a uno che lavora.
            </h2>
          </motion.div>
          <motion.p
            className="lg:col-span-5 lg:pl-8 text-obsidian/65"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)", lineHeight: 1.4 }}
          >
            Trascina lo slider. A sinistra il sito di prima, a destra quello
            che abbiamo costruito: mobile-first, veloce, con WhatsApp a un tocco.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease }}
        >
          <BeforeAfter
            before={{
              desktop: "/lavori/villa-pet-sitter/prima-desktop.webp",
              mobile:  "/lavori/villa-pet-sitter/prima-mobile.webp",
              alt:     "Home page del vecchio sito di Villa Pet Sitter (villapetsitter.eu), fatto in WordPress con Elementor",
            }}
            after={{
              desktop: "/lavori/villa-pet-sitter/dopo-desktop.webp",
              mobile:  "/lavori/villa-pet-sitter/dopo-mobile.webp",
              alt:     "Home page del nuovo sito di Villa Pet Sitter, pet sitter professionale a Bologna, costruito da Dieci Bottega in Next.js",
            }}
            beforeLabel="◆ PRIMA · villapetsitter.eu"
            afterLabel="◆ DOPO · il nuovo sito"
          />
        </motion.div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-obsidian/35"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            ◀ TRASCINA O USA LE FRECCE ▶ · VILLA PET SITTER · BOLOGNA
          </p>
          <a
            href="https://villa-pet-sitter.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-rosewood hover:text-obsidian transition-colors duration-200 ease-out"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}
          >
            Guarda il sito
            <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
