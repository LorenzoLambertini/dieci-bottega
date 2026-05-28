"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";

const ease = [0.2, 0.8, 0.2, 1] as const;

type SiteType = "vetrina" | "ecommerce" | "landing" | "altro";
type Source   = "facebook" | "instagram" | "google" | "referral" | "tiktok" | "altro";
type Style    = "modern" | "minimal" | "elegant" | "colorful" | "dark" | "corporate";

const STYLE_OPTIONS: { key: Style; label: string; hint: string }[] = [
  { key: "modern",    label: "Moderno",    hint: "Linee pulite, contemporaneo" },
  { key: "minimal",   label: "Minimal",    hint: "Pochi elementi, tanto spazio" },
  { key: "elegant",   label: "Elegante",   hint: "Editoriale, raffinato" },
  { key: "colorful",  label: "Colorato",   hint: "Vivace, espressivo" },
  { key: "dark",      label: "Dark",       hint: "Sfondi scuri, premium" },
  { key: "corporate", label: "Corporate",  hint: "Formale, business" },
];

const SOURCE_OPTIONS: { key: Source; label: string }[] = [
  { key: "facebook",  label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "google",    label: "Google" },
  { key: "tiktok",    label: "TikTok" },
  { key: "referral",  label: "Passaparola" },
  { key: "altro",     label: "Altro" },
];

const SITE_TYPES: { key: SiteType; label: string; desc: string }[] = [
  { key: "vetrina",   label: "Sito Vetrina",   desc: "5–7 pagine istituzionali" },
  { key: "ecommerce", label: "E-commerce",     desc: "Vendita online prodotti" },
  { key: "landing",   label: "Landing Page",   desc: "Una pagina, un obiettivo" },
  { key: "altro",     label: "Altro / Misto",  desc: "Discutiamone insieme" },
];

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--db-jetbrains)",
  fontSize:      "0.5625rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export default function LeadForm({ onSuccess }: { onSuccess?: () => void }) {
  const cartItems  = useCart(s => s.items);
  const clearCart  = useCart(s => s.clear);

  const [siteType, setSiteType]     = useState<SiteType>("vetrina");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [businessName, setBN]       = useState("");
  const [businessType, setBT]       = useState("");
  const [socials, setSocials]       = useState("");
  const [website, setWebsite]       = useState("");
  const [source, setSource]         = useState<Source | "">("");
  const [styles, setStyles]         = useState<Style[]>([]);
  const [colors, setColors]         = useState("");
  const [notes, setNotes]           = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [sent, setSent]       = useState(false);

  const toggleStyle = (s: Style) => {
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !businessName.trim()) {
      setError("Compila nome, email e nome attività.");
      return;
    }
    setLoading(true);
    setError(null);

    // Build the payload merging quiz-style data + cart
    const cartSummary = cartItems.length > 0
      ? `\n\n--- SERVIZI NEL CARRELLO ---\n${cartItems.map(i => `- ${i.title} × ${i.quantity} (€${i.price * i.quantity})`).join("\n")}`
      : "";

    const message = [
      `Tipo progetto: ${SITE_TYPES.find(t => t.key === siteType)?.label}`,
      `Attività: ${businessName}${businessType ? ` (${businessType})` : ""}`,
      socials  ? `Social: ${socials}`                                                   : null,
      website  ? `Sito attuale: ${website}`                                              : null,
      source   ? `Ci hai trovati su: ${SOURCE_OPTIONS.find(s => s.key === source)?.label}` : null,
      styles.length > 0 ? `Stili preferiti: ${styles.map(s => STYLE_OPTIONS.find(o => o.key === s)?.label).join(", ")}` : null,
      colors   ? `Colori preferiti: ${colors}`                                            : null,
      notes    ? `\nNote: ${notes}`                                                       : null,
      cartSummary,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:    name.trim(),
          email:   email.trim(),
          phone:   phone.trim() || undefined,
          company: businessName.trim(),
          message,
          source:  cartItems.length > 0 ? "website-cart" : "website-form",
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Errore durante l'invio");
      }
      setSent(true);
      clearCart();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="text-center py-12 px-6"
      >
        <div className="w-14 h-14 mx-auto mb-6 bg-rosewood flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4.5 11L9 15.5L17.5 7" stroke="#F4EFE6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3
          className="text-obsidian mb-3"
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(1.75rem, 3vw, 2.5rem)",
            lineHeight:    1,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
          }}
        >
          Richiesta inviata!
        </h3>
        <p className="text-obsidian/55 max-w-md mx-auto mb-3" style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.125rem", lineHeight: 1.5 }}>
          Controlla la tua email da <span className="text-rosewood not-italic" style={{ fontFamily: "var(--db-jetbrains)", fontSize: "0.9rem" }}>info@diecibottega.it</span> — dentro trovi 6 orari cliccabili per fissare la call.
        </p>
        <p className="text-obsidian/40 mt-6" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}>
          Ti contatteremo entro <strong>24 ore lavorative</strong>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-8 text-obsidian hover:text-rosewood transition-colors duration-200"
          style={labelStyle}
        >
          ← TORNA ALLA HOME
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>

      {/* ── SECTION 1 — Tipo progetto ── */}
      <Section number="01" title="Che progetto vuoi?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SITE_TYPES.map(t => {
            const isOn = siteType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSiteType(t.key)}
                className={[
                  "text-left p-4 border transition-all duration-300 press",
                  isOn
                    ? "bg-obsidian text-ivory border-obsidian"
                    : "bg-transparent text-obsidian border-obsidian/15 hover:border-obsidian/40",
                ].join(" ")}
              >
                <p
                  className="block"
                  style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem" }}
                >
                  {t.label}
                </p>
                <p
                  className={isOn ? "text-ivory/55" : "text-obsidian/45"}
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "0.75rem", lineHeight: 1.4 }}
                >
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── SECTION 2 — Anagrafica ── */}
      <Section number="02" title="Chi sei?">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="NOME *"  value={name}  onChange={setName}  placeholder="Marco Rossi" required />
          <Field label="EMAIL *" value={email} onChange={setEmail} placeholder="marco@azienda.it" type="email" required />
          <Field label="TELEFONO / WHATSAPP" value={phone} onChange={setPhone} placeholder="+39 333 1234567" />
          <Field label="NOME ATTIVITÀ *" value={businessName} onChange={setBN} placeholder="Trattoria Da Mario" required />
        </div>
        <Field label="TIPO ATTIVITÀ" value={businessType} onChange={setBT} placeholder="Ristorante / Studio legale / E-commerce / …" />
      </Section>

      {/* ── SECTION 3 — Presenza online ── */}
      <Section number="03" title="Sei già online?">
        <Field label="LINK SOCIAL (instagram, facebook, ecc)" value={socials} onChange={setSocials} placeholder="https://instagram.com/tuoaccount" />
        <Field label="SITO ATTUALE (se ne hai uno)" value={website} onChange={setWebsite} placeholder="https://tuosito.it" />
      </Section>

      {/* ── SECTION 4 — Source ── */}
      <Section number="04" title="Come ci hai trovati?">
        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map(s => {
            const isOn = source === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSource(s.key)}
                className={[
                  "px-4 py-2 border transition-all duration-300 press",
                  isOn
                    ? "bg-rosewood text-ivory border-rosewood"
                    : "bg-transparent text-obsidian/65 border-obsidian/15 hover:border-obsidian/40",
                ].join(" ")}
                style={labelStyle}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── SECTION 5 — Style + colors ── */}
      <Section number="05" title="Che stile ti piace? (multi-selezione)">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {STYLE_OPTIONS.map(s => {
            const isOn = styles.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleStyle(s.key)}
                className={[
                  "text-left p-3 border transition-all duration-300 press",
                  isOn
                    ? "bg-obsidian text-ivory border-obsidian"
                    : "bg-transparent text-obsidian border-obsidian/15 hover:border-obsidian/40",
                ].join(" ")}
              >
                <p style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.875rem" }}>
                  {s.label}
                </p>
                <p
                  className={isOn ? "text-ivory/55" : "text-obsidian/45"}
                  style={{ fontFamily: "var(--db-archivo)", fontSize: "0.7rem", lineHeight: 1.3 }}
                >
                  {s.hint}
                </p>
              </button>
            );
          })}
        </div>
        <Field label="COLORI PREFERITI (opzionale)" value={colors} onChange={setColors} placeholder="Rosso e nero / Pastello / Toni naturali / …" />
      </Section>

      {/* ── SECTION 6 — Notes ── */}
      <Section number="06" title="Altro che vuoi dirci?">
        <div className="flex flex-col gap-2">
          <label htmlFor="notes" className="text-obsidian/45" style={labelStyle}>NOTE LIBERE</label>
          <textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Riferimenti che ti piacciono, urgenza, budget, vincoli…"
            className="bg-ivory border border-obsidian/15 focus:border-obsidian/40 text-obsidian py-3 px-4 outline-none resize-none placeholder:text-obsidian/25 transition-colors duration-200"
            style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}
          />
        </div>
      </Section>

      {/* Cart summary (if present) */}
      {cartItems.length > 0 && (
        <div className="border border-rosewood/30 bg-rosewood/8 p-5 flex items-start gap-3">
          <span className="live-dot mt-1.5 shrink-0" />
          <div>
            <p className="text-obsidian" style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em", fontWeight: 700, marginBottom: "0.25rem" }}>
              DAL CARRELLO · {cartItems.length} {cartItems.length === 1 ? "SERVIZIO" : "SERVIZI"}
            </p>
            <p className="text-obsidian/65" style={{ fontFamily: "var(--db-archivo)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
              {cartItems.map(i => `${i.title}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-rosewood border border-rosewood/40 bg-rosewood/8 px-4 py-3"
            style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem" }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="relative w-full flex items-center justify-center gap-2.5 bg-rosewood text-ivory overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed press py-4"
        style={{ ...labelStyle, fontSize: "0.6875rem", letterSpacing: "0.12em", padding: "1.125rem" }}
      >
        {!loading && (
          <span className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-500" style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }} aria-hidden />
        )}
        <span className="relative flex items-center gap-2.5">
          {loading ? (
            <>
              <span className="spinner" aria-hidden />
              Invio in corso…
            </>
          ) : (
            <>
              <span className="live-dot" />
              Il mio sito gratis
              <span>→</span>
            </>
          )}
        </span>
      </button>

      <p className="text-center text-obsidian/35 -mt-4" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
        RISPOSTA ENTRO 24 ORE · NESSUN OBBLIGO · NESSUN PAGAMENTO ONLINE
      </p>
    </form>
  );
}

/* ─── helper components ────────────────────────────────── */

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-rosewood" style={{ ...labelStyle, fontSize: "0.625rem", letterSpacing: "0.14em", fontWeight: 700 }}>
          {number}
        </span>
        <legend
          className="text-obsidian"
          style={{
            fontFamily:    "var(--db-archivo)",
            fontWeight:    900,
            fontSize:      "clamp(1.125rem, 1.6vw, 1.5rem)",
            lineHeight:    1.1,
            letterSpacing: "-0.015em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </legend>
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-obsidian/45" style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="bg-ivory border border-obsidian/15 focus:border-obsidian/40 text-obsidian py-3 px-4 outline-none placeholder:text-obsidian/25 transition-colors duration-200"
        style={{ fontFamily: "var(--db-archivo)", fontSize: "0.9375rem" }}
      />
    </div>
  );
}
