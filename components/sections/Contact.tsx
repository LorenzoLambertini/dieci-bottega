"use client";

import { useState } from "react";

const BUDGET_OPTIONS = [
  "Seleziona un range…",
  "Fino a €1.000",
  "€1.000 – €2.000",
  "€2.000 – €4.000",
  "Oltre €4.000",
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.5625rem",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
};

export default function Contact() {
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    fd.get("name"),
          email:   fd.get("email"),
          company: fd.get("company") || undefined,
          budget:  fd.get("budget")  || undefined,
          message: fd.get("message"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Errore server");
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Errore server"
          ? err.message
          : "Qualcosa è andato storto. Scrivici direttamente a ciao@diecibottega.it"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contatti" className="bg-obsidian text-ivory">

      {/* Header */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-16 lg:pt-36 lg:pb-24">
        <div className="flex items-center gap-3 mb-8">
          <span className="block w-8 h-px bg-rosewood" />
          <span className="text-rosewood" style={labelStyle}>06 · CONTATTI</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-end mb-16">
          <h2
            className="text-ivory"
            style={{
              fontFamily:    "var(--db-archivo)",
              fontWeight:    900,
              fontSize:      "clamp(4rem, 12vw, 10rem)",
              lineHeight:    0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            Parlaci.
          </h2>
          <p
            className="text-ivory/50 max-w-md lg:ml-auto"
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Raccontaci il tuo progetto. Ti risponderemo entro 24 ore
            con un piano d&apos;azione. Prima call sempre gratuita, senza impegno.
          </p>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">

          {/* Left — info */}
          <div className="flex flex-col gap-6">
            <div className="border border-ivory/8">
              {[
                { label: "EMAIL",    value: "ciao@diecibottega.it",      href: "mailto:ciao@diecibottega.it" },
                { label: "WHATSAPP", value: "Scrivici direttamente",      href: "https://wa.me/393331234567"  },
                { label: "RISPOSTA", value: "Entro 24 ore lavorative",    href: null },
              ].map(row => (
                <div key={row.label} className="border-b border-ivory/8 last:border-b-0">
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.href.startsWith("http") ? "_blank" : undefined}
                      rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between px-6 py-5 hover:bg-ivory/5 group transition-colors duration-200"
                    >
                      <div>
                        <span className="block text-ivory/25 mb-1" style={labelStyle}>{row.label}</span>
                        <span className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.9375rem" }}>
                          {row.value}
                        </span>
                      </div>
                      <span className="text-ivory/20 group-hover:text-rosewood transition-colors duration-200" style={{ fontFamily: "var(--db-jetbrains)" }}>→</span>
                    </a>
                  ) : (
                    <div className="px-6 py-5">
                      <span className="block text-ivory/25 mb-1" style={labelStyle}>{row.label}</span>
                      <span className="text-ivory" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.9375rem" }}>
                        {row.value}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border border-ivory/8 p-6">
              <p className="text-ivory/50" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.55 }}>
                &ldquo;Se il progetto non è adatto a noi, te lo diciamo subito.
                Nessun obbligo. Solo una conversazione onesta.&rdquo;
              </p>
              <p className="text-ivory/20 mt-4" style={labelStyle}>
                — DIECI BOTTEGA · BOLOGNA
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="border border-ivory/8">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-24 px-8 gap-6 min-h-[400px]">
                <div className="w-12 h-12 bg-rosewood flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M4 10L8 14L16 6" stroke="#F4EFE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3
                    className="text-ivory"
                    style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.75rem", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}
                  >
                    Messaggio inviato!
                  </h3>
                  <p className="text-ivory/45" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    Abbiamo ricevuto il tuo messaggio.
                    <br />Ti risponderemo entro 24 ore lavorative.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 lg:p-10 flex flex-col gap-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="NOME *"  id="name"  name="name"  placeholder="Marco Rossi"      required />
                  <Field label="EMAIL *" id="email" name="email" type="email" placeholder="marco@azienda.it" required />
                </div>

                <Field label="AZIENDA" id="company" name="company" placeholder="Azienda Srl" />

                {/* Budget */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="budget" className="text-ivory/35" style={labelStyle}>BUDGET INDICATIVO</label>
                  <select
                    id="budget"
                    name="budget"
                    className="bg-transparent border border-ivory/12 focus:border-rosewood text-ivory py-3 px-4 outline-none appearance-none cursor-pointer transition-colors duration-200"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                  >
                    {BUDGET_OPTIONS.map(o => (
                      <option key={o} value={o} className="bg-obsidian">{o}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-ivory/35" style={labelStyle}>RACCONTACI IL TUO PROGETTO *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Ciao, ho bisogno di un sito vetrina per la mia attività…"
                    className="bg-transparent border border-ivory/12 focus:border-rosewood text-ivory py-3 px-4 outline-none resize-none placeholder:text-ivory/20 transition-colors duration-200"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    role="alert"
                    className="text-peach"
                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.5 }}
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center bg-rosewood text-ivory hover:bg-ivory hover:text-obsidian disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition-colors duration-200"
                  style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "1rem" }}
                >
                  {loading ? "INVIO IN CORSO…" : "INVIA MESSAGGIO →"}
                </button>

                <p className="text-center text-ivory/20" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.06em" }}>
                  RISPOSTA ENTRO 24 ORE · NESSUN OBBLIGO
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label, id, name, type = "text", placeholder, required,
}: {
  label: string; id: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-ivory/35"
        style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5625rem", letterSpacing: "0.10em", textTransform: "uppercase" }}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="bg-transparent border border-ivory/12 focus:border-rosewood text-ivory py-3 px-4 outline-none placeholder:text-ivory/20 transition-colors duration-200"
        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
      />
    </div>
  );
}
