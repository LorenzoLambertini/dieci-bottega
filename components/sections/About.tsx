const VALUES = [
  { n: "01", title: "Mestiere", body: "Non vendiamo \"soluzioni digitali\". Vendiamo lavoro fatto bene. Ogni font, ogni microcopy, ogni millisecondo è una scelta consapevole." },
  { n: "02", title: "Velocità", body: "Consegnare in 10 giorni è dire al cliente: il tuo tempo conta quanto il nostro. La velocità non è scorciatoia, è metodo." },
  { n: "03", title: "Onestà", body: "Prezzi pubblici, tempi reali, limiti chiari. Mai soprapromettere per chiudere. Meglio perdere un cliente che mentirgli." },
  { n: "04", title: "Prossimità", body: "Parliamo italiano, lavoriamo da Bologna, conosciamo le PMI. La distanza zero è il nostro vantaggio competitivo." },
  { n: "05", title: "Dettagli", body: "\"È tutto nei dettagli\" non è una tagline: è un protocollo. Spaziature, microcopy, performance, accessibilità. Tutto curato." },
];

export default function About() {
  return (
    <section id="bottega" style={{ backgroundColor: "#E63B2E" }}>

      {/* ── Header ── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-ivory/40" />
              <span
                className="text-ivory/50"
                style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
              >
                04 · BOTTEGA
              </span>
            </div>
            <h2
              className="text-ivory"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(2.25rem, 5.5vw, 5rem)",
                lineHeight: 0.93,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Nati da un<br />caffè a<br />Bologna.
            </h2>
          </div>

          <div className="flex flex-col gap-8 lg:ml-auto max-w-md">
            <p
              className="text-ivory/80"
              style={{
                fontFamily: "var(--db-cardo)",
                fontStyle: "italic",
                fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                lineHeight: 1.35,
              }}
            >
              &ldquo;Veloci, ma non frettolosi.
              <br />È tutto nei dettagli.&rdquo;
            </p>
            <p
              className="text-ivory/60"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
            >
              Dieci Bottega nasce dall&apos;incontro di due percorsi: chi sa fare
              design e codice (Lorenzo) e chi sa parlare con i clienti (Tommaso).
              Entrambi convinti che le PMI italiane meritino di meglio.
            </p>
          </div>
        </div>
      </div>

      {/* ── Values ── */}
      <div
        className="border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
        style={{
          borderColor: "rgba(244,239,230,0.15)",
          borderLeft: "1px solid rgba(244,239,230,0.15)",
        }}
      >
        {VALUES.map(v => (
          <div
            key={v.n}
            className="p-7 lg:p-8 border-r border-b flex flex-col gap-4 hover:bg-burgundy/40 group"
            style={{ borderColor: "rgba(244,239,230,0.15)", transition: "background 0.3s" }}
          >
            <span
              className="text-ivory/30"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              {v.n}
            </span>
            <h3
              className="text-ivory"
              style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}
            >
              {v.title}
            </h3>
            <p
              className="text-ivory/55 group-hover:text-ivory/70"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.65, transition: "color 0.3s" }}
            >
              {v.body}
            </p>
          </div>
        ))}
      </div>

      {/* ── Team ── */}
      <div
        className="grid md:grid-cols-2 border-t"
        style={{ borderColor: "rgba(244,239,230,0.15)" }}
      >
        {[
          {
            role: "CO-FOUNDER · DESIGN & WEB",
            firstName: "Lorenzo",
            lastName: "Lambertini",
            bio: "Sviluppa siti e design per PMI italiane dal 2024. Crede che ogni pixel debba guadagnarsi il proprio posto.",
            email: "lorenzo@diecibottega.it",
          },
          {
            role: "CO-FOUNDER · STRATEGY & SALES",
            firstName: "Tommaso",
            lastName: "Villa",
            bio: "Consulente commerciale per agenzie digitali. Trasforma un brief in un piano d'azione concreto.",
            email: "tommaso@diecibottega.it",
          },
        ].map(person => (
          <div
            key={person.firstName}
            className="p-8 lg:p-12 border-r border-b flex flex-col gap-5 hover:bg-burgundy/30 group"
            style={{ borderColor: "rgba(244,239,230,0.15)", transition: "background 0.3s" }}
          >
            <span
              className="text-ivory/35"
              style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              {person.role}
            </span>
            <h3
              className="text-ivory"
              style={{
                fontFamily: "var(--db-archivo)",
                fontWeight: 900,
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {person.firstName}<br />{person.lastName}
            </h3>
            <p
              className="text-ivory/55"
              style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9rem", lineHeight: 1.65, maxWidth: "26rem" }}
            >
              {person.bio}
            </p>
            <a
              href={`mailto:${person.email}`}
              className="text-ivory/30 hover:text-ivory group-hover:text-ivory/50 mt-auto inline-block"
              style={{
                fontFamily: "var(--db-jetbrains)",
                fontSize: "0.5625rem",
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                transition: "color 0.2s",
              }}
            >
              {person.email.toUpperCase()} →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
