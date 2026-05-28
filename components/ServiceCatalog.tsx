"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SERVICES, CATEGORIES, priceLabel, type Service, type ServiceCategory } from "@/lib/services";
import { useCart } from "@/lib/cart";

const ease = [0.2, 0.8, 0.2, 1] as const;

type Filter = "tutti" | ServiceCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "tutti",       label: "Tutti" },
  { key: "siti",        label: "Siti Web" },
  { key: "marketing",   label: "Marketing" },
  { key: "crm",         label: "CRM & Dati" },
  { key: "automazioni", label: "Automazioni" },
  { key: "abbonamenti", label: "Abbonamenti" },
  { key: "extra",       label: "Extra" },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

function unitSuffix(svc: Service): string {
  if (svc.unit === "mese") return "/mese";
  if (svc.unit === "anno") return "/anno";
  return "";
}

export default function ServiceCatalog() {
  const [filter, setFilter] = useState<Filter>("tutti");
  const add = useCart(s => s.add);

  const visible = useMemo(() => {
    if (filter === "tutti") return SERVICES;
    return SERVICES.filter(s => s.category === filter);
  }, [filter]);

  return (
    <>
      {/* Filter bar — sticky on desktop, scrollable on mobile */}
      <div className="sticky top-16 lg:top-[72px] z-30 bg-ivory/95 backdrop-blur-md border-b border-obsidian/8 py-3">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map(f => {
              const isOn = filter === f.key;
              const count = f.key === "tutti" ? SERVICES.length : SERVICES.filter(s => s.category === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={[
                    "shrink-0 inline-flex items-center gap-2 px-4 py-2 border transition-all duration-300 press",
                    isOn
                      ? "bg-obsidian text-ivory border-obsidian"
                      : "bg-transparent text-obsidian/55 border-obsidian/15 hover:border-obsidian/40 hover:text-obsidian",
                  ].join(" ")}
                  style={labelStyle}
                >
                  <span>{f.label}</span>
                  <span className={isOn ? "text-ivory/55" : "text-obsidian/30"} style={{ fontSize: "0.625rem" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 py-10 lg:py-14">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
          >
            {visible.map((svc, i) => (
              <motion.article
                key={svc.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: Math.min(i * 0.04, 0.4) }}
                className="relative flex flex-col bg-ivory border border-obsidian/10 hover:border-obsidian/25 transition-all duration-400 group overflow-hidden card-tactile"
                style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
              >
                {svc.featured && (
                  <div
                    className="absolute top-3 right-3 bg-rosewood text-ivory px-2 py-1"
                    style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
                  >
                    ◆ PIÙ SCELTO
                  </div>
                )}

                <Link
                  href={`/servizi/${svc.slug}`}
                  className="flex-1 p-6 lg:p-7 flex flex-col"
                >
                  {/* Category */}
                  <p className="text-rosewood mb-3" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                    {CATEGORIES[svc.category].label}
                  </p>

                  {/* Title */}
                  <h3
                    className="text-obsidian mb-2 group-hover:text-rosewood transition-colors duration-300"
                    style={{
                      fontFamily:    "var(--db-archivo)",
                      fontWeight:    900,
                      fontSize:      "1.5rem",
                      lineHeight:    1.05,
                      letterSpacing: "-0.02em",
                      textTransform: "uppercase",
                    }}
                  >
                    {svc.title}
                  </h3>

                  {/* Short desc */}
                  <p
                    className="text-obsidian/55 mb-5 flex-1"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.55 }}
                  >
                    {svc.shortDesc}
                  </p>

                  {/* Meta */}
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-obsidian/8">
                    <div>
                      <p className="text-obsidian/35" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                        DA
                      </p>
                      <p
                        className="text-obsidian"
                        style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                      >
                        {priceLabel(svc)}<span className="text-obsidian/40" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{unitSuffix(svc)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-obsidian/35" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                        TEMPO
                      </p>
                      <p
                        className="text-obsidian/70"
                        style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}
                      >
                        {svc.deliveryDays === "su preventivo" || svc.deliveryDays === "su richiesta" ? svc.deliveryDays : `${svc.deliveryDays} gg`}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Add to cart */}
                <button
                  onClick={() => add(svc)}
                  className="relative bg-obsidian text-ivory py-3 overflow-hidden group/cta press"
                  style={labelStyle}
                >
                  <span
                    className="absolute inset-0 bg-rosewood translate-y-full group-hover/cta:translate-y-0 transition-transform duration-400"
                    style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                    aria-hidden
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    + Aggiungi al carrello
                  </span>
                </button>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
