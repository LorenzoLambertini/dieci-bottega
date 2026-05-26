"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Lavori",   href: "#lavori"   },
  { label: "Servizi",  href: "#servizi"  },
  { label: "Bottega",  href: "#bottega"  },
  { label: "Prezzi",   href: "#prezzi"   },
  { label: "Contatti", href: "#contatti" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Fixed bar ── */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-ivory/95 backdrop-blur-md border-b border-obsidian/8 shadow-[0_1px_20px_rgba(26,20,20,0.06)]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-[1400px] px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <a
            href="/"
            aria-label="Dieci Bottega"
            className="flex items-center gap-3 group"
          >
            <div
              className="relative h-8 w-16 shrink-0 transition-opacity duration-200 group-hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="10/B"
                fill
                className="object-contain object-left"
                style={{ mixBlendMode: "multiply" }}
                priority
              />
            </div>
            <span
              className="hidden sm:block text-obsidian/55 group-hover:text-obsidian transition-colors duration-200"
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize: "0.8125rem",
                letterSpacing: "0.06em",
              }}
            >
              dieci bottega
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="relative text-obsidian/40 hover:text-obsidian transition-colors duration-200 group"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  {l.label}
                  <span
                    className="absolute -bottom-0.5 left-0 w-full h-px bg-rosewood scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            <a
              href="#contatti"
              className="hidden lg:flex items-center gap-2 bg-rosewood text-ivory overflow-hidden relative group"
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding:       "0.625rem 1.25rem",
              }}
            >
              {/* Hover fill overlay */}
              <span
                className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                aria-hidden
              />
              <span className="relative flex items-center gap-1.5">
                PARLACI
                <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-200">→</span>
              </span>
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px]"
              aria-label={menuOpen ? "Chiudi" : "Menu"}
              aria-expanded={menuOpen}
            >
              <span
                className="block w-5 bg-obsidian transition-all duration-300"
                style={{
                  height: "1.5px",
                  transform: menuOpen ? "rotate(45deg) translate(0, 3.25px)" : "none",
                }}
              />
              <span
                className="block w-5 bg-obsidian transition-all duration-300"
                style={{
                  height: "1.5px",
                  transform: menuOpen ? "rotate(-45deg) translate(0, -3.25px)" : "none",
                }}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 bg-ivory lg:hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
          >
            <div className="flex flex-col justify-between h-full px-6 pt-24 pb-10">
              <ul className="flex flex-col gap-0">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    className="border-b border-obsidian/8"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease, delay: 0.05 + i * 0.055 }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center justify-between py-4 text-obsidian hover:text-rosewood transition-colors duration-200"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(2.5rem, 10vw, 4rem)",
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                        lineHeight:    1,
                      }}
                    >
                      {l.label}
                      <span
                        className="text-obsidian/15 group-hover:text-rosewood/50 transition-colors duration-200"
                        style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.75rem" }}
                      >
                        →
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease, delay: 0.35 }}
              >
                <a
                  href="#contatti"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-rosewood text-ivory w-full py-4 hover:bg-obsidian transition-colors duration-200"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  PARLACI →
                </a>
                <p
                  className="text-center text-obsidian/20"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.625rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  BOLOGNA · ITALIA · EST. 2026
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
