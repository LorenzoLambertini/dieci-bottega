/**
 * Lavori reali di Dieci Bottega: elenco in /progetti e casi studio in /progetti/[slug].
 * Solo fatti verificabili: niente numeri o risultati che il cliente non ci ha confermato.
 */

export interface ProjectShot {
  desktop: string;
  mobile: string;
  alt: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Etichetta breve, es. "SITO VETRINA · Bologna" */
  type: string;
  /** Descrizione per l'elenco dei lavori */
  desc: string;
  tags: [string, string, string];
  image: string;
  alt: string;
  url: string;
  secondary?: { label: string; url: string };

  /* ─── Caso studio ─── */
  seoTitle: string;
  /** Meta description (110–160 caratteri) */
  description: string;
  client: string;
  sector: string;
  place: string;
  /** Servizio del listino più vicino a questo lavoro */
  service?: { label: string; href: string };
  /** Il punto di partenza */
  challenge: string[];
  /** Cosa abbiamo fatto */
  solution: string[];
  /** Cosa c'è dentro: funzioni concrete */
  features: { title: string; text: string }[];
  /** Strumenti usati (solo se certi) */
  stack?: string[];
  beforeAfter?: { before: ProjectShot; after: ProjectShot; beforeLabel: string; afterLabel: string };
}

/** Solo lavori reali, in quest'ordine. */
export const PROJECTS: Project[] = [
  {
    slug: "villa-pet-sitter",
    name: "Villa Pet Sitter",
    type: "SITO VETRINA · Bologna",
    desc: "Pet sitter professionale a Bologna. Dal vecchio sito WordPress a un sito vetrina multipagina: servizi, prezzi, attestati, recensioni, galleria, WhatsApp a un tocco.",
    tags: ["Sito Vetrina", "SEO locale", "Mobile-first"],
    image: "/lavori/villa-pet-sitter/dopo-desktop-v2.webp",
    alt: "Home page del nuovo sito di Villa Pet Sitter, pet sitter professionale a Bologna",
    url: "https://villa-pet-sitter.vercel.app",
    secondary: { label: "Il sito di prima", url: "https://villapetsitter.eu" },

    seoTitle: "Villa Pet Sitter: il nuovo sito di un pet sitter a Bologna",
    description:
      "Caso studio: da un vecchio sito WordPress a un sito vetrina chiaro per un pet sitter di Bologna, con servizi, prezzi, attestati, FAQ e WhatsApp a un tocco.",
    client: "Villa Pet Sitter",
    sector: "Servizi per animali",
    place: "Bologna",
    service: { label: "Sito Vetrina", href: "/servizi/sito-vetrina" },
    challenge: [
      "Il vecchio sito era fatto in WordPress con Elementor. La home si apriva con un grande \"Benvenuto!\" e uno spazio vuoto, il menu aveva solo tre voci (Home, Foto, Recensioni) e i servizi erano descritti in un unico blocco di testo centrato.",
      "Chi arrivava da Google o da un passaparola non trovava subito le risposte che cercava: cosa fa esattamente, quanto costa, perché fidarsi, come contattarlo dal telefono.",
    ],
    solution: [
      "Abbiamo riorganizzato tutto attorno alle domande di chi deve lasciare il proprio animale a qualcuno: servizi, prezzi, chi è il pet sitter, attestati, recensioni, galleria, domande frequenti e contatti, ognuno con la sua sezione nel menu.",
      "In apertura ci sono un titolo chiaro (\"Parti sereno. Al tuo animale ci penso io.\"), i segnali di fiducia che contano per questo lavoro (partita IVA, assicurazione, disponibilità 7 giorni su 7, foto e video durante il servizio) e due pulsanti: richiesta di preventivo e WhatsApp.",
      "Il sito è pensato prima di tutto per il telefono: numero e WhatsApp sono sempre a portata di pollice, con un messaggio già scritto per iniziare la conversazione.",
    ],
    features: [
      { title: "Menu che risponde alle domande", text: "Servizi, prezzi, chi sono, attestati, recensioni, galleria, FAQ e contatti: ogni dubbio ha la sua sezione." },
      { title: "WhatsApp a un tocco", text: "Pulsante sempre visibile con messaggio precompilato, oltre al numero di telefono in alto." },
      { title: "Segnali di fiducia in apertura", text: "Partita IVA, assicurazione, disponibilità 7/7 e aggiornamenti con foto e video, visibili subito." },
      { title: "Richiesta di preventivo", text: "Un percorso chiaro per chiedere un preventivo senza dover chiamare." },
      { title: "Privacy in regola", text: "Banner dei cookie con accetta, rifiuta e preferenze, informativa privacy e cookie policy." },
      { title: "Pensato per Bologna", text: "Testi e struttura scritti per farsi trovare da chi cerca un pet sitter in città." },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    beforeAfter: {
      before: {
        desktop: "/lavori/villa-pet-sitter/prima-desktop-v2.webp",
        mobile: "/lavori/villa-pet-sitter/prima-mobile-v2.webp",
        alt: "Home page del vecchio sito di Villa Pet Sitter (villapetsitter.eu), fatto in WordPress con Elementor",
      },
      after: {
        desktop: "/lavori/villa-pet-sitter/dopo-desktop-v2.webp",
        mobile: "/lavori/villa-pet-sitter/dopo-mobile-v2.webp",
        alt: "Home page del nuovo sito di Villa Pet Sitter, pet sitter professionale a Bologna, costruito da Dieci Bottega",
      },
      beforeLabel: "◆ PRIMA · villapetsitter.eu",
      afterLabel: "◆ DOPO · il nuovo sito",
    },
  },
  {
    slug: "virtus-bologna-welcome-kit",
    name: "Virtus Bologna",
    type: "WEB APP · Basket EuroLeague",
    desc: "Welcome Kit per i nuovi giocatori della stagione 2026/27. Una web app in quattro lingue con tutto quello che serve per ambientarsi a Bologna.",
    tags: ["Web App", "Multilingua", "PWA-ready"],
    image: "/lavori/virtus-welcome-kit/desktop-v2.webp",
    alt: "Home della web app Welcome Kit di Virtus Bologna per i nuovi giocatori",
    url: "https://virtus-welcome-kit.vercel.app",

    seoTitle: "Virtus Bologna: la web app Welcome Kit per i giocatori",
    description:
      "Caso studio: il Welcome Kit di Virtus Bologna trasformato in una web app multilingua per i nuovi giocatori: città, cibo, trasporti, trasferte, calendario e contatti.",
    client: "Virtus Bologna",
    sector: "Sport · Basket EuroLeague",
    place: "Bologna",
    challenge: [
      "Ogni stagione arrivano a Bologna giocatori e staff da tutto il mondo. Le informazioni per ambientarsi (dove vivere, dove mangiare, come muoversi, contatti utili, convenzioni con i partner) erano raccolte in un documento PDF.",
      "Un PDF si legge male dal telefono, non si aggiorna facilmente e non cambia lingua: il contrario di quello che serve a chi è appena arrivato in una città nuova.",
    ],
    solution: [
      "Abbiamo trasformato il Welcome Kit in una web app che si apre dal telefono come un'applicazione, senza passare dagli store.",
      "I contenuti sono divisi per bisogno: la città, il cibo, come muoversi, le cose da sapere, le trasferte, il calendario, gli sponsor e le convenzioni dei partner, i palazzetti, i contatti dello staff.",
      "Al primo accesso si sceglie la lingua: l'app è in quattro lingue (italiano, inglese, spagnolo e francese) e ogni sezione ha mappe e collegamenti diretti per arrivare a destinazione.",
    ],
    features: [
      { title: "Quattro lingue", text: "Selettore lingua IT, EN, ES, FR al primo accesso e nelle impostazioni." },
      { title: "Tutto dal telefono", text: "Web app pensata per il telefono, da aggiungere alla schermata home come un'app." },
      { title: "Sezioni per bisogno", text: "City, Food, Getting around, Things to know, Away trips, Calendar, Sponsors, Contacts, Partner deals, Arenas." },
      { title: "Mappe e indicazioni", text: "Per ogni luogo: mappa, apertura in Maps e come arrivarci in auto, a piedi, in autobus o in treno." },
      { title: "Convenzioni dei partner", text: "Le agevolazioni riservate ai giocatori raccolte in un'unica sezione." },
      { title: "Contatti dello staff", text: "Un pulsante diretto per scrivere o chiamare le persone giuste." },
    ],
    stack: ["HTML", "JavaScript", "Multilingua (JSON)", "Vercel"],
  },
  {
    slug: "lambo-dj",
    name: "LAMBO",
    type: "PORTFOLIO · DJ",
    desc: "Portfolio per Giulio Lambertini, DJ house e tech house: sound, gallery, set su SoundCloud e booking diretto.",
    tags: ["Portfolio", "Musica", "One-page"],
    image: "/lavori/lambo/desktop-v2.webp",
    alt: "Home del portfolio di LAMBO, DJ house e tech house",
    url: "https://djlambogiulio.vercel.app",

    seoTitle: "LAMBO: il portfolio one-page di un DJ house e tech house",
    description:
      "Caso studio: il portfolio one-page di LAMBO, DJ house e tech house, con gallery, set su SoundCloud, date live e richiesta di booking diretta.",
    client: "Giulio Lambertini (LAMBO)",
    sector: "Musica · DJ",
    place: "Milano",
    service: { label: "Landing Page", href: "/servizi/landing-page" },
    challenge: [
      "Per un DJ il sito è il biglietto da visita per locali, agenzie e organizzatori di eventi: deve far capire in pochi secondi che musica suona, far ascoltare un set e rendere facile la richiesta di una data.",
      "Senza un sito proprio, tutto resta sparso tra profili social e piattaforme musicali, e manca un unico indirizzo da mandare a chi organizza.",
    ],
    solution: [
      "Abbiamo costruito una pagina unica con un'identità forte: fondo scuro, rosso, tipografia grande e una forma d'onda audio che richiama il mondo della consolle.",
      "Il percorso è quello che segue chi deve prenotare un DJ: chi è, le foto, il suono, le date live e il booking, tutto raggiungibile dal menu in alto.",
    ],
    features: [
      { title: "Generi in evidenza", text: "House, tech house, deep e afro dichiarati subito, in apertura." },
      { title: "Set da ascoltare", text: "I set su SoundCloud incorporati nella pagina, senza dover uscire dal sito." },
      { title: "Gallery", text: "Foto dalle serate per far capire atmosfera e tipo di locali." },
      { title: "Live", text: "Una sezione per le date e le serate." },
      { title: "Booking diretto", text: "Contatto immediato per organizzatori e locali." },
      { title: "Una pagina sola", text: "Tutto in un unico indirizzo da mettere nella bio e mandare a chi organizza." },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
