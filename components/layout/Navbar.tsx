"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const links = [
  { label: "Lavori",   href: "#lavori"   },
  { label: "Servizi",  href: "#servizi"  },
  { label: "Bottega",  href: "#bottega"  },
  { label: "Prezzi",   href: "#prezzi"   },
  { label: "Contatti", href: "#contatti" },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
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
        style={{ transition: "background 0.3s ease, border-color 0.3s ease" }}
        className={[
          "fixed inset-x-0 top-0 z-50",
          scrolled
            ? "bg-ivory/96 backdrop-blur-sm border-b border-obsidian/8"
            : "bg-transparent",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-[1400px] px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <a href="/" aria-label="Dieci Bottega" className="flex items-center gap-3 group">
            <div className="relative h-8 w-16 shrink-0">
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
              className="hidden sm:block text-obsidian/60 group-hover:text-obsidian"
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize: "0.8125rem",
                letterSpacing: "0.06em",
                transition: "color 0.2s",
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
                  style={{
                    fontFamily: "var(--db-jetbrains)",
                    fontSize: "0.6875rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    transition: "color 0.2s",
                  }}
                  className="text-obsidian/45 hover:text-obsidian"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            <a
              href="#contatti"
              className="hidden lg:flex items-center gap-2 bg-rosewood text-ivory hover:bg-obsidian"
              style={{
                fontFamily: "var(--db-jetbrains)",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.625rem 1.25rem",
                transition: "background 0.2s",
              }}
            >
              PARLACI →
            </a>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px]"
              aria-label={menuOpen ? "Chiudi" : "Menu"}
            >
              <span
                className="block w-6 bg-obsidian"
                style={{
                  height: "1.5px",
                  transition: "transform 0.3s, opacity 0.3s",
                  transform: menuOpen ? "rotate(45deg) translate(0, 3.25px)" : "none",
                }}
              />
              <span
                className="block w-6 bg-obsidian"
                style={{
                  height: "1.5px",
                  transition: "transform 0.3s, opacity 0.3s",
                  transform: menuOpen ? "rotate(-45deg) translate(0, -3.25px)" : "none",
                }}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu ── */}
      <div
        className="fixed inset-0 z-40 bg-ivory lg:hidden flex flex-col"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="flex flex-col justify-between h-full px-6 pt-28 pb-10">
          <ul className="flex flex-col gap-0">
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-obsidian/10">
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "var(--db-archivo)",
                    fontWeight: 900,
                    fontSize: "clamp(2.5rem, 10vw, 4rem)",
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                    lineHeight: 1,
                    display: "block",
                    padding: "0.75rem 0",
                    color: "#1A1414",
                    transition: "color 0.2s",
                    transitionDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#E63B2E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#1A1414")}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <a
              href="#contatti"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center bg-rosewood text-ivory w-full py-4"
              style={{
                fontFamily: "var(--db-jetbrains)",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              PARLACI →
            </a>
            <p
              className="text-center text-obsidian/25"
              style={{
                fontFamily: "var(--db-jetbrains)",
                fontSize: "0.625rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              BOLOGNA · ITALIA · EST. 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
