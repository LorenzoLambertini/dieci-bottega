"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useCart } from "@/lib/cart";

const ease = [0.2, 0.8, 0.2, 1] as const;

/* ─── Nav structure ────────────────────────────────────── */

type NavLeaf  = { label: string; href: string; desc?: string };
type NavGroup = { label: string; items: NavLeaf[] };
type NavItem  = { label: string; href?: string; groups?: NavGroup[] };

const NAV: NavItem[] = [
  {
    label:  "Soluzioni",
    groups: [
      {
        label: "Siti Web",
        items: [
          { label: "Sito Vetrina",     href: "/servizi/sito-vetrina",     desc: "Presenza credibile, in 10 giorni" },
          { label: "Landing Page",     href: "/servizi/landing-page",     desc: "Una pagina, un obiettivo" },
          { label: "E-commerce Light", href: "/servizi/ecommerce-light",  desc: "Vendita diretta artigiana" },
        ],
      },
      {
        label: "CRM & Dati",
        items: [
          { label: "CRM Su Misura",     href: "/servizi/crm-su-misura",     desc: "Niente più Excel" },
          { label: "Dashboard Custom",  href: "/servizi/dashboard-custom",  desc: "KPI in tempo reale" },
          { label: "Integrazione tool", href: "/servizi/integrazione-tool", desc: "Far parlare i sistemi" },
        ],
      },
      {
        label: "Marketing & AI",
        items: [
          { label: "SEO On-Page",        href: "/servizi/seo-on-page",                  desc: "Apparire su Google" },
          { label: "Google Ads",         href: "/servizi/google-ads-setup",             desc: "Setup pubblicità" },
          { label: "Email Sequences",    href: "/servizi/automazione-email-sequences",  desc: "Follow-up automatico" },
        ],
      },
    ],
  },
  { label: "Servizi",   href: "/servizi"   },
  { label: "Progetti",  href: "/progetti"  },
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Contatti",  href: "/contatti"  },
];

/* ─── Component ────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const closeTimer = useRef<number | null>(null);

  // Cart count (hydration-safe)
  const cartCount = useCart(s => s.totalItems());
  const cartHydrated = useCart(s => s.hydrated);

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // Is the page background dark? (e.g. Hero on home is red)
  // For now: only the Home page has a colored hero at top → keep transparent header at top
  const isHomeAtTop = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

  // Dropdown hover with delay close
  const handleEnter = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };
  const handleLeave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 200);
  };

  /* ─── Colors based on context ───────────────────────── */

  const headerBg = scrolled
    ? "bg-ivory/90 backdrop-blur-xl border-b border-obsidian/[0.08]"
    : "bg-transparent border-b border-transparent";

  const textColor      = isHomeAtTop ? "text-ivory"       : "text-obsidian";
  const textColorMuted = isHomeAtTop ? "text-ivory/65"    : "text-obsidian/55";
  const textColorHover = isHomeAtTop ? "hover:text-ivory" : "hover:text-obsidian";

  /* ─── Render ────────────────────────────────────────── */

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerBg}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
      >
        <nav className="mx-auto max-w-[1480px] px-6 lg:px-12 flex items-center justify-between h-16 lg:h-[72px]">

          {/* Logo */}
          <Link href="/" aria-label="Dieci Bottega" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-7 w-14 transition-opacity duration-300 group-hover:opacity-75">
              <Image
                src="/logo.png"
                alt="10/B"
                fill
                className="object-contain object-left"
                style={{
                  mixBlendMode: isHomeAtTop ? "screen" : "multiply",
                  filter: isHomeAtTop ? "brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.25))" : "none",
                }}
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className={`${textColor} ${textColorHover} transition-colors duration-300`}
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
                className={`${textColorMuted} mt-0.5`}
                style={{
                  fontFamily:    "var(--db-jetbrains)",
                  fontSize:      "0.5rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  opacity:       0.7,
                }}
              >
                BOLOGNA · EST. 26
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-7">
            {NAV.map(item => {
              const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
              const isOpen = openDropdown === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.groups && handleEnter(item.label)}
                  onMouseLeave={() => item.groups && handleLeave()}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-1.5 transition-colors duration-300 group ${isActive ? textColor : textColorMuted} ${textColorHover}`}
                      style={{
                        fontFamily:    "var(--db-jetbrains)",
                        fontSize:      "0.6875rem",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-rosewood" aria-hidden />
                      )}
                    </Link>
                  ) : (
                    <button
                      className={`relative flex items-center gap-1.5 transition-colors duration-300 group ${isOpen ? textColor : textColorMuted} ${textColorHover}`}
                      style={{
                        fontFamily:    "var(--db-jetbrains)",
                        fontSize:      "0.6875rem",
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                      <svg
                        width="9" height="9" viewBox="0 0 9 9" fill="none"
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        <path d="M1 3l3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    </button>
                  )}

                  {/* Mega dropdown */}
                  {item.groups && (
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25, ease }}
                          onMouseEnter={() => handleEnter(item.label)}
                          onMouseLeave={handleLeave}
                        >
                          <div className="bg-ivory border border-obsidian/10 shadow-atelier-lg overflow-hidden min-w-[640px] grid grid-cols-3">
                            {item.groups.map(group => (
                              <div key={group.label} className="p-5 border-r border-obsidian/8 last:border-r-0">
                                <p
                                  className="text-rosewood mb-4"
                                  style={{
                                    fontFamily:    "var(--db-jetbrains)",
                                    fontSize:      "0.5625rem",
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    fontWeight:    700,
                                  }}
                                >
                                  {group.label}
                                </p>
                                <ul className="space-y-3">
                                  {group.items.map(leaf => (
                                    <li key={leaf.href}>
                                      <Link
                                        href={leaf.href}
                                        className="block group/leaf hover:bg-obsidian/[0.02] -mx-2 px-2 py-1.5 transition-colors duration-200"
                                      >
                                        <p
                                          className="text-obsidian group-hover/leaf:text-rosewood transition-colors duration-200"
                                          style={{
                                            fontFamily: "var(--db-archivo)",
                                            fontWeight: 700,
                                            fontSize:   "0.9375rem",
                                            lineHeight: 1.3,
                                          }}
                                        >
                                          {leaf.label}
                                        </p>
                                        {leaf.desc && (
                                          <p
                                            className="text-obsidian/45 mt-0.5"
                                            style={{ fontFamily: "var(--db-archivo)", fontSize: "0.75rem", lineHeight: 1.4 }}
                                          >
                                            {leaf.desc}
                                          </p>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div className="bg-obsidian/[0.03] border-x border-b border-obsidian/10 px-5 py-3 flex items-center justify-between">
                            <p
                              className="text-obsidian/55"
                              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.875rem" }}
                            >
                              Non sai cosa scegliere?
                            </p>
                            <Link
                              href="/servizi"
                              className="text-rosewood hover:text-obsidian transition-colors duration-200 inline-flex items-center gap-1.5"
                              style={{
                                fontFamily:    "var(--db-jetbrains)",
                                fontSize:      "0.6875rem",
                                letterSpacing: "0.10em",
                                textTransform: "uppercase",
                              }}
                            >
                              Vedi tutti i servizi <span>→</span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right: Cart + CTA + Hamburger */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">

            {/* Cart icon */}
            <Link
              href="/carrello"
              aria-label="Carrello"
              className={`relative w-10 h-10 flex items-center justify-center group ${textColorMuted} ${textColorHover} transition-colors duration-300`}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M2 2H4L5 11H15L16 4H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="15" r="1" fill="currentColor" />
                <circle cx="13" cy="15" r="1" fill="currentColor" />
              </svg>
              {cartHydrated && cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rosewood text-ivory flex items-center justify-center tabular-nums"
                  style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem", fontWeight: 700, lineHeight: 1 }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* CTA */}
            <Link
              href="/inizia-progetto"
              className="hidden lg:flex items-center gap-2 bg-rosewood text-ivory overflow-hidden relative group press"
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.6875rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                padding:       "0.625rem 1.125rem",
              }}
            >
              <span
                className="absolute inset-0 bg-obsidian translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                aria-hidden
              />
              <span className="relative flex items-center gap-2">
                <span className="live-dot" />
                <span>Il tuo sito gratis</span>
              </span>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={`lg:hidden w-10 h-10 flex flex-col justify-center items-center gap-[5px] ${textColor}`}
              aria-label={menuOpen ? "Chiudi" : "Menu"}
              aria-expanded={menuOpen}
            >
              <span
                className="block w-5 bg-current transition-all duration-400"
                style={{ height: "1.5px", transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)", transform: menuOpen ? "rotate(45deg) translate(0, 3.25px)" : "none" }}
              />
              <span
                className="block w-5 bg-current transition-all duration-400"
                style={{ height: "1.5px", transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)", transform: menuOpen ? "rotate(-45deg) translate(0, -3.25px)" : "none" }}
              />
            </button>
          </div>
        </nav>

        {/* Scroll progress */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-rosewood origin-left"
          style={{ scaleX: progress, width: "100%", opacity: scrolled ? 1 : 0, transition: "opacity 0.3s" }}
          aria-hidden
        />
      </header>

      {/* ─── Mobile menu ─── */}
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
            <div className="relative flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto">

              <div className="mb-6 flex items-center gap-3">
                <span className="block w-8 h-px bg-rosewood" />
                <span
                  className="text-rosewood"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.5625rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight:    700,
                  }}
                >
                  MENU · DIECI BOTTEGA
                </span>
              </div>

              <ul className="flex-1 flex flex-col gap-0">
                {NAV.map((item, i) => {
                  const isExpanded = mobileExpanded === item.label;
                  return (
                    <motion.li
                      key={item.label}
                      className="border-b border-obsidian/8"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease, delay: 0.05 + i * 0.04 }}
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex items-baseline justify-between py-4 text-obsidian"
                          style={{
                            fontFamily:    "var(--db-archivo)",
                            fontWeight:    900,
                            fontSize:      "1.75rem",
                            letterSpacing: "-0.025em",
                            textTransform: "uppercase",
                            lineHeight:    1,
                          }}
                        >
                          {item.label}
                          <span className="text-obsidian/20" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.75rem" }}>→</span>
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                            className="w-full flex items-baseline justify-between py-4 text-obsidian text-left"
                            style={{
                              fontFamily:    "var(--db-archivo)",
                              fontWeight:    900,
                              fontSize:      "1.75rem",
                              letterSpacing: "-0.025em",
                              textTransform: "uppercase",
                              lineHeight:    1,
                            }}
                          >
                            {item.label}
                            <span
                              className="text-obsidian/30 transition-transform duration-300"
                              style={{
                                fontFamily: "var(--db-jetbrains)",
                                fontSize:   "0.875rem",
                                transform:  isExpanded ? "rotate(45deg)" : "rotate(0)",
                              }}
                            >
                              +
                            </span>
                          </button>

                          <AnimatePresence>
                            {isExpanded && item.groups && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease }}
                                className="overflow-hidden"
                              >
                                <div className="pb-4 space-y-4">
                                  {item.groups.map(group => (
                                    <div key={group.label}>
                                      <p
                                        className="text-rosewood mb-2"
                                        style={{
                                          fontFamily:    "var(--db-jetbrains)",
                                          fontSize:      "0.5625rem",
                                          letterSpacing: "0.14em",
                                          textTransform: "uppercase",
                                          fontWeight:    700,
                                        }}
                                      >
                                        {group.label}
                                      </p>
                                      <ul className="space-y-1">
                                        {group.items.map(leaf => (
                                          <li key={leaf.href}>
                                            <Link
                                              href={leaf.href}
                                              className="block py-2 text-obsidian/70 hover:text-obsidian transition-colors duration-200"
                                              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}
                                            >
                                              {leaf.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                className="mt-6 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.4 }}
              >
                <Link
                  href="/carrello"
                  className="flex items-center justify-between gap-2 border border-obsidian/15 text-obsidian w-full py-3 px-4"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Carrello</span>
                  <span className="bg-rosewood text-ivory px-2 py-0.5" style={{ fontSize: "0.625rem" }}>
                    {cartHydrated ? cartCount : 0}
                  </span>
                </Link>
                <Link
                  href="/inizia-progetto"
                  className="flex items-center justify-center gap-2 bg-rosewood text-ivory w-full py-3.5 press"
                  style={{
                    fontFamily:    "var(--db-jetbrains)",
                    fontSize:      "0.6875rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                  }}
                >
                  <span className="live-dot" />
                  <span>Il tuo sito gratis</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
