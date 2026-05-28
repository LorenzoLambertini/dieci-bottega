"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { SERVICES, getServiceBySlug, priceLabel, formatPrice } from "@/lib/services";

const ease = [0.2, 0.8, 0.2, 1] as const;

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

function unitLabel(u: "one-shot" | "mese" | "anno"): string {
  if (u === "mese") return "/mese";
  if (u === "anno") return "/anno";
  return "";
}

export default function CartView() {
  const items     = useCart(s => s.items);
  const hydrated  = useCart(s => s.hydrated);
  const remove    = useCart(s => s.remove);
  const incQty    = useCart(s => s.incQty);
  const decQty    = useCart(s => s.decQty);
  const clear     = useCart(s => s.clear);
  const oneShot   = useCart(s => s.totalOneShot());
  const monthly   = useCart(s => s.totalMonthly());
  const annual    = useCart(s => s.totalAnnual());

  // Cross-sell: 3 popolari non già nel carrello
  const crossSell = useMemo(() => {
    const inCart = new Set(items.map(i => i.slug));
    const popular = ["sito-vetrina", "manutenzione-care-plus", "google-business-setup", "casella-email-pro", "automazione-email-sequences", "crm-su-misura"];
    return popular
      .filter(slug => !inCart.has(slug))
      .map(slug => getServiceBySlug(slug))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .slice(0, 3);
  }, [items]);

  const isEmpty = hydrated && items.length === 0;

  return (
    <>
      {/* Header */}
      <section className="bg-ivory pt-28 pb-10 lg:pt-36 lg:pb-12 relative overflow-hidden">
        <div className="grain-soft" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-rosewood" />
            <span className="text-rosewood" style={labelStyle}>RIEPILOGO · CARRELLO</span>
          </div>
          <h1
            className="text-obsidian"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(2.75rem, 7vw, 6rem)",
              lineHeight:    0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            Il tuo<br />
            <span className="text-obsidian/40">progetto.</span>
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="bg-ivory pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-12">

          {!hydrated && (
            <div className="text-obsidian/40 py-20 text-center" style={{ fontFamily: "var(--db-archivo)" }}>
              <div className="dots inline-flex">
                <span /><span /><span />
              </div>
            </div>
          )}

          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-center py-16 lg:py-24 max-w-xl mx-auto"
            >
              <div className="w-14 h-14 mx-auto mb-6 border border-obsidian/15 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-obsidian/40">
                  <path d="M3 3H5L6 13H18L19 5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="17" r="1" fill="currentColor" />
                  <circle cx="16" cy="17" r="1" fill="currentColor" />
                </svg>
              </div>
              <h2
                className="text-obsidian mb-3"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(1.75rem, 3vw, 2.5rem)",
                  lineHeight:    1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                }}
              >
                Carrello vuoto
              </h2>
              <p
                className="text-obsidian/55 mb-8"
                style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.5 }}
              >
                Sfoglia il catalogo e scegli i servizi che ti servono.
                Niente pagamento online: aggiungi al carrello e ti contattiamo per il brief.
              </p>
              <Link
                href="/servizi"
                className="relative inline-flex items-center justify-center gap-2 bg-obsidian text-ivory overflow-hidden group press"
                style={{ ...labelStyle, padding: "1rem 1.75rem" }}
              >
                <span className="absolute inset-0 bg-rosewood translate-y-full group-hover:translate-y-0 transition-transform duration-400" style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }} aria-hidden />
                <span className="relative flex items-center gap-2">Vai al catalogo <span>→</span></span>
              </Link>
            </motion.div>
          )}

          {hydrated && items.length > 0 && (
            <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-start">

              {/* LEFT: Items */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-obsidian/55" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em" }}>
                    {items.length} {items.length === 1 ? "SERVIZIO" : "SERVIZI"}
                  </p>
                  <button
                    onClick={clear}
                    className="text-obsidian/40 hover:text-rosewood transition-colors duration-200"
                    style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                  >
                    Svuota carrello
                  </button>
                </div>

                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.li
                        key={item.slug}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="bg-ivory border border-obsidian/10 hover:border-obsidian/25 p-5 lg:p-6 grid grid-cols-[1fr_auto] gap-4 items-start transition-colors duration-300"
                      >
                        <div>
                          <Link
                            href={`/servizi/${item.slug}`}
                            className="text-obsidian hover:text-rosewood transition-colors duration-200"
                            style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.125rem", lineHeight: 1.1, letterSpacing: "-0.015em", textTransform: "uppercase" }}
                          >
                            {item.title}
                          </Link>
                          <p className="text-obsidian/45 mt-1" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem" }}>
                            €{formatPrice(item.price)}{unitLabel(item.unit)} · {item.unit === "one-shot" ? "una tantum" : item.unit === "mese" ? "ricorrente mensile" : "ricorrente annuale"}
                          </p>

                          <div className="flex items-center gap-4 mt-4">
                            {/* Quantity controls */}
                            <div className="inline-flex items-center border border-obsidian/15">
                              <button
                                onClick={() => decQty(item.slug)}
                                className="w-8 h-8 flex items-center justify-center text-obsidian/55 hover:text-obsidian hover:bg-obsidian/[0.04] transition-colors duration-200"
                                aria-label="Riduci quantità"
                              >
                                −
                              </button>
                              <span
                                className="w-8 text-center text-obsidian tabular-nums"
                                style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => incQty(item.slug)}
                                className="w-8 h-8 flex items-center justify-center text-obsidian/55 hover:text-obsidian hover:bg-obsidian/[0.04] transition-colors duration-200"
                                aria-label="Aumenta quantità"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => remove(item.slug)}
                              className="text-obsidian/40 hover:text-rosewood transition-colors duration-200"
                              style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                            >
                              Rimuovi
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-obsidian/35" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                            SUBTOTALE
                          </p>
                          <p
                            className="text-obsidian tabular-nums"
                            style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                          >
                            €{formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>

              {/* RIGHT: Summary */}
              <aside className="lg:sticky lg:top-24">
                <div className="bg-obsidian text-ivory shadow-atelier-lg relative overflow-hidden">
                  <div className="grain-soft" aria-hidden />
                  <div className="relative p-7 lg:p-8">
                    <p className="text-rosewood mb-4" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                      ◆ STIMA TOTALE
                    </p>

                    <div className="space-y-4 pb-5 border-b border-ivory/12">
                      {oneShot > 0 && (
                        <div className="flex items-baseline justify-between">
                          <p className="text-ivory/55" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}>
                            Una tantum
                          </p>
                          <p className="text-ivory tabular-nums" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1.25rem" }}>
                            €{formatPrice(oneShot)}
                          </p>
                        </div>
                      )}
                      {monthly > 0 && (
                        <div className="flex items-baseline justify-between">
                          <p className="text-ivory/55" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}>
                            Mensile
                          </p>
                          <p className="text-ivory tabular-nums" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1.25rem" }}>
                            €{formatPrice(monthly)}<span className="text-ivory/45" style={{ fontSize: "0.75rem", fontWeight: 500 }}>/mese</span>
                          </p>
                        </div>
                      )}
                      {annual > 0 && (
                        <div className="flex items-baseline justify-between">
                          <p className="text-ivory/55" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}>
                            Annuale
                          </p>
                          <p className="text-ivory tabular-nums" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1.25rem" }}>
                            €{formatPrice(annual)}<span className="text-ivory/45" style={{ fontSize: "0.75rem", fontWeight: 500 }}>/anno</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-ivory/35 my-5" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.875rem", lineHeight: 1.55 }}>
                      Il preventivo definitivo viene confermato dopo il brief.
                      Nessun pagamento online — paghi 50% all&apos;avvio, 50% al lancio.
                    </p>

                    <Link
                      href="/inizia-progetto"
                      className="relative w-full flex items-center justify-center gap-2 bg-rosewood text-ivory overflow-hidden group press"
                      style={{ ...labelStyle, padding: "1rem" }}
                    >
                      <span className="absolute inset-0 bg-ivory translate-y-full group-hover:translate-y-0 transition-transform duration-500" style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }} aria-hidden />
                      <span className="relative flex items-center gap-2 group-hover:text-obsidian transition-colors duration-150">
                        <span className="live-dot" />
                        Richiedi preventivo
                        <span>→</span>
                      </span>
                    </Link>

                    <p className="text-ivory/30 mt-4 text-center" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                      RISPOSTA ENTRO 24 ORE · NESSUN OBBLIGO
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Cross-sell */}
          {hydrated && items.length > 0 && crossSell.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-8 h-px bg-rosewood" />
                <span className="text-rosewood" style={labelStyle}>
                  DI SOLITO ACQUISTATI INSIEME
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {crossSell.map(svc => (
                  <Link
                    key={svc.slug}
                    href={`/servizi/${svc.slug}`}
                    className="block bg-ivory border border-obsidian/10 hover:border-obsidian/25 p-5 group transition-all duration-300 card-tactile"
                  >
                    <h3
                      className="text-obsidian group-hover:text-rosewood transition-colors duration-200 mb-1"
                      style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.125rem", letterSpacing: "-0.015em", textTransform: "uppercase" }}
                    >
                      {svc.title}
                    </h3>
                    <p className="text-obsidian/50 mb-4" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                      {svc.shortDesc}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-obsidian/8">
                      <span className="text-obsidian" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}>
                        {priceLabel(svc)}<span className="text-obsidian/40 ml-1" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{unitLabel(svc.unit)}</span>
                      </span>
                      <span className="text-rosewood">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
