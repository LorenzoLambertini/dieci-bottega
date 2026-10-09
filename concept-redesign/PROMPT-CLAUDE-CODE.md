# Prompt per Claude Code — Concept redesign Dieci Bottega

Copia tutto il testo qui sotto in Claude Code, aperto nella root del repo del sito diecibottega.it, dopo aver copiato la cartella `concept-redesign/` nel repo.

---

Ciao Claude. Nel repo trovi la cartella `concept-redesign/` con tre casi studio "concept redesign" per diecibottega.it. Sono attività di **fantasia**, ispirate a locali reali di Bologna ma rese non riconducibili: nomi, indirizzi, telefoni e P.IVA sono inventati e devono restare inventati.

- `prima/` contiene i siti "prima", volutamente brutti e poco efficaci: `prima-lantern-pub.html`, `prima-trattoria-portico.html` e `prima-pizzeria-brace.html`. Quest'ultimo non è un sito ma la simulazione di scheda Maps + Instagram, perché la pizzeria il sito non ce l'ha.
- `dopo/` contiene le versioni rifatte: `dopo-lantern-pub.html`, `dopo-pizzeria-brace.html` e `dopo-trattoria-portico.html`.

Lavora in quattro fasi e fermati a fine fase 1 per farmi vedere il piano.

## Fase 1 — Analisi (poi fermati)

1. Studia la struttura del repo: framework, routing, componenti, stile, come sono fatte le pagine portfolio esistenti, dove stanno le immagini e come si fa il deploy (Vercel).
2. Leggi i sei file HTML di `concept-redesign/`.
3. Controlla il portfolio attuale. "Trattoria Da Mario" sul sito è solo un esempio e non un cliente; i lavori reali sono Virtus Bologna Welcome Kit, Villa Pet Sitter e il portfolio DJ LAMBO. Non toccare i lavori reali.
4. Proponimi un piano breve: dove va la sezione, come si chiamano le route, quali componenti riusi, elenco immagini e video da scaricare.

## Fase 2 — Immagini e video stock nei siti "prima" e "dopo"

Nei file ci sono URL Unsplash diretti non verificati e video che puntano a `media/*.mp4` non esistenti. Sostituiscili con file locali veri.

1. Scarica foto da **Unsplash** o **Pexels** (licenza gratuita, uso commerciale ok). Salva in `public/concept/<progetto>/` (o nella cartella asset del framework) e tieni un file `CREDITS.md` con fotografo e link per ogni immagine.
2. Soggetti da usare:
   - Pub: interno pub caldo con luci soffuse, spine di birra, bicchieri di birra di colori diversi, dehors con lucine la sera.
   - Pizzeria: pizza margherita dall'alto, forno a legna acceso, pala che inforna, pizze da asporto nel cartone. Nella simulazione Instagram del "prima" servono 6 foto di pizza (puoi riusarle).
   - Trattoria: sala di trattoria apparecchiata, tagliatelle al ragù, tortellini, sfoglia tirata col mattarello, portico bolognese di sera.
3. Video hero (Pexels Videos o Coverr): spillatura birra al rallentatore; fiamme del forno o pizza infornata; mani che tirano la sfoglia. Taglia a 8–12 secondi in loop, senza audio, 720p, mp4 H.264 + webm, ognuno sotto i 3 MB (usa ffmpeg). Crea anche un poster jpg/webp dal primo fotogramma.
4. Ottimizzazione solo per i "dopo": WebP/AVIF, `srcset` e `sizes`, larghezze 640/1024/1600, `loading="lazy"` tranne l'hero, `width` e `height` per evitare layout shift, poster hero con `fetchpriority="high"`.
5. Nei "prima" mantieni apposta i difetti: immagini enormi non ottimizzate (anche 2–4 MB), deformate dove già lo sono, font caricati in eccesso. Devono restare credibilmente lenti, perché il confronto dei numeri è il cuore del caso studio.
6. Non cambiare design, testi, palette e funzioni dei "dopo" (lavagna spine, comanda pizzeria, prenotazione WhatsApp, archi in parallax). Puoi correggere bug o migliorare accessibilità e performance.
7. Ogni foto ha un `alt` descrittivo in italiano. Niente volti riconoscibili in primo piano e niente insegne o loghi reali visibili.

## Fase 3 — Misure prima/dopo

1. Avvia i sei file in locale e fai girare Lighthouse mobile (CLI o `npx lighthouse`) tre volte per pagina, tenendo la mediana.
2. Raccogli: Performance, Accessibility, Best Practices, SEO, LCP, CLS, TBT, peso totale pagina, numero di richieste.
3. Salva tutto in `concept-redesign/metriche.json` e usa **solo questi numeri veri** nella sezione del sito. Niente stime o numeri inventati.

## Fase 4 — Sezione sul sito diecibottega.it

1. Crea una sezione "Concept" (o il nome che si integra meglio nella navigazione esistente; proponimelo) separata dai lavori reali per clienti, con:
   - Una pagina indice con le tre card dei concept.
   - Una pagina per ogni caso studio con: il problema (cosa non funzionava nel "prima", in modo tecnico e oggettivo, mai denigratorio), lo slider prima/dopo con screenshot desktop e mobile, le scelte fatte e perché (l'elemento interattivo chiave di ciascun sito), le metriche Lighthouse prima/dopo da `metriche.json`, e una CTA finale per prenotare una call o scrivere su WhatsApp.
   - I link alle due versioni live, servite come pagine statiche, per esempio `/concept/lantern-pub/prima` e `/concept/lantern-pub/dopo`. Aggiungi `noindex` alle pagine "prima" e ai siti demo, così Google indicizza solo i casi studio.
2. Su ogni pagina, in modo ben visibile e non nascosto nel footer, metti la dicitura: **"Concept non commissionato. Attività di fantasia, nessun rapporto con locali reali."**
3. Le pagine della sezione seguono le **Brand Guidelines Dieci Bottega 2026 v2** (se nel repo c'è un file di token o di stile usa quello):
   - Palette: Obsidian #1A1414 (testo), Rosewood #E63B2E (brand), Peach #F2B8A2 (accento), Ivory #F4EFE6 (sfondo), Ash #E8E2D6, Plum #4A3838, Burgundy #7A1818, Clay #C44A38.
   - Font: Archivo per titoli e testo (display Black 900 maiuscolo, tracking −3/−4%; H1 ExtraBold 800; H2 Bold 700; body Regular 400). Cardo corsivo solo come contrappunto, con parsimonia. JetBrains Mono 500 maiuscolo, tracking 10%, per metadati, etichette e CTA.
   - Voce: artigiano competente, diretto, concreto, frasi brevi (max 12 parole), zero gergo. Parole da evitare: "soluzione end-to-end", "visibilità digitale", "ecosistema", "ROI", "pain point", "mindset".
   - Motion 150–400 ms, niente bouncing.
   - Le foto stock stanno **solo dentro i siti concept** dei clienti di fantasia. Le pagine Dieci Bottega usano screenshot dei siti, non stock.
   - Aggiungi una riga che dichiari i contenuti realizzati con assistenza AI e rivisti da noi.
4. SEO per i casi studio: title e meta description in italiano, Open Graph con screenshot, dati strutturati `CreativeWork`, URL leggibili e link interni dalla home e dalla pagina servizi.
5. Prima di chiudere: build pulita, nessun errore in console, controllo responsive a 390px e 1440px, focus da tastiera visibile, `prefers-reduced-motion` rispettato, link e video funzionanti. Fai gli screenshot e mostrameli.
6. Lavora su un branch `concept-redesign` e apri una pull request con una descrizione chiara. Non fare merge su main senza il mio ok.

Se qualcosa non è chiaro o una scelta cambia molto il risultato, chiedimelo prima di procedere.
