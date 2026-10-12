# Concept redesign Dieci Bottega

Tre casi studio "concept non commissionato" per diecibottega.it. Attività di fantasia ispirate a locali di Bologna, rese non riconducibili.

| Progetto | Prima | Dopo | Elemento chiave |
|---|---|---|---|
| The Lantern Pub | `prima/prima-lantern-pub.html` | `dopo/dopo-lantern-pub.html` | Lavagna spine filtrabile, stato "aperto ora", prenotazione WhatsApp |
| Pizzeria Brace | `prima/prima-pizzeria-brace.html` (scheda Maps + Instagram) | `dopo/dopo-pizzeria-brace.html` | Comanda d'asporto con totale e orario di ritiro, invio su WhatsApp |
| Trattoria del Portico | `prima/prima-trattoria-portico.html` | `dopo/dopo-trattoria-portico.html` | Archi del portico in parallax, menu del giorno, prenotazione pranzo/cena |

## Da sapere

- Le immagini sono URL Unsplash diretti e vanno sostituite con file locali. I video puntano a `media/*.mp4`, che non esiste ancora. Il prompt per Claude Code (`PROMPT-CLAUDE-CODE.md`) gestisce entrambe le cose.
- Nomi, indirizzi, telefoni, P.IVA e recensioni sono inventati.
- Su ogni pagina pubblicata deve comparire: "Concept non commissionato. Attività di fantasia, nessun rapporto con locali reali."

## Come usarlo

1. Copia la cartella `concept-redesign/` nella root del repo di diecibottega.it.
2. Apri Claude Code nel repo.
3. Incolla il contenuto di `PROMPT-CLAUDE-CODE.md`.

## Stato nel repo

- Sezione sul sito: `/concept` (indice) e `/concept/<slug>` (casi studio), dati in `lib/concepts.ts`.
- Siti demo: `npm run concept:demos` li genera in `public/concept-demo/` dai sorgenti di questa cartella,
  con `noindex` e la dicitura in alto. Sono serviti su `/concept/<slug>/prima` e `/concept/<slug>/dopo`.
- Lo slider prima/dopo e la tabella delle misure compaiono da soli quando esistono screenshot e metriche.

## Passi rimasti (servono rete verso Pexels e una chiave API)

1. `PEXELS_API_KEY=... npm run concept:assets` → foto e video in `public/concept/<slug>/media/`, `CREDITS.md`, `assets.json`.
2. Controllare a occhio le foto (niente volti in primo piano, insegne o loghi reali) e collegarle nei sorgenti
   `prima/` e `dopo/` al posto degli URL Unsplash e dei `media/*.mp4`; nei "dopo" con `srcset` 640/1024/1600.
3. `npm run concept:demos`, poi con il sito avviato:
   `BASE_URL=http://localhost:3000 npm run concept:shots` e `BASE_URL=http://localhost:3000 npm run concept:measure`.
4. Togliere `https://images.unsplash.com` dalla CSP delle demo in `next.config.ts`.

## Brand book

I brand book dei tre locali sono PDF forniti da Dieci Bottega, in `public/concept/<slug>/brand-identity.pdf`.
`brands.json` riassume i dati usati nella pagina del caso studio (palette, valori, tono, logo SVG) e
`public/concept/<slug>/book/<pagina>.webp` sono le pagine esportate per la galleria (1600 px, 16:9).
Se un brand book cambia, sostituire il PDF, riesportare le pagine elencate in `book` e aggiornare `brands.json`.
