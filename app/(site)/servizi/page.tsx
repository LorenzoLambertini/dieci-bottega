import ServiceCatalog from "@/components/ServiceCatalog";

export const metadata = {
  title: "Servizi · Dieci Bottega",
  description: "Catalogo completo dei servizi: siti web, CRM, automazioni AI, marketing, abbonamenti. Prezzi trasparenti, consegne rapide.",
};

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default function ServiziPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-ivory pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden">
        <div className="grain-soft" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-8 h-px bg-rosewood" />
                <span className="text-rosewood" style={labelStyle}>CATALOGO · SERVIZI</span>
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
                Tutto<br />
                <span className="text-obsidian/40">in chiaro.</span>
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pl-8">
              <p
                className="text-obsidian/65"
                style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)", lineHeight: 1.35 }}
              >
                Prezzi pubblici, tempi reali, descrizioni complete.
                Aggiungi quello che ti serve al carrello — poi parliamo.
              </p>
              <p
                className="text-obsidian/45 mt-4"
                style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem", lineHeight: 1.65 }}
              >
                Tutti i prezzi IVA esclusa. Il carrello è una stima — il preventivo definitivo arriva dopo il brief.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceCatalog />
    </>
  );
}
