const STEPS = [
  {
    n: "01",
    title: "Brief",
    time: "Giorno 1–2",
    desc: "Una call di 45 minuti e un questionario strutturato. Capiamo il brand, gli obiettivi, il pubblico. Zero burocrazia, massima sostanza.",
    quote: "Ascoltiamo prima di costruire.",
  },
  {
    n: "02",
    title: "Design",
    time: "Giorno 3–5",
    desc: "Wireframe e mockup su Figma. Palette colori, tipografia, struttura delle pagine. AI-assistito, curato da noi. Due round di revisioni inclusi.",
    quote: "AI-assisted, curato da noi.",
  },
  {
    n: "03",
    title: "Sviluppo",
    time: "Giorno 6–12",
    desc: "Il design prende vita in codice pulito con Next.js. Stack moderno, performance elevate. Nessun compromesso sulla qualità.",
    quote: "Stack moderno. Performance elevate.",
  },
  {
    n: "04",
    title: "Deploy",
    time: "Giorno 13–14",
    desc: "Go-live su Vercel. SEO finale, test cross-device, analytics, consegna credenziali. Sei online, in tempi record.",
    quote: "Online. In tempi record.",
  },
];

export default function Process() {
  return (
    <section id="processo" className="bg-ivory">

      {/* ── Divider ── */}
      <div className="border-t border-obsidian/10" />

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
                03 · PROCESSO
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
              Da zero<br />a online.
            </h2>
          </div>
          <div className="flex items-end">
            <p
              className="text-obsidian/65 max-w-md lg:ml-auto"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle: "italic",
                fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
                lineHeight: 1.3,
              }}
            >
              In quattordici giorni. Un processo rodato, veloce e trasparente.
            </p>
          </div>
        </div>
      </div>

      {/* ── Steps ── */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-obsidian/10"
        style={{ borderLeft: "1px solid rgba(26,20,20,0.10)" }}
      >
        {STEPS.map(step => (
          <div
            key={step.n}
            className="p-8 lg:p-10 border-r border-b border-obsidian/10 flex flex-col gap-6 hover:bg-ash/50 group"
            style={{ transition: "background 0.3s" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-obsidian/20"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                {step.n}
              </span>
              <span
                className="text-obsidian/20"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                {step.time}
              </span>
            </div>

            <h3
              className="text-obsidian"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(2rem, 3vw, 2.75rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {step.title}
            </h3>

            <p
              className="text-obsidian/55 flex-1"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.65 }}
            >
              {step.desc}
            </p>

            <p
              className="text-obsidian/50 group-hover:text-obsidian/70"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle: "italic",
                fontSize: "1rem",
                lineHeight: 1.4,
                transition: "color 0.3s",
              }}
            >
              &ldquo;{step.quote}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* ── CTA strip ── */}
      <div
        className="border-t border-obsidian/10 mx-0"
        style={{ backgroundColor: "#E63B2E" }}
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h3
              className="text-ivory"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              Pronto a partire?
            </h3>
            <p
              className="text-ivory/70 mt-2"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.6 }}
            >
              Una call di 30 minuti. Senza impegno, senza preventivi gonfiati.
            </p>
          </div>
          <a
            href="#contatti"
            className="shrink-0 flex items-center justify-center gap-2 bg-ivory text-rosewood hover:bg-ash"
            style={{
              fontFamily: "var(--db-jetbrains)",
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "1rem 2rem",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            INIZIAMO IL PROGETTO →
          </a>
        </div>
      </div>

      <div className="h-16 lg:h-20" />
    </section>
  );
}
