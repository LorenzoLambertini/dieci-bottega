"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

interface Project {
  name:       string;
  type:       string;
  desc:       string;
  tags:       [string, string, string];
  image:      string;
  alt:        string;
  url:        string;
  secondary?: { label: string; url: string };
}

/** Solo lavori reali, in quest'ordine. */
const PROJECTS: Project[] = [
  {
    name:  "Villa Pet Sitter",
    type:  "SITO VETRINA · Bologna",
    desc:  "Pet sitter professionale a Bologna. Dal vecchio sito WordPress a un sito vetrina multipagina: servizi, prezzi, attestati, recensioni, galleria, WhatsApp a un tocco.",
    tags:  ["Sito Vetrina", "SEO locale", "Mobile-first"],
    image: "/lavori/villa-pet-sitter/dopo-desktop-v2.webp",
    alt:   "Home page del nuovo sito di Villa Pet Sitter, pet sitter professionale a Bologna",
    url:   "https://villa-pet-sitter.vercel.app",
    secondary: { label: "Il sito di prima", url: "https://villapetsitter.eu" },
  },
  {
    name:  "Virtus Bologna",
    type:  "WEB APP · Basket EuroLeague",
    desc:  "Welcome Kit per i nuovi giocatori della stagione 2026/27. Una web app in quattro lingue con tutto quello che serve per ambientarsi a Bologna.",
    tags:  ["Web App", "Multilingua", "PWA-ready"],
    image: "/lavori/virtus-welcome-kit/desktop-v2.webp",
    alt:   "Home della web app Welcome Kit di Virtus Bologna per i nuovi giocatori",
    url:   "https://virtus-welcome-kit.vercel.app",
  },
  {
    name:  "LAMBO",
    type:  "PORTFOLIO · DJ",
    desc:  "Portfolio per Giulio Lambertini, DJ house e tech house: sound, gallery, set su SoundCloud e booking diretto.",
    tags:  ["Portfolio", "Musica", "One-page"],
    image: "/lavori/lambo/desktop-v2.webp",
    alt:   "Home del portfolio di LAMBO, DJ house e tech house",
    url:   "https://djlambogiulio.vercel.app",
  },
];

export default function Projects() {
  return (
    <section id="lavori" className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-16 lg:pt-36 lg:pb-24">
        <motion.div
          className="mb-12 lg:mb-20 max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="flex items-center gap-3 mb-8">
            <span className="live-dot" />
            <span className="text-rosewood" style={labelStyle}>01 · LAVORI</span>
          </div>
          <h1
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
            Lavori<br />
            <span className="text-obsidian/40">online.</span>
          </h1>
        </motion.div>

        <ol className="flex flex-col gap-14 lg:gap-24">
          {PROJECTS.map((p, i) => (
            <motion.li
              key={p.name}
              className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, ease }}
            >
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${p.name}: apri il sito in una nuova scheda`}
                className={`group lg:col-span-7 block relative aspect-[16/9] overflow-hidden rounded-xl border border-obsidian/10 shadow-atelier-lg bg-obsidian ${i % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover object-top transition-transform duration-400 ease-out group-hover:scale-[1.02]"
                />
              </a>

              <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-rosewood" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                    {p.type}
                  </span>
                  <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                    {String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                </div>
                <h2
                  className="text-obsidian mb-4"
                  style={{
                    fontFamily:    "var(--db-archivo)",
                    fontWeight:    900,
                    fontSize:      "clamp(2rem, 3.6vw, 3.25rem)",
                    lineHeight:    0.95,
                    letterSpacing: "-0.035em",
                    textTransform: "uppercase",
                  }}
                >
                  {p.name}
                </h2>
                <p
                  className="text-obsidian/65 mb-6"
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.6 }}
                >
                  {p.desc}
                </p>
                <ul className="flex flex-wrap gap-2 mb-7">
                  {p.tags.map(t => (
                    <li
                      key={t}
                      className="text-obsidian/65 border border-obsidian/15 px-2.5 py-1"
                      style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 bg-obsidian text-ivory hover:bg-rosewood transition-colors duration-200 ease-out px-5 py-3"
                    style={{ ...labelStyle, fontWeight: 700 }}
                  >
                    Guarda il progetto
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
                  </a>
                  {p.secondary && (
                    <a
                      href={p.secondary.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-obsidian/50 hover:text-rosewood underline underline-offset-4 decoration-obsidian/20 transition-colors duration-200 ease-out"
                      style={{ ...labelStyle, fontSize: "0.625rem" }}
                    >
                      {p.secondary.label} ↗
                    </a>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
