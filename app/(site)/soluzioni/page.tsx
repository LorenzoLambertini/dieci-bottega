import Link from "next/link";
import { CATEGORIES, getServicesByCategory, priceLabel, type ServiceCategory } from "@/lib/services";

export const metadata = {
  title: "Soluzioni · Dieci Bottega",
  description: "Le nostre macro-aree di lavoro: Siti Web, CRM & Dati, Automazioni AI, Marketing, Abbonamenti, Extra.",
};

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const ORDER: ServiceCategory[] = ["siti", "crm", "automazioni", "marketing", "abbonamenti", "extra"];

export default function SoluzioniPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory pt-28 pb-10 lg:pt-36 lg:pb-16 relative overflow-hidden">
        <div className="grain-soft" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-rosewood" />
            <span className="text-rosewood" style={labelStyle}>SOLUZIONI · 6 AREE</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <h1
              className="lg:col-span-7 text-obsidian"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2.75rem, 7vw, 6rem)",
                lineHeight:    0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              Sei aree.<br />
              <span className="text-obsidian/40">Una bottega.</span>
            </h1>
            <p
              className="lg:col-span-5 lg:pl-8 text-obsidian/65"
              style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)", lineHeight: 1.35 }}
            >
              Quasi sempre, un progetto ne tocca più di una.
              Esplora le macro-aree, poi entra nei dettagli sui servizi.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-ivory pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-12 space-y-4">
          {ORDER.map((catKey, i) => {
            const services = getServicesByCategory(catKey);
            const meta = CATEGORIES[catKey];
            return (
              <div
                key={catKey}
                className="border border-obsidian/10 bg-ivory hover:border-obsidian/25 transition-colors duration-400 group overflow-hidden"
              >
                <div className="grid lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-12 items-start p-7 lg:p-10">
                  {/* Index */}
                  <span
                    className="text-obsidian/25 shrink-0"
                    style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(1.5rem, 2vw, 2rem)", letterSpacing: "-0.02em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Title + blurb */}
                  <div>
                    <h2
                      className="text-obsidian mb-3"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.75rem, 3.5vw, 2.75rem)",
                        lineHeight:    1,
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {meta.label}
                    </h2>
                    <p className="text-obsidian/55 max-w-xl mb-6" style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.6 }}>
                      {meta.blurb}
                    </p>
                    <ul className="space-y-2 mt-4">
                      {services.map(s => (
                        <li key={s.slug}>
                          <Link
                            href={`/servizi/${s.slug}`}
                            className="flex items-baseline justify-between gap-3 py-2 border-b border-obsidian/8 hover:border-rosewood/40 group/row transition-colors duration-200"
                          >
                            <div className="flex items-baseline gap-3">
                              <span className="text-obsidian group-hover/row:text-rosewood transition-colors duration-200" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1rem" }}>
                                {s.title}
                              </span>
                              <span className="hidden sm:inline text-obsidian/40" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}>
                                — {s.shortDesc}
                              </span>
                            </div>
                            <span className="text-obsidian/55 shrink-0" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.875rem" }}>
                              {priceLabel(s)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA right */}
                  <div className="shrink-0 lg:text-right">
                    <p className="text-obsidian/35 mb-2" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                      {services.length} SERVIZI
                    </p>
                    <Link
                      href={`/servizi#${catKey}`}
                      className="text-rosewood hover:text-obsidian transition-colors duration-200 inline-flex items-center gap-1.5"
                      style={{ ...labelStyle, fontSize: "0.625rem" }}
                    >
                      VEDI TUTTI →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-[1480px] px-6 lg:px-12 mt-12 text-center">
          <Link
            href="/inizia-progetto"
            className="relative inline-flex items-center gap-2 bg-obsidian text-ivory overflow-hidden group press"
            style={{ ...labelStyle, padding: "1rem 1.75rem" }}
          >
            <span className="absolute inset-0 bg-rosewood translate-y-full group-hover:translate-y-0 transition-transform duration-400" style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }} aria-hidden />
            <span className="relative flex items-center gap-2">
              <span className="live-dot" />
              <span>Inizia un progetto</span>
              <span>→</span>
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
