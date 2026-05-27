"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.2, 0.8, 0.2, 1] as const;

const SESSION_KEY = "db-quiz-v1";

/* ─── Domande ───────────────────────────────────────────── */

type Option = { key: string; label: string; hint?: string };
type Question = {
  id:      number;
  label:   string;
  text:    string;
  context: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    id:      1,
    label:   "SITUAZIONE",
    text:    "Cosa hai online oggi?",
    context: "L'85% dei clienti cerca un'attività online prima di contattarla. Sapere dove parti aiuta a costruire il passo giusto.",
    options: [
      { key: "none",   label: "Niente",                   hint: "Parto da zero" },
      { key: "social", label: "Solo i social",            hint: "Instagram, Facebook" },
      { key: "old",    label: "Sito vecchio",             hint: "Da rifare" },
      { key: "weak",   label: "Sito ma non funziona",     hint: "Pochi contatti" },
    ],
  },
  {
    id:      2,
    label:   "ATTIVITÀ",
    text:    "Cosa offri?",
    context: "Ogni tipo di attività ha bisogni diversi. Un ristorante non è un&apos;agenzia immobiliare.",
    options: [
      { key: "local",   label: "Servizio locale",        hint: "Ristorante, studio, negozio" },
      { key: "b2b",     label: "Consulenza e B2B",       hint: "Professionisti, agenzie" },
      { key: "products",label: "Prodotti fisici",        hint: "E-commerce, artigiani" },
      { key: "digital", label: "Servizio digitale",      hint: "SaaS, corsi, software" },
    ],
  },
  {
    id:      3,
    label:   "OBIETTIVO",
    text:    "Cosa vuoi ottenere?",
    context: "Un sito senza obiettivo è un brochure. Un sito con un obiettivo chiaro lavora per te ogni giorno.",
    options: [
      { key: "leads",     label: "Più contatti qualificati",  hint: "Lead generation" },
      { key: "sales",     label: "Vendere online",            hint: "E-commerce diretto" },
      { key: "brand",     label: "Apparire più credibile",    hint: "Presenza professionale" },
      { key: "automate",  label: "Automatizzare processi",    hint: "Meno lavoro manuale" },
    ],
  },
  {
    id:      4,
    label:   "TEMPO",
    text:    "Quanto puoi aspettare?",
    context: "Costruiamo in 10 giorni quello che gli studi fanno in tre mesi. Ma capire la tua urgenza ci aiuta a darti la priorità giusta.",
    options: [
      { key: "now",   label: "Mi serve subito",           hint: "1–2 settimane" },
      { key: "soon",  label: "Entro un mese",             hint: "Pianificabile" },
      { key: "ok",    label: "Ho 2–3 mesi",               hint: "Posso aspettare" },
      { key: "long",  label: "Senza fretta",              hint: "Voglio farlo bene" },
    ],
  },
  {
    id:      5,
    label:   "BUDGET",
    text:    "Quanto sei disposto a investire?",
    context: "Pubblichiamo i prezzi perché crediamo nell&apos;onestà radicale. Diciamo subito se rientriamo nel tuo budget.",
    options: [
      { key: "low",     label: "Fino a €1.000",          hint: "Start basic" },
      { key: "mid",     label: "€1.000 – €2.500",        hint: "La maggior parte" },
      { key: "high",    label: "€2.500 – €5.000",        hint: "Custom esteso" },
      { key: "premium", label: "Oltre €5.000",           hint: "Premium, ricorrente" },
    ],
  },
];

type Answers = Record<number, string>;

/* ─── Logica raccomandazione ────────────────────────────── */

type Recommendation = {
  product:  string;
  tier:     string;
  price:    string;
  time:     string;
  reason:   string;
  features: string[];
};

function recommend(a: Answers): Recommendation {
  const situation = a[1];
  const activity  = a[2];
  const goal      = a[3];
  const time      = a[4];
  const budget    = a[5];

  // E-commerce
  if (activity === "products" || goal === "sales") {
    if (budget === "low") {
      return {
        product: "Landing Page con vendita",
        tier:    "TIER 01 · BASIC",
        price:   "da €900",
        time:    "7 giorni",
        reason:  "Inizi a vendere subito con una pagina focalizzata su 1–3 prodotti. Quando vali, espandiamo.",
        features: ["Pagina vendita ottimizzata", "Form ordine + pagamento", "Tracking conversioni", "SEO essenziale"],
      };
    }
    return {
      product: "E-commerce Light",
      tier:    budget === "premium" ? "TIER 03 · PREMIUM" : "TIER 02 · PRO",
      price:   budget === "premium" ? "da €3.200" : "da €1.800",
      time:    budget === "premium" ? "3 settimane" : "12–15 giorni",
      reason:  "Catalogo curato, vendita diretta, controllo del margine. Il giusto strumento per chi ha prodotti e vuole venderli senza intermediari.",
      features: ["Catalogo prodotti custom", "Checkout Stripe/PayPal", "Gestione ordini", "Email transazionali"],
    };
  }

  // Automazione / CRM
  if (goal === "automate") {
    if (budget === "low" || budget === "mid") {
      return {
        product: "Automazione AI mirata",
        tier:    "TIER 01–02",
        price:   "da €900",
        time:    "7–10 giorni",
        reason:  "Identifichiamo i 2 processi che ti rubano più tempo e li automatizziamo. ROI in poche settimane.",
        features: ["Workflow design + setup", "Integrazione tool esistenti", "Email/notifiche automatiche", "Dashboard semplice"],
      };
    }
    return {
      product: "CRM Su Misura + Automazioni",
      tier:    "TIER 03 · PREMIUM",
      price:   "da €2.800",
      time:    "3–4 settimane",
      reason:  "Strumento interno cucito sul tuo workflow. Niente abbonamenti software, codice tuo, scala con te.",
      features: ["CRM su misura (Next + Supabase)", "Pipeline lead drag&drop", "Email sequences", "Dashboard analytics"],
    };
  }

  // Lead generation con urgenza/budget basso → Landing
  if (goal === "leads" && (budget === "low" || time === "now")) {
    return {
      product: "Landing Page Conversion",
      tier:    "TIER 01 · BASIC",
      price:   "da €800",
      time:    "5–7 giorni",
      reason:  "Una pagina, un obiettivo. Struttura testata per conversione, copy AI-assistito, lead generation pronta.",
      features: ["Pagina focalizzata sul lead", "Copy persuasivo AI + umano", "Form + tracking", "Lighthouse 95+"],
    };
  }

  // Servizio locale + apparire professionale → Vetrina
  if (activity === "local" || goal === "brand") {
    if (budget === "low") {
      return {
        product: "Sito Vetrina Basic",
        tier:    "TIER 01 · BASIC",
        price:   "da €800",
        time:    "7 giorni",
        reason:  "Una presenza credibile per chi parte da zero. Mobile-first, Google-friendly, gestibile.",
        features: ["1 pagina one-pager", "Design adattato al brand", "Form contatto", "SEO on-page locale"],
      };
    }
    if (budget === "premium") {
      return {
        product: "Sito Vetrina Premium",
        tier:    "TIER 03 · PREMIUM",
        price:   "da €2.500",
        time:    "3 settimane",
        reason:  "Design su misura, copy professionale, revisioni illimitate. Lo standard per chi vuole essere il riferimento del proprio settore.",
        features: ["8–12 pagine + blog", "Design 100% custom", "Copy professionale", "Multi-form + CRM integrato"],
      };
    }
    return {
      product: "Sito Vetrina Pro",
      tier:    "TIER 02 · PRO",
      price:   "da €1.500",
      time:    "10–14 giorni",
      reason:  "Cinque-sette pagine fatte bene, design su brief, copy curato. La scelta più richiesta dai nostri clienti.",
      features: ["5–7 pagine custom", "Design su brief", "Copy AI + revisione umana", "Google Business + form avanzato"],
    };
  }

  // B2B / consulenza
  if (activity === "b2b") {
    return {
      product: "Sito Vetrina Pro",
      tier:    "TIER 02 · PRO",
      price:   "da €1.500",
      time:    "10–14 giorni",
      reason:  "Per professionisti che vendono fiducia. Posizionamento chiaro, casi studio, lead qualificati.",
      features: ["Pagine servizi dedicate", "Sezione casi studio", "Form lead qualification", "Blog opzionale"],
    };
  }

  // Default: Pacchetto Pro
  return {
    product: "Sito Vetrina Pro",
    tier:    "TIER 02 · PRO",
    price:   "da €1.500",
    time:    "10–14 giorni",
    reason:  "L'equilibrio più richiesto: qualità, funzionalità, velocità. Il pacchetto che sceglie il 60% dei nostri clienti.",
    features: ["5–7 pagine custom", "Design su brief", "Copy AI-assistito + revisione", "Form + Google Business"],
  };
}

/* ─── Component ─────────────────────────────────────────── */

export default function Quiz() {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState(0); // 0 = intro, 1–5 = questions, 6 = result
  const [answers, setAnswers] = useState<Answers>({});

  // Trigger logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let fired = false;
    const fire = () => {
      if (fired) return;
      // Don't show if already at contact
      const contact = document.querySelector<HTMLElement>("#contatti");
      if (contact) {
        const rect = contact.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7) return;
      }
      fired = true;
      setOpen(true);
    };

    // Trigger 1: scroll past 55% of first viewport
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.55) {
        scrollTimer = window.setTimeout(fire, 1200);
        window.removeEventListener("scroll", onScroll);
      }
    };
    let scrollTimer = 0;
    window.addEventListener("scroll", onScroll, { passive: true });

    // Trigger 2: exit-intent (desktop only)
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY < 8 && !e.relatedTarget) fire();
    };
    document.addEventListener("mouseout", onMouseOut);

    // Trigger 3: 35s idle fallback
    const idleTimer = window.setTimeout(fire, 35000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(idleTimer);
      window.clearTimeout(scrollTimer);
    };
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "dismissed");
    setOpen(false);
  }, []);

  const select = useCallback((qId: number, optKey: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optKey }));
    // auto-advance
    setTimeout(() => setStep(s => s + 1), 250);
  }, []);

  const goToContact = () => {
    // Pre-fill via sessionStorage so Contact form can pick it up
    sessionStorage.setItem(SESSION_KEY, "completed");
    sessionStorage.setItem("db-quiz-answers", JSON.stringify(answers));
    sessionStorage.setItem("db-quiz-recommendation", JSON.stringify(recommendation));
    setOpen(false);
    setTimeout(() => {
      const el = document.querySelector("#contatti");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const recommendation = useMemo(() => recommend(answers), [answers]);
  const currentQ = step >= 1 && step <= 5 ? QUESTIONS[step - 1] : null;
  const progress = step <= 5 ? (step / 5) * 100 : 100;
  const labelStyle: React.CSSProperties = {
    fontFamily:    "var(--db-jetbrains)",
    fontSize:      "0.6875rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="quiz-overlay"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-obsidian/65 backdrop-blur-sm"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-title"
            className="relative w-full max-w-[640px] bg-ivory text-obsidian shadow-atelier-lg max-h-[92vh] flex flex-col overflow-hidden"
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,  opacity: 1, scale: 1    }}
            exit={{    y: 20, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="grain-soft" aria-hidden />

            {/* Top bar */}
            <div className="relative flex items-center justify-between px-6 lg:px-8 py-4 border-b border-obsidian/10">
              <div className="flex items-center gap-3">
                <span className="live-dot" />
                <span className="text-obsidian/65" style={labelStyle}>
                  DIECI BOTTEGA · GUIDA
                </span>
              </div>
              <button
                onClick={dismiss}
                aria-label="Chiudi"
                className="text-obsidian/30 hover:text-obsidian transition-colors duration-200 w-7 h-7 flex items-center justify-center press"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="relative h-px bg-obsidian/8">
              <motion.div
                className="absolute inset-y-0 left-0 bg-rosewood"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease }}
              />
            </div>

            {/* Body */}
            <div className="relative overflow-y-auto flex-1">
              <AnimatePresence mode="wait" initial={false}>

                {/* ── Intro ── */}
                {step === 0 && (
                  <motion.div
                    key="intro"
                    className="px-6 lg:px-10 py-9 lg:py-12 text-center"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <p className="text-rosewood mb-6" style={labelStyle}>
                      05 DOMANDE · 60 SECONDI
                    </p>
                    <h2
                      id="quiz-title"
                      className="text-obsidian mb-5"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.875rem, 4vw, 2.75rem)",
                        lineHeight:    0.95,
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      Capiamoci<br />
                      <span className="text-obsidian/40">in un minuto.</span>
                    </h2>
                    <p
                      className="text-obsidian/55 max-w-md mx-auto mb-3"
                      style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.125rem", lineHeight: 1.45 }}
                    >
                      Cinque domande veloci. Ti diciamo cosa serve davvero
                      al tuo progetto — e cosa no.
                    </p>
                    <p
                      className="text-obsidian/45 max-w-sm mx-auto mb-9"
                      style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.6 }}
                    >
                      Niente email obbligatoria, niente spam. Solo una
                      raccomandazione sincera, basata sulla tua situazione.
                    </p>

                    <button
                      onClick={() => setStep(1)}
                      className="relative inline-flex items-center justify-center gap-2 bg-obsidian text-ivory overflow-hidden group press"
                      style={{ ...labelStyle, padding: "1rem 2rem" }}
                    >
                      <span
                        className="absolute inset-0 bg-rosewood translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                        style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                        aria-hidden
                      />
                      <span className="relative flex items-center gap-2">
                        Iniziamo
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </span>
                    </button>

                    <p className="text-obsidian/25 mt-8" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                      OPPURE PREMI ESC PER CHIUDERE
                    </p>
                  </motion.div>
                )}

                {/* ── Questions 1-5 ── */}
                {currentQ && (
                  <motion.div
                    key={`q-${currentQ.id}`}
                    className="px-6 lg:px-10 py-8 lg:py-10"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-rosewood" style={labelStyle}>
                        {String(currentQ.id).padStart(2, "0")} / 05 · {currentQ.label}
                      </p>
                      {step > 1 && (
                        <button
                          onClick={() => setStep(s => s - 1)}
                          className="text-obsidian/30 hover:text-obsidian transition-colors duration-200 flex items-center gap-1.5"
                          style={{ ...labelStyle, fontSize: "0.5625rem", letterSpacing: "0.14em" }}
                        >
                          <span>←</span> INDIETRO
                        </button>
                      )}
                    </div>

                    <h3
                      className="text-obsidian mb-4"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.625rem, 3.2vw, 2.25rem)",
                        lineHeight:    1.05,
                        letterSpacing: "-0.025em",
                        textTransform: "uppercase",
                      }}
                    >
                      {currentQ.text}
                    </h3>

                    <p
                      className="text-obsidian/50 mb-8 max-w-md"
                      style={{
                        fontFamily: "var(--db-cardo)",
                        fontStyle:  "italic",
                        fontSize:   "0.9375rem",
                        lineHeight: 1.5,
                      }}
                      dangerouslySetInnerHTML={{ __html: currentQ.context }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentQ.options.map(opt => {
                        const isSelected = answers[currentQ.id] === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => select(currentQ.id, opt.key)}
                            className={[
                              "text-left p-4 border transition-all duration-400 press group/opt",
                              isSelected
                                ? "bg-obsidian text-ivory border-obsidian"
                                : "bg-transparent border-obsidian/15 hover:border-obsidian/40 hover:bg-obsidian/[0.02]",
                            ].join(" ")}
                            style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-300"
                                style={{
                                  borderColor: isSelected ? "#E63B2E" : "rgba(26,20,20,0.20)",
                                  background:  isSelected ? "#E63B2E" : "transparent",
                                  boxShadow:   isSelected ? "inset 0 0 0 2px #1A1414" : "none",
                                }}
                                aria-hidden
                              />
                              <div className="min-w-0">
                                <span
                                  className="block"
                                  style={{ fontFamily: "var(--db-archivo)", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.3 }}
                                >
                                  {opt.label}
                                </span>
                                {opt.hint && (
                                  <span
                                    className={isSelected ? "text-ivory/45" : "text-obsidian/40"}
                                    style={{ fontFamily: "var(--db-archivo)", fontSize: "0.75rem", lineHeight: 1.4 }}
                                  >
                                    {opt.hint}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── Result ── */}
                {step === 6 && (
                  <motion.div
                    key="result"
                    className="px-6 lg:px-10 py-8 lg:py-10"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <div className="flex items-center gap-2.5 mb-6">
                      <span className="live-dot" />
                      <p className="text-rosewood" style={labelStyle}>
                        RACCOMANDAZIONE · BASATA SUL TUO PROFILO
                      </p>
                    </div>

                    <h3
                      className="text-obsidian mb-2"
                      style={{
                        fontFamily:    "var(--db-archivo)",
                        fontWeight:    900,
                        fontSize:      "clamp(1.75rem, 3.4vw, 2.5rem)",
                        lineHeight:    1.02,
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {recommendation.product}
                    </h3>
                    <p className="text-obsidian/35 mb-6" style={labelStyle}>
                      {recommendation.tier}
                    </p>

                    <p
                      className="text-obsidian/65 mb-7"
                      style={{ fontFamily: "var(--db-cardo)", fontStyle: "italic", fontSize: "1.0625rem", lineHeight: 1.5 }}
                    >
                      &ldquo;{recommendation.reason}&rdquo;
                    </p>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4 mb-7 p-5 bg-obsidian/[0.04] border border-obsidian/8">
                      <div>
                        <p className="text-obsidian/40 mb-1" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                          INVESTIMENTO
                        </p>
                        <p
                          className="text-obsidian"
                          style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                        >
                          {recommendation.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-obsidian/40 mb-1" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                          CONSEGNA
                        </p>
                        <p
                          className="text-obsidian"
                          style={{ fontFamily: "var(--db-archivo)", fontWeight: 900, fontSize: "1.375rem", lineHeight: 1, letterSpacing: "-0.02em" }}
                        >
                          {recommendation.time}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <p className="text-obsidian/40 mb-3" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.14em" }}>
                      COSA INCLUDE
                    </p>
                    <ul className="space-y-2 mb-8">
                      {recommendation.features.map(f => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="mt-[6px] shrink-0" style={{ width: "5px", height: "5px", background: "#E63B2E" }} aria-hidden />
                          <span
                            className="text-obsidian/70"
                            style={{ fontFamily: "var(--db-archivo)", fontSize: "0.875rem", lineHeight: 1.55 }}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={goToContact}
                        className="flex-1 relative flex items-center justify-center gap-2 bg-rosewood text-ivory overflow-hidden group press"
                        style={{ ...labelStyle, padding: "1rem 1.25rem" }}
                      >
                        <span
                          className="absolute inset-0 bg-obsidian translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                          style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
                          aria-hidden
                        />
                        <span className="relative flex items-center gap-2">
                          Parlane con noi
                          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </span>
                      </button>
                      <button
                        onClick={() => { setStep(0); setAnswers({}); }}
                        className="border border-obsidian/15 hover:border-obsidian/35 text-obsidian/55 hover:text-obsidian transition-all duration-300 press"
                        style={{ ...labelStyle, padding: "1rem 1.25rem" }}
                      >
                        Rifai il quiz
                      </button>
                    </div>

                    <p
                      className="text-center text-obsidian/30 mt-6"
                      style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}
                    >
                      * STIMA INDICATIVA · PREVENTIVO DEFINITIVO DOPO BRIEF
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="relative border-t border-obsidian/10 px-6 lg:px-8 py-3 flex items-center justify-between">
              <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                {step === 0 && "INIZIA"}
                {step >= 1 && step <= 5 && `DOMANDA ${step} DI 5`}
                {step === 6 && "RACCOMANDAZIONE FINALE"}
              </span>
              <span className="text-obsidian/25" style={{ ...labelStyle, fontSize: "0.5rem", letterSpacing: "0.18em" }}>
                BOLOGNA · MMXXVI
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
