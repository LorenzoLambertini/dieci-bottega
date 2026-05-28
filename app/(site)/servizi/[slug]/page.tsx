import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getRelatedServices, SERVICES, CATEGORIES, priceLabel } from "@/lib/services";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) return { title: "Servizio non trovato" };
  return {
    title:       `${svc.title} · Dieci Bottega`,
    description: svc.shortDesc,
  };
}

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export default async function ServizioDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const svc = getServiceBySlug(slug);
  if (!svc) notFound();

  const related = getRelatedServices(slug);
  const unitSuffix = svc.unit === "mese" ? "/mese" : svc.unit === "anno" ? "/anno" : "";

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-ivory pt-24 lg:pt-28 pb-4">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-12 flex items-center gap-2 text-obsidian/40" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
          <Link href="/" className="hover:text-obsidian transition-colors">HOME</Link>
          <span>·</span>
          <Link href="/servizi" className="hover:text-obsidian transition-colors">SERVIZI</Link>
          <span>·</span>
          <span className="text-rosewood">{CATEGORIES[svc.category].label.toUpperCase()}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <section className="bg-ivory pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1480px] px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-start">

            {/* LEFT COLUMN */}
            <div>
              {svc.featured && (
                <div className="inline-flex items-center gap-2 bg-rosewood/10 border border-rosewood/30 px-3 py-1.5 mb-6">
                  <span className="live-dot" />
                  <span className="text-rosewood" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                    ◆ PIÙ SCELTO IN {CATEGORIES[svc.category].label.toUpperCase()}
                  </span>
                </div>
              )}

              <h1
                className="text-obsidian mb-5"
                style={{
                  fontFamily:    "var(--db-archivo)",
                  fontWeight:    900,
                  fontSize:      "clamp(2.5rem, 6vw, 4.5rem)",
                  lineHeight:    0.95,
                  letterSpacing: "-0.04em",
                  textTransform: "uppercase",
                }}
              >
                {svc.title}
              </h1>

              <p
                className="text-obsidian/70 mb-10 max-w-2xl"
                style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "clamp(1.125rem, 1.8vw, 1.375rem)", lineHeight: 1.4 }}
              >
                {svc.longDesc}
              </p>

              {/* Per chi */}
              <div className="mb-10 pb-10 border-b border-obsidian/10">
                <p className="text-rosewood mb-3" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                  PER CHI
                </p>
                <p
                  className="text-obsidian/75"
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "1.0625rem", lineHeight: 1.6 }}
                >
                  {svc.forWho}
                </p>
              </div>

              {/* Features */}
              <div className="mb-10 pb-10 border-b border-obsidian/10">
                <p className="text-rosewood mb-5" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                  COSA INCLUDE
                </p>
                <ul className="space-y-3">
                  {svc.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-[10px] shrink-0" style={{ width: "5px", height: "5px", background: "#E63B2E" }} aria-hidden />
                      <span className="text-obsidian/75" style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.6 }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="mb-10 pb-10 border-b border-obsidian/10">
                <p className="text-rosewood mb-5" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                  COSA RISOLVE
                </p>
                <ul className="space-y-3">
                  {svc.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-1 shrink-0 text-rosewood" aria-hidden>
                        <path d="M3.5 9L7.5 13L14.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-obsidian/75" style={{ fontFamily: "var(--db-archivo)", fontSize: "1rem", lineHeight: 1.55 }}>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use cases */}
              <div>
                <p className="text-rosewood mb-5" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
                  CASI D&apos;USO
                </p>
                <ul className="space-y-2.5">
                  {svc.useCases.map((u, i) => (
                    <li key={i} className="flex items-start gap-3 text-obsidian/65" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.5 }}>
                      <span className="text-rosewood mt-0.5">→</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN — summary box (sticky on desktop) */}
            <aside className="lg:sticky lg:top-24">
              <div className="bg-obsidian text-ivory shadow-atelier-lg overflow-hidden relative">
                <div className="grain-soft" aria-hidden />
                <div className="relative p-7 lg:p-8">
                  <p className="text-ivory/50 mb-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                    {CATEGORIES[svc.category].label.toUpperCase()}
                  </p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="text-ivory tabular-nums"
                      style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "clamp(3rem, 5vw, 4.25rem)", lineHeight: 1, letterSpacing: "-0.04em" }}
                    >
                      {priceLabel(svc).replace("€", "")}
                    </span>
                    <span style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.75rem", color: "#E63B2E" }}>€</span>
                  </div>
                  <p className="text-ivory/45" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}>
                    {svc.unit === "one-shot" ? "una tantum" : svc.unit === "mese" ? "al mese (IVA escl.)" : "all'anno (IVA escl.)"}{unitSuffix && ""}
                  </p>

                  <div className="my-6 pt-6 border-t border-ivory/12 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-ivory/40 mb-1" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>CONSEGNA</p>
                      <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1rem" }}>
                        {svc.deliveryDays === "su preventivo" || svc.deliveryDays === "su richiesta" ? svc.deliveryDays : `${svc.deliveryDays} giorni`}
                      </p>
                    </div>
                    <div>
                      <p className="text-ivory/40 mb-1" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>REVISIONI</p>
                      <p className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "1rem" }}>
                        2 incluse
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <AddToCartButton slug={svc.slug} variant="primary" />
                    <Link
                      href="/carrello"
                      className="block w-full text-center border border-ivory/20 hover:border-ivory/40 text-ivory/70 hover:text-ivory transition-all duration-300 py-3"
                      style={labelStyle}
                    >
                      Vai al carrello →
                    </Link>
                  </div>

                  <p className="text-ivory/30 mt-5 text-center" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                    NESSUN PAGAMENTO ONLINE · STIMA + BRIEF
                  </p>
                </div>
              </div>

              <p className="text-obsidian/35 mt-4 text-center" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.9375rem" }}>
                Aggiungi al carrello — non paghi nulla. Ti contattiamo per il brief.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-obsidian text-ivory py-16 lg:py-24 relative overflow-hidden">
          <div className="grain-soft" aria-hidden />
          <div className="relative mx-auto max-w-[1480px] px-6 lg:px-12">
            <p className="text-rosewood mb-3" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
              DI SOLITO AGGIUNTI INSIEME
            </p>
            <h2
              className="text-ivory mb-10"
              style={{
                fontFamily:    "var(--db-archivo)",
                fontWeight:    900,
                fontSize:      "clamp(2rem, 4vw, 3rem)",
                lineHeight:    1,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
              }}
            >
              Servizi correlati
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {related.map(rel => (
                <Link
                  key={rel.slug}
                  href={`/servizi/${rel.slug}`}
                  className="block border border-ivory/12 hover:border-ivory/30 hover:bg-ivory/[0.03] p-6 transition-all duration-400 group card-tactile"
                >
                  <p className="text-rosewood mb-2" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
                    {CATEGORIES[rel.category].label}
                  </p>
                  <h3 className="text-ivory group-hover:text-rosewood transition-colors duration-300 mb-2" style={{
                    fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.25rem", lineHeight: 1.1, letterSpacing: "-0.02em", textTransform: "uppercase",
                  }}>
                    {rel.title}
                  </h3>
                  <p className="text-ivory/55 mb-4" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                    {rel.shortDesc}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-ivory/10">
                    <span className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}>
                      {priceLabel(rel)}
                    </span>
                    <span className="text-ivory/40 group-hover:text-rosewood group-hover:translate-x-0.5 transition-all duration-300">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
