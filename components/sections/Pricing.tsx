"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

/* ─── Configuratore ─────────────────────────────────────── */

type TypeKey = "vetrina" | "landing" | "ecommerce" | "crm" | "automazione";
type Complexity = "base" | "standard" | "premium";

const TYPES: { key: TypeKey; label: string; base: number; minPages: number; maxPages: number; defaultPages: number; sub: string }[] = [
  { key: "vetrina",      label: "Sito Vetrina",      base: 800,  minPages: 3,  maxPages: 10, defaultPages: 5,  sub: "Presenza istituzionale" },
  { key: "landing",      label: "Landing Page",      base: 600,  minPages: 1,  maxPages: 3,  defaultPages: 1,  sub: "Una pagina, un obiettivo" },
  { key: "ecommerce",    label: "E-commerce Light",  base: 1500, minPages: 4,  maxPages: 12, defaultPages: 6,  sub: "Vendita diretta" },
  { key: "crm",          label: "CRM Su Misura",     base: 2200, minPages: 5,  maxPages: 15, defaultPages: 8,  sub: "Strumento interno" },
  { key: "automazione",  label: "Automazione AI",    base: 700,  minPages: 1,  maxPages: 6,  defaultPages: 2,  sub: "Workflow ricorrenti" },
];

const COMPLEXITIES: { key: Complexity; label: string; mult: number; time: [number, number]; desc: string }[] = [
  { key: "base",     label: "Base",     mult: 1.0, time: [5, 7],   desc: "Solidità, niente fronzoli." },
  { key: "standard", label: "Standard", mult: 1.4, time: [8, 12],  desc: "Su misura, due round revisioni." },
  { key: "premium",  label: "Premium",  mult: 2.0, time: [14, 21], desc: "Design custom, revisioni illimitate." },
];

function formatPrice(n: number) {
  return n.toLocaleString("it-IT");
}

function Configurator() {
  const [type, setType] = useState<TypeKey>("vetrina");
  const [pages, setPages] = useState(5);
  const [complexity, setComplexity] = useState<Complexity>("standard");

  const currentType = useMemo(() => TYPES.find(t => t.key === type)!, [type]);
  const currentComplexity = useMemo(() => COMPLEXITIES.find(c => c.key === complexity)!, [complexity]);

  // Clamp pages when type changes
  const clampedPages = Math.max(currentType.minPages, Math.min(currentType.maxPages, pages));

  const subtotal = useMemo(() => {
    const extraPages = Math.max(0, clampedPages - currentType.minPages);
    const raw = (currentType.base + extraPages * 150) * currentComplexity.mult;
    return Math.round(raw / 100) * 100;
  }, [currentType, clampedPages, currentComplexity]);

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0 border border-obsidian/10 bg-ivory shadow-atelier">

      {/* ── Form ── */}
      <div className="p-6 lg:p-10 border-r-0 lg:border-r border-obsidian/10">

        {/* Type */}
        <div className="mb-9">
          <label className="block text-obsidian/40 mb-4" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
            1 · TIPO DI PROGETTO
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => {
              const isOn = type === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => { setType(t.key); setPages(t.defaultPages); }}
                  className={[
                    "text-left p-3 lg:p-4 border transition-all duration-400 press group",
                    isOn
                      ? "bg-obsidian text-ivory border-obsidian"
                      : "bg-transparent text-obsidian border-obsidian/15 hover:border-obsidian/40",
                  ].join(" ")}
                  style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                >
                  <span
                    className="block"
                    style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "-0.01em" }}
                  >
                    {t.label}
                  </span>
                  <span
                    className={isOn ? "text-ivory/45" : "text-obsidian/35"}
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.75rem", lineHeight: 1.3 }}
                  >
                    {t.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pages */}
        <div className="mb-9">
          <div className="flex items-baseline justify-between mb-4">
            <label htmlFor="pages-slider" className="text-obsidian/40" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
              2 · PAGINE / SEZIONI
            </label>
            <span
              className="text-obsidian tabular-nums"
              style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.02em" }}
            >
              {clampedPages}
            </span>
          </div>
          <input
            id="pages-slider"
            type="range"
            min={currentType.minPages}
            max={currentType.maxPages}
            value={clampedPages}
            onChange={e => setPages(parseInt(e.target.value, 10))}
            className="w-full atelier-slider"
            style={{
              background: `linear-gradient(to right, #E63B2E ${((clampedPages - currentType.minPages) / Math.max(1, (currentType.maxPages - currentType.minPages))) * 100}%, rgba(26,20,20,0.15) ${((clampedPages - currentType.minPages) / Math.max(1, (currentType.maxPages - currentType.minPages))) * 100}%)`,
            }}
          />
          <div className="flex items-center justify-between mt-2 text-obsidian/30" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
            <span>{currentType.minPages} MIN</span>
            <span>{currentType.maxPages} MAX</span>
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-obsidian/40 mb-4" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
            3 · LIVELLO DI CURA
          </label>
          <div className="space-y-2">
            {COMPLEXITIES.map(c => {
              const isOn = complexity === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setComplexity(c.key)}
                  className={[
                    "w-full text-left flex items-center justify-between gap-4 p-4 border transition-all duration-400 press",
                    isOn
                      ? "bg-rosewood/8 border-rosewood text-obsidian"
                      : "bg-transparent border-obsidian/15 hover:border-obsidian/40",
                  ].join(" ")}
                  style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-300"
                      style={{
                        borderColor: isOn ? "#E63B2E" : "rgba(26,20,20,0.20)",
                        background:  isOn ? "#E63B2E" : "transparent",
                        boxShadow:   isOn ? "inset 0 0 0 2px #F4EFE6" : "none",
                      }}
                      aria-hidden
                    />
                    <div>
                      <span
                        className="block"
                        style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}
                      >
                        {c.label}
                      </span>
                      <span
                        className="block text-obsidian/45 mt-0.5"
                        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.3 }}
                      >
                        {c.desc}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-obsidian/35 shrink-0 tabular-nums"
                    style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                  >
                    {c.time[0]}–{c.time[1]} GG
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Output ── */}
      <div className="p-6 lg:p-10 bg-obsidian text-ivory relative overflow-hidden">
        <div className="grain-soft" aria-hidden />
        <div className="relative h-full flex flex-col">

          {/* Top meta */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-ivory/60 flex items-center gap-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
              <span className="live-dot" />
              STIMA · LIVE
            </span>
            <span className="text-ivory/30" style={{ ...labelStyle, fontSize: "0.5rem" }}>
              N° {Math.floor(Math.random() * 9000) + 1000}
            </span>
          </div>

          {/* Configuration recap */}
          <div className="space-y-3 mb-8 pb-8 border-b border-ivory/12">
            {[
              { k: "Progetto",  v: currentType.label },
              { k: "Pagine",    v: `${clampedPages}` },
              { k: "Cura",      v: currentComplexity.label },
              { k: "Consegna",  v: `${currentComplexity.time[0]}–${currentComplexity.time[1]} giorni` },
            ].map(row => (
              <div key={row.k} className="grid grid-cols-[96px_1fr] gap-3 items-baseline">
                <dt className="text-ivory/35" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                  {row.k}
                </dt>
                <dd
                  className="text-ivory"
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", fontWeight: 500 }}
                >
                  {row.v}
                </dd>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-ivory/40 mb-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
              INVESTIMENTO INDICATIVO
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="text-ivory tabular-nums"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(3.5rem, 7vw, 5.5rem)", lineHeight: 1, letterSpacing: "-0.045em" }}
              >
                <AnimatedNumber value={subtotal} />
              </span>
              <span
                className="text-rosewood"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "2rem", lineHeight: 1 }}
              >
                €
              </span>
            </div>
            <p
              className="text-ivory/45 mt-3"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.4 }}
            >
              IVA esclusa. 50% all&apos;avvio, 50% al lancio.
              Preventivo definitivo dopo il brief.
            </p>
          </div>

          {/* CTA */}
          <a
            href="#contatti"
            className="mt-8 relative flex items-center justify-center gap-2.5 bg-rosewood text-ivory overflow-hidden group press"
            style={{ ...labelStyle, padding: "1.0625rem 1.25rem" }}
          >
            <span
              className="absolute inset-0 bg-ivory translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
              aria-hidden
            />
            <span className="relative flex items-center gap-2 group-hover:text-obsidian transition-colors duration-150">
              Richiedi preventivo
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* Animated number — counts up to target */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    let raf = 0;
    const start = fromRef.current;
    const delta = value - start;
    if (delta === 0) return;
    const dur = 420;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(start + delta * eased);
      setDisplay(next);
      fromRef.current = next;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{formatPrice(display)}</>;
}

/* ─── Standard Packages ─────────────────────────────────── */

const PLANS = [
  {
    tier: "TIER 01",
    name: "Basic",
    min: "800",
    max: "1.200",
    time: "7 giorni",
    desc: "Per chi parte da zero e ha bisogno di una presenza digitale credibile, subito.",
    features: [
      "1 pagina · one-pager",
      "Template adattato al brand",
      "Form contatto base",
      "SEO on-page",
      "1 round di revisione",
    ],
    cta: "Inizia da Basic",
    featured: false,
  },
  {
    tier: "TIER 02",
    badge: "PIÙ SCELTO",
    name: "Pro",
    min: "1.500",
    max: "2.200",
    time: "10–14 giorni",
    desc: "L'equilibrio giusto tra qualità, funzionalità e velocità. La scelta più richiesta.",
    features: [
      "5–7 pagine custom",
      "Design su brief",
      "Copy AI + revisione",
      "Form + Google Business",
      "2 round di revisione",
    ],
    cta: "Prenota una call",
    featured: true,
  },
  {
    tier: "TIER 03",
    name: "Premium",
    min: "2.500",
    max: "3.800",
    time: "3–4 settimane",
    desc: "Design su misura, copy professionale, revisioni illimitate. Soluzione completa.",
    features: [
      "8–12 pagine + blog",
      "Design 100% custom",
      "Copy professionale",
      "Multi-form + CRM",
      "Revisioni illimitate",
    ],
    cta: "Parliamone",
    featured: false,
  },
];

function StandardPackages() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 border border-obsidian/10 bg-ivory">
      {PLANS.map((plan, i) => (
        <motion.div
          key={plan.name}
          className={[
            "relative flex flex-col p-7 lg:p-9 border-r border-b lg:border-b-0 border-obsidian/10 last:border-r-0 group",
            plan.featured ? "bg-obsidian text-ivory" : "bg-ivory text-obsidian",
          ].join(" ")}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: i * 0.1 }}
          style={plan.featured ? { boxShadow: "0 0 0 1px rgba(230,59,46,0.35), 0 24px 60px -16px rgba(26,20,20,0.18)" } : undefined}
        >
          {plan.featured && plan.badge && (
            <div
              className="absolute -top-px left-1/2 -translate-x-1/2 bg-rosewood px-4 py-1 flex items-center gap-1.5"
              style={{ ...labelStyle, fontSize: "0.5rem", color: "#F4EFE6", letterSpacing: "0.18em", whiteSpace: "nowrap" }}
            >
              <span className="w-1 h-1 bg-ivory rounded-full" />
              {plan.badge}
            </div>
          )}

          {/* Header */}
          <div className="flex items-baseline justify-between mb-5">
            <span style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em", color: plan.featured ? "#E63B2E" : "rgba(26,20,20,0.30)" }}>
              {plan.tier}
            </span>
            <span style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em", color: plan.featured ? "rgba(244,239,230,0.35)" : "rgba(26,20,20,0.30)" }}>
              {plan.time}
            </span>
          </div>

          <h3
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "2.75rem",
              lineHeight:    1,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color:         plan.featured ? "#F4EFE6" : "#1A1414",
              marginBottom:  "0.5rem",
            }}
          >
            {plan.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-6">
            <span
              className="tabular-nums"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize:   "clamp(3rem, 5vw, 4.25rem)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color:      plan.featured ? "#F4EFE6" : "#1A1414",
              }}
            >
              {plan.min}
            </span>
            <span style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.5rem", color: "#E63B2E" }}>€</span>
            <span
              className="ml-2 tabular-nums"
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize:   "0.875rem",
                color:      plan.featured ? "rgba(244,239,230,0.35)" : "rgba(26,20,20,0.32)",
              }}
            >
              — {plan.max}€
            </span>
          </div>

          {/* Desc */}
          <p
            className="mb-7"
            style={{
              fontFamily: "var(--db-archivo)",
              fontSize:   "0.875rem",
              lineHeight: 1.6,
              color:      plan.featured ? "rgba(244,239,230,0.55)" : "rgba(26,20,20,0.55)",
            }}
          >
            {plan.desc}
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-9 flex-1">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <span
                  className="mt-[7px] shrink-0"
                  style={{ width: "5px", height: "5px", background: "#E63B2E" }}
                  aria-hidden
                />
                <span
                  style={{
                    fontFamily: "var(--db-archivo)",
                    fontSize:   "0.8125rem",
                    lineHeight: 1.55,
                    color:      plan.featured ? "rgba(244,239,230,0.70)" : "rgba(26,20,20,0.68)",
                  }}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="#contatti"
            className={[
              "relative flex items-center justify-center gap-2 overflow-hidden group/cta press",
              plan.featured
                ? "bg-rosewood text-ivory"
                : "border border-obsidian/20 text-obsidian hover:border-obsidian/40",
            ].join(" ")}
            style={{
              ...labelStyle,
              padding: "1.0625rem 1.25rem",
            }}
          >
            <span
              className={[
                "absolute inset-0 translate-y-full group-hover/cta:translate-y-0 transition-transform duration-500",
                plan.featured ? "bg-ivory" : "bg-obsidian",
              ].join(" ")}
              style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
              aria-hidden
            />
            <span
              className={[
                "relative flex items-center gap-2 transition-colors duration-150",
                plan.featured ? "group-hover/cta:text-obsidian" : "group-hover/cta:text-ivory",
              ].join(" ")}
            >
              {plan.cta}
              <span className="group-hover/cta:translate-x-1 transition-transform duration-300">→</span>
            </span>
          </a>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────── */

export default function Pricing() {
  const [tab, setTab] = useState<"config" | "pack">("config");

  return (
    <section id="prezzi" className="relative bg-ivory text-obsidian overflow-hidden">
      <div className="section-divider" />

      {/* Header */}
      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 pt-24 pb-12 lg:pt-36 lg:pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-end">

          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-rosewood" />
              <span className="text-rosewood" style={labelStyle}>05 · PREZZI</span>
            </div>
            <h2
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
              Listino<br />
              <span className="text-obsidian/40">trasparente.</span>
            </h2>
          </motion.div>

          <motion.div
            className="lg:col-span-5 flex flex-col gap-5 lg:pl-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
          >
            <p
              className="text-obsidian/65"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle:  "italic",
                fontSize:   "clamp(1.125rem, 1.8vw, 1.5rem)",
                lineHeight: 1.35,
              }}
            >
              Niente preventivi a sorpresa. Configuratore in tempo
              reale, o tre pacchetti su misura.
            </p>
            <p
              className="text-obsidian/45"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.7 }}
            >
              Tutti i prezzi includono revisioni, deploy su Vercel
              e supporto post-lancio. Pagamento 50%/50%.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12 mb-6 lg:mb-8">
        <div role="tablist" className="inline-flex border border-obsidian/15 p-1 bg-ivory">
          {[
            { k: "config" as const, label: "Configuratore", hint: "live" },
            { k: "pack"   as const, label: "Pacchetti",     hint: "fissi" },
          ].map(t => {
            const isOn = tab === t.k;
            return (
              <button
                key={t.k}
                role="tab"
                aria-selected={isOn}
                onClick={() => setTab(t.k)}
                className="relative px-5 py-2.5 transition-colors duration-300 press"
                style={{ ...labelStyle, color: isOn ? "#F4EFE6" : "rgba(26,20,20,0.55)" }}
              >
                {isOn && (
                  <motion.span
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-obsidian"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {t.label}
                  <span className={isOn ? "text-ivory/45" : "text-obsidian/25"} style={{ fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                    {t.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 pb-16 lg:pb-24">
        <AnimatePresence mode="wait">
          {tab === "config" ? (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              <Configurator />
            </motion.div>
          ) : (
            <motion.div
              key="pack"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              <StandardPackages />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Note */}
      <div className="mx-auto max-w-[1480px] px-6 lg:px-12 pb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p
          className="text-obsidian/30"
          style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
        >
          * TUTTI I PREZZI IVA ESCLUSA · VALIDITÀ 30 GIORNI
        </p>
        <a
          href="#contatti"
          className="inline-flex items-center gap-1.5 text-obsidian/40 hover:text-rosewood transition-colors duration-300 link-underline"
          style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}
        >
          ESIGENZE PARTICOLARI · PARLIAMONE
          <span>→</span>
        </a>
      </div>

      <style>{`
        .atelier-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #E63B2E var(--p, 50%), rgba(26,20,20,0.15) var(--p, 50%));
          outline: none;
        }
        .atelier-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1A1414;
          border: 3px solid #F4EFE6;
          box-shadow: 0 0 0 1px rgba(26,20,20,0.20), 0 4px 12px rgba(26,20,20,0.18);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.2,0.8,0.2,1);
        }
        .atelier-slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }
        .atelier-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1A1414;
          border: 3px solid #F4EFE6;
          box-shadow: 0 0 0 1px rgba(26,20,20,0.20), 0 4px 12px rgba(26,20,20,0.18);
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
