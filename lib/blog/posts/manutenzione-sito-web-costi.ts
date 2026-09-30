import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "manutenzione-sito-web-costi",
  title: "Manutenzione del sito web: cosa comprende e quanto costa davvero",
  seoTitle: "Manutenzione sito web: cosa comprende e quanto costa",
  description:
    "Cosa comprende la manutenzione di un sito web (hosting, sicurezza, backup, aggiornamenti, modifiche), quanto costa al mese e cosa rischi senza.",
  category: "Prezzi",
  keywords: ["manutenzione sito web", "costo manutenzione sito web", "hosting gestito", "aggiornamento sito web", "assistenza sito web"],
  publishedAt: "2026-09-30",
  author: "tommaso",
  cover: { glyph: "CARE", variant: "obsidian", label: "Manutenzione" },
  tldr: [
    "La manutenzione tiene il sito online, sicuro, veloce e aggiornato: hosting, copie di sicurezza, aggiornamenti, controlli e piccole modifiche.",
    "Per una piccola impresa costa in genere da circa 30€ a 150€ al mese, in base a quante modifiche e quanto supporto sono inclusi.",
    "Senza manutenzione i rischi sono concreti: sito che smette di funzionare, attacchi, contenuti vecchi, perdita di posizioni su Google.",
    "I nostri piani: Care Basic 29€/mese, Care Plus 79€/mese, Care Pro 149€/mese.",
  ],
  body: `
## Perché un sito ha bisogno di manutenzione

Un sito non è un volantino stampato una volta per sempre. Vive su un server, usa componenti che vengono aggiornati, riceve visite e (purtroppo) anche tentativi di attacco. E la tua attività cambia: orari, prezzi, servizi, foto.

La manutenzione è il lavoro che tiene tutto questo sotto controllo, così il sito continua a portare clienti invece di diventare un problema.

## Cosa comprende (e cosa chiedere nel contratto)

- **Hosting**: lo spazio dove vive il sito, con prestazioni adeguate.
- **Certificato di sicurezza** (il lucchetto, https) sempre attivo.
- **Copie di sicurezza** regolari, per tornare indietro in caso di problemi.
- **Aggiornamenti** di software e componenti.
- **Controllo** che il sito sia online e veloce.
- **Modifiche**: testi, foto, orari, nuove sezioni, entro un certo numero di ore o richieste.
- **Supporto**: chi ti risponde, con che tempi e su quale canale.
- **Rapporto periodico**: visite, richieste arrivate, problemi risolti.

> **Chiedi sempre:** quante modifiche sono incluse al mese, in quanto tempo vengono fatte e cosa succede se serve di più.

## Quanto costa

| Livello | Prezzo indicativo | Per chi |
|---|---|---|
| Solo hosting e sicurezza | 20–40€/mese | Siti che cambiano raramente |
| Hosting + modifiche mensili | 60–100€/mese | La maggior parte delle piccole imprese |
| Partner digitale (modifiche, contenuti, supporto prioritario) | 120–200€/mese | Chi aggiorna spesso o vende online |

I nostri piani seguono queste fasce:

- **Care Basic · 29€/mese**: hosting gestito, sicurezza, copie di sicurezza, controllo continuo. [Dettagli](/servizi/manutenzione-care-basic).
- **Care Plus · 79€/mese**: tutto il Basic più modifiche mensili a testi, foto e orari. [Dettagli](/servizi/manutenzione-care-plus).
- **Care Pro · 149€/mese**: il partner digitale, con più interventi, contenuti e supporto prioritario. [Dettagli](/servizi/manutenzione-care-pro).

## A chiamata o a canone?

**A chiamata** paghi solo quando serve. Va bene se il sito cambia pochissimo, ma nessuno controlla sicurezza e aggiornamenti tra una chiamata e l'altra, e i tempi di intervento non sono garantiti.

**A canone** paghi una cifra fissa e sai chi se ne occupa. Costa di più nei mesi tranquilli, ma evita le brutte sorprese e ti permette di tenere il sito sempre fresco, cosa che piace anche a Google.

## Cosa rischi senza manutenzione

1. **Sito fuori uso** dopo un aggiornamento del server o di un componente.
2. **Attacchi**: siti non aggiornati vengono presi di mira da programmi automatici.
3. **Lucchetto scaduto**: il browser mostra un avviso di pericolo e i visitatori scappano.
4. **Contenuti vecchi** che danno un'immagine trascurata dell'attività.
5. **Perdita di posizioni** su Google per lentezza o errori.
6. **Nessuna copia di sicurezza** quando serve davvero.

## Come scegliere il piano giusto

- Aggiorni il sito meno di una volta al mese? Basta hosting e sicurezza.
- Cambi spesso orari, prezzi, offerte o foto? Serve un piano con modifiche incluse.
- Pubblichi articoli, vendi online o usi il sito per le campagne? Serve un partner che segua anche i contenuti.

## In sintesi

La manutenzione costa in genere tra 30€ e 150€ al mese e protegge l'investimento fatto nel sito. Il nostro consiglio: scegli sempre almeno un piano base e aggiungi modifiche quando servono. Se vuoi capire quale fa per te, [scrivici](/inizia-progetto). Stai ancora valutando il sito? Parti da [quanto costa un sito web](/blog/quanto-costa-un-sito-web).
`,
  faq: [
    { q: "Quanto costa la manutenzione di un sito web?", a: "Per una piccola impresa in genere tra 30€ e 150€ al mese, in base a modifiche e supporto inclusi. I piani Dieci Bottega vanno da 29€ a 149€ al mese." },
    { q: "Cosa comprende la manutenzione di un sito?", a: "Hosting, certificato di sicurezza, copie di sicurezza, aggiornamenti, controllo continuo, modifiche ai contenuti e supporto, secondo il piano scelto." },
    { q: "Cosa succede se non faccio manutenzione?", a: "Il sito può smettere di funzionare dopo aggiornamenti del server, diventare vulnerabile ad attacchi, mostrare avvisi di sicurezza e perdere posizioni su Google." },
  ],
  related: ["quanto-costa-un-sito-web", "errori-sito-web-perdere-clienti", "crm-piccole-imprese"],
};

export default post;
