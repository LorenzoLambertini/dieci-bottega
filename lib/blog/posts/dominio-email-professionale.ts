import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "dominio-email-professionale",
  title: "Dominio ed email professionale: come averli e perché lasciare @gmail",
  seoTitle: "Dominio ed email professionale: guida per piccole imprese",
  description:
    "Cos'è un dominio, come sceglierlo, quanto costa e come creare un'email professionale con il nome della tua attività al posto di @gmail, senza errori.",
  category: "Siti web",
  keywords: ["email professionale", "dominio per attività", "come scegliere un dominio", "email con dominio aziendale", "quanto costa un dominio"],
  publishedAt: "2026-10-06",
  author: "lorenzo",
  cover: { glyph: "@", variant: "rosewood", label: "Dominio ed email" },
  tldr: [
    "Il dominio è il nome del tuo sito, come diecibottega.it; l'email professionale usa lo stesso nome, come info@diecibottega.it.",
    "Un dominio .it costa in genere tra 10 e 30€ all'anno; una casella professionale tra 5 e 12€ al mese, a seconda del fornitore.",
    "Il dominio deve essere sempre intestato a te, non all'agenzia o al tecnico che l'ha registrato.",
    "Per evitare che le email finiscano nello spam vanno configurati tre record tecnici: SPF, DKIM e DMARC.",
  ],
  body: `
## Cos'è un dominio, in una frase

Il dominio è **l'indirizzo del tuo sito**: la parte che scrivi nella barra del browser, come diecibottega.it. È anche la base delle tue email professionali: info@nomeattivita.it.

Si registra presso un fornitore (registrar), si paga ogni anno e resta tuo finché lo rinnovi.

## Perché lasciare @gmail

Un indirizzo @gmail o @libero va benissimo per la vita privata. Per un'attività ha tre limiti:

- **Fiducia**: un preventivo che arriva da pizzeriamario@gmail.com sembra meno solido di uno da info@pizzeriamario.it.
- **Riconoscibilità**: ogni email ripete il nome della tua attività, anche quando viene inoltrata.
- **Continuità**: se un collaboratore se ne va, la casella resta tua e la puoi passare a qualcun altro. Con un account personale non è così semplice.

In più, un dominio tuo ti permette di avere più indirizzi ordinati: info@, preventivi@, amministrazione@.

## Come scegliere il nome del dominio

- **Corto e facile da dettare** al telefono: se devi spiegarlo lettera per lettera, è troppo complicato.
- **Uguale al nome dell'attività**, o il più vicino possibile.
- **Senza trattini e numeri**, se puoi: si dimenticano e si sbagliano.
- **Estensione .it** se lavori in Italia: è la più riconosciuta dai clienti. Il .com è utile se lavori anche all'estero.
- **Città nel nome** solo se serve a distinguerti: "idraulicorossibologna.it" può andare, ma il nome dell'attività da solo resta più forte.

Se il nome che vuoi è già preso, prova piccole varianti: aggiungere la città o il tipo di attività ("rossi-ferramenta" diventa "ferramentarossi").

## Quanto costano dominio ed email

| Cosa | Costo indicativo |
|---|---|
| Dominio .it o .com | in genere 10–30€ all'anno |
| Casella email professionale | in genere 5–12€ al mese per casella |
| Configurazione iniziale | una tantum, o inclusa nel sito |

Attenzione ai prezzi del **primo anno**: alcuni fornitori fanno offerte molto basse e poi rinnovano a prezzi più alti. Guarda sempre il costo del rinnovo.

## Quale servizio email scegliere

Le soluzioni più usate sono:

- **Google Workspace**: Gmail con il tuo dominio, calendario e documenti condivisi. Comodo se usi già Gmail.
- **Microsoft 365**: Outlook con il tuo dominio, più Word ed Excel. Indicato se lavori molto con Office.
- **Soluzioni leggere** come Zoho o le caselle dei registrar italiani: costano meno e bastano per chi usa solo la posta.

Per una piccola attività, la scelta migliore è quella che corrisponde agli strumenti che usi già.

## Il punto tecnico da non saltare: SPF, DKIM e DMARC

Sono tre impostazioni del dominio che dicono ai servizi di posta: "queste email arrivano davvero da me".

- **SPF** indica quali server possono spedire email a nome del tuo dominio.
- **DKIM** aggiunge una firma digitale a ogni email.
- **DMARC** dice cosa fare con le email che non superano i controlli.

Senza queste impostazioni le tue email rischiano di finire nello **spam**, soprattutto quelle con preventivi e allegati. Da inizio 2024 Gmail e Yahoo le richiedono in modo più rigido a chi spedisce molte email. Si configurano una volta e poi funzionano da sole.

> **La regola d'oro:** il dominio deve essere intestato a te, con i tuoi dati, e devi avere accesso al pannello del registrar. Molte attività scoprono di non poter cambiare sito perché il dominio è a nome di un tecnico che non risponde più.

## Gli errori più comuni

1. Dominio intestato all'agenzia o a un collaboratore.
2. Rinnovo legato a una carta scaduta: il dominio scade e il sito sparisce.
3. Email senza SPF, DKIM e DMARC che finiscono nello spam.
4. Indirizzi diversi su sito, biglietti da visita e scheda Google.

Altri errori simili li trovi in [10 errori che fanno perdere clienti online](/blog/errori-sito-web-perdere-clienti).

## In sintesi

Un dominio con il nome della tua attività e un'email professionale costano poco e fanno sembrare tutto più serio, dal preventivo al biglietto da visita. Intestali a te, configura SPF, DKIM e DMARC e tieni d'occhio i rinnovi. Se vuoi pensarci noi, vedi [acquisto e gestione del dominio](/servizi/dominio-gestione) e [caselle email professionali](/servizi/casella-email-pro), oppure [raccontaci la tua attività](/inizia-progetto).
`,
  faq: [
    { q: "Quanto costa un dominio .it?", a: "In genere tra 10 e 30€ all'anno, a seconda del fornitore. Conviene controllare il prezzo del rinnovo e non solo quello del primo anno." },
    { q: "Come si crea un'email con il proprio dominio?", a: "Si registra il dominio e si attiva un servizio di posta come Google Workspace, Microsoft 365 o Zoho, poi si configurano i record del dominio, compresi SPF, DKIM e DMARC." },
    { q: "Perché le mie email finiscono nello spam?", a: "Spesso perché il dominio non ha SPF, DKIM e DMARC configurati: sono le impostazioni che dimostrano ai servizi di posta che le email arrivano davvero da te." },
    { q: "A chi deve essere intestato il dominio?", a: "Sempre all'attività o al titolare, mai all'agenzia o al tecnico. Così puoi cambiare fornitore quando vuoi senza perdere sito ed email." },
  ],
  related: ["manutenzione-sito-web-costi", "errori-sito-web-perdere-clienti", "wordpress-wix-o-sito-su-misura"],
};

export default post;
