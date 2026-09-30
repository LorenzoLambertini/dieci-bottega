---
name: blog
description: Scrive e pubblica un nuovo articolo del blog di Dieci Bottega (SEO + GEO, copertina in stile brand, link interni, FAQ). Usala quando l'utente scrive "blog", "nuovo articolo", "scrivi un articolo" o chiede di aggiornare il blog.
---

# Nuovo articolo del blog

Quando l'utente scrive **"blog"** (anche da solo) va scritto e pubblicato un nuovo articolo.
Se l'utente indica un argomento usa quello, altrimenti sceglilo tu (vedi "Scelta dell'argomento").

## 1. Scelta dell'argomento
- Leggi i titoli esistenti in `lib/blog/posts/` per **non ripetere** un argomento già trattato.
- Pubblico: titolari di piccole imprese italiane (ristoranti, B&B, studi professionali, palestre, artigiani, negozi, agenzie immobiliari), soprattutto a Bologna.
- Scegli una domanda che queste persone scrivono davvero su Google o chiedono a ChatGPT
  (es. "quanto costa…", "come fare…", "meglio X o Y…", "sito per [settore]"), legata ai servizi in `lib/services.ts`.
- Alterna le categorie: `Siti web`, `Prezzi`, `SEO e GEO`, `Google`, `CRM e automazioni`, `Settori`.

## 2. Il file
Crea `lib/blog/posts/<slug>.ts` copiando la struttura di un articolo esistente (tipo `BlogPost` in `lib/blog/types.ts`), poi
aggiungi l'import e la voce in `POSTS` in `lib/blog/index.ts`.

Campi:
- `slug`: minuscolo con trattini, contiene la keyword principale.
- `title` (H1) e `seoTitle` (**max 60 caratteri**, keyword all'inizio).
- `description`: **110–160 caratteri**, con keyword e beneficio concreto.
- `keywords`: 4–6, la prima è la keyword principale.
- `publishedAt`: data di oggi (YYYY-MM-DD). Se aggiorni un articolo esistente usa `updatedAt`.
- `author`: `lorenzo` (siti, tecnica, SEO, AI) o `tommaso` (prezzi, strategia, clienti, settori).
- `cover`: `glyph` di 1–4 caratteri (simbolo o sigla forte: "€", "SEO", "B&B"…), `variant` alternando `rosewood` / `obsidian` / `ivory`, `label` breve.
- `tldr`: 3–5 frasi che **rispondono subito** alla domanda, con numeri concreti (è la parte che citano le AI).
- `faq`: 3–5 domande reali con risposte di 1–2 frasi autosufficienti.
- `related`: 3 slug di articoli esistenti.

## 3. Come scrivere il corpo (`body`, Markdown semplice)
- Sintassi supportata: `## titolo`, `### sottotitolo`, elenchi `- ` e `1. `, `**grassetto**`, `[link](/percorso)`,
  `> nota in evidenza`, tabelle `| a | b |`. Niente HTML. Non iniziare un paragrafo con un numero seguito da punto.
- Almeno **5 sezioni `##`**, 800–1.400 parole, frasi brevi, italiano semplice.
- Tono Dieci Bottega: diretto, concreto, artigiano. **Mai** inglesismi da agenzia ("ROI", "onboarding", "pain point",
  "ecosistema", "visibilità digitale", "soluzione end-to-end", "leveraging", "stakeholder"). Mai promettere risultati
  numerici garantiti né posizioni su Google.
- **Dati veri**: prezzi e tempi coerenti con i pacchetti (BASIC 800–1.000€ ~7 giorni, PRO 1.500–2.000€ 10–14 giorni,
  PREMIUM 2.500–3.500€ 3–4 settimane, Care 29/79/149€ al mese) e con `lib/services.ts`. Niente statistiche inventate:
  se un numero non è verificabile, usa "in genere", "indicativamente".
- **GEO**: una tabella di confronto o prezzi quando ha senso, definizioni chiare in una frase ("X è…"), dati precisi.
- **Link interni** (almeno 3): altri articoli `/blog/<slug>`, servizi `/servizi/<slug>`, e sempre `/inizia-progetto`
  nella chiusura. Link esterni solo a fonti autorevoli.
- Chiudi con `## In sintesi` + invito all'azione.
- Se l'argomento è collegato ai lead magnet (es. "errori"), ricorda: "scrivi ERRORI in DM a @diecibottega o nella chat del sito".

## 4. Verifica prima di pubblicare
```bash
npx vitest run tests/blog      # controlla lunghezze SEO, FAQ, link interni validi, related esistenti
npx tsc --noEmit
npm run build
```
Poi apri `/blog/<slug>` e `/blog/<slug>/cover.png` in locale e controlla con uno screenshot che copertina e testo siano a posto.

## 5. Pubblicazione
Commit (`Blog: <titolo>`), push sul branch di lavoro, pull request e **link diretto per il merge**
(`https://github.com/LorenzoLambertini/dieci-bottega/pull/<N>#partial-pull-merging`).
Sitemap, RSS (`/blog/rss.xml`), `llms.txt` e la pagina `/blog` si aggiornano da soli.
Al termine dai all'utente: titolo, keyword principale, link all'articolo e un testo breve da usare per condividerlo su Instagram/Facebook.
