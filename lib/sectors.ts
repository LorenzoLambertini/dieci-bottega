/**
 * Pagine per settore (/settori/[slug]): cosa serve al sito di ogni tipo di attività,
 * pacchetto consigliato, domande frequenti e collegamenti a blog, servizi e casi studio.
 * Prezzi e tempi devono restare allineati al listino (lib/services.ts e pacchetti).
 */

export interface Sector {
  slug: string;
  /** Nome al plurale, minuscolo: "ristoranti" */
  name: string;
  /** Titolo H1 */
  title: string;
  /** Title tag (max ~60 caratteri) */
  seoTitle: string;
  /** Meta description (110–160 caratteri) */
  description: string;
  /** Sigla per la card (1–4 caratteri) */
  glyph: string;
  intro: string;
  /** Il problema tipico del settore */
  problem: string;
  /** Cosa deve avere il sito */
  needs: { title: string; text: string }[];
  plan: { name: string; price: string; time: string; why: string; href: string };
  faq: { q: string; a: string }[];
  /** Slug di articoli del blog collegati */
  posts: string[];
  /** Slug di un caso studio collegato */
  caseStudy?: string;
  /** Mostra i concept prima/dopo dei locali (/concept) */
  concepts?: boolean;
  /** Messaggio WhatsApp precompilato */
  whatsapp: string;
}

const BASIC = { name: "BASIC", price: "800–1.000€", time: "circa 7 giorni", href: "/servizi/landing-page" };
const PRO = { name: "PRO", price: "1.500–2.000€", time: "10–14 giorni", href: "/servizi/sito-vetrina" };
const PREMIUM = { name: "PREMIUM", price: "2.500–3.500€", time: "3–4 settimane", href: "/inizia-progetto" };

export const SECTORS: Sector[] = [
  {
    slug: "ristoranti",
    name: "ristoranti",
    title: "Sito web per ristoranti, pizzerie e bar a Bologna",
    seoTitle: "Sito web per ristoranti a Bologna | Dieci Bottega",
    description:
      "Siti web per ristoranti, pizzerie e bar a Bologna: menù leggibile da telefono, prenotazioni, orari e mappa sempre aggiornati. Online in circa dieci giorni.",
    glyph: "MENU",
    intro: "Chi cerca dove mangiare decide in pochi secondi, quasi sempre dal telefono. Il sito deve mostrare subito il menù, gli orari, dove sei e come prenotare.",
    problem: "Il problema più comune è il menù in PDF o in foto: da telefono va ingrandito, non si legge e Google non lo capisce. Poi orari diversi tra sito e scheda Google, e nessun modo semplice per prenotare.",
    needs: [
      { title: "Menù in pagina, non in PDF", text: "Piatti e prezzi leggibili dal telefono e facili da aggiornare quando cambia la stagione." },
      { title: "Prenota in un tocco", text: "Telefono, WhatsApp o il sistema di prenotazione che usi già, sempre visibili." },
      { title: "Orari e mappa", text: "Gli stessi orari della scheda Google, con giorni di chiusura e indicazioni per arrivare." },
      { title: "Foto vere", text: "Piatti, sala e dehors: le persone scelgono con gli occhi." },
      { title: "Allergeni e richieste speciali", text: "Informazioni chiare su allergeni, opzioni vegetariane e senza glutine." },
      { title: "Eventi e menù speciali", text: "Una sezione per serate, menù delle feste e degustazioni." },
    ],
    plan: { ...PRO, why: "Una pagina per il menù, una per la sala e gli eventi, contatti e prenotazione: è il pacchetto che serve alla maggior parte dei locali." },
    faq: [
      { q: "Quanto costa un sito per un ristorante?", a: "Indicativamente 800–1.000€ per una pagina sola con menù e contatti, 1.500–2.000€ per un sito con più pagine, eventi e prenotazioni." },
      { q: "Posso aggiornare il menù da solo?", a: "Sì: il menù può essere modificabile da te, oppure aggiornato da noi con un piano di manutenzione." },
      { q: "Il sito si collega al sistema di prenotazione che uso già?", a: "Nella maggior parte dei casi sì: inseriamo il pulsante o il widget del servizio che usi, oppure WhatsApp." },
    ],
    posts: ["sito-web-ristorante", "google-business-profile-guida", "come-ottenere-recensioni-google"],
    concepts: true,
    whatsapp: "Ciao Dieci Bottega, ho un ristorante e vorrei informazioni per un sito",
  },
  {
    slug: "bb-case-vacanza",
    name: "B&B e case vacanza",
    title: "Sito web per B&B e case vacanza a Bologna",
    seoTitle: "Sito web per B&B e case vacanza | Dieci Bottega",
    description:
      "Siti web per B&B, affittacamere e case vacanza: foto, disponibilità, prenotazioni dirette senza commissioni e collegamento al channel manager che usi.",
    glyph: "B&B",
    intro: "Booking e Airbnb ti fanno trovare la prima volta. Il tuo sito serve a far tornare gli ospiti e a ricevere prenotazioni dirette, senza commissioni.",
    problem: "Senza un sito proprio ogni prenotazione passa da un portale e paga la commissione, e chi è stato bene da te non ha un modo semplice per riprenotare direttamente.",
    needs: [
      { title: "Foto grandi di ogni camera", text: "Camere, bagni, colazione e spazi comuni, con una pagina per ogni alloggio." },
      { title: "Disponibilità e prezzi", text: "Booking engine collegato al channel manager, oppure calendario e richiesta su WhatsApp." },
      { title: "Più lingue", text: "Almeno l'inglese, con traduzioni curate e non automatiche." },
      { title: "Posizione e come arrivare", text: "Mappa, distanze a piedi, parcheggio, stazione e aeroporto." },
      { title: "Regole chiare", text: "Check-in, tassa di soggiorno, cancellazione, animali: scritte semplici." },
      { title: "CIN in evidenza", text: "Il codice identificativo nazionale riportato anche sul sito." },
    ],
    plan: { ...PRO, why: "Pagine per le camere, la zona e più lingue. Con booking engine e pagamenti online si passa al PREMIUM (2.500–3.500€)." },
    faq: [
      { q: "Il sito può prendere prenotazioni dirette?", a: "Sì, con il booking engine del tuo channel manager o con una richiesta guidata su WhatsApp per le strutture più piccole." },
      { q: "Quanto si risparmia con le prenotazioni dirette?", a: "La commissione del portale, che su Booking in genere è tra il 15 e il 18% del soggiorno, meno il costo del pagamento online." },
      { q: "Serve il sito anche se sono già su Booking?", a: "Sì: i portali portano il primo contatto, il sito ti permette di tenerti gli ospiti che tornano e il passaparola." },
    ],
    posts: ["sito-web-bb-case-vacanza", "google-business-profile-guida", "come-ottenere-recensioni-google"],
    whatsapp: "Ciao Dieci Bottega, ho un B&B / casa vacanza e vorrei informazioni per un sito",
  },
  {
    slug: "studi-professionali",
    name: "studi professionali",
    title: "Sito web per studi professionali a Bologna: avvocati, commercialisti, dentisti",
    seoTitle: "Sito web per studi professionali a Bologna",
    description:
      "Siti web per avvocati, commercialisti, dentisti e consulenti a Bologna: testi chiari, una pagina per ogni area di attività e comunicazione nel rispetto del tuo ordine.",
    glyph: "§",
    intro: "Anche chi ti arriva per passaparola cerca il tuo nome su Google prima di chiamare. Il sito deve trasmettere serietà e rendere semplice il primo contatto.",
    problem: "Molti siti di studi sono fermi da anni: foto di repertorio, testi tecnici che il cliente non capisce e nessun modo chiaro per fissare una prima consulenza.",
    needs: [
      { title: "Chi siamo con foto vere", text: "Professionisti, studio, percorso e iscrizione all'ordine." },
      { title: "Una pagina per ogni area", text: "Scritta per chi ha quel problema: è anche il modo migliore per farsi trovare su Google." },
      { title: "Come lavoriamo", text: "Primo incontro, documenti da portare, come si definiscono i compensi." },
      { title: "Domande frequenti", text: "Le domande che ricevi ogni settimana, con risposte brevi." },
      { title: "Comunicazione corretta", text: "Testi informativi e sobri, nel rispetto del codice deontologico." },
      { title: "Contatti e privacy", text: "Modulo con i soli dati necessari e informativa chiara." },
    ],
    plan: { ...PRO, why: "Una pagina per ogni area di attività, FAQ e contatti: lo spazio giusto per spiegare cosa fai senza diventare complicati." },
    faq: [
      { q: "Un avvocato può farsi pubblicità sul sito?", a: "Sì, con una comunicazione informativa, corretta e verificabile, senza superlativi né promesse di risultato." },
      { q: "Quanto costa il sito di uno studio?", a: "Indicativamente 1.500–2.000€ per un sito vetrina con una pagina per ogni area di attività, pronto in 10–14 giorni." },
      { q: "Scrivete voi i testi?", a: "Sì, li prepariamo noi partendo da un'intervista, e li rivedi tu prima della pubblicazione." },
    ],
    posts: ["sito-web-studio-professionale", "seo-locale-bologna", "dominio-email-professionale"],
    whatsapp: "Ciao Dieci Bottega, ho uno studio professionale e vorrei informazioni per un sito",
  },
  {
    slug: "palestre",
    name: "palestre e centri sportivi",
    title: "Sito web per palestre, studi di pilates e centri sportivi a Bologna",
    seoTitle: "Sito web per palestre e centri sportivi a Bologna",
    description:
      "Siti web per palestre, box, studi di pilates e yoga a Bologna: orari dei corsi, prezzi degli abbonamenti, istruttori e richiesta di lezione di prova.",
    glyph: "GYM",
    intro: "Chi cerca una palestra confronta tre cose: dove sei, che corsi fai e quanto costa. Il sito deve rispondere subito e portare alla lezione di prova.",
    problem: "Spesso gli orari dei corsi sono solo in una storia di Instagram o in una foto della bacheca, e i prezzi non si trovano: le persone scrivono, aspettano e intanto provano altrove.",
    needs: [
      { title: "Orari dei corsi", text: "Un calendario chiaro, leggibile da telefono e facile da aggiornare." },
      { title: "Abbonamenti e prezzi", text: "Anche solo indicativi: chi trova il prezzo si fida di più." },
      { title: "Lezione di prova", text: "Un modulo o un WhatsApp per prenotarla in pochi secondi." },
      { title: "Istruttori", text: "Volti, qualifiche e specialità di chi insegna." },
      { title: "Spazi e attrezzature", text: "Foto vere di sale, spogliatoi e attrezzi." },
      { title: "Contatti da CRM", text: "Le richieste di prova arrivano in un unico posto, con promemoria per ricontattare." },
    ],
    plan: { ...PRO, why: "Pagine per corsi, orari, abbonamenti e istruttori, con la richiesta di prova collegata ai tuoi contatti." },
    faq: [
      { q: "Si può prenotare la lezione di prova dal sito?", a: "Sì, con un modulo o un messaggio WhatsApp già scritto; le richieste possono arrivare direttamente nel CRM." },
      { q: "Posso aggiornare gli orari dei corsi da solo?", a: "Sì, l'orario può essere modificabile da te, oppure lo aggiorniamo noi con un piano di manutenzione." },
      { q: "Quanto costa il sito di una palestra?", a: "Indicativamente 1.500–2.000€ per un sito con corsi, orari, abbonamenti e istruttori, pronto in 10–14 giorni." },
    ],
    posts: ["errori-sito-web-perdere-clienti", "instagram-o-sito-web", "crm-piccole-imprese"],
    whatsapp: "Ciao Dieci Bottega, ho una palestra / centro sportivo e vorrei informazioni per un sito",
  },
  {
    slug: "estetiste-parrucchieri",
    name: "centri estetici e parrucchieri",
    title: "Sito web per centri estetici, parrucchieri e barbieri a Bologna",
    seoTitle: "Sito web per estetiste e parrucchieri a Bologna",
    description:
      "Siti web per centri estetici, parrucchieri e barbieri a Bologna: listino dei trattamenti, prenotazione semplice, foto dei lavori e collegamento con Instagram.",
    glyph: "LOOK",
    intro: "Le clienti ti scoprono su Instagram, ma prima di prenotare vogliono sapere trattamenti, prezzi e disponibilità. Il sito mette tutto in ordine.",
    problem: "Il listino è spesso in un'immagine o nelle storie in evidenza, e le prenotazioni arrivano in DM a qualsiasi ora: si perdono messaggi e si risponde sempre alle stesse domande.",
    needs: [
      { title: "Listino trattamenti", text: "Viso, corpo, mani, capelli: con durata e prezzo indicativo." },
      { title: "Prenotazione semplice", text: "Il sistema che usi già, oppure WhatsApp con il trattamento già scritto nel messaggio." },
      { title: "Foto dei lavori", text: "Una galleria curata, con il consenso delle clienti." },
      { title: "Collegamento a Instagram", text: "Il profilo porta al sito, il sito porta al profilo." },
      { title: "Prodotti che usi", text: "Marchi e linee: per molte clienti è un motivo di scelta." },
      { title: "Risposte automatiche", text: "Per le domande ripetitive nei DM, con una persona sempre pronta a subentrare." },
    ],
    plan: { ...BASIC, why: "Per iniziare basta una pagina con listino, foto e prenotazione. Con più servizi e pagine dedicate si passa al PRO (1.500–2.000€)." },
    faq: [
      { q: "Mi serve un sito se lavoro già bene con Instagram?", a: "Instagram tiene il contatto con chi ti segue; il sito ti fa trovare su Google da chi cerca un trattamento in zona." },
      { q: "Si possono prenotare i trattamenti dal sito?", a: "Sì, con il gestionale di prenotazione che usi o con un messaggio WhatsApp già compilato." },
      { q: "Quanto costa?", a: "Indicativamente 800–1.000€ per una pagina con listino e prenotazione, 1.500–2.000€ per un sito completo." },
    ],
    posts: ["instagram-o-sito-web", "risposte-automatiche-instagram-ai", "come-ottenere-recensioni-google"],
    whatsapp: "Ciao Dieci Bottega, ho un centro estetico / salone e vorrei informazioni per un sito",
  },
  {
    slug: "artigiani-imprese-edili",
    name: "artigiani e imprese edili",
    title: "Sito web per artigiani, idraulici, elettricisti e imprese edili a Bologna",
    seoTitle: "Sito web per artigiani e imprese edili a Bologna",
    description:
      "Siti web per idraulici, elettricisti, imbianchini e imprese edili a Bologna: lavori realizzati, zone servite e richiesta di preventivo anche con foto su WhatsApp.",
    glyph: "TOOL",
    intro: "Chi ha un guasto cerca su Google e chiama il primo che sembra serio e vicino. Il sito deve far vedere i tuoi lavori e farti chiamare subito.",
    problem: "Molti artigiani lavorano solo col passaparola, ma i clienti nuovi controllano comunque online: senza un sito o con una pagina vuota, chiamano un concorrente.",
    needs: [
      { title: "Lavori realizzati", text: "Foto prima e dopo, con il tipo di intervento e la zona." },
      { title: "Zone servite", text: "Bologna e comuni vicini, scritti chiaramente: aiuta anche su Google." },
      { title: "Preventivo con foto", text: "WhatsApp già pronto per mandare una foto del problema." },
      { title: "Chiamata in un tocco", text: "Numero sempre visibile da telefono, anche per le urgenze." },
      { title: "Certificazioni", text: "Abilitazioni, assicurazione e garanzie: sono la prova della tua serietà." },
      { title: "Una pagina per servizio", text: "Caldaie, bagni, impianti elettrici: ognuno con la sua pagina." },
    ],
    plan: { ...PRO, why: "Una pagina per ogni servizio e per le zone in cui lavori: è la struttura che funziona meglio per farsi trovare su Google in zona." },
    faq: [
      { q: "Mi conviene il sito se lavoro già col passaparola?", a: "Sì: anche chi arriva per passaparola controlla online, e il sito ti fa trovare da chi cerca il tuo servizio in zona." },
      { q: "I clienti possono mandarmi le foto del problema?", a: "Sì, con un pulsante WhatsApp che apre un messaggio già scritto a cui allegare le foto." },
      { q: "Quanto costa il sito di un artigiano?", a: "Indicativamente 800–1.000€ per una pagina con lavori e contatti, 1.500–2.000€ con una pagina per ogni servizio." },
    ],
    posts: ["seo-locale-bologna", "google-business-profile-guida", "preventivi-online-accettazione"],
    whatsapp: "Ciao Dieci Bottega, sono un artigiano / impresa e vorrei informazioni per un sito",
  },
  {
    slug: "negozi",
    name: "negozi",
    title: "Sito web per negozi e botteghe a Bologna",
    seoTitle: "Sito web per negozi e botteghe a Bologna",
    description:
      "Siti web per negozi e botteghe di Bologna: prodotti in vetrina, orari, come arrivare e, se serve, un piccolo e-commerce con ritiro in negozio.",
    glyph: "SHOP",
    intro: "Prima di uscire di casa, sempre più persone controllano online se il negozio ha quello che cercano e se è aperto. Il sito porta gente in negozio.",
    problem: "Senza un sito, chi cerca un prodotto in zona trova solo le grandi catene o gli store online, anche quando il tuo negozio è a due passi.",
    needs: [
      { title: "Vetrina dei prodotti", text: "Categorie e prodotti principali, con foto vere e prezzi se vuoi." },
      { title: "Orari e come arrivare", text: "Allineati alla scheda Google, con mappa e parcheggi." },
      { title: "Chiedi disponibilità", text: "Un WhatsApp per sapere se un prodotto c'è prima di passare." },
      { title: "Novità e promozioni", text: "Una sezione semplice da aggiornare, da collegare ai social." },
      { title: "Vendita online, se serve", text: "Un e-commerce leggero con ritiro in negozio o spedizione." },
      { title: "La tua storia", text: "Chi sei e perché comprare da te: è quello che le catene non hanno." },
    ],
    plan: { ...BASIC, why: "Per farsi trovare basta una pagina con prodotti, orari e contatti. Per vendere online c'è l'E-commerce Light, da 1.800€." },
    faq: [
      { q: "Serve un e-commerce o basta un sito vetrina?", a: "Se vuoi soprattutto portare persone in negozio basta un sito vetrina; l'e-commerce conviene se puoi spedire o vendere online con continuità." },
      { q: "Quanto costa un piccolo e-commerce?", a: "Il nostro E-commerce Light parte da 1.800€ (fino a circa 3.200€) e si consegna in circa due settimane." },
      { q: "Posso aggiornare i prodotti da solo?", a: "Sì, i prodotti possono essere modificabili da te, oppure li aggiorniamo noi con un piano di manutenzione." },
    ],
    posts: ["google-business-profile-guida", "instagram-o-sito-web", "quanto-costa-un-sito-web"],
    whatsapp: "Ciao Dieci Bottega, ho un negozio e vorrei informazioni per un sito",
  },
  {
    slug: "agenzie-immobiliari",
    name: "agenzie immobiliari",
    title: "Sito web per agenzie immobiliari a Bologna",
    seoTitle: "Sito web per agenzie immobiliari a Bologna",
    description:
      "Siti web per agenzie immobiliari di Bologna: annunci con schede chiare, richiesta di valutazione dell'immobile, zone in cui lavorate e contatti che arrivano nel CRM.",
    glyph: "CASA",
    intro: "I portali portano chi cerca casa. Il sito dell'agenzia serve soprattutto a conquistare chi vende: è lì che si decide a chi affidare l'immobile.",
    problem: "Molti siti di agenzie ripetono gli annunci dei portali e basta. Manca quello che convince un proprietario: chi siete, in che zone lavorate e come valutate una casa.",
    needs: [
      { title: "Richiesta di valutazione", text: "Un modulo semplice per chi vuole vendere o affittare: è il contatto più prezioso." },
      { title: "Annunci chiari", text: "Schede con foto grandi, dati essenziali, planimetria e mappa." },
      { title: "Zone in cui lavorate", text: "Una pagina per quartiere o comune, con contenuti veri." },
      { title: "Il team", text: "Volti e ruoli: chi vende casa vuole sapere con chi parlerà." },
      { title: "Contatti nel CRM", text: "Richieste di visita e valutazioni in un unico posto, con promemoria." },
      { title: "Collegamento al gestionale", text: "Se il gestionale che usate lo permette, gli annunci si aggiornano da lì." },
    ],
    plan: { ...PREMIUM, why: "Annunci, pagine per le zone, richiesta di valutazione e contatti collegati al CRM: un progetto più ampio, che definiamo insieme." },
    faq: [
      { q: "Il sito può mostrare gli annunci del nostro gestionale?", a: "Spesso sì, se il gestionale offre un'esportazione degli annunci; lo verifichiamo prima di iniziare." },
      { q: "Perché un sito se siamo già sui portali?", a: "I portali servono a chi compra; il sito serve a convincere chi vende ad affidarvi l'immobile, con la richiesta di valutazione." },
      { q: "Quanto costa il sito di un'agenzia immobiliare?", a: "Indicativamente 2.500–3.500€ con annunci, pagine per le zone e richiesta di valutazione, in 3–4 settimane." },
    ],
    posts: ["seo-locale-bologna", "crm-piccole-imprese", "preventivi-online-accettazione"],
    whatsapp: "Ciao Dieci Bottega, abbiamo un'agenzia immobiliare e vorremmo informazioni per un sito",
  },
  {
    slug: "pet-sitter-servizi-animali",
    name: "pet sitter e servizi per animali",
    title: "Sito web per pet sitter, dog sitter e servizi per animali a Bologna",
    seoTitle: "Sito web per pet sitter e servizi per animali",
    description:
      "Siti web per pet sitter, dog sitter, toelettature ed educatori cinofili a Bologna: servizi, prezzi, attestati, recensioni e WhatsApp a un tocco.",
    glyph: "PET",
    intro: "Chi lascia il proprio animale a qualcuno cerca soprattutto fiducia. Il sito deve far vedere chi sei, come lavori e quanto costa, e farti scrivere subito.",
    problem: "È il caso di Villa Pet Sitter: un vecchio sito con poche voci di menu e un lungo testo, dove servizi, prezzi e contatti non si trovavano al primo colpo.",
    needs: [
      { title: "Servizi e prezzi", text: "Pensione, visite a domicilio, passeggiate: ognuno con il suo prezzo indicativo." },
      { title: "Segnali di fiducia", text: "Partita IVA, assicurazione, attestati e corsi, ben visibili." },
      { title: "Recensioni e galleria", text: "Foto degli animali seguiti e parole di chi ti ha già scelto." },
      { title: "WhatsApp a un tocco", text: "Con un messaggio già scritto per chiedere disponibilità." },
      { title: "Domande frequenti", text: "Vaccini, chiavi di casa, aggiornamenti durante il servizio." },
      { title: "Zone servite", text: "I quartieri e i comuni in cui lavori, scritti chiaramente." },
    ],
    plan: { ...PRO, why: "Servizi, prezzi, attestati, recensioni, galleria e FAQ: la stessa struttura del sito di Villa Pet Sitter." },
    faq: [
      { q: "Cosa deve avere il sito di un pet sitter?", a: "Servizi e prezzi chiari, attestati e assicurazione, recensioni, foto e un modo immediato per scrivere, come WhatsApp." },
      { q: "Quanto costa?", a: "Indicativamente 800–1.000€ per una pagina sola, 1.500–2.000€ per un sito come quello di Villa Pet Sitter." },
      { q: "Posso vedere un esempio?", a: "Sì: nel caso studio di Villa Pet Sitter trovi il sito di prima, quello nuovo e cosa abbiamo cambiato." },
    ],
    posts: ["errori-sito-web-perdere-clienti", "come-ottenere-recensioni-google", "seo-locale-bologna"],
    caseStudy: "villa-pet-sitter",
    whatsapp: "Ciao Dieci Bottega, sono un pet sitter / servizi per animali e vorrei informazioni per un sito",
  },
];

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
