import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "google-business-profile-guida",
  title: "Google Business Profile: la guida completa per attività locali",
  seoTitle: "Google Business Profile: guida completa per attività locali",
  description:
    "Come creare e ottimizzare la scheda Google Business Profile per comparire su Google Maps: categorie, foto, recensioni, post ed errori da evitare.",
  category: "Google",
  keywords: ["google business profile", "scheda google my business", "comparire su google maps", "ottimizzare scheda google", "recensioni google"],
  publishedAt: "2026-09-30",
  author: "tommaso",
  cover: { glyph: "G", variant: "ivory", label: "Google Maps" },
  tldr: [
    "Google Business Profile è la scheda gratuita che fa comparire la tua attività su Google Maps e nei risultati locali.",
    "Per posizionarla contano soprattutto: categoria principale corretta, dati completi e coerenti, foto vere, recensioni costanti e risposte del titolare.",
    "Nome, indirizzo e telefono devono essere identici su scheda, sito e social.",
    "Si crea in circa 30 minuti, ma la verifica di Google può richiedere alcuni giorni.",
  ],
  body: `
## Cos'è Google Business Profile (e perché è gratis)

Google Business Profile (prima si chiamava Google My Business) è la scheda della tua attività che compare su **Google Maps** e nel riquadro a destra quando qualcuno cerca il tuo nome. Mostra orari, indirizzo, telefono, foto, recensioni e il link al sito.

Per un'attività locale è spesso **la prima cosa che un cliente vede**, prima ancora del sito. Ed è gratuita: l'unico investimento è il tempo per curarla.

## Come crearla in 6 passaggi

1. Vai su [business.google.com](https://business.google.com) e accedi con un account Google (meglio uno dell'attività, non personale).
2. Cerca il nome della tua attività: se esiste già una scheda, **rivendicala** invece di crearne una nuova.
3. Scegli la **categoria principale**: è il fattore più importante. Sii specifico ("Ristorante di pesce", non "Ristorante").
4. Inserisci indirizzo (o zona servita se lavori a domicilio), telefono e sito web.
5. Completa la **verifica**: Google può chiedere un video, una telefonata o una cartolina. Può richiedere qualche giorno.
6. Completa tutto il resto: orari, servizi, attributi, descrizione, foto.

## Le 7 cose che fanno salire la scheda nella mappa

### Categoria giusta (e categorie secondarie)
La categoria principale dice a Google per quali ricerche mostrarti. Aggiungi anche le categorie secondarie pertinenti, senza esagerare.

### Nome reale, senza parole chiave aggiunte
Scrivi il nome come appare sull'insegna. Aggiungere "Idraulico Bologna economico" al nome viola le regole di Google e può farti sospendere la scheda.

### Dati identici ovunque
Nome, indirizzo e telefono devono essere **scritti allo stesso modo** su scheda, sito, social e directory. Le incongruenze confondono Google.

### Foto vere e aggiornate
Esterno (per farti riconoscere), interno, squadra, prodotti o lavori. Carica foto nuove ogni mese: è un segnale di attività.

### Recensioni costanti
Contano numero, voto medio e **continuità nel tempo**. Chiedile a ogni cliente soddisfatto con un link diretto (lo trovi nella scheda, "Chiedi recensioni").

### Risposte a tutte le recensioni
Rispondi a tutte, soprattutto a quelle negative: con calma, ringraziando e proponendo una soluzione. Chi legge valuta come gestisci i problemi.

### Post e aggiornamenti
Offerte, eventi, novità: i post restano visibili nella scheda e mostrano un'attività viva.

## Gli errori che ti fanno sparire dalla mappa

- Orari non aggiornati durante festività e ferie.
- Due schede per la stessa attività (duplicati).
- Nome con parole chiave aggiunte.
- Telefono che non risponde o numero diverso dal sito.
- Nessuna risposta alle recensioni per mesi.

> **Collega scheda e sito:** la scheda porta visite al sito, il sito conferma a Google che la scheda è affidabile. Nel sito usa gli stessi dati e una pagina per ogni servizio: ti spieghiamo come nella [guida alla SEO locale](/blog/seo-locale-bologna).

## Quanto tempo serve per vedere risultati

La scheda compare dopo la verifica, ma per salire nella mappa servono in genere alcune settimane di cura costante: foto, recensioni, post. Non esistono scorciatoie legittime: chi promette "primo posto su Maps in 48 ore" di solito usa trucchi che Google punisce.

## Te la sistemiamo noi

Se non hai tempo, possiamo creare o sistemare la scheda per te: categorie, descrizione, servizi, foto, link per le recensioni e collegamento al sito. Trovi il servizio in [Google Business Profile setup](/servizi/google-business-setup), oppure incluso nel pacchetto PRO. [Scrivici](/inizia-progetto) per iniziare.
`,
  faq: [
    { q: "Google Business Profile è gratuito?", a: "Sì, creare e gestire la scheda è gratuito. Si paga solo se si decide di fare pubblicità su Google." },
    { q: "Posso avere la scheda se lavoro da casa o a domicilio?", a: "Sì: puoi nascondere l'indirizzo e indicare la zona in cui servi i clienti." },
    { q: "Quanto tempo ci vuole per comparire su Google Maps?", a: "La scheda è visibile dopo la verifica, che può richiedere alcuni giorni. Per salire nei risultati servono in genere alcune settimane di cura costante." },
    { q: "Come ottengo più recensioni su Google?", a: "Chiedile a ogni cliente soddisfatto con il link diretto della scheda, magari via WhatsApp subito dopo il servizio, e rispondi sempre." },
  ],
  related: ["seo-locale-bologna", "errori-sito-web-perdere-clienti", "farsi-trovare-su-chatgpt-geo"],
};

export default post;
