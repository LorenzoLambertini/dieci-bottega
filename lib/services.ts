/**
 * Catalogo Servizi · Dieci Bottega
 *
 * Allineato al Documento Fondativo:
 * - Tipi di prodotti vendibili one-shot
 * - Servizi ricorrenti (abbonamenti)
 * - Pricing trasparente, con range
 */

export type ServiceCategory =
  | "siti"
  | "marketing"
  | "crm"
  | "automazioni"
  | "abbonamenti"
  | "extra";

export type ServiceUnit = "one-shot" | "mese" | "anno";

export type Service = {
  slug:         string;
  title:        string;
  category:     ServiceCategory;
  shortDesc:    string;
  longDesc:     string;
  price:        number;       // €, valore "from"
  priceMax?:    number;       // €, valore "to" (range)
  unit:         ServiceUnit;
  deliveryDays: string;       // es "7", "5–7", "su preventivo"
  forWho:       string;
  features:     string[];
  benefits:     string[];
  useCases:     string[];
  related:      string[];     // slugs of related services
  featured?:    boolean;      // marker per "Più scelto"
};

export const CATEGORIES: Record<ServiceCategory, { label: string; blurb: string }> = {
  siti:         { label: "Siti Web",       blurb: "Vetrine, landing, e-commerce snelli, consegnati in dieci giorni." },
  marketing:    { label: "Marketing",      blurb: "Strategie e contenuti per farti trovare e farti scegliere." },
  crm:          { label: "CRM & Dati",     blurb: "Strumenti interni su misura. Niente abbonamenti software." },
  automazioni:  { label: "Automazioni AI", blurb: "Workflow che fanno il lavoro ripetitivo al posto tuo." },
  abbonamenti:  { label: "Abbonamenti",    blurb: "Continuità nel tempo: hosting, manutenzione, supporto." },
  extra:        { label: "Servizi Extra",  blurb: "Domini, caselle email, copywriting, consulenze." },
};

export const SERVICES: Service[] = [
  /* ─── SITI WEB ──────────────────────────────────────────── */
  {
    slug:         "sito-vetrina",
    title:        "Sito Vetrina",
    category:     "siti",
    shortDesc:    "Presenza digitale credibile, indicizzata, gestibile. La base per PMI locali.",
    longDesc:     "Un sito vetrina fatto bene è il biglietto da visita digitale della tua attività. Cinque-sette pagine costruite a mano: home, chi siamo, servizi, contatti, eventuali pagine extra. Design su misura adattato al tuo brand, mobile-first, indicizzato su Google, gestibile da te o da noi. È il punto di partenza per chiunque voglia essere preso sul serio nel digitale.",
    price:        1200,
    priceMax:     1800,
    unit:         "one-shot",
    deliveryDays: "10",
    forWho:       "Ristoranti, studi professionali, artigiani, negozi locali, agenzie immobiliari singole, palestre.",
    features: [
      "5–7 pagine custom (Home, Chi siamo, Servizi/Menu, Contatti, extra)",
      "Design su brief adattato al brand (palette, typography, gerarchie)",
      "Mobile-first responsive (perfetto su smartphone)",
      "SEO on-page completo (title, meta, sitemap, Open Graph)",
      "Integrazione Google Business Profile",
      "Form contatto avanzato collegato al CRM",
      "Deploy su Vercel con SSL gratuito e CDN globale",
      "2 round di revisione inclusi",
      "Formazione e handover documentato",
    ],
    benefits: [
      "Essere trovato su Google con ricerche locali",
      "Trasmettere professionalità prima ancora del primo contatto",
      "Aggiornare orari, menu, prezzi senza chiamare un'agenzia",
      "Convertire visitatori in contatti reali",
    ],
    useCases: [
      "Trattoria che vuole prenotazioni dirette",
      "Studio legale che cerca lead qualificati",
      "Estetista che vuole un catalogo trattamenti online",
    ],
    related:  ["landing-page", "manutenzione-care-plus", "google-business-setup"],
    featured: true,
  },
  {
    slug:         "landing-page",
    title:        "Landing Page",
    category:     "siti",
    shortDesc:    "Una pagina, un obiettivo. Conversioni misurate e ottimizzate.",
    longDesc:     "Quando hai un solo prodotto, un evento, una campagna pubblicitaria — non ti serve un sito intero, ti serve una pagina che converta. La nostra landing page è costruita con struttura testata: hero, benefit, social proof, FAQ, form. Copy AI-assistito + revisione umana. Lighthouse score garantito sopra 95.",
    price:        800,
    priceMax:     1100,
    unit:         "one-shot",
    deliveryDays: "5–7",
    forWho:       "Chi lancia un prodotto, un servizio specifico, una campagna ads, un evento.",
    features: [
      "Pagina singola focalizzata su una sola call-to-action",
      "Struttura testata: hero, benefit, social proof, FAQ, form",
      "Copy AI-assistito + revisione umana",
      "Form lead generation collegato al CRM",
      "Analytics + tracking eventi (click, scroll, conversioni)",
      "Lighthouse score ≥ 95 garantito",
      "Setup base A/B test (per future ottimizzazioni)",
    ],
    benefits: [
      "Trasformare il traffico ads in lead qualificati",
      "Misurare cosa funziona e cosa no",
      "Iterare velocemente sui copy e sulle CTA",
    ],
    useCases: [
      "Lancio di un nuovo corso o consulenza",
      "Campagna Meta/Google Ads",
      "Evento o webinar con form di iscrizione",
    ],
    related: ["sito-vetrina", "lead-capture", "google-ads-setup"],
  },
  {
    slug:         "ecommerce-light",
    title:        "E-commerce Light",
    category:     "siti",
    shortDesc:    "Vendita diretta per brand artigiani. Cataloghi curati, controllo del margine.",
    longDesc:     "Per chi ha prodotti veri e vuole venderli senza pagare commissioni a Amazon o Etsy. Un e-commerce snello con catalogo (fino ~50 prodotti), schede con varianti, carrello e checkout Stripe/PayPal. Gestione ordini essenziale e email transazionali. Niente WooCommerce gonfio, niente abbonamenti Shopify.",
    price:        1800,
    priceMax:     3200,
    unit:         "one-shot",
    deliveryDays: "12–15",
    forWho:       "Artigiani, brand emergenti, produttori con catalogo curato (fino ~50 prodotti).",
    features: [
      "Catalogo prodotti gestibile via CMS leggero",
      "Schede prodotto con varianti, foto, prezzi, disponibilità",
      "Carrello + checkout Stripe o PayPal",
      "Email transazionali (conferma ordine, spedizione, ringraziamento)",
      "Gestione spedizioni base (corrieri italiani)",
      "Dashboard ordini per gestione interna",
      "SEO prodotti + integrazione Google Shopping opzionale",
    ],
    benefits: [
      "Vendere direttamente senza commissioni dei marketplace",
      "Mantenere il controllo del margine",
      "Costruire un rapporto diretto con il cliente",
    ],
    useCases: [
      "Pasticceria artigianale che vuole vendere online",
      "Designer che vende oggetti in tiratura limitata",
      "Cantina che vuole spedire le proprie bottiglie",
    ],
    related: ["sito-vetrina", "automazione-email-sequences", "manutenzione-care-pro"],
  },

  /* ─── CRM & DATI ───────────────────────────────────────── */
  {
    slug:         "crm-su-misura",
    title:        "CRM Su Misura",
    category:     "crm",
    shortDesc:    "Pipeline visibile, niente più Excel né abbonamenti software mensili.",
    longDesc:     "Un CRM costruito sul tuo workflow, non sul workflow di un SaaS americano. Database lead, pipeline visuale con drag&drop, schede complete, activity feed, multi-utente con ruoli. Costruito su Supabase: i dati sono tuoi, scala con te, e a fine anno non paghi €30-80/utente al mese a HubSpot o Pipedrive.",
    price:        2500,
    priceMax:     4000,
    unit:         "one-shot",
    deliveryDays: "14–21",
    forWho:       "Team commerciali di 2–10 persone stanchi di gestire lead su Excel o di abbonamenti software.",
    features: [
      "Database lead su Supabase (proprietà tua)",
      "Pipeline visuale drag & drop personalizzata sulle tue fasi",
      "Schede lead complete: contatti, attività, note, allegati",
      "Activity feed (chi ha fatto cosa, quando)",
      "Multi-utente con ruoli (admin, sales, marketing)",
      "Tag, segmenti, filtri avanzati",
      "Integrazione email/WhatsApp/calendar",
      "Esportazione dati CSV/Excel in qualsiasi momento",
    ],
    benefits: [
      "Niente più €30–80 per utente al mese a CRM SaaS",
      "Scala con te senza limiti artificiali",
      "I tuoi dati sono tuoi, non in licenza",
    ],
    useCases: [
      "Studio di consulenza con 5 commerciali",
      "Agenzia immobiliare con flusso lead complesso",
      "Servizi B2B con cicli di vendita lunghi",
    ],
    related: ["dashboard-custom", "automazione-lead-routing", "manutenzione-care-pro"],
  },
  {
    slug:         "dashboard-custom",
    title:        "Dashboard Custom",
    category:     "crm",
    shortDesc:    "Tutti i KPI del tuo business in un'unica vista. Niente più 5 strumenti aperti.",
    longDesc:     "Aggreghiamo dati da Shopify, Stripe, Google Analytics, fogli Excel, il tuo gestionale — tutto in una dashboard live. Grafici, trend, comparazioni periodo-su-periodo. Alert automatici quando un KPI scende sotto soglia. Accesso mobile per consultare in movimento.",
    price:        1500,
    priceMax:     2500,
    unit:         "one-shot",
    deliveryDays: "10–14",
    forWho:       "Founder, owner, manager che vogliono vedere i numeri al volo, in tempo reale.",
    features: [
      "Aggregazione dati da fonti multiple (Shopify, Stripe, GA, Excel, DB)",
      "Visualizzazione metriche in tempo reale",
      "Grafici, trend, comparazioni periodo-su-periodo",
      "Alert automatici (es. fatturato sotto soglia)",
      "Accesso mobile responsive",
      "Esportazione report PDF settimanali/mensili",
    ],
    benefits: [
      "Decisioni dati alla mano, non a sensazione",
      "Vedere cosa succede oggi, non a fine mese",
      "Risparmiare ore di lavoro manuale su report",
    ],
    useCases: [
      "E-commerce che vuole monitorare conversioni giornaliere",
      "Agenzia che vuole vedere fatturato per cliente",
      "Operations team che monitora SLA in tempo reale",
    ],
    related: ["crm-su-misura", "integrazione-tool", "manutenzione-care-pro"],
  },
  {
    slug:         "integrazione-tool",
    title:        "Integrazione Tool",
    category:     "crm",
    shortDesc:    "Far parlare tra loro i 4 strumenti che usi già. Niente più data entry doppia.",
    longDesc:     "Hai un gestionale, un CRM, un'email marketing, un e-commerce — e nessuno dei quattro si parla con gli altri. Risultato: data entry doppia, errori, ore perse. Noi mappiamo il workflow, colleghiamo via API o n8n, e tutto comunica.",
    price:        800,
    priceMax:     2200,
    unit:         "one-shot",
    deliveryDays: "5–10",
    forWho:       "Aziende che usano già 3–5 strumenti che non si parlano tra loro.",
    features: [
      "Analisi del workflow esistente",
      "Connessione automatica via API o n8n",
      "Sincronizzazione bidirezionale dei dati",
      "Mapping dei campi tra sistemi",
      "Gestione errori e log centralizzati",
    ],
    benefits: [
      "Niente più data entry doppia",
      "Errori di trascrizione azzerati",
      "Workflow fluidi che richiedono meno persone",
    ],
    useCases: [
      "Shopify → CRM → email marketing",
      "Form sito → CRM → notifiche Slack",
      "Gestionale → fatturazione elettronica → contabilità",
    ],
    related: ["crm-su-misura", "automazione-lead-routing", "manutenzione-care-plus"],
  },

  /* ─── AUTOMAZIONI ──────────────────────────────────────── */
  {
    slug:         "automazione-lead-routing",
    title:        "Lead Capture & Routing",
    category:     "automazioni",
    shortDesc:    "Ogni contatto trovato, qualificato, instradato al commerciale giusto.",
    longDesc:     "Ricevi contatti da form, WhatsApp, email, Facebook, Instagram — e ne perdi metà tra il rumore. Costruiamo un flusso unico: unificazione canali, validazione automatica, score di qualità, routing intelligente al commerciale giusto in base a zona/competenza, notifiche istantanee.",
    price:        700,
    priceMax:     1400,
    unit:         "one-shot",
    deliveryDays: "5–7",
    forWho:       "Chi riceve contatti da più canali (sito, WhatsApp, email, social) e perde traccia.",
    features: [
      "Unificazione di tutti i punti di entrata in un unico flusso",
      "Validazione automatica (email valida, anti-spam)",
      "Score automatico in base ai parametri (settore, budget, urgenza)",
      "Routing intelligente al commerciale giusto",
      "Notifiche istantanee su email/Slack/Telegram",
      "Storico completo conversazioni",
    ],
    benefits: [
      "Zero lead persi",
      "Risposta al cliente più rapida",
      "I commerciali ricevono solo lead già qualificati",
    ],
    useCases: [
      "Agenzia immobiliare con 3 commerciali per zona",
      "Studio di consulenza che riceve form da 4 canali",
      "Palestra che gestisce richieste corso/abbonamento",
    ],
    related: ["crm-su-misura", "automazione-email-sequences", "manutenzione-care-plus"],
  },
  {
    slug:         "automazione-email-sequences",
    title:        "Email Sequences",
    category:     "automazioni",
    shortDesc:    "Follow-up automatico curato. Risparmi 5–10 ore a settimana.",
    longDesc:     "Sequenze email automatiche ma fatte come se le scrivessi tu. Strategia (benvenuto, onboarding, follow-up, riattivazione), copy professionale tono umano (mai noreply), segmentazione, A/B test sui soggetti, integrazione CRM con trigger su comportamento del lead.",
    price:        900,
    priceMax:     1800,
    unit:         "one-shot",
    deliveryDays: "7–10",
    forWho:       "Consulenti, agenzie, servizi che vogliono nutrire lead senza scrivere manualmente.",
    features: [
      "Strategia di sequenza (benvenuto, onboarding, follow-up, riattivazione)",
      "Copy professionale, tono umano (mai template)",
      "Segmentazione (lead caldi/freddi, comportamento)",
      "A/B test su soggetti e CTA",
      "Integrazione CRM con trigger automatici",
      "Reportistica: open rate, click rate, conversioni",
    ],
    benefits: [
      "Follow-up automatico fatto bene",
      "Risparmi 5–10 ore di lavoro a settimana",
      "Lead nutriti senza intervento manuale",
    ],
    useCases: [
      "Servizio di consulenza con ciclo di vendita lungo",
      "E-commerce che vuole recuperare carrelli abbandonati",
      "Corso/membership che vuole onboarding curato",
    ],
    related: ["crm-su-misura", "automazione-lead-routing", "copywriting"],
  },
  {
    slug:         "workflow-builder",
    title:        "Workflow Builder",
    category:     "automazioni",
    shortDesc:    "Ore restituite alla settimana. Errori azzerati.",
    longDesc:     "Audit dei processi: mappiamo cosa fate ogni giorno manualmente, calcoliamo quanto tempo costa. Identifichiamo le 3-5 automazioni con ROI più alto. Costruiamo i workflow su n8n (motore open-source, niente abbonamenti). Gestione eccezioni e fallback umani. Documentazione + formazione interna.",
    price:        2200,
    priceMax:     5000,
    unit:         "one-shot",
    deliveryDays: "14–21",
    forWho:       "Operations team che fanno ogni giorno gli stessi 10 task ripetitivi.",
    features: [
      "Audit processi attuali (mappatura + stima tempo)",
      "Identificazione delle 3–5 automazioni con ROI più alto",
      "Costruzione workflow su n8n (self-hosted, no abbonamenti)",
      "Gestione eccezioni e fallback umani",
      "Documentazione + formazione interna",
    ],
    benefits: [
      "Ore restituite ogni settimana",
      "Errori operativi azzerati",
      "Scalare senza dover assumere",
    ],
    useCases: [
      "Operations e-commerce che gestisce ordini, spedizioni, customer care",
      "Studio professionale con processi ripetitivi (contratti, fatturazione)",
      "Agenzia che fa onboarding clienti ripetitivo",
    ],
    related: ["crm-su-misura", "integrazione-tool", "manutenzione-care-pro"],
  },

  /* ─── MARKETING ────────────────────────────────────────── */
  {
    slug:         "seo-on-page",
    title:        "SEO On-Page",
    category:     "marketing",
    shortDesc:    "Apparire su Google con le ricerche giuste. Set-up tecnico completo.",
    longDesc:     "Audit SEO completo del sito esistente, ottimizzazione tecnica (Core Web Vitals, schema markup, sitemap, robots), ricerca keyword competitive sul tuo settore, ottimizzazione contenuti esistenti, setup Google Search Console + Analytics, report mensile per i primi 3 mesi.",
    price:        600,
    priceMax:     1200,
    unit:         "one-shot",
    deliveryDays: "7–10",
    forWho:       "Chi ha un sito ma riceve traffico organico zero o scarso.",
    features: [
      "Audit tecnico SEO (velocità, mobile, sicurezza)",
      "Ricerca keyword del settore + competitor analysis",
      "Ottimizzazione title, meta, headings esistenti",
      "Schema markup (JSON-LD per attività locali, prodotti, articoli)",
      "Setup Google Search Console + Analytics 4",
      "Report di posizionamento 3 mesi",
    ],
    benefits: [
      "Apparire nelle ricerche dei tuoi clienti",
      "Traffico gratuito ricorrente",
      "Indipendenza da pubblicità a pagamento",
    ],
    useCases: [
      "Sito vetrina che non riceve visite organiche",
      "E-commerce che vuole posizionarsi su keyword di prodotto",
      "Blog professionale che vuole crescere",
    ],
    related: ["sito-vetrina", "google-ads-setup", "copywriting"],
  },
  {
    slug:         "google-ads-setup",
    title:        "Google Ads · Setup",
    category:     "marketing",
    shortDesc:    "Campagne ads strutturate per portare lead reali, non vanity metrics.",
    longDesc:     "Setup di una campagna Google Ads (Search o Performance Max) costruita su obiettivi commerciali concreti: lead, vendite, prenotazioni. Ricerca keyword, struttura ad group, copy degli annunci, estensioni, conversion tracking, dashboard di monitoraggio. Non gestiamo la pubblicazione mensile (sceglierete voi se gestire internamente o con noi via Care+).",
    price:        500,
    priceMax:     1500,
    unit:         "one-shot",
    deliveryDays: "5–7",
    forWho:       "Chi vuole iniziare a investire in ads con un setup professionale.",
    features: [
      "Strategia campagna (Search / Pmax / Display)",
      "Ricerca keyword + lista negative",
      "Struttura ad group + copy annunci (3–5 varianti)",
      "Estensioni (sitelink, callout, snippet strutturati)",
      "Conversion tracking via GA4 + Google Ads",
      "Dashboard di monitoraggio",
    ],
    benefits: [
      "Setup tecnico fatto bene fin dal giorno 1",
      "Conversioni tracciate correttamente (no spreco budget)",
      "Base per scalare in futuro",
    ],
    useCases: [
      "Landing di un nuovo servizio da lanciare",
      "E-commerce che vuole testare Shopping ads",
      "Studio professionale che cerca clienti su keyword specifiche",
    ],
    related: ["landing-page", "seo-on-page", "manutenzione-care-pro"],
  },
  {
    slug:         "copywriting",
    title:        "Copywriting Professionale",
    category:     "marketing",
    shortDesc:    "Testi che convincono, scritti da umani con tono di voce sul brand.",
    longDesc:     "Copywriting per sito, landing, email, ads. AI-assistito ma sempre con revisione umana e adattamento al tone of voice del brand. Tariffa al pacchetto (tot. pagine) o all'ora per progetti complessi.",
    price:        80,
    priceMax:     150,
    unit:         "one-shot",
    deliveryDays: "su richiesta",
    forWho:       "Chi sa cosa vuole dire ma non sa come dirlo bene.",
    features: [
      "Brief approfondito sul brand e sul tono",
      "Drafts iniziali AI-assistiti + 2 round revisione",
      "Microcopy (bottoni, form, CTA)",
      "Copy SEO-friendly senza essere robotico",
    ],
    benefits: [
      "Testi che convincono davvero",
      "Tono di voce coerente su tutti i canali",
      "Risparmio tempo per chi non scrive di mestiere",
    ],
    useCases: [
      "Riscrittura completa di un sito esistente",
      "Sequenza email lancio prodotto",
      "Annunci ads + landing page coordinate",
    ],
    related: ["sito-vetrina", "landing-page", "automazione-email-sequences"],
  },

  /* ─── ABBONAMENTI / CARE ──────────────────────────────── */
  {
    slug:         "manutenzione-care-basic",
    title:        "Care Basic · Hosting Gestito",
    category:     "abbonamenti",
    shortDesc:    "Sito sempre online, sicuro, veloce. Zero pensieri.",
    longDesc:     "Hosting Vercel gestito da noi (CDN globale, SSL, backup automatici), monitoraggio uptime 24/7 con notifica se va offline, aggiornamenti di sicurezza, backup settimanali del database, supporto email entro 48h.",
    price:        29,
    unit:         "mese",
    deliveryDays: "attivo subito",
    forWho:       "Chi vuole il sito online, sicuro e veloce, senza pensieri tecnici.",
    features: [
      "Hosting Vercel gestito (CDN globale, SSL, backup)",
      "Monitoraggio uptime 24/7",
      "Aggiornamenti di sicurezza (dipendenze, framework)",
      "Backup settimanali del database",
      "Supporto email entro 48h",
    ],
    benefits: [
      "Zero downtime imprevisto",
      "Niente preoccupazioni di sicurezza",
      "Aggiornamenti tecnici curati da noi",
    ],
    useCases: [
      "Sito vetrina di una PMI senza team tecnico",
      "Studio professionale con sito istituzionale",
    ],
    related: ["sito-vetrina", "dominio-gestione", "casella-email-pro"],
  },
  {
    slug:         "manutenzione-care-plus",
    title:        "Care Plus · Hosting + Modifiche",
    category:     "abbonamenti",
    shortDesc:    "Tutto del Basic, più modifiche mensili e report SEO.",
    longDesc:     "Hosting gestito + monitoraggio uptime + aggiornamenti sicurezza + fino a 2 ore/mese di modifiche al sito (testi, immagini, sezioni) + monitoraggio SEO mensile + report analitico con suggerimenti + supporto prioritario entro 24h + 1 A/B test/mese.",
    price:        79,
    unit:         "mese",
    deliveryDays: "attivo subito",
    forWho:       "Chi pubblica contenuti o vuole un sito sempre vivo.",
    features: [
      "Tutto del Care Basic",
      "Fino a 2 ore di modifiche/mese (testi, immagini, sezioni)",
      "Monitoraggio SEO mensile (posizionamento, broken links)",
      "Report analitico mensile con insights",
      "Supporto prioritario entro 24h",
      "1 A/B test/mese (CTA, headline)",
    ],
    benefits: [
      "Sito sempre aggiornato",
      "Insight su cosa funziona e cosa no",
      "Risposta rapida quando serve",
    ],
    useCases: [
      "Sito che pubblica articoli regolarmente",
      "E-commerce con catalogo che evolve",
      "Studio che vuole aggiornare casi studio mensilmente",
    ],
    related: ["sito-vetrina", "seo-on-page", "manutenzione-care-pro"],
    featured: true,
  },
  {
    slug:         "manutenzione-care-pro",
    title:        "Care Pro · Partner Digitale",
    category:     "abbonamenti",
    shortDesc:    "Per chi cresce e vuole un partner, non un fornitore.",
    longDesc:     "Tutto del Plus, più fino a 5 ore/mese di modifiche + design tweaks, CRM gestito (pulizia dati, segmentazioni, automazioni nuove), strategy call mensile di 30 minuti con noi, supporto WhatsApp in giornata lavorativa, sviluppo features nuove a tariffa scontata (-20%).",
    price:        149,
    unit:         "mese",
    deliveryDays: "attivo subito",
    forWho:       "Business che cresce e vuole continuità nel tempo.",
    features: [
      "Tutto del Care Plus",
      "Fino a 5 ore/mese di modifiche + design tweaks",
      "CRM gestito (pulizia dati, segmentazioni, automazioni)",
      "Strategy call mensile (30 min con noi)",
      "Supporto WhatsApp in giornata lavorativa",
      "Sviluppo features nuove con sconto 20%",
    ],
    benefits: [
      "Un partner digitale dedicato",
      "Strategia evoluta nel tempo",
      "Sviluppo nuove funzionalità a costi ridotti",
    ],
    useCases: [
      "Startup in crescita",
      "E-commerce che scala",
      "Azienda con team marketing/sales attivo",
    ],
    related: ["crm-su-misura", "dashboard-custom", "automazione-email-sequences"],
  },

  /* ─── EXTRA ────────────────────────────────────────────── */
  {
    slug:         "dominio-gestione",
    title:        "Dominio · Acquisto e Gestione",
    category:     "extra",
    shortDesc:    "Compriamo, configuriamo e rinnoviamo il tuo dominio (.it, .com, .eu).",
    longDesc:     "Acquisto del dominio a tuo nome (resta tuo, non nostro), configurazione DNS, SPF, DKIM, DMARC, gestione del rinnovo. Tariffa annua include costo dominio + nostra gestione.",
    price:        15,
    priceMax:     30,
    unit:         "anno",
    deliveryDays: "1–2 giorni",
    forWho:       "Chi non vuole gestire pannelli DNS Aruba/GoDaddy/Cloudflare.",
    features: [
      "Acquisto dominio a tuo nome",
      "Setup DNS, SPF, DKIM, DMARC",
      "Gestione del rinnovo automatico",
      "Trasferimento da altri provider se necessario",
    ],
    benefits: [
      "Zero pensieri tecnici",
      "Configurazione fatta bene fin da subito",
      "Niente sorprese al rinnovo",
    ],
    useCases: [
      "Apertura nuova attività che parte da zero",
      "Trasferimento dominio da Aruba/GoDaddy a noi",
    ],
    related: ["sito-vetrina", "manutenzione-care-basic", "casella-email-pro"],
  },
  {
    slug:         "casella-email-pro",
    title:        "Caselle Email Professionali",
    category:     "extra",
    shortDesc:    "info@tuodominio.it. Configuriamo Google Workspace o alternative.",
    longDesc:     "Caselle email professionali (nome@tuodominio.it). Setup su Google Workspace, Microsoft 365 o alternative leggere (Zoho, Aruba). Configurazione di SPF/DKIM/DMARC, firma email, alias multipli, migrazione da provider esistente.",
    price:        5,
    priceMax:     12,
    unit:         "mese",
    deliveryDays: "1 giorno",
    forWho:       "Chi non vuole più scrivere 'tuonome@gmail.com' nelle email professionali.",
    features: [
      "Setup su provider scelto (Workspace, M365, Zoho, Aruba)",
      "Configurazione DNS lato email (SPF, DKIM, DMARC)",
      "Migrazione email esistenti se necessario",
      "Firma email professionale",
      "Alias e gruppi (info@, supporto@, vendite@)",
    ],
    benefits: [
      "Comunicazione professionale",
      "Migliora deliverability delle tue email",
      "Brand coerente fino alla firma",
    ],
    useCases: [
      "Studio che vuole nome.cognome@studio.it",
      "Negozio che vuole info@negozio.it e ordini@negozio.it",
    ],
    related: ["dominio-gestione", "sito-vetrina", "manutenzione-care-basic"],
  },
  {
    slug:         "google-business-setup",
    title:        "Google Business Profile Setup",
    category:     "extra",
    shortDesc:    "Apparire nelle ricerche locali Google + Maps. Setup completo.",
    longDesc:     "Configurazione del profilo Google Business da zero: dati attività, foto ottimizzate, categorie, orari, servizi, attributi. Ottimizzazione descrizione SEO-friendly. Primi 5 post per attivare l'algoritmo. Guida raccolta recensioni (script + flyer da stampare).",
    price:        150,
    unit:         "one-shot",
    deliveryDays: "2–3",
    forWho:       "Attività locali che vogliono apparire nelle ricerche Google e Maps.",
    features: [
      "Configurazione profilo completo (dati, foto, categorie, orari)",
      "Ottimizzazione descrizione SEO-friendly",
      "Primi 5 post di attivazione",
      "Guida raccolta recensioni (script + flyer)",
      "Setup proprietario condiviso per gestione futura",
    ],
    benefits: [
      "Apparire nella mappa quando cercano la tua attività",
      "Recensioni Google = nuovi clienti",
      "Più visibilità senza costi pubblicitari",
    ],
    useCases: [
      "Ristorante, bar, parrucchiere, dentista, palestra — qualsiasi attività con sede fisica",
    ],
    related: ["sito-vetrina", "seo-on-page", "manutenzione-care-plus"],
  },
  {
    slug:         "consulenza-strategica",
    title:        "Consulenza Strategica · 1h",
    category:     "extra",
    shortDesc:    "Una call di un'ora con noi. Strategia digitale, marketing, processi.",
    longDesc:     "Un'ora di call strategica con uno di noi (Lorenzo per tech/design, Tommaso per sales/operations). Ideale per chi vuole un parere esterno prima di prendere una decisione importante: scegliere un tool, ristrutturare un processo, valutare un investimento.",
    price:        90,
    unit:         "one-shot",
    deliveryDays: "entro 7 giorni",
    forWho:       "Chi ha bisogno di un parere esterno onesto prima di una decisione.",
    features: [
      "Call di 60 minuti con uno dei founder",
      "Documento sintesi con punti chiave + raccomandazioni",
      "Follow-up email entro 7 giorni",
    ],
    benefits: [
      "Parere onesto, no venditori",
      "Esperienza concreta su PMI italiane",
      "Direzione chiara prima di spendere",
    ],
    useCases: [
      "Vuoi capire se ti serve un sito vetrina o landing",
      "Stai per comprare un CRM e vuoi un secondo parere",
      "Hai un sito che non converte e vuoi capire perché",
    ],
    related: ["sito-vetrina", "seo-on-page", "crm-su-misura"],
  },
];

/* ─── Helper functions ──────────────────────────────────── */

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find(s => s.slug === slug);
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter(s => s.category === category);
}

export function getRelatedServices(slug: string): Service[] {
  const service = getServiceBySlug(slug);
  if (!service) return [];
  return service.related
    .map(relSlug => getServiceBySlug(relSlug))
    .filter((s): s is Service => Boolean(s));
}

export function formatPrice(price: number): string {
  return price.toLocaleString("it-IT");
}

/** Display price as range or single value */
export function priceLabel(s: Service): string {
  if (s.priceMax && s.priceMax !== s.price) {
    return `€${formatPrice(s.price)}–${formatPrice(s.priceMax)}`;
  }
  return `€${formatPrice(s.price)}`;
}
