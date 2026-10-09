/**
 * Concept redesign: casi studio "non commissionati" su attività di fantasia (/concept).
 * Sorgenti dei siti demo in concept-redesign/, pubblicati con `npm run concept:demos`.
 * Le metriche arrivano solo da misure Lighthouse vere (lib/concept-metrics.ts).
 */

export const CONCEPT_DISCLAIMER = "Concept non commissionato. Attività di fantasia, nessun rapporto con locali reali.";

export interface Concept {
  slug: string;
  name: string;
  /** Etichetta breve */
  type: string;
  /** Una frase per card e meta */
  pitch: string;
  seoTitle: string;
  description: string;
  /** L'elemento interattivo chiave del "dopo" */
  keyFeature: string;
  /** Il punto di partenza: cosa non funziona nel "prima", in modo tecnico e oggettivo */
  problems: string[];
  /** Le scelte fatte nel "dopo" e perché */
  choices: { title: string; why: string }[];
  /** Testo sul "prima" quando non è un sito (es. pizzeria senza sito) */
  primaLabel: string;
  /** Messaggio WhatsApp per chi vuole un lavoro simile */
  whatsapp: string;
}

export const CONCEPTS: Concept[] = [
  {
    slug: "lantern-pub",
    name: "The Lantern Pub",
    type: "PUB · Bologna",
    pitch: "Un pub con le spine che cambiano ogni settimana e un sito fermo al menu in PDF del 2022.",
    seoTitle: "Concept: il sito di un pub rifatto da Dieci Bottega",
    description:
      "Concept redesign del sito di un pub di fantasia a Bologna: lavagna delle spine filtrabile, stato aperto ora e prenotazione del tavolo su WhatsApp.",
    keyFeature: "La lavagna delle spine, filtrabile per stile",
    primaLabel: "Il sito di prima",
    problems: [
      "Il menu è solo un PDF datato 2022, con un nome file da cartella di lavoro.",
      "Nessun orario, nessun telefono: il pulsante \"Contattaci per prenotare\" porta solo all'indirizzo.",
      "Otto voci di menu con doppioni (\"Il nostro Menu\" e \"Our menu\") e parole attaccate come \"Lebirreallaspina\".",
      "Quattro famiglie di caratteri Google e diciassette pesi caricati a ogni visita, per un sito che ne usa pochi.",
      "Foto da 2.400–3.000 pixel caricate anche da telefono, senza testo alternativo e deformate nella galleria.",
      "Gli eventi esistono solo su Facebook; il link \"Vai al contenuto\" è nascosto anche a chi naviga da tastiera.",
    ],
    choices: [
      { title: "Lavagna delle spine", why: "È la prima domanda di chi sceglie un pub: cosa c'è alla spina stasera. Lista breve, filtro per chiare, ambrate e scure, aggiornabile dal banco." },
      { title: "\"Aperto ora\" in apertura", why: "Lo stato si calcola dagli orari della settimana, con il giorno di oggi evidenziato. Niente telefonate per sapere se è aperto." },
      { title: "Prenotazione su WhatsApp", why: "Giorno, ora, persone e posto (dentro, dehors o vicino al maxischermo): si apre WhatsApp con il messaggio già scritto." },
      { title: "Barra rapida da telefono", why: "Chiama, WhatsApp e Prenota sempre a portata di pollice, nascosta da computer." },
      { title: "Dati per Google", why: "Scheda strutturata da pub con indirizzo, orari e prenotazioni, così le informazioni arrivano giuste anche su Maps e nelle risposte delle AI." },
    ],
    whatsapp: "Ciao Dieci Bottega, ho visto il concept del pub e vorrei qualcosa di simile per il mio locale",
  },
  {
    slug: "pizzeria-brace",
    name: "Pizzeria Brace",
    type: "PIZZERIA · Bologna",
    pitch: "Una pizzeria con buone recensioni ma senza sito: asporto solo al telefono, sempre occupato.",
    seoTitle: "Concept: asporto online per una pizzeria, da Dieci Bottega",
    description:
      "Concept redesign per una pizzeria di fantasia senza sito: menu online, comanda d'asporto con totale e orario di ritiro, ordine inviato su WhatsApp.",
    keyFeature: "La comanda d'asporto, con totale e orario di ritiro",
    primaLabel: "La presenza online di prima (scheda Maps e Instagram)",
    problems: [
      "Nessun sito: nella scheda Google i pulsanti \"Sito web\" e \"Menu\" sono spenti.",
      "Il menu esiste solo nelle foto caricate dai clienti, risalenti al 2022.",
      "Google segnala \"Gli orari potrebbero essere cambiati\": nessuno li ha mai confermati.",
      "Ordini e prenotazioni solo al telefono; due recensioni recenti parlano di linea sempre occupata e asporto incerto.",
      "Su Instagram la bio promette un link che non c'è e l'ultimo post è di oltre due anni fa.",
    ],
    choices: [
      { title: "Comanda d'asporto", why: "Si aggiungono le pizze dal menu, il totale si calcola da solo, si sceglie l'orario di ritiro ogni 15 minuti e l'ordine parte su WhatsApp già scritto." },
      { title: "Come si ordina, in tre passi", why: "Scegli, scegli l'orario, invia. Toglie i dubbi prima che diventino telefonate." },
      { title: "Menu vero, con le informazioni che servono", why: "Prezzi, ingredienti, piatti vegetariani e vegani segnalati, impasto integrale e senza glutine spiegati in una riga." },
      { title: "Riepilogo sempre visibile", why: "Da telefono una barra mostra articoli e totale mentre si scorre il menu." },
      { title: "Orari certi in apertura", why: "Apertura, giorno di chiusura e fine dell'asporto scritti subito, uguali alla scheda Google." },
    ],
    whatsapp: "Ciao Dieci Bottega, ho visto il concept della pizzeria e vorrei l'asporto online anche per il mio locale",
  },
  {
    slug: "trattoria-portico",
    name: "Trattoria del Portico",
    type: "TRATTORIA · Bologna",
    pitch: "Una trattoria storica sotto i portici, con un sito da modello mai finito.",
    seoTitle: "Concept: il sito di una trattoria bolognese rifatto",
    description:
      "Concept redesign del sito di una trattoria bolognese di fantasia: archi del portico in parallax, menu del giorno e prenotazione di pranzo o cena.",
    keyFeature: "Gli archi del portico in parallax e il menu di oggi",
    primaLabel: "Il sito di prima",
    problems: [
      "Il modello non è mai stato completato: testi \"Lorem ipsum\", pulsanti chiamati \"Button\" e piatti come \"Sands of Time\".",
      "La pagina si dichiara in inglese e si intitola solo \"Home\": per Google e per i lettori di schermo non ha un nome.",
      "La sezione recensioni è vuota e il pulsante \"Vai al Menù\" non porta da nessuna parte.",
      "Si prenota solo al telefono, con un numero segnaposto.",
      "Foto da 2.000–2.400 pixel usate come sfondi, senza testo alternativo; in fondo resta \"Made with ♥ by Website Builder\".",
    ],
    choices: [
      { title: "Gli archi del portico", why: "Due file di archi disegnati, che scorrono a velocità diverse: si riconosce Bologna senza bisogno di una foto. Si fermano per chi ha chiesto meno movimento." },
      { title: "Oggi in cucina", why: "Il menu del giorno con data, prezzi e due righe su ogni piatto. È il motivo per cui si torna a pranzo." },
      { title: "Prenotazione pranzo o cena", why: "Si sceglie il servizio, l'orario tra quelli possibili, giorno e persone: la richiesta parte su WhatsApp." },
      { title: "Storia e recensioni vere", why: "Tre generazioni, la pasta tirata ogni mattina e recensioni con la fonte: la fiducia passa da qui." },
      { title: "Orari e indirizzo chiari", why: "Una tabella con i servizi del giorno e l'indirizzo \"sotto il portico\", con la mappa a un tocco." },
    ],
    whatsapp: "Ciao Dieci Bottega, ho visto il concept della trattoria e vorrei un sito così per il mio ristorante",
  },
];

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}
