const PROJECTS = [
  {
    n: "01",
    client: "Trattoria Da Mario",
    cat: "RISTORAZIONE · BOLOGNA",
    tier: "TIER 02 · PRO",
    desc: "Sito vetrina con prenotazione diretta, menu digitale aggiornabile e Google My Business integrato. Da zero a online in 9 giorni.",
    results: ["+187% prenotazioni online", "1ª pagina Google Maps", "9 giorni di consegna"],
    bg: "#F2B8A2", /* peach */
    accent: "#E63B2E",
  },
  {
    n: "02",
    client: "Studio Legale Ferretti",
    cat: "PROFESSIONALE · BOLOGNA",
    tier: "TIER 02 · PRO",
    desc: "Sito premium con lead generation qualificata, blog giuridico e SEO locale ottimizzata. Consegnato in 11 giorni.",
    results: ["+2× lead qualificati al mese", "1ª pagina Google", "11 giorni di consegna"],
    bg: "#E8E2D6", /* ash */
    accent: "#1A1414",
  },
  {
    n: "03",
    client: "Immobiliare Adriatica",
    cat: "IMMOBILIARE · RIMINI",
    tier: "TIER 03 · PREMIUM",
    desc: "Landing page + CRM su misura con listings dinamici, filtri avanzati e pannello admin per gli agenti. Stack: Next.js + Supabase.",
    results: ["+2× traffico organico", "450+ immobili gestiti", "12 giorni di consegna"],
    bg: "#F4EFE6", /* ivory */
    accent: "#E63B2E",
  },
];

export default function Portfolio() {
  return (
    <section id="lavori" className="bg-ivory">
      {/* ── Header ── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-rosewood" />
              <span
                className="text-rosewood"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
              >
                02 · LAVORI
              </span>
            </div>
            <h2
              className="text-obsidian"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(2.25rem, 5.5vw, 5rem)",
                lineHeight: 0.93,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              I nostri<br />lavori.
            </h2>
          </div>
          <p
            className="text-obsidian/50 max-w-md lg:ml-auto"
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Ogni progetto nasce da un brief chiaro. Il design segue
            la strategia, mai il contrario.
          </p>
        </div>
      </div>

      {/* ── Projects list ── */}
      <div className="border-t border-obsidian/10">
        {PROJECTS.map((p) => (
          <div
            key={p.n}
            className="border-b border-obsidian/10 group"
            style={{ backgroundColor: p.bg, transition: "filter 0.3s" }}
          >
            <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-10 lg:py-14 grid lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-16 items-start">

              {/* Number */}
              <span
                className="text-obsidian/15 hidden lg:block"
                style={{
                  fontFamily: "var(--db-archivo)",
                  fontWeight: 900,
                  fontSize: "5rem",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                }}
              >
                {p.n}
              </span>

              {/* Content */}
              <div>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span
                    className="text-obsidian/35"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
                  >
                    {p.cat}
                  </span>
                  <span
                    className="text-obsidian/35"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
                  >
                    {p.tier}
                  </span>
                </div>
                <h3
                  className="text-obsidian mb-4"
                  style={{
                    fontFamily: "var(--db-archivo)",
                    fontWeight: 900,
                    fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {p.client}
                </h3>
                <p
                  className="text-obsidian/60 max-w-lg"
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
                >
                  {p.desc}
                </p>
              </div>

              {/* Results */}
              <div className="flex flex-col gap-4">
                <ul className="space-y-2.5 lg:min-w-[200px]">
                  {p.results.map(r => (
                    <li key={r} className="flex items-center gap-2.5">
                      <span className="block w-1.5 h-1.5 shrink-0" style={{ backgroundColor: p.accent }} />
                      <span
                        className="text-obsidian"
                        style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.875rem" }}
                      >
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contatti"
                  className="text-obsidian/30 hover:text-rosewood mt-2"
                  style={{
                    fontFamily: "var(--db-jetbrains)",
                    fontSize: "0.625rem",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    transition: "color 0.2s",
                  }}
                >
                  PROGETTO SIMILE →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-6">
        <p
          className="text-obsidian/20"
          style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          * DATI SIMULATI A SCOPO ILLUSTRATIVO — CLIENTI REALI IN ARRIVO
        </p>
      </div>
    </section>
  );
}
