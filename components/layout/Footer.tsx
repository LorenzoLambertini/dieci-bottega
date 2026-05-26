"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const NAV = [
  { label: "Lavori",   href: "#lavori"   },
  { label: "Servizi",  href: "#servizi"  },
  { label: "Bottega",  href: "#bottega"  },
  { label: "Prezzi",   href: "#prezzi"   },
  { label: "Contatti", href: "#contatti" },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t relative overflow-hidden" style={{ borderColor: "rgba(244,239,230,0.06)" }}>
      <div className="noise-overlay" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12 py-16 lg:py-20">

        {/* Top */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 mb-12 pb-12 border-b"
          style={{ borderColor: "rgba(244,239,230,0.06)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease }}
        >

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p
                className="text-ivory"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", textTransform: "uppercase", letterSpacing: "-0.02em" }}
              >
                Dieci Bottega
              </p>
              <span
                className="text-rosewood"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.45rem", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "0.1rem" }}
              >
                ®
              </span>
            </div>
            <p
              className="text-ivory/30 mb-6"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1rem" }}
            >
              È tutto nei dettagli.
            </p>
            <p
              className="text-ivory/28 max-w-xs"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
            >
              Micro-agenzia digitale italiana. Siti professionali per PMI
              in 10 giorni, al prezzo di un template, con la cura di
              un&apos;agenzia.
            </p>

            {/* Contact quick link */}
            <a
              href="#contatti"
              className="inline-flex items-center gap-2 mt-6 text-rosewood hover:text-ivory transition-colors duration-200 group"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
            >
              INIZIA IL PROGETTO
              <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </a>
          </div>

          {/* Nav */}
          <div>
            <p
              className="text-ivory/18 mb-5"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              NAVIGAZIONE
            </p>
            <ul className="space-y-3">
              {NAV.map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-ivory/35 hover:text-ivory transition-colors duration-200 link-underline"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p
              className="text-ivory/18 mb-5"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              CONTATTI
            </p>
            <div className="space-y-3">
              <a
                href="mailto:info@diecibottega.it"
                className="flex items-center gap-1.5 text-ivory/35 hover:text-ivory transition-colors duration-200 group"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
              >
                <span>info@diecibottega.it</span>
                <span className="text-ivory/15 group-hover:text-rosewood group-hover:translate-x-0.5 transition-all duration-200" style={{ fontSize: "0.65rem" }}>→</span>
              </a>
              <a
                href="https://wa.me/393331234567"
                className="flex items-center gap-1.5 text-ivory/35 hover:text-ivory transition-colors duration-200 group"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
              >
                <span>WhatsApp</span>
                <span className="text-ivory/15 group-hover:text-rosewood group-hover:translate-x-0.5 transition-all duration-200" style={{ fontSize: "0.65rem" }}>→</span>
              </a>
              <div className="pt-2">
                <p
                  className="text-ivory/18"
                  style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
                >
                  BOLOGNA · ITALIA
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p
            className="text-ivory/14"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            © {new Date().getFullYear()} DIECI BOTTEGA® · TUTTI I DIRITTI RISERVATI · P.IVA IN CORSO
          </p>
          <p
            className="text-ivory/14 flex items-center gap-2"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            MADE WITH <span style={{ color: "#E63B2E" }}>♥</span> IN BOLOGNA · NEXT.JS · TAILWIND · VERCEL
          </p>
        </div>
      </div>
    </footer>
  );
}
