# Social AI — Setup

Modulo del CRM Dieci Bottega (`/crm/social`) che centralizza commenti e messaggi di
Instagram, Facebook, LinkedIn e TikTok e li gestisce con Claude.

```
SOCIAL → webhook firmato → backend Next.js (Vercel) → regole deterministiche
       → Claude (solo se serve) → azioni (risposta, guida, tag, lead score, handoff)
       → CRM Supabase (leads, tags, activities, opportunities + tabelle social_*)
```

Nessun middleware esterno (Make, Zapier, n8n, ManyChat…), nessuno scraping. L'unico
costo AI è l'API Anthropic. Tutto usa lo stesso Supabase e lo stesso login del CRM.

---

## 0. Cosa è stato aggiunto

| Sezione CRM | Percorso |
|---|---|
| Dashboard Social AI | `/crm/social` |
| Inbox unificata | `/crm/social/inbox` |
| Contatti social | `/crm/leads?channel=social` (tabella lead esistente) |
| Guide / lead magnet | `/crm/social/guides` |
| Automazioni social | `/crm/social/automations` |
| Knowledge base AI | `/crm/ai/knowledge` |
| AI Logs (audit) | `/crm/social/logs` |
| Impostazioni | `/crm/settings/social-ai` |

| Endpoint | Uso |
|---|---|
| `GET/POST /api/webhooks/instagram` · `/facebook` · `/meta` | Webhook Meta (stesso handler) |
| `GET/POST /api/webhooks/linkedin` | Webhook LinkedIn (challenge + firma) |
| `POST /api/webhooks/tiktok` | Webhook lead TikTok (firma) |
| `GET /api/social/oauth/{meta,linkedin,tiktok}` (+ `/callback`) | Collegamento account (solo admin) |
| `GET /api/cron/social-retry` | Retry controllati (Vercel Cron, `CRON_SECRET`) |
| `POST /api/ai/simulate` | Simulatore dalla dashboard (solo admin, nessun invio reale) |

---

## 1. Database (obbligatorio, una volta)

Il progetto Supabase **DieciBottega CRM** (`voyhwqqubcathcvjatyk`) risulta in pausa:
riattivalo da Supabase Dashboard → Project → *Restore*.

Poi applica la migration:

- Supabase Dashboard → **SQL Editor** → incolla il contenuto di
  `supabase/migrations/20260926120000_social_ai.sql` → **Run**
- oppure, con la CLI: `supabase link --project-ref voyhwqqubcathcvjatyk && supabase db push`

La migration è **additiva e idempotente** (si può rieseguire). Unica modifica a una
tabella esistente: `leads.email` diventa facoltativa (un contatto social spesso non ha
email; il vincolo UNIQUE resta) e `leads` ottiene le colonne `temperature` e `interests`.

---

## 2. Anthropic (Claude)

1. <https://console.anthropic.com> → **API Keys** → *Create key*.
2. Imposta un limite di spesa mensile in **Billing → Limits**.
3. Variabili: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.

Scelta del modello (cambiabile anche dal CRM senza deploy):

| Modello | Input / Output ($/M token) | Note |
|---|---|---|
| `claude-opus-5` | 5 / 25 | Default: massima qualità di giudizio |
| `claude-sonnet-5` | 2 / 10 | Buon compromesso |
| `claude-haiku-4-5` | 1 / 5 | Il più economico |

Riduzione costi già attiva: regole deterministiche prima di Claude ("GUIDA" non chiama
l'AI), commenti solo-emoji ignorati, storico limitato (default 12 messaggi), riassunto
delle conversazioni lunghe, prompt caching di system prompt + knowledge base,
effort `low`, limite di chiamate/ora per conversazione, idempotenza degli eventi.
I token consumati sono visibili in `/crm/social/logs`.

---

## 3. Meta App (Instagram + Facebook)

Requisiti: account Instagram **professionale** (Business o Creator) collegato a una
**Pagina Facebook**; sei admin della Pagina.

1. <https://developers.facebook.com/apps> → **Create App** → tipo **Business**.
2. Aggiungi i prodotti **Facebook Login for Business**, **Webhooks**, **Messenger**,
   **Instagram** (API con Facebook Login).
3. **Facebook Login → Settings → Valid OAuth Redirect URIs**:
   `https://diecibottega.it/api/social/oauth/meta/callback`
4. **App settings → Basic**: copia *App ID* → `META_APP_ID`, *App Secret* → `META_APP_SECRET`.
   Aggiungi Privacy Policy URL e dominio `diecibottega.it`.
5. Scegli una stringa casuale per `META_VERIFY_TOKEN` (es. `openssl rand -hex 16`).
6. Permessi richiesti (App Review → **Advanced Access** per l'uso con utenti reali):
   `pages_show_list`, `pages_manage_metadata`, `pages_read_engagement`,
   `pages_manage_engagement`, `pages_messaging`, `instagram_basic`,
   `instagram_manage_comments`, `instagram_manage_messages`, `business_management`.
   Finché l'app è in *Development* funziona solo con utenti che hanno un ruolo nell'app.
7. Instagram: nell'app Instagram → Impostazioni → Privacy messaggi → **Consenti accesso
   ai messaggi** (connected tools) per l'account aziendale.

### Webhook Meta
**Webhooks** → per ciascun oggetto:

| Oggetto | Callback URL | Campi |
|---|---|---|
| Instagram | `https://diecibottega.it/api/webhooks/instagram` | `comments`, `messages` |
| Page | `https://diecibottega.it/api/webhooks/facebook` | `feed`, `messages` |

Verify token = `META_VERIFY_TOKEN`. La firma `X-Hub-Signature-256` viene verificata con
`META_APP_SECRET`. Al collegamento OAuth il CRM iscrive automaticamente la Pagina
(`/{page-id}/subscribed_apps`).

### Limiti ufficiali rispettati (nessun workaround)
- DM solo entro **24 ore** dall'ultimo messaggio dell'utente: fuori finestra l'invio
  è bloccato e nell'inbox il pulsante *Invia DM* è disabilitato.
- Da un commento: **una** *private reply* per commento, entro **7 giorni**.
- Il commento di per sé non apre la finestra di 24h: se l'utente risponde alla
  private reply, si apre una conversazione normale.

---

## 4. LinkedIn — *Richiede autorizzazione LinkedIn*

1. <https://www.linkedin.com/developers/apps> → **Create app** (associata alla Pagina aziendale).
2. **Products** → richiedi **Community Management API** (processo di approvazione).
3. **Auth** → Redirect URL: `https://diecibottega.it/api/social/oauth/linkedin/callback`.
   Copia `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`.
4. Dopo l'approvazione: **Webhooks** → URL `https://diecibottega.it/api/webhooks/linkedin`
   (challenge e firma `X-LI-Signature` gestite), evento
   `ORGANIZATION_SOCIAL_ACTION_NOTIFICATIONS`.

Disponibile con approvazione: commenti sui post della Pagina, risposta come
organizzazione, contatto nel CRM.
**Non disponibile**: DM/messaggi privati (nessuna API di messaggistica per questo caso
d'uso). Nessuna automazione DM è implementata. Senza approvazione, dopo l'OAuth
l'account appare come *Requires approval*.

> Il formato del payload di notifica va verificato sul primo evento reale dopo
> l'approvazione: il parser (`lib/social-ai/providers/linkedin.ts`) ignora i campi che
> non riconosce e non fallisce.

---

## 5. TikTok — funzioni limitate dalla piattaforma

Stato verificato a settembre 2026:

| Funzione | Stato | Motivo |
|---|---|---|
| DM (Business Messaging API) | **Not available** | Non disponibile per account registrati in SEE/UK/CH/USA |
| Commenti (lettura/risposta) | **Requires approval** | TikTok API for Business, account Business |
| Lead generation (Instant Form) | **Requires approval** | TikTok API for Business |
| Collegamento account | Supported | Login Kit |

1. <https://developers.tiktok.com> → **Manage apps** → crea app, aggiungi **Login Kit**.
   Redirect URI: `https://diecibottega.it/api/social/oauth/tiktok/callback`.
   Copia `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET`.
2. Per i lead: <https://business-api.tiktok.com> → richiedi accesso a TikTok API for
   Business, abilita la sottoscrizione lead verso
   `https://diecibottega.it/api/webhooks/tiktok` (firma `TikTok-Signature` verificata,
   eventi più vecchi di 5 minuti rifiutati).

I lead TikTok vengono importati in `leads` (source `tiktok`, tag `tiktok-lead-ads`),
senza duplicati.

---

## 6. Variabili d'ambiente (Vercel)

Vercel → progetto **dieci-bottega** → Settings → **Environment Variables** (Production):

```
# già esistenti
NEXT_PUBLIC_SITE_URL=https://diecibottega.it
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
TEAM_EMAILS=

# Social AI
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-opus-5
SOCIAL_TOKEN_ENCRYPTION_KEY=        # openssl rand -hex 32  (NON cambiarla dopo: i token salvati diventerebbero illeggibili)
META_APP_ID=
META_APP_SECRET=
META_VERIFY_TOKEN=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
CRON_SECRET=                        # openssl rand -hex 32
```

Opzionali: `META_GRAPH_VERSION` (default `v25.0`), `LINKEDIN_API_VERSION` (default `202606`).
Nessuna di queste chiavi arriva al browser (nessuna ha prefisso `NEXT_PUBLIC_`).
`/crm/settings/social-ai` mostra solo se sono presenti, mai il valore.

---

## 7. Deploy su Vercel

Il deploy è automatico da GitHub (`LorenzoLambertini/dieci-bottega`, branch `main`).

1. Imposta le variabili (punto 6) **prima** del merge.
2. Applica la migration (punto 1).
3. Merge del branch → Vercel builda e pubblica.
4. `vercel.json` registra il cron `/api/cron/social-retry` una volta al giorno (compatibile
   con il piano Hobby). Con il piano Pro puoi portarlo a `*/15 * * * *`.
   I retry avvengono comunque anche a ogni webhook ricevuto e manualmente dall'inbox.

---

## 8. Collegare gli account

1. Accedi al CRM come **admin** → `/crm/settings/social-ai`.
2. Clicca **Collega** su Instagram/Facebook (un solo login Meta collega Pagine e account
   Instagram), LinkedIn, TikTok.
3. Controlla per ogni social: *Connected*, *Permissions*, *Last sync*, *Webhook status*.
4. **Scollega** elimina il token dal database.

I token sono cifrati (AES-256-GCM) in `social_account_secrets`, tabella senza policy RLS:
leggibile solo dal backend con service role, mai dal frontend.

---

## 9. Primo avvio consigliato

1. `/crm/ai/knowledge`: inserisci servizi, prezzi, FAQ, casi studio **reali**, tono di voce.
   Finché è vuota, Claude usa una knowledge di base derivata dal chatbot del sito.
2. `/crm/social/guides`: crea la guida e attivala (la migration ne crea una d'esempio
   **disattivata** con URL da sostituire).
3. `/crm/social/automations`: es. *Commento contiene "GUIDA" → Invia guida*,
   *Lead score supera 80 → Notifica admin (+ takeover)*.
4. `/crm/settings/social-ai`: attiva **AI enabled** (di default è spenta).
5. Dashboard → **Simulatore**: prova "GUIDA", "Quanto costa un sito?",
   "Vorrei parlare con qualcuno." senza inviare nulla sui social.

---

## 10. Testare i webhook

```bash
# Verifica Meta (deve restituire 12345)
curl "https://diecibottega.it/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=$META_VERIFY_TOKEN&hub.challenge=12345"

# Evento firmato di prova (commento "GUIDA")
BODY='{"object":"instagram","entry":[{"id":"<IG_ACCOUNT_ID>","time":1790000000,"changes":[{"field":"comments","value":{"id":"test-1","text":"GUIDA","from":{"id":"123","username":"test"},"media":{"id":"m1"}}}]}]}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$META_APP_SECRET" | sed 's/^.* //')
curl -X POST https://diecibottega.it/api/webhooks/instagram \
  -H "Content-Type: application/json" -H "X-Hub-Signature-256: sha256=$SIG" -d "$BODY"
# → {"received":1,"queued":1,"duplicates":0}; ripetendo lo stesso comando → "duplicates":1
```

Da Meta: **Webhooks → Test** invia eventi d'esempio. In `/crm/social/logs` trovi ogni
azione; gli eventi falliti compaiono in "Eventi webhook falliti".

Test automatici: `npm test` (49 test: webhook, firme, duplicati, commenti, DM, AI,
tool calling, guide, lead scoring, handoff, CRM, errori API, retry).

---

## 11. Riferimenti

- Lead scoring: pesi e soglie documentati in `lib/social-ai/scoring.ts`, modificabili dal CRM.
- System prompt: `lib/social-ai/prompt.ts`, sovrascrivibile da `/crm/settings/social-ai`.
- Tool dell'AI (schema, validazione, limiti): `lib/social-ai/tools.ts`.
- Motore: `lib/social-ai/engine.ts`. Provider social: `lib/social-ai/providers/`.
- Documentazione ufficiale: Meta <https://developers.facebook.com/docs/instagram-platform/>,
  LinkedIn <https://learn.microsoft.com/en-us/linkedin/>, TikTok
  <https://developers.tiktok.com/> e <https://business-api.tiktok.com/portal/docs>,
  Anthropic <https://docs.anthropic.com/>.
