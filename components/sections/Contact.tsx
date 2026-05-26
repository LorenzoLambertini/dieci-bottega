"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

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
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name:     String(fd.get("name") ?? ""),
      email:    String(fd.get("email") ?? ""),
      company:  (fd.get("company") as string) || undefined,
      budget:   (fd.get("budget")  as string) || undefined,
      message:  (fd.get("message") as string) || undefined,
      source:   "website",
      page_url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      const [emailRes] = await Promise.all([
        fetch("/api/contact", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }),
        fetch(
          "https://voyhwqqubcathcvjatyk.supabase.co/functions/v1/capture-lead",
          {
            method:    "POST",
            headers:   { "Content-Type": "application/json" },
            body:      JSON.stringify(payload),
            keepalive: true,
          }
        ).catch(() => undefined),
      ]);

      if (!emailRes.ok) {
        const data = await emailRes.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Errore server");
      }

      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Errore server"
          ? err.message
          : "Qualcosa è andato storto. Scrivici direttamente a info@diecibottega.it"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contatti" className="bg-obsidian text-ivory relative overflow-hidden">
      <div className="noise-overlay" aria-hidden />

      {/* Header */}
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12 pt-24 pb-16 lg:pt-36 lg:pb-24">
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="block w-8 h-px bg-rosewood" />
          <span className="text-rosewood" style={labelStyle}>06 · CONTATTI</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-end mb-16">
          <motion.h2
            className="text-ivory"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease, delay: 0.05 }}
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
          </motion.h2>
          <motion.p
            className="text-ivory/45 max-w-md lg:ml-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
            style={{ fontFamily: "var(--db-archivo)", fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)", lineHeight: 1.65 }}
          >
            Raccontaci il tuo progetto. Ti risponderemo entro 24 ore
            con un piano d&apos;azione. Prima call sempre gratuita, senza impegno.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20">

          {/* Left — info */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease, delay: 0.1 }}
          >
            <div className="border border-ivory/8">
              {[
                { label: "EMAIL",    value: "info@diecibottega.it",      href: "mailto:info@diecibottega.it" },
                { label: "WHATSAPP", value: "Scrivici direttamente",      href: "https://wa.me/393331234567"  },
                { label: "RISPOSTA", value: "Entro 24 ore lavorative",    href: null },
              ].map(row => (
                <div key={row.label} className="border-b border-ivory/8 last:border-b-0">
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.href.startsWith("http") ? "_blank" : undefined}
                      rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between px-6 py-5 hover:bg-ivory/[0.04] group transition-colors duration-200"
                    >
                      <div>
                        <span className="block text-ivory/22 mb-1" style={labelStyle}>{row.label}</span>
                        <span className="text-ivory/80 group-hover:text-ivory transition-colors duration-200" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.9375rem" }}>
                          {row.value}
                        </span>
                      </div>
                      <span className="text-ivory/20 group-hover:text-rosewood transition-colors duration-200 group-hover:translate-x-0.5 transform" style={{ fontFamily: "var(--db-jetbrains)" }}>→</span>
                    </a>
                  ) : (
                    <div className="px-6 py-5">
                      <span className="block text-ivory/22 mb-1" style={labelStyle}>{row.label}</span>
                      <span className="text-ivory/80" style={{ fontFamily: "var(--db-archivo)", fontWeight: 500, fontSize: "0.9375rem" }}>
                        {row.value}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border border-ivory/8 p-6 hover:border-ivory/12 transition-colors duration-200">
              <p className="text-ivory/45" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.55 }}>
                &ldquo;Se il progetto non è adatto a noi, te lo diciamo subito.
                Nessun obbligo. Solo una conversazione onesta.&rdquo;
              </p>
              <p className="text-ivory/18 mt-4" style={labelStyle}>
                — DIECI BOTTEGA · BOLOGNA
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            className="border border-ivory/8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center text-center py-24 px-8 gap-6 min-h-[400px]"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <div className="w-14 h-14 bg-rosewood flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                      <path d="M4.5 11L9 15.5L17.5 7" stroke="#F4EFE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3
                      className="text-ivory"
                      style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.75rem", textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}
                    >
                      Messaggio inviato!
                    </h3>
                    <p className="text-ivory/40" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                      Abbiamo ricevuto il tuo messaggio.
                      <br />Ti risponderemo entro 24 ore lavorative.
                    </p>
                  </div>
                  <p
                    className="text-ivory/20 mt-2"
                    style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "0.875rem" }}
                  >
                    A presto. — Dieci Bottega
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="p-8 lg:p-10 flex flex-col gap-5"
                  noValidate
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="NOME *"  id="name"  name="name"  placeholder="Marco Rossi"       required />
                    <Field label="EMAIL *" id="email" name="email" type="email" placeholder="marco@azienda.it" required />
                  </div>

                  <Field label="AZIENDA" id="company" name="company" placeholder="Azienda Srl" />

                  {/* Budget */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="budget" className="text-ivory/30" style={labelStyle}>BUDGET INDICATIVO</label>
                    <div className="relative">
                      <select
                        id="budget"
                        name="budget"
                        className="w-full bg-ivory/[0.03] border border-ivory/12 focus:border-rosewood/60 focus:bg-ivory/[0.05] text-ivory/70 py-3 px-4 outline-none appearance-none cursor-pointer transition-all duration-200"
                        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                      >
                        {BUDGET_OPTIONS.map(o => (
                          <option key={o} value={o} className="bg-obsidian text-ivory">{o}</option>
                        ))}
                      </select>
                      <span
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ivory/25"
                        style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.5rem" }}
                        aria-hidden
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-ivory/30" style={labelStyle}>RACCONTACI IL TUO PROGETTO *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Ciao, ho bisogno di un sito vetrina per la mia attività…"
                      className="bg-ivory/[0.03] border border-ivory/12 focus:border-rosewood/60 focus:bg-ivory/[0.05] text-ivory py-3 px-4 outline-none resize-none placeholder:text-ivory/18 transition-all duration-200"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
                    />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        role="alert"
                        className="flex items-start gap-3 border border-rosewood/30 bg-rosewood/8 px-4 py-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease }}
                      >
                        <span className="text-rosewood mt-0.5 shrink-0" style={{ fontSize: "0.875rem" }}>!</span>
                        <p
                          className="text-peach"
                          style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.5 }}
                        >
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative flex items-center justify-center gap-2.5 bg-rosewood text-ivory overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.6875rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "1rem" }}
                  >
                    {!loading && (
                      <span
                        className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        aria-hidden
                      />
                    )}
                    <span className="relative flex items-center gap-2.5">
                      {loading ? (
                        <>
                          <span className="spinner" aria-hidden />
                          INVIO IN CORSO…
                        </>
                      ) : (
                        <>
                          INVIA MESSAGGIO
                          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                        </>
                      )}
                    </span>
                  </button>

                  <p className="text-center text-ivory/18" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.06em" }}>
                    RISPOSTA ENTRO 24 ORE · NESSUN OBBLIGO
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
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
        className="text-ivory/30"
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
        className="bg-ivory/[0.03] border border-ivory/12 focus:border-rosewood/60 focus:bg-ivory/[0.05] text-ivory py-3 px-4 outline-none placeholder:text-ivory/18 transition-all duration-200"
        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
      />
    </div>
  );
}
