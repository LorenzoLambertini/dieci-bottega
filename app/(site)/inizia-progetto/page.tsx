import LeadForm from "@/components/LeadForm";

export const metadata = {
  title: "Inizia un progetto · Dieci Bottega",
  description: "Raccontaci il tuo progetto in 60 secondi. Ti risponderemo entro 24 ore lavorative con un piano d'azione.",
};

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function IniziaProgettoPage() {
  return (
    <section className="bg-ivory relative overflow-hidden">
      <div className="grain-soft" aria-hidden />

      <div className="relative mx-auto max-w-[920px] px-6 lg:px-12 pt-28 pb-16 lg:pt-36 lg:pb-24">

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-rosewood" />
            <span className="text-rosewood" style={labelStyle}>FUNNEL · IL TUO SITO GRATIS</span>
            <span className="block w-8 h-px bg-rosewood" />
          </div>
          <h1
            className="text-obsidian mb-5"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(2.5rem, 6vw, 5rem)",
              lineHeight:    0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            Raccontaci<br />
            <span className="text-obsidian/40">il tuo progetto.</span>
          </h1>
          <p
            className="text-obsidian/60 max-w-xl mx-auto"
            style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.125rem, 1.8vw, 1.375rem)", lineHeight: 1.4 }}
          >
            Compila il modulo in 60 secondi. Ti contattiamo entro 24 ore lavorative
            con un piano d&apos;azione, un preventivo personalizzato e una proposta di call.
          </p>
        </div>

        {/* 3-step explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14 lg:mb-20">
          {[
            { n: "01", t: "Compila", d: "5 sezioni guidate. 60 secondi. Nessun obbligo." },
            { n: "02", t: "Riceviamo", d: "Lead in CRM + email di conferma con 6 orari per la call." },
            { n: "03", t: "Parliamo", d: "Call di 30 min, gratis. Capiamo se siamo i giusti per te." },
          ].map(step => (
            <div key={step.n} className="border-l-2 border-rosewood pl-5 py-2">
              <p className="text-rosewood mb-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                {step.n}
              </p>
              <h3
                className="text-obsidian mb-2"
                style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "-0.015em" }}
              >
                {step.t}
              </h3>
              <p className="text-obsidian/50" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.55 }}>
                {step.d}
              </p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="border border-obsidian/10 bg-ivory shadow-atelier p-7 lg:p-12">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
