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
      "Concept redesign di un pub di fantasia a Bologna: nuova brand identity, lavagna delle spine con il punto acceso, stato aperto ora e prenotazione su WhatsApp.",
    keyFeature: "La lavagna delle spine con il punto acceso",
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
      { title: "\"Accesa ora\" in apertura", why: "Il punto ambra pulsa quando il pub è aperto e dice fino a che ora: lo stato si calcola dagli orari, come l'insegna con la fiamma accesa." },
      { title: "La lavagna delle spine", why: "Punto pieno: c'è adesso. Cerchio vuoto: finita, con il giorno in cui si riaccende. Filtri per chiare, ambrate e scure, data dell'ultimo aggiornamento e prezzi per 0,2 e 0,4 litri." },
      { title: "Cucina, partite, dehors", why: "Tre schede con un numero ciascuna (00:00, 21:00, 14 spine): le domande della sera hanno una risposta prima di telefonare." },
      { title: "Tessera fedeltà a punti", why: "Dieci punti, uno per pinta: lo stesso segno della lavagna. Alla decima la birra la offre la casa." },
      { title: "Prenotazione su WhatsApp", why: "Giorno, ora, persone e posto (dentro, dehors, vicino al maxischermo): si apre WhatsApp con il messaggio già scritto, mai un tavolo promesso senza conferma." },
      { title: "Barra rapida da telefono", why: "Chiama, WhatsApp e Prenota sempre a portata di pollice, nascosta da computer." },
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
      "Concept redesign per una pizzeria di fantasia senza sito: nuova brand identity, comanda d'asporto con ritiro al quarto d'ora e stato dell'ordine a spicchi.",
    keyFeature: "La comanda d'asporto, con lo spicchio che segna il quarto d'ora",
    primaLabel: "La presenza online di prima (scheda Maps e Instagram)",
    problems: [
      "Nessun sito: nella scheda Google i pulsanti \"Sito web\" e \"Menu\" sono spenti.",
      "Il menu esiste solo nelle foto caricate dai clienti, risalenti al 2022.",
      "Google segnala \"Gli orari potrebbero essere cambiati\": nessuno li ha mai confermati.",
      "Ordini e prenotazioni solo al telefono; due recensioni recenti parlano di linea sempre occupata e asporto incerto.",
      "Su Instagram la bio promette un link che non c'è e l'ultimo post è di oltre due anni fa.",
    ],
    choices: [
      { title: "Lo scontrino come interfaccia", why: "La comanda #047 in apertura dice già come funziona: pizze, totale, ritiro alle 20:15. Perforazioni, numeri tabellari, angoli vivi." },
      { title: "Comanda d'asporto", why: "Si aggiungono le pizze dal menu, il totale si calcola da solo, si sceglie il quarto d'ora di ritiro (quelli pieni sono barrati) e l'ordine parte su WhatsApp già scritto." },
      { title: "Lo stato a spicchi", why: "Dopo l'invio lo spicchio del logo si riempie un quarto alla volta: ricevuto, impasto, in forno, pronta. Il segno del brand diventa il tempo dell'ordine." },
      { title: "Numeri, non aggettivi", why: "48 ore di impasto, 90 secondi nel forno, 1 minuto per ordinare, 15 minuti di finestra di ritiro. Niente \"pizza gourmet\"." },
      { title: "Menu leggibile da tutti", why: "Prezzo sempre accanto al nome, vegetariane segnate con la V nel cerchio e non con il verde, senza glutine spiegato in una riga." },
      { title: "Orari certi", why: "Mercoledì–lunedì 18:30–22:30, il martedì il forno riposa: scritto uguale sul sito, sul cartone e sulla scheda Google." },
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
      "Concept redesign di una trattoria bolognese di fantasia: nuova brand identity, menu del giorno in tre campate, piatti che finiscono e prenotazione di pranzo o cena.",
    keyFeature: "Il menu di oggi in tre campate, con i piatti che finiscono",
    primaLabel: "Il sito di prima",
    problems: [
      "Il modello non è mai stato completato: testi \"Lorem ipsum\", pulsanti chiamati \"Button\" e piatti come \"Sands of Time\".",
      "La pagina si dichiara in inglese e si intitola solo \"Home\": per Google e per i lettori di schermo non ha un nome.",
      "La sezione recensioni è vuota e il pulsante \"Vai al Menù\" non porta da nessuna parte.",
      "Si prenota solo al telefono, con un numero segnaposto.",
      "Foto da 2.000–2.400 pixel usate come sfondi, senza testo alternativo; in fondo resta \"Made with ♥ by Website Builder\".",
    ],
    choices: [
      { title: "Tre archi, una porta", why: "In apertura tre foto incorniciate ad arco, la centrale più alta e color Mattone come la porta del logo. Si muovono appena allo scorrere, e si fermano per chi chiede meno movimento." },
      { title: "Oggi in cucina", why: "Il menu del giorno su carta Intonaco, con la data, tre campate (primi, secondi, dolci) e la firma di chi cucina. Quando un piatto finisce lo dice: \"finiti alle 13:40\"." },
      { title: "Prenotazione pranzo o cena", why: "Si sceglie il servizio, le persone e l'orario tra quelli possibili; la richiesta parte su WhatsApp. La domenica a pranzo ricorda che il carrello dei bolliti esce all'una." },
      { title: "Un solo carattere", why: "Newsreader con le dimensioni ottiche: sottile nei titoli, robusto a 12 px nel menu. Sostituisce un serif che a piccole dimensioni si spezzava." },
      { title: "Storia e recensioni con la fonte", why: "Tre generazioni allo stesso bancone, le ricette a matita, recensioni con nome e piattaforma. La fiducia passa da qui." },
      { title: "Orari chiari", why: "Pranzo 12–14:30, cena 19:30–22:30, lunedì riposo, l'indirizzo \"sotto il portico\" con la mappa a un tocco." },
    ],
    whatsapp: "Ciao Dieci Bottega, ho visto il concept della trattoria e vorrei un sito così per il mio ristorante",
  },
];

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}
