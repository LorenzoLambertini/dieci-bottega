"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

const links = [
  { label: "Soluzioni",      href: "#soluzioni",   short: "01" },
  { label: "Bottega Aperta", href: "#bottega-aperta", short: "02" },
  { label: "Processo",       href: "#processo",    short: "03" },
  { label: "Studio",         href: "#studio",      short: "04" },
  { label: "Prezzi",         href: "#prezzi",      short: "05" },
  { label: "Contatti",       href: "#contatti",    short: "06" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active,   setActive]   = useState<string>("");

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);

      // Find which section is most in view
      const mid = window.innerHeight * 0.35;
      let current = "";
      for (const l of links) {
        const el = document.querySelector<HTMLElement>(l.href);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom > mid) {
          current = l.href;
          break;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-ivory/90 backdrop-blur-xl border-b border-obsidian/[0.08]"
            : "bg-transparent border-b border-transparent",
        ].join(" ")}
        style={{
          transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <nav className="mx-auto max-w-[1480px] px-6 lg:px-12 flex items-center justify-between h-16 lg:h-[72px]">

          {/* Logo */}
          <a href="/" aria-label="Dieci Bottega" className="flex items-center gap-3 group">
            <div className="relative h-7 w-14 shrink-0 transition-opacity duration-300 group-hover:opacity-75">
              <Image
                src="/logo.png"
                alt="10/B"
                fill
                className="object-contain object-left"
                style={{ mixBlendMode: "multiply" }}
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="text-obsidian/70 group-hover:text-obsidian transition-colors duration-300"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    700,
                  fontSize:      "0.8125rem",
                  letterSpacing: "0.02em",
                }}
              >
                Dieci Bottega
              </span>
              <span
                className="text-obsidian/30 mt-0.5"
                style={{
                  fontFamily:    "var(--db-jetbrains)",
                  fontSize:      "0.5rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                BOLOGNA · EST. 26
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-9">
            {links.map(l => {
              const isActive = active === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="relative flex items-center gap-2 transition-colors duration-300 group"
                    style={{
                      fontFamily:    "var(--db-jetbrains)",
                      fontSize:      "0.6875rem",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color:         isActive ? "#1A1414" : "rgba(26,20,20,0.40)",
                    }}
                  >
                    <span
                      className="transition-colors duration-300"
                      style={{ color: isActive ? "#E63B2E" : "rgba(26,20,20,0.20)" }}
                    >
                      {l.short}
                    </span>
                    <span className="group-hover:text-obsidian transition-colors duration-300">{l.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-[22px] left-0 right-0 h-px bg-rosewood"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#contatti"
              className="hidden lg:flex items-center gap-2 bg-obsidian text-ivory overflow-hidden relative group press"
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.6875rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                padding:       "0.625rem 1.125rem",
              }}
            >
              <span
                className="absolute inset-0 bg-rosewood translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                aria-hidden
              />
              <span className="relative flex items-center gap-2">
                <span className="live-dot" />
                <span>Inizia un progetto</span>
              </span>
            </a>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px] -mr-2"
              aria-label={menuOpen ? "Chiudi" : "Menu"}
              aria-expanded={menuOpen}
            >
              <span
                className="block w-5 bg-obsidian transition-all duration-400"
                style={{
                  height: "1.5px",
                  transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
                  transform: menuOpen ? "rotate(45deg) translate(0, 3.25px)" : "none",
                }}
              />
              <span
                className="block w-5 bg-obsidian transition-all duration-400"
                style={{
                  height: "1.5px",
                  transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)",
                  transform: menuOpen ? "rotate(-45deg) translate(0, -3.25px)" : "none",
                }}
              />
            </button>
          </div>
        </nav>

        {/* Scroll progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-rosewood origin-left"
          style={{
            scaleX: progress,
            width:  "100%",
            opacity: scrolled ? 1 : 0,
            transition: "opacity 0.3s",
          }}
          aria-hidden
        />
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 bg-ivory lg:hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="grain-soft" aria-hidden />
            <div className="relative flex flex-col justify-between h-full px-6 pt-24 pb-10">

              {/* Section index */}
              <div className="mb-8 flex items-center gap-3">
                <span className="section-rule bg-obsidian/30" />
                <span className="text-label-xs text-obsidian/40">INDICE · DIECI BOTTEGA</span>
              </div>

              <ul className="flex flex-col gap-0 flex-1">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    className="border-b border-obsidian/8"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.06 + i * 0.05 }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-baseline justify-between gap-3 py-4 text-obsidian hover:text-rosewood transition-colors duration-300"
                    >
                      <span
                        className="text-obsidian/25 group-hover:text-rosewood/60 transition-colors duration-300 shrink-0"
                        style={{
                          fontFamily:    "var(--db-jetbrains)",
                          fontSize:      "0.625rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                        }}
                      >
                        {l.short}
                      </span>
                      <span
                        className="flex-1"
                        style={{
                          fontFamily:    "var(--db-archivo)",
                          fontWeight:    900,
                          fontSize:      "clamp(2.25rem, 9vw, 3.5rem)",
                          letterSpacing: "-0.03em",
                          textTransform: "uppercase",
                          lineHeight:    1,
                          textAlign:     "right",
                        }}
                      >
                        {l.label}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="mt-8 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.4 }}
              >
                <a
                  href="#contatti"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2.5 bg-obsidian text-ivory w-full py-4 press"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  <span className="live-dot" />
                  <span>Inizia un progetto</span>
                </a>
                <div className="flex items-center justify-between">
                  <p
                    className="text-obsidian/30"
                    style={{
                      fontFamily:    "var(--db-jetbrains)",
                      fontSize:      "0.5625rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    BOLOGNA · ITALIA
                  </p>
                  <p
                    className="text-obsidian/30"
                    style={{
                      fontFamily:    "var(--db-jetbrains)",
                      fontSize:      "0.5625rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    EST. MMXXVI
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
