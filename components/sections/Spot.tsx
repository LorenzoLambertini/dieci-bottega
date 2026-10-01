"use client";

/**
 * Lo spot di Dieci Bottega (16:9, 39 secondi). Il video non si scarica finché non si
 * preme play: in pagina c'è solo la copertina (26 KB). Da telefono parte la versione a 720p.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--db-jetbrains)",
  fontSize: "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const VIDEO_LD = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Dieci Bottega · Il sito che ti serve",
  description: "Lo spot di Dieci Bottega: siti web per piccole imprese, progettati con l'AI e curati a mano, online in dieci giorni.",
  thumbnailUrl: "https://diecibottega.it/video/spot-poster.jpg",
  contentUrl: "https://diecibottega.it/video/spot-1080.mp4",
  uploadDate: "2026-10-01",
  duration: "PT39S",
  inLanguage: "it-IT",
  publisher: { "@type": "Organization", name: "Dieci Bottega", url: "https://diecibottega.it" },
};

export default function Spot() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section id="spot" className="relative bg-obsidian text-ivory overflow-hidden" aria-label="Lo spot di Dieci Bottega">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(VIDEO_LD) }} />
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-10 lg:mb-14">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>LO SPOT · 39 SECONDI</span>
            </div>
            <h2
              className="text-ivory"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Lavori bene.<br />
              <span className="text-ivory/40">Fallo vedere.</span>
            </h2>
          </motion.div>
          <motion.p
            className="lg:col-span-5 lg:pl-8 text-ivory/65"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.0625rem, 1.6vw, 1.375rem)", lineHeight: 1.4 }}
          >
            Chi siamo e come lavoriamo, in meno di un minuto: dieci giorni, non tre mesi.
            Al prezzo di un template, con la cura di un&apos;agenzia.
          </motion.p>
        </div>

        <motion.div
          className="relative w-full aspect-video overflow-hidden bg-black shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease }}
        >
          {playing ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full"
              controls
              autoPlay
              playsInline
              preload="auto"
              poster="/video/spot-poster.jpg"
              aria-label="Spot di Dieci Bottega"
            >
              <source src="/video/spot-720.mp4" type="video/mp4" media="(max-width: 767px)" />
              <source src="/video/spot-1080.mp4" type="video/mp4" />
            </video>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 w-full h-full cursor-pointer"
              aria-label="Guarda lo spot di Dieci Bottega (39 secondi, con audio)"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/video/spot-poster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              <span className="absolute inset-0 bg-obsidian/10 group-hover:bg-obsidian/0 transition-colors duration-500" aria-hidden />
              <span className="absolute left-3 bottom-3 sm:left-5 sm:bottom-5 lg:left-8 lg:bottom-8 flex items-center gap-3 lg:gap-4">
                <span className="relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-rosewood text-ivory shadow-[0_10px_40px_rgba(230,59,46,0.45)] transition-transform duration-300 group-hover:scale-110">
                  <span className="absolute inset-0 rounded-full bg-rosewood animate-ping opacity-25" aria-hidden />
                  <svg viewBox="0 0 24 24" className="relative w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 translate-x-0.5" fill="currentColor" aria-hidden>
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                  </svg>
                </span>
                <span className="bg-obsidian/90 text-ivory px-3 py-2" style={labelStyle}>
                  Guarda lo spot · 0:39<span className="hidden sm:inline"> · con audio</span>
                </span>
              </span>
            </button>
          )}
        </motion.div>

        {/* Invito: lo stesso tipo di video per la tua attività */}
        <motion.div
          className="mt-8 lg:mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-ivory/10 px-5 py-5 lg:px-8 lg:py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
        >
          <div>
            <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)", lineHeight: 1.05, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              Vuoi anche tu un video così?
            </p>
            <p className="text-ivory/55 mt-1.5" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}>
              Uno spot con il tuo brand, pronto per sito e social. <span className="text-ivory">50€ ogni 30 secondi</span>, consegna in 3–5 giorni.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/inizia-progetto"
              className="inline-flex items-center gap-2 bg-rosewood text-ivory px-5 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200"
              style={labelStyle}
            >
              Contattaci <span aria-hidden>→</span>
            </Link>
            <Link
              href="/servizi/video-spot"
              className="inline-flex items-center gap-2 border border-ivory/30 text-ivory px-5 py-3.5 hover:bg-ivory hover:text-obsidian transition-colors duration-200"
              style={labelStyle}
            >
              Scopri il servizio
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
