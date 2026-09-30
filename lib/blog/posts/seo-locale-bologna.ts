import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "seo-locale-bologna",
  title: "SEO locale: come farsi trovare su Google a Bologna (e nella tua città)",
  seoTitle: "SEO locale a Bologna: come farsi trovare su Google",
  description:
    "Guida pratica alla SEO locale per piccole imprese di Bologna: pagine per servizio, Google Business Profile, recensioni, dati strutturati e citazioni.",
  category: "SEO e GEO",
  keywords: ["seo locale bologna", "farsi trovare su google", "seo locale", "posizionamento google bologna", "seo per piccole imprese"],
  publishedAt: "2026-09-30",
  author: "lorenzo",
  cover: { glyph: "BO", variant: "obsidian", label: "SEO locale" },
  tldr: [
    "La SEO locale serve a comparire quando qualcuno cerca un servizio vicino a sé, ad esempio \"dentista Bologna\" o \"parrucchiere vicino a me\".",
    "I tre pilastri sono: scheda Google Business Profile curata, sito con una pagina per ogni servizio e zona, recensioni costanti.",
    "Nome, indirizzo e telefono devono essere identici su sito, scheda Google e directory.",
    "I primi miglioramenti arrivano in genere in poche settimane, i risultati stabili in alcuni mesi.",
  ],
  body: `
## Cos'è la SEO locale

La SEO locale è l'insieme di interventi che ti fanno comparire su Google quando qualcuno cerca **un servizio in una zona precisa**: "idraulico Bologna", "ristorante sui colli bolognesi", "palestra San Lazzaro". Per queste ricerche Google mostra prima la **mappa con tre attività** e poi i risultati classici.

Per un'attività che lavora sul territorio, quelle tre posizioni in mappa valgono più di qualsiasi altra pubblicità: le persone le cercano proprio mentre hanno bisogno di te.

## Come decide Google chi mostrare

Per i risultati locali Google guarda soprattutto tre cose:

- **Pertinenza**: quanto la tua attività corrisponde a ciò che la persona cerca (categoria, servizi, testi del sito).
- **Distanza**: quanto sei vicino a chi cerca o alla zona indicata.
- **Notorietà**: recensioni, citazioni su altri siti, qualità del sito, quanto sei conosciuto.

Sulla distanza puoi poco. Sulle altre due puoi moltissimo.

## Pilastro 1: la scheda Google Business Profile

È il punto di partenza e costa zero. Categoria principale precisa, servizi, orari, foto nuove ogni mese, risposte alle recensioni. Trovi tutti i passaggi nella [guida a Google Business Profile](/blog/google-business-profile-guida).

## Pilastro 2: un sito pensato per le ricerche locali

### Una pagina per ogni servizio
Se fai tre servizi, servono tre pagine. Ogni pagina con:

- un titolo che contiene servizio e città ("Ristrutturazione bagni a Bologna");
- una descrizione concreta: cosa fai, per chi, tempi, prezzi indicativi;
- foto di lavori veri fatti in zona;
- domande frequenti con risposte brevi e chiare;
- telefono e WhatsApp sempre a portata di pollice.

### Pagine per le zone (solo se servono davvero)
Se lavori in più comuni (Bologna, Casalecchio, San Lazzaro, Imola) puoi creare una pagina per zona, ma solo con **contenuti veri e diversi**: lavori fatti lì, tempi di arrivo, particolarità. Pagine copiate cambiando solo il nome della città vengono ignorate o penalizzate.

### Dati strutturati
Sono informazioni "per le macchine" inserite nel codice del sito (tipo attività, indirizzo, orari, recensioni). Aiutano Google e gli assistenti AI a capire chi sei. Nei nostri siti li inseriamo sempre.

### Velocità e telefono
Il sito deve aprirsi in fretta da smartphone: chi cerca "vicino a me" è spesso per strada.

## Pilastro 3: recensioni e citazioni

- **Recensioni**: chiedile sempre, con il link diretto, e rispondi a tutte. Contano numero, voto e continuità.
- **Citazioni**: la tua attività citata con nome, indirizzo e telefono **identici** su altri siti: Pagine Gialle, TripAdvisor (se sei nel turismo), associazioni di categoria, giornali locali.

> **La regola d'oro:** nome, indirizzo e telefono scritti sempre allo stesso modo. "Via Rizzoli 10" e "V. Rizzoli, 10/a" per Google possono sembrare due indirizzi diversi.

## Gli errori tipici della SEO locale

1. Una sola pagina con tutti i servizi elencati.
2. Indirizzo e telefono solo dentro un'immagine (Google non li legge).
3. Scheda Google abbandonata, con orari sbagliati.
4. Testi copiati da altri siti o scritti per i motori invece che per le persone.
5. Nessuna richiesta di recensioni ai clienti.

## Quanto tempo ci vuole

I primi segnali (più visualizzazioni della scheda, più chiamate) arrivano spesso in poche settimane. Per posizioni stabili sulle ricerche più contese servono in genere alcuni mesi di lavoro costante. Diffida da chi garantisce il primo posto: nessuno può garantirlo, perché lo decide Google.

## E l'intelligenza artificiale?

Sempre più persone chiedono consigli a ChatGPT, Gemini o all'AI di Google invece di scorrere i risultati. Le basi sono le stesse della SEO locale, più qualche accorgimento: lo spieghiamo in [come farsi trovare su ChatGPT e sulle AI](/blog/farsi-trovare-su-chatgpt-geo).

## In sintesi

Per farti trovare a Bologna (o nella tua città) cura la scheda Google, crea una pagina per ogni servizio, chiedi recensioni e tieni i dati identici ovunque. Se vuoi un aiuto concreto, il nostro servizio [SEO on-page](/servizi/seo-on-page) parte da 600€, oppure [raccontaci la tua attività](/inizia-progetto).
`,
  faq: [
    { q: "Cos'è la SEO locale?", a: "È l'insieme di interventi su sito, scheda Google e recensioni che fa comparire un'attività quando qualcuno cerca un servizio in una zona precisa, ad esempio \"dentista Bologna\"." },
    { q: "Quanto costa la SEO locale per una piccola impresa?", a: "Molte basi sono gratuite (scheda Google, recensioni). Un intervento professionale sul sito parte in genere da alcune centinaia di euro; da noi la SEO on-page parte da 600€." },
    { q: "Quanto tempo serve per salire su Google Maps?", a: "I primi miglioramenti arrivano spesso in poche settimane, mentre posizioni stabili sulle ricerche più contese richiedono alcuni mesi." },
    { q: "Servono pagine diverse per ogni città?", a: "Solo se lavori davvero in più zone e hai contenuti diversi per ciascuna. Pagine identiche con il nome della città cambiato non funzionano." },
  ],
  related: ["google-business-profile-guida", "farsi-trovare-su-chatgpt-geo", "sito-vetrina-o-landing-page"],
};

export default post;
