import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "velocita-sito-web",
  title: "Velocità del sito web: perché conta, come misurarla e come migliorarla",
  seoTitle: "Velocità del sito web: come misurarla e migliorarla",
  description:
    "Perché la velocità del sito conta per clienti e Google, cosa sono i Core Web Vitals, come misurarla gratis con PageSpeed Insights e cosa rallenta un sito.",
  category: "SEO e GEO",
  keywords: ["velocità sito web", "sito lento cosa fare", "core web vitals", "pagespeed insights", "velocizzare sito"],
  publishedAt: "2026-10-09",
  author: "lorenzo",
  cover: { glyph: "1s", variant: "obsidian", label: "Velocità" },
  tldr: [
    "Un sito lento perde visitatori prima ancora che leggano: chi cerca da telefono, spesso per strada, non aspetta.",
    "Google misura la velocità con i Core Web Vitals: contenuto principale visibile entro 2,5 secondi, risposta ai tocchi entro 200 millisecondi, pagina che non salta mentre si carica.",
    "Si misura gratis con PageSpeed Insights di Google, inserendo l'indirizzo del sito.",
    "Le cause più comuni sono immagini troppo pesanti, troppi plugin e script esterni, hosting economico e video caricati subito.",
  ],
  body: `
## Perché la velocità conta

Pensa a chi cerca "idraulico urgente" dal telefono, in strada, con poca rete. Apre tre risultati. Il primo che si carica e mostra un numero di telefono vince. Gli altri due nemmeno li vede.

La velocità conta per due motivi:

- **per i clienti**: più il sito è lento, più persone se ne vanno prima di vedere cosa offri;
- **per Google**: l'esperienza di navigazione, velocità compresa, è uno dei segnali che usa per decidere chi mostrare.

## Cosa sono i Core Web Vitals

I Core Web Vitals sono tre misure con cui Google valuta l'esperienza di una pagina. In parole semplici:

| Misura | Cosa controlla | Valore buono |
|---|---|---|
| LCP | quanto ci mette a comparire il contenuto principale | entro 2,5 secondi |
| INP | quanto risponde in fretta a tocchi e clic | entro 200 millisecondi |
| CLS | se la pagina "salta" mentre si carica | sotto 0,1 |

Il terzo è quello che dà più fastidio: stai per toccare un pulsante e all'ultimo momento la pagina si sposta perché è comparsa un'immagine o un banner.

## Come misurare la velocità del tuo sito

Bastano due minuti:

1. Apri **PageSpeed Insights** di Google (pagespeed.web.dev).
2. Inserisci l'indirizzo del tuo sito e avvia l'analisi.
3. Guarda prima i risultati **da dispositivo mobile**: sono quelli che contano di più.
4. In alto trovi i dati reali dei visitatori, se il sito ha abbastanza visite; sotto, un test di laboratorio con un punteggio da 0 a 100.

> **Non inseguire il 100.** Un punteggio sopra 90 da mobile è ottimo, ma conta di più che i tre Core Web Vitals siano "buoni" e che il sito sembri veloce a chi lo usa.

## Cosa rallenta davvero un sito

### Immagini troppo pesanti
È la causa numero uno. Una foto presa dal telefono pesa diversi megabyte: sul sito dovrebbe pesarne una piccola parte. Servono formati moderni (WebP, AVIF) e dimensioni adatte allo schermo.

### Troppi plugin e script
Ogni plugin, chat, widget dei social, contatore o mappa aggiunge codice da scaricare. Molti siti WordPress ne caricano decine, anche nelle pagine dove non servono. Ne parliamo in [WordPress, Wix o sito su misura](/blog/wordpress-wix-o-sito-su-misura).

### Hosting economico
Un server lento risponde in ritardo a ogni visita, qualunque cosa ci sia sopra. Spesso il risparmio di pochi euro al mese si paga in visitatori persi.

### Video caricati subito
Un video in home page può pesare più di tutto il resto del sito. La soluzione è mostrare un'immagine di copertina e caricare il video solo quando qualcuno preme play.

### Font e caratteri
Troppe varianti di carattere scaricate da servizi esterni rallentano la comparsa del testo. Meglio poche varianti, caricate dal proprio sito.

## Come rendere più veloce un sito esistente

In ordine di impatto, per la maggior parte dei siti:

- **comprimere e ridimensionare le immagini**, e caricarle solo quando servono;
- **togliere plugin e script inutili**, a partire da quelli che non usi più;
- **caricare i video solo al clic**;
- **attivare la cache** e una rete di distribuzione dei contenuti (CDN);
- **valutare un hosting migliore** se il server risponde lentamente.

Se dopo questi passaggi il sito resta lento, spesso conviene rifarlo su basi più leggere invece di continuare a rattoppare.

## Come lavoriamo noi

I siti che realizziamo partono già veloci: immagini ottimizzate in automatico, niente plugin, pagine pronte in anticipo e servite da una rete distribuita, video caricati solo al clic. Controlliamo i Core Web Vitals prima della consegna. È anche una delle cose che seguiamo nella [manutenzione](/blog/manutenzione-sito-web-costi), e fa parte del servizio di [SEO on-page](/servizi/seo-on-page).

## In sintesi

Un sito veloce tiene i visitatori e piace a Google. Misuralo gratis con PageSpeed Insights, guarda i risultati da telefono e intervieni prima su immagini, plugin e video. Se il tuo sito è lento e vuoi capire perché, [scrivici](/inizia-progetto): ti diciamo cosa sistemare e se conviene farlo o rifarlo.
`,
  faq: [
    { q: "Come faccio a sapere se il mio sito è lento?", a: "Inserisci l'indirizzo in PageSpeed Insights di Google e guarda i risultati da dispositivo mobile: se i Core Web Vitals non sono \"buoni\", il sito va migliorato." },
    { q: "Cosa sono i Core Web Vitals?", a: "Sono tre misure di Google sull'esperienza della pagina: tempo di comparsa del contenuto principale (entro 2,5 secondi), rapidità di risposta ai tocchi (entro 200 millisecondi) e stabilità della pagina (CLS sotto 0,1)." },
    { q: "Qual è la causa più comune di un sito lento?", a: "Le immagini troppo pesanti, seguite da troppi plugin e script esterni, hosting lento e video caricati subito all'apertura della pagina." },
    { q: "La velocità influisce sul posizionamento su Google?", a: "Sì, l'esperienza della pagina, velocità compresa, è uno dei segnali che Google considera. Conta però meno della qualità e della pertinenza dei contenuti." },
  ],
  related: ["errori-sito-web-perdere-clienti", "wordpress-wix-o-sito-su-misura", "seo-locale-bologna"],
};

export default post;
