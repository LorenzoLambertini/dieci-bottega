# Dieci Bottega — Sito Web Ufficiale

> Micro-agenzia digitale italiana · Bologna · Est. 2026  
> *È tutto nei dettagli.*

---

## Stack

| Tool | Versione |
|------|----------|
| Next.js | 16 (App Router, Turbopack) |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Framer Motion | 12 |

**Font** (Google Fonts via `next/font`):
- **Archivo** Black 900 / Bold 700 / Regular 400 — display & body
- **Cardo** Italic 400 — accenti editoriali
- **JetBrains Mono** 400/500 — label & metadata

**Palette brand**:
| Token | Hex |
|-------|-----|
| Rosewood | `#E63B2E` |
| Obsidian | `#1A1414` |
| Ivory | `#F4EFE6` |
| Ash | `#E8E2D6` |
| Plum | `#4A3838` |
| Burgundy | `#7A1818` |
| Clay | `#C44A38` |
| Peach | `#F2B8A2` |

---

## Struttura cartelle

```
site/
├── app/
│   ├── api/contact/route.ts  ← form handler (Resend)
│   ├── globals.css           ← design tokens Tailwind v4
│   ├── layout.tsx            ← font, metadata SEO
│   ├── opengraph-image.tsx   ← OG social share image (edge)
│   ├── page.tsx              ← composizione sezioni
│   ├── robots.ts             ← robots.txt generato
│   └── sitemap.ts            ← sitemap.xml generato
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx        ← fixed nav + mobile menu
│   │   └── Footer.tsx        ← server component
│   └── sections/
│       ├── Hero.tsx          ← DRENCHED rosewood hero (framer-motion)
│       ├── Services.tsx      ← 3 servizi core (framer-motion whileInView)
│       ├── Portfolio.tsx     ← case study (server component)
│       ├── Process.tsx       ← timeline 4 step (server component)
│       ├── About.tsx         ← bottega + valori + team (server component)
│       ├── Pricing.tsx       ← 3 tier listino (server component, CSS hover)
│       └── Contact.tsx       ← form + canali (wired to /api/contact)
├── lib/
│   └── utils.ts              ← cn() helper
├── public/
│   ├── logo.png              ← logo ufficiale 10/B
│   └── favicon.svg           ← brand favicon rosewood
├── .env.example
├── .gitignore
├── next.config.ts            ← security headers, image optimization
├── package.json
└── vercel.json               ← Vercel config, cache headers
```

---

## Avvio locale

```bash
# 1. Installa dipendenze
npm install

# 2. Configura environment (necessario per invio email)
cp .env.example .env.local
# Modifica .env.local con le tue variabili

# 3. Avvia il dev server
npm run dev
# → http://localhost:3000

# Type check
npm run type-check
```

---

## Build per produzione

```bash
npm run build   # compila e ottimizza — deve uscire verde (zero errori)
npm run start   # avvia server produzione locale
```

**Output atteso:**
```
Route (app)
┌ ○ /
├ ○ /robots.txt
├ ○ /sitemap.xml
├ ƒ /api/contact
└ ƒ /opengraph-image
```

---

## Push su GitHub

```bash
# Dalla cartella site/
git add .
git commit -m "feat: sito Dieci Bottega — production ready"

# Crea repo su GitHub, poi:
git remote add origin https://github.com/TUO-USERNAME/dieci-bottega.git
git branch -M main
git push -u origin main
```

---

## Deploy su Vercel

### Metodo 1 — Dashboard (consigliato)

1. [vercel.com](https://vercel.com) → **Add New… → Project**
2. Importa il repo `dieci-bottega`
3. **Root Directory** → `site`
4. Framework: **Next.js** (rilevato automaticamente)
5. **Environment Variables** → aggiungi da `.env.example`:
   - `RESEND_API_KEY` ← obbligatorio per il form contatti
   - `CONTACT_EMAIL` ← email destinatario (default: ciao@diecibottega.it)
6. **Deploy** → pronto in ~1 minuto

### Metodo 2 — Vercel CLI

```bash
npm i -g vercel

# Dalla cartella site/
vercel

# Production deploy
vercel --prod
```

### Dominio personalizzato

Dashboard Vercel → progetto → **Settings → Domains**:
1. Aggiungi `diecibottega.it` e `www.diecibottega.it`
2. Configura DNS nel tuo provider (Aruba/Register.it):
   - Record A: `@` → IP Vercel
   - Record CNAME: `www` → `cname.vercel-dns.com`
3. SSL automatico Let's Encrypt → attivo in <5 minuti

---

## Variabili d'ambiente (produzione)

| Variabile | Richiesta | Descrizione |
|-----------|-----------|-------------|
| `RESEND_API_KEY` | Sì (per form) | API key Resend per invio email |
| `CONTACT_EMAIL` | No | Destinatario form (default: ciao@diecibottega.it) |
| `NEXT_PUBLIC_SITE_URL` | No | URL del sito per OG/sitemap |

---

## Personalizzazioni rapide

| Cosa | File |
|------|------|
| Copy / testi | `components/sections/*.tsx` |
| Prezzi | `components/sections/Pricing.tsx` → `PLANS` |
| Email form | `app/api/contact/route.ts` + `.env.local` |
| Colori brand | `app/globals.css` → `@theme` |
| Font | `app/layout.tsx` |
| Metadata SEO | `app/layout.tsx` → `metadata` |
| Logo | `public/logo.png` |
| OG image | `app/opengraph-image.tsx` |

---

## Licenza

Proprietà di Dieci Bottega — Lorenzo Lambertini & Tommaso Villa  
© 2026 Dieci Bottega®. Tutti i diritti riservati.
