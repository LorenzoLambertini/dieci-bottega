"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const NAV = [
  {
    label: "Naviga",
    links: [
      { label: "Home",       href: "/"               },
      { label: "Soluzioni",  href: "/soluzioni"      },
      { label: "Servizi",    href: "/servizi"        },
      { label: "Progetti",   href: "/progetti"       },
      { label: "Chi siamo",  href: "/chi-siamo"      },
      { label: "Contatti",   href: "/contatti"       },
    ],
  },
  {
    label: "Servizi",
    links: [
      { label: "Sito Vetrina",        href: "/servizi/sito-vetrina"              },
      { label: "Landing Page",        href: "/servizi/landing-page"              },
      { label: "E-commerce Light",    href: "/servizi/ecommerce-light"           },
      { label: "CRM Su Misura",       href: "/servizi/crm-su-misura"             },
      { label: "Care Plus",           href: "/servizi/manutenzione-care-plus"    },
    ],
  },
  {
    label: "Contatti",
    links: [
      { label: "info@diecibottega.it", href: "mailto:info@diecibottega.it" },
      { label: "WhatsApp",             href: "https://wa.me/393331234567"  },
      { label: "Bologna · Italia",     href: null                          },
    ] as Array<{ label: string; href: string | null }>,
  },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t relative overflow-hidden" style={{ borderColor: "rgba(244,239,230,0.06)" }}>
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 py-16 lg:py-20">

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-14 lg:mb-20 pb-14 lg:pb-20 border-b border-ivory/8 grid lg:grid-cols-[1fr_auto] gap-8 items-end"
        >
          <h2
            className="text-ivory"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(2.25rem, 5vw, 4.25rem)",
              lineHeight:    0.95,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            Hai un&apos;idea?<br />
            <span className="text-ivory/40">Parliamone in 30 minuti.</span>
          </h2>
          <Link
            href="/inizia-progetto"
            className="shrink-0 relative inline-flex items-center justify-center gap-2 bg-rosewood text-ivory overflow-hidden group press"
            style={{
              fontFamily:    "var(--db-jetbrains)",
              fontSize:      "0.6875rem",
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              padding:       "1.125rem 1.875rem",
              whiteSpace:    "nowrap",
            }}
          >
            <span className="absolute inset-0 bg-ivory translate-y-full group-hover:translate-y-0 transition-transform duration-500" style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }} aria-hidden />
            <span className="relative flex items-center gap-2 group-hover:text-obsidian transition-colors duration-150">
              <span className="live-dot" />
              <span>Il tuo sito gratis</span>
              <span>→</span>
            </span>
          </Link>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-baseline gap-1 mb-2">
              <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
                Dieci Bottega
              </p>
              <span className="text-rosewood" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem" }}>®</span>
            </div>
            <p className="text-ivory/30 mb-5" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1rem" }}>
              È tutto nei dettagli.
            </p>
            <p className="text-ivory/35 max-w-xs" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              Micro-agenzia digitale di Bologna. Siti, CRM e automazioni
              per chi vuole un lavoro che si veda.
            </p>
          </div>

          {NAV.map(group => (
            <div key={group.label}>
              <p
                className="text-ivory/22 mb-5"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}
              >
                {group.label}
              </p>
              <ul className="space-y-3">
                {group.links.map(l => (
                  <li key={l.label}>
                    {l.href ? (
                      <Link
                        href={l.href}
                        className="text-ivory/45 hover:text-ivory transition-colors duration-200 link-underline"
                        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <p
                        className="text-ivory/35"
                        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}
                      >
                        {l.label}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-ivory/8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p
            className="text-ivory/22"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
          >
            © {new Date().getFullYear()} DIECI BOTTEGA® · TUTTI I DIRITTI RISERVATI · P.IVA IN CORSO
          </p>
          <p
            className="text-ivory/22 flex items-center gap-2"
            style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            MADE WITH <span style={{ color: "#E63B2E" }}>♥</span> IN BOLOGNA · NEXT.JS · TAILWIND · VERCEL
          </p>
        </div>
      </div>
    </footer>
  );
}
