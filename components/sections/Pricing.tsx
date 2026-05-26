"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const PLANS = [
  {
    tier: "TIER 01",
    name: "Basic",
    min: "800",
    max: "1.000",
    time: "7 giorni",
    hours: "4–6 ore",
    desc: "Per chi parte da zero e ha bisogno di una presenza digitale professionale, subito.",
    features: [
      "1 pagina (one-pager)",
      "Template adattato al brand",
      "Form contatto base",
      "SEO on-page",
      "1 round di revisione",
    ],
    cta: "INIZIA DA BASIC",
    dark: false,
    featured: false,
  },
  {
    tier: "TIER 02",
    badge: "PIÙ SCELTO",
    name: "Pro",
    min: "1.500",
    max: "2.000",
    time: "10–14 giorni",
    hours: "8–12 ore",
    desc: "Il giusto equilibrio tra qualità, funzionalità e velocità di consegna. La scelta più popolare.",
    features: [
      "5–7 pagine",
      "Template + custom",
      "Copy AI-assistito",
      "Form avanzato + GMB",
      "2 round di revisione",
    ],
    cta: "PRENOTA UNA CALL",
    dark: true,
    featured: true,
  },
  {
    tier: "TIER 03",
    name: "Premium",
    min: "2.500",
    max: "3.500",
    time: "3–4 settimane",
    hours: "16–25 ore",
    desc: "Design custom, copy professionale, revisioni illimitate. Soluzione completa su misura.",
    features: [
      "8–12 pagine + blog",
      "Design su misura",
      "Copy professionale",
      "Multi-form + CRM",
      "Revisioni illimitate",
    ],
    cta: "PARLIAMONE",
    dark: false,
    featured: false,
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Pricing() {
  return (
    <section id="prezzi" className="bg-ivory">
      <div className="section-divider" />

      {/* Header */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease }}
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
                fontSize:      "clamp(2.25rem, 5.5vw, 5rem)",
                lineHeight:    0.93,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Listino chiaro.<br />Niente sorprese.
            </h2>
          </motion.div>
          <motion.p
            className="text-obsidian/45 max-w-md lg:ml-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Ogni pacchetto include revisioni, supporto post-lancio e deploy su
            Vercel. Pagamento 50% all&apos;avvio, 50% al lancio.
          </motion.p>
        </div>
      </div>

      {/* Plans */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 border-t border-obsidian/10"
        style={{ borderLeft: "1px solid rgba(26,20,20,0.10)" }}
      >
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={[
              "relative flex flex-col p-8 lg:p-10 border-r border-b border-obsidian/10 group",
              plan.featured ? "lg:-mt-px lg:-mb-px" : "",
            ].join(" ")}
            style={{
              backgroundColor: plan.dark ? "#1A1414" : "transparent",
              ...(plan.featured ? { boxShadow: "0 0 0 1px rgba(230,59,46,0.3), 0 24px 48px rgba(26,20,20,0.15)" } : {}),
              zIndex: plan.featured ? 1 : 0,
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.65, ease, delay: i * 0.1 }}
          >
            {/* Featured badge */}
            {plan.badge && (
              <div
                className="absolute -top-px left-1/2 -translate-x-1/2 bg-rosewood px-4 py-1"
                style={{ ...labelStyle, fontSize: "0.5rem", color: "#F4EFE6", letterSpacing: "0.14em", whiteSpace: "nowrap" }}
              >
                ◆ {plan.badge}
              </div>
            )}

            {/* Hover overlay for light cards */}
            {!plan.dark && (
              <div
                className="absolute inset-0 bg-ash/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden
              />
            )}

            {/* Tier label */}
            <p
              className="relative"
              style={{
                ...labelStyle,
                fontSize:     "0.5rem",
                letterSpacing: "0.14em",
                color:         plan.dark ? "#E63B2E" : "rgba(26,20,20,0.25)",
                marginBottom:  "1.5rem",
              }}
            >
              {plan.tier}
            </p>

            {/* Name */}
            <h3
              className="relative"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "2.5rem",
                lineHeight:    1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color:         plan.dark ? "#F4EFE6" : "#1A1414",
                marginBottom:  "0.5rem",
              }}
            >
              {plan.name}
            </h3>

            {/* Price */}
            <div className="relative flex items-baseline gap-1 mb-1">
              <span
                style={{
                  fontFamily: "var(--db-archivo)",
                  fontWeight: 900,
                  fontSize:   "clamp(3rem, 5vw, 4.5rem)",
                  lineHeight: 1,
                  color:      plan.dark ? "#F4EFE6" : "#1A1414",
                }}
              >
                {plan.min}
              </span>
              <span style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.5rem", color: "#E63B2E" }}>€</span>
              <span
                style={{
                  fontFamily: "var(--db-archivo)",
                  fontSize:   "0.875rem",
                  color:      plan.dark ? "rgba(244,239,230,0.30)" : "rgba(26,20,20,0.28)",
                  marginLeft: "0.25rem",
                }}
              >
                — {plan.max}€
              </span>
            </div>

            {/* Time */}
            <div
              className="relative flex items-center gap-2 mb-6"
              style={{ color: plan.dark ? "rgba(244,239,230,0.28)" : "rgba(26,20,20,0.28)" }}
            >
              <span style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.08em" }}>
                {plan.time}
              </span>
              <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor", display: "block" }} />
              <span style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.08em" }}>
                {plan.hours}
              </span>
            </div>

            {/* Desc */}
            <p
              className="relative mb-8 flex-1"
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize:   "0.875rem",
                lineHeight: 1.65,
                color:      plan.dark ? "rgba(244,239,230,0.45)" : "rgba(26,20,20,0.48)",
              }}
            >
              {plan.desc}
            </p>

            {/* Features */}
            <ul className="relative space-y-3 mb-10">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    className="mt-[5px] shrink-0 text-rosewood"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.45rem", lineHeight: 1 }}
                    aria-hidden
                  >
                    ◆
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--db-archivo)",
                      fontSize:   "0.8125rem",
                      lineHeight: 1.5,
                      color:      plan.dark ? "rgba(244,239,230,0.60)" : "rgba(26,20,20,0.62)",
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
                "relative flex items-center justify-center gap-2 overflow-hidden group/cta",
                plan.dark
                  ? "bg-rosewood text-ivory"
                  : "border border-obsidian/20 text-obsidian hover:border-obsidian/40",
              ].join(" ")}
              style={{
                ...labelStyle,
                letterSpacing: "0.08em",
                padding: "1rem",
              }}
            >
              <span
                className={[
                  "absolute inset-0 translate-y-full group-hover/cta:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  plan.dark ? "bg-ivory" : "bg-obsidian",
                ].join(" ")}
                aria-hidden
              />
              <span
                className={[
                  "relative flex items-center gap-2 transition-colors duration-100",
                  plan.dark ? "group-hover/cta:text-obsidian" : "group-hover/cta:text-ivory",
                ].join(" ")}
              >
                {plan.cta}
                <span className="group-hover/cta:translate-x-0.5 transition-transform duration-200">→</span>
              </span>
            </a>
          </motion.div>
        ))}
      </div>

      {/* Note */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p
          className="text-obsidian/20"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          * TUTTI I PREZZI IVA ESCLUSA
        </p>
        <a
          href="#contatti"
          className="inline-flex items-center gap-1.5 text-obsidian/28 hover:text-rosewood transition-colors duration-200 group/link"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
        >
          ESIGENZE PARTICOLARI? PARLIAMONE
          <span className="group-hover/link:translate-x-0.5 transition-transform duration-200">→</span>
        </a>
      </div>

      <div className="h-8" />
    </section>
  );
}
