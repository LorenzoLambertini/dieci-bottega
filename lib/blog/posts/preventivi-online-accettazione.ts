import type { BlogPost } from "../types";

const post: BlogPost = {
  slug: "preventivi-online-accettazione",
  title: "Preventivi online: come farli chiari e farli accettare più in fretta",
  seoTitle: "Preventivi online: come farli e farli accettare prima",
  description:
    "Come fare un preventivo chiaro che il cliente accetta più in fretta: cosa scrivere, errori da evitare, preventivo online con accettazione e quando ricontattare.",
  category: "CRM e automazioni",
  keywords: ["preventivi online", "come fare un preventivo", "preventivo accettato", "software preventivi", "modello preventivo"],
  publishedAt: "2026-10-09",
  author: "tommaso",
  cover: { glyph: "OK", variant: "rosewood", label: "Preventivi" },
  tldr: [
    "Un preventivo viene accettato più facilmente se arriva in fretta, è chiaro e dice esattamente cosa è incluso, cosa no, quanto costa e entro quando.",
    "Il preventivo online è una pagina con un link: il cliente lo apre dal telefono, lo legge e lo accetta con un clic, e tu vedi quando l'ha aperto.",
    "La maggior parte dei preventivi persi non viene rifiutata: viene dimenticata. Un promemoria dopo qualche giorno fa spesso la differenza.",
    "Si possono usare software in abbonamento o un sistema dentro il proprio CRM, che tiene insieme cliente, preventivo e storia dei contatti.",
  ],
  body: `
## Perché tanti preventivi restano senza risposta

Mandi un preventivo, il cliente dice "ci penso", e poi silenzio. Succede a tutti. Nella maggior parte dei casi il motivo non è il prezzo: il preventivo è arrivato tardi, era poco chiaro, oppure il cliente se n'è semplicemente dimenticato.

La buona notizia è che su tutte e tre le cose puoi intervenire.

## Cosa deve contenere un preventivo chiaro

- **Chi sei e per chi è**: dati dell'attività e del cliente, data e numero del preventivo.
- **Cosa farai**, descritto con parole del cliente, non con sigle interne.
- **Cosa è incluso e cosa no**: è la parte che evita più discussioni dopo.
- **Prezzo**, con IVA indicata chiaramente (inclusa o esclusa).
- **Tempi**: quando inizi e quando finisci.
- **Modalità di pagamento**: acconto, saldo, scadenze.
- **Validità**: fino a quando vale il prezzo.
- **Come accettare**: firma, risposta, pulsante. Deve essere ovvio.

> **La regola d'oro:** se il cliente deve chiamarti per capire il preventivo, il preventivo non è chiaro.

## Gli errori che fanno perdere il lavoro

1. **Arrivare tardi.** Chi chiede tre preventivi spesso sceglie tra i primi due che arrivano.
2. **Una cifra sola, senza spiegazione.** Senza dettagli il cliente può confrontare solo il prezzo.
3. **Troppe voci tecniche.** Venti righe incomprensibili spaventano quanto una cifra secca.
4. **Nessuna scadenza.** Senza una data, decidere può aspettare all'infinito.
5. **Nessun seguito.** Mandato il preventivo, nessuno richiama.

## Una o tre opzioni?

Spesso funziona proporre **tre livelli**, dal più semplice al più completo, con quello consigliato evidenziato. Il cliente non sceglie più tra "sì" e "no", ma tra le opzioni, e capisce meglio cosa cambia da una all'altra. È lo stesso principio dei pacchetti che trovi nel nostro listino.

## Preventivo online: come funziona

Invece di un PDF allegato a un'email, il preventivo online è **una pagina con un link** da mandare su WhatsApp o per email.

| | PDF allegato | Preventivo online |
|---|---|---|
| Lettura dal telefono | scomoda, bisogna ingrandire | comoda, la pagina si adatta |
| Sai se l'ha aperto | no | sì, con data e ora |
| Accettazione | stampa, firma, scansione | un pulsante |
| Modifiche | nuovo PDF da rimandare | si aggiorna la stessa pagina |
| Archivio | sparso tra email e cartelle | collegato alla scheda del cliente |

Sapere che il cliente ha aperto il preventivo ti dice anche **quando richiamarlo**: se l'ha letto tre volte ieri sera, è il momento giusto per una telefonata.

## Quando e come ricontattare

Un semplice promemoria recupera molti preventivi "dimenticati". Un ritmo che funziona:

- **dopo 2–3 giorni**: un messaggio breve per chiedere se ci sono dubbi;
- **qualche giorno prima della scadenza**: un promemoria che il prezzo vale fino a quella data;
- **dopo la scadenza**: una domanda onesta, "ha scelto un'altra strada?". Anche un no ti insegna qualcosa.

Senza un sistema, questi promemoria si dimenticano. Un [CRM](/blog/crm-piccole-imprese) può ricordarteli in automatico o mandarli per te.

## Quale strumento usare

- **Modello in Word o Excel**: va bene se fai pochi preventivi al mese.
- **Software in abbonamento**: comodi, in genere da 10 a 50€ al mese, ma separati dal resto dei tuoi contatti.
- **Preventivi dentro il proprio CRM**: cliente, preventivo, accettazione e promemoria nello stesso posto. È quello che usiamo noi e che realizziamo con il [CRM su misura](/servizi/crm-su-misura).

Se i contatti arrivano già dal sito, conviene che finiscano direttamente nello stesso sistema: lo spieghiamo nel servizio di [Lead Capture & Routing](/servizi/automazione-lead-routing).

## In sintesi

Preventivi rapidi, chiari, con cosa è incluso, tempi, validità e un modo semplice per accettare. Meglio ancora se online, così sai quando il cliente li apre e puoi richiamare al momento giusto. E non dimenticare il promemoria. Se vuoi un sistema che faccia tutto questo insieme ai tuoi contatti, [raccontaci come lavori oggi](/inizia-progetto).
`,
  faq: [
    { q: "Cosa deve contenere un preventivo?", a: "Dati di attività e cliente, descrizione del lavoro, cosa è incluso e cosa no, prezzo con IVA indicata, tempi, modalità di pagamento, validità e come accettarlo." },
    { q: "Cos'è un preventivo online?", a: "È una pagina con un link che il cliente apre dal telefono o dal computer e accetta con un clic. Chi lo invia vede quando è stato aperto e accettato." },
    { q: "Dopo quanto tempo si ricontatta un cliente per un preventivo?", a: "In genere dopo 2–3 giorni con un messaggio breve, poi qualche giorno prima della scadenza del preventivo." },
    { q: "Conviene proporre più opzioni nel preventivo?", a: "Spesso sì: tre livelli, con quello consigliato evidenziato, aiutano il cliente a scegliere tra le opzioni invece che tra sì e no." },
  ],
  related: ["crm-piccole-imprese", "risposte-automatiche-instagram-ai", "quanto-costa-un-sito-web"],
};

export default post;
