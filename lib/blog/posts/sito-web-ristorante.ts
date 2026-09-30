import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "sito-web-ristorante",
  title: "Sito web per ristorante: cosa deve avere per portare prenotazioni",
  seoTitle: "Sito web per ristorante: cosa serve per avere prenotazioni",
  description:
    "Cosa deve avere il sito di un ristorante per portare prenotazioni: menù leggibile, foto vere, prenotazione in un tocco, Google Maps e costi indicativi.",
  category: "Settori",
  keywords: ["sito web ristorante", "sito per ristorante", "prenotazioni online ristorante", "menu online ristorante", "sito ristorante bologna"],
  publishedAt: "2026-09-30",
  author: "tommaso",
  cover: { glyph: "MENU", variant: "rosewood", label: "Ristorazione" },
  tldr: [
    "Il sito di un ristorante ha un solo lavoro: far prenotare. Tutto il resto viene dopo.",
    "Gli elementi indispensabili: menù in testo (non PDF), foto vere dei piatti, pulsante per prenotare o chiamare sempre visibile, orari aggiornati e mappa.",
    "La scheda Google Business Profile curata porta spesso più prenotazioni del sito stesso: vanno gestite insieme.",
    "Un sito per ristorante ben fatto costa in genere tra 800€ e 2.000€, in base a pagine e prenotazione online.",
  ],
  body: `
## Cosa cerca chi visita il sito di un ristorante

Chi apre il sito di un ristorante di solito ha già fame, o sta organizzando una serata. Cerca risposte rapide a poche domande:

- Cosa si mangia e quanto costa?
- È aperto stasera (o domenica a pranzo)?
- Dov'è e si parcheggia?
- Com'è il locale?
- Come prenoto?

Se trova tutto in 30 secondi da telefono, prenota. Se deve scaricare un PDF del menù o cercare il numero, spesso torna su Google e sceglie un altro locale.

## Gli 8 elementi indispensabili

### 1. Prenotazione in un tocco
Un pulsante "Prenota" sempre visibile: chiamata, WhatsApp o modulo di prenotazione online. Meglio offrire due strade: chi preferisce parlare con una persona e chi vuole fare tutto dal telefono.

### 2. Menù in testo, non in PDF
Il PDF da telefono si legge male e Google non lo legge bene. Il menù scritto nella pagina è più comodo, si aggiorna in un minuto e aiuta a comparire per ricerche come "tagliatelle al ragù Bologna".

### 3. Foto vere
Piatti, sala, dehors, squadra. Niente immagini di repertorio: i clienti vogliono sapere cosa troveranno davvero.

### 4. Orari sempre aggiornati
Festività, chiusure, ferie. Un orario sbagliato è una serata rovinata e una recensione negativa.

### 5. Mappa e indicazioni
Indirizzo scritto in testo, mappa, parcheggi vicini, mezzi pubblici.

### 6. Recensioni
Le migliori recensioni di Google o TripAdvisor, con il link per leggerle tutte.

### 7. Eventi e occasioni
Cene a tema, menù di Natale, feste private, pranzi aziendali: ognuno può avere una pagina o una sezione dedicata e intercettare ricerche precise.

### 8. Velocità da smartphone
Foto leggere, niente video pesanti in apertura, niente musica automatica.

## Sito e scheda Google: una squadra

Per un ristorante la scheda Google Business Profile è spesso **il primo contatto**: da lì le persone vedono foto, recensioni e orari, e da lì cliccano sul sito o chiamano. La scheda deve avere categoria precisa, menù, link per prenotare e foto aggiornate. Trovi tutti i passaggi nella [guida a Google Business Profile](/blog/google-business-profile-guida).

> **Un dettaglio che fa la differenza:** rispondere alle recensioni, anche a quelle negative, con calma e gentilezza. Chi legge si fa un'idea del locale anche da come gestisci i problemi.

## Prenotazione online: serve davvero?

Dipende da come lavori. Se hai molte richieste e poco tempo per il telefono, un sistema di prenotazione online ti libera ore ogni settimana. Se il tuo è un locale piccolo e familiare, spesso bastano un pulsante per chiamare e uno per WhatsApp. L'importante è che ogni richiesta arrivi in un posto solo e non si perda.

## Quanto costa il sito di un ristorante

| Soluzione | Prezzo indicativo | Cosa include |
|---|---|---|
| Pagina unica | 800–1.000€ | Menù, foto, orari, mappa, pulsanti per chiamare e prenotare |
| Sito di più pagine | 1.500–2.000€ | Menù, eventi, galleria, pagine per occasioni, scheda Google collegata |
| Con prenotazione e raccolta contatti | da 2.000€ | Prenotazioni in un unico elenco, promemoria, clienti abituali |

A questi si aggiungono dominio, hosting e manutenzione: ne parliamo in [quanto costa un sito web](/blog/quanto-costa-un-sito-web).

## Gli errori più comuni nei siti dei ristoranti

- Menù in PDF o in foto.
- Numero di telefono non cliccabile.
- Orari diversi tra sito, scheda Google e social.
- Galleria piena di foto di bassa qualità.
- Nessuna indicazione per prenotare gruppi ed eventi privati.

## In sintesi

Il sito di un ristorante deve far venire fame e far prenotare in pochi secondi: menù leggibile, foto vere, orari giusti e un pulsante per prenotare sempre sotto il pollice. Se hai un locale a Bologna o dintorni, [raccontaci com'è](/inizia-progetto): in dieci giorni possiamo metterlo online, collegato alla tua scheda Google.
`,
  faq: [
    { q: "Il menù del ristorante va messo in PDF?", a: "Meglio di no: da telefono si legge male e Google lo interpreta peggio. Il menù scritto nella pagina è più comodo e aiuta la visibilità." },
    { q: "Quanto costa un sito per un ristorante?", a: "In genere tra 800€ per una pagina unica e 2.000€ per un sito di più pagine; con prenotazione online e raccolta contatti si parte da circa 2.000€." },
    { q: "Serve la prenotazione online?", a: "Conviene se ricevi molte richieste e hai poco tempo al telefono. Per locali piccoli spesso bastano pulsanti per chiamare e scrivere su WhatsApp." },
  ],
  related: ["google-business-profile-guida", "quanto-costa-un-sito-web", "errori-sito-web-perdere-clienti"],
};

export default post;
