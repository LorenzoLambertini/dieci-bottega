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
    cta: "INIZIA DA BASIC →",
    dark: false,
  },
  {
    tier: "TIER 02 · PIÙ SCELTO",
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
    cta: "PRENOTA UNA CALL →",
    dark: true,
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
    cta: "PARLIAMONE →",
    dark: false,
  },
];

export default function Pricing() {
  return (
    <section id="prezzi" className="bg-ivory">
      <div className="border-t border-obsidian/10" />

      {/* Header */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-rosewood" />
              <span
                className="text-rosewood"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
              >
                05 · PREZZI
              </span>
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
          </div>
          <p
            className="text-obsidian/50 max-w-md lg:ml-auto"
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Ogni pacchetto include revisioni, supporto post-lancio e deploy su
            Vercel. Pagamento 50% all&apos;avvio, 50% al lancio.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 border-t border-obsidian/10"
        style={{ borderLeft: "1px solid rgba(26,20,20,0.10)" }}
      >
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="flex flex-col p-8 lg:p-10 border-r border-b border-obsidian/10"
            style={{ backgroundColor: plan.dark ? "#1A1414" : "transparent" }}
          >
            {/* Tier label */}
            <p
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.5625rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: plan.dark ? "#E63B2E" : "rgba(26,20,20,0.30)",
                marginBottom:  "1.5rem",
              }}
            >
              {plan.tier}
            </p>

            {/* Name */}
            <h3
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
            <div className="flex items-baseline gap-1 mb-1">
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
                  fontFamily:  "var(--db-archivo)",
                  fontSize:    "0.875rem",
                  color:       plan.dark ? "rgba(244,239,230,0.35)" : "rgba(26,20,20,0.30)",
                  marginLeft:  "0.25rem",
                }}
              >
                — {plan.max}€
              </span>
            </div>

            {/* Time */}
            <div
              className="flex items-center gap-2 mb-6"
              style={{ color: plan.dark ? "rgba(244,239,230,0.30)" : "rgba(26,20,20,0.30)" }}
            >
              <span style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {plan.time}
              </span>
              <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "currentColor", display: "block" }} />
              <span style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {plan.hours}
              </span>
            </div>

            {/* Desc */}
            <p
              className="mb-8 flex-1"
              style={{
                fontFamily: "var(--db-archivo)",
                fontSize:   "0.875rem",
                lineHeight: 1.65,
                color:      plan.dark ? "rgba(244,239,230,0.50)" : "rgba(26,20,20,0.50)",
              }}
            >
              {plan.desc}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-10">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-[6px] block w-1.5 h-1.5 shrink-0 bg-rosewood" />
                  <span
                    style={{
                      fontFamily: "var(--db-archivo)",
                      fontSize:   "0.8125rem",
                      lineHeight: 1.5,
                      color:      plan.dark ? "rgba(244,239,230,0.65)" : "rgba(26,20,20,0.65)",
                    }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA — pure CSS hover, no JS */}
            <a
              href="#contatti"
              className={
                plan.dark
                  ? "flex items-center justify-center bg-rosewood text-ivory hover:bg-ivory hover:text-obsidian transition-colors duration-200"
                  : "flex items-center justify-center border border-obsidian/20 text-obsidian hover:bg-obsidian hover:text-ivory transition-colors duration-200"
              }
              style={{
                fontFamily:    "var(--db-jetbrains)",
                fontSize:      "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding:       "1rem",
              }}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p
          className="text-obsidian/25"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          * TUTTI I PREZZI IVA ESCLUSA
        </p>
        <a
          href="#contatti"
          className="text-obsidian/30 hover:text-rosewood transition-colors duration-200"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
        >
          ESIGENZE PARTICOLARI? PARLIAMONE →
        </a>
      </div>

      <div className="h-8" />
    </section>
  );
}
