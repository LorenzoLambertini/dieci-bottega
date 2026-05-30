'use client'

import { useState, useRef, useEffect } from 'react'
import ChatForm from './ChatForm'
import PackageCard from './PackageCard'

// ── Types ──────────────────────────────────────────────
type Role = 'user' | 'assistant'
type FormType = 'quote' | 'contact' | null
type PackageType = 'BASIC' | 'PRO' | 'PREMIUM' | null

interface Message {
  id: string
  role: Role
  content: string
  suggestedPackage?: PackageType
  showForm?: FormType
}

// ── Package data ───────────────────────────────────────
const PACKAGES = {
  BASIC: {
    label: 'BASIC',
    price: '800 — 1.000 €',
    days: '7 giorni',
    features: ['One-pager', 'Template adattato', 'Form contatto', 'SEO base'],
    badge: null,
  },
  PRO: {
    label: 'PRO',
    price: '1.500 — 2.000 €',
    days: '10-14 giorni',
    features: ['5-7 pagine', 'Design custom', 'Copy AI assistito', 'Google My Business'],
    badge: 'PIÙ SCELTO',
  },
  PREMIUM: {
    label: 'PREMIUM',
    price: '2.500 — 3.500 €',
    days: '3-4 settimane',
    features: ['8-12 pagine + blog', 'Design su misura', 'Copy professionale', 'CRM integrato'],
    badge: null,
  },
}

// ── Helpers ────────────────────────────────────────────
function parseMessage(raw: string): {
  clean: string
  pkg: PackageType
  form: FormType
} {
  let clean = raw
  let pkg: PackageType = null
  let form: FormType = null

  const pkgMatch = raw.match(/\[SUGGEST_PACKAGE:(BASIC|PRO|PREMIUM)\]/)
  if (pkgMatch) {
    pkg = pkgMatch[1] as PackageType
    clean = clean.replace(pkgMatch[0], '').trim()
  }

  const formMatch = raw.match(/\[SHOW_FORM:(CONTACT|QUOTE)\]/)
  if (formMatch) {
    form = formMatch[1].toLowerCase() as FormType
    clean = clean.replace(formMatch[0], '').trim()
  }

  return { clean, pkg, form }
}

// ── Welcome message ────────────────────────────────────
const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Ciao. Hai bisogno di un sito? Dimmi che tipo di attività hai e ti dico cosa possiamo fare per te — in dieci giorni.',
}

// ── Main component ─────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<PackageType>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const { clean, pkg, form } = parseMessage(data.message || '')

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: clean,
        suggestedPackage: pkg,
        showForm: form,
      }

      setMessages((prev) => [...prev, assistantMsg])
      if (pkg) setSelectedPkg(pkg)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Errore di connessione. Riprova tra un momento.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleAddToCart(pkg: PackageType) {
    if (!pkg) return
    // Integra qui con il tuo sistema carrello/CRM
    // Es: window.dispatchEvent(new CustomEvent('addToCart', { detail: { package: pkg } }))
    sendMessage(`Voglio procedere con il pacchetto ${pkg}`)
  }

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Chiudi chat' : 'Apri chat'}
        className="db-chat-toggle"
        style={{
          position: 'fixed',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#E63B2E',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(230,59,46,0.35)',
          transition: 'transform 150ms ease-in-out, box-shadow 150ms ease-in-out',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="#F4EFE6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M3 5C3 3.9 3.9 3 5 3H17C18.1 3 19 3.9 19 5V13C19 14.1 18.1 15 17 15H7L3 19V5Z"
              stroke="#F4EFE6"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        className="db-chat-panel"
        style={{
          position: 'fixed',
          right: '24px',
          zIndex: 9998,
          width: '360px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '560px',
          background: '#1A1414',
          borderRadius: '12px',
          border: '1px solid #4A3838',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 300ms cubic-bezier(.2,.8,.2,1), transform 300ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #4A3838',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#E63B2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--db-archivo)',
              fontWeight: 900,
              fontSize: '11px',
              color: '#F4EFE6',
              letterSpacing: '-0.5px',
            }}
          >
            10/B
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--db-archivo)',
                fontWeight: 700,
                fontSize: '13px',
                color: '#F4EFE6',
                letterSpacing: '0.02em',
              }}
            >
              DIECI BOTTEGA
            </div>
            <div
              style={{
                fontFamily: 'var(--db-jetbrains)',
                fontSize: '10px',
                color: '#E63B2E',
                letterSpacing: '0.08em',
              }}
            >
              BOTTEGA APERTA · CODICE ACCESO
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Bubble */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? '#E63B2E' : '#2A1F1F',
                    color: '#F4EFE6',
                    fontFamily: 'var(--db-archivo)',
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>

              {/* Package card */}
              {msg.suggestedPackage && PACKAGES[msg.suggestedPackage] && (
                <div style={{ marginTop: '10px' }}>
                  <PackageCard
                    pkg={PACKAGES[msg.suggestedPackage]}
                    pkgKey={msg.suggestedPackage}
                    selected={selectedPkg === msg.suggestedPackage}
                    onSelect={() => handleAddToCart(msg.suggestedPackage!)}
                    onQuote={() => sendMessage('Voglio un preventivo dettagliato')}
                  />
                </div>
              )}

              {/* Inline form */}
              {msg.showForm && (
                <div style={{ marginTop: '10px' }}>
                  <ChatForm
                    type={msg.showForm}
                    selectedPackage={selectedPkg}
                    onSuccess={(name) => {
                      sendMessage(`Mi chiamo ${name} e ho inviato i miei dati`)
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div style={{ display: 'flex', gap: '4px', padding: '10px 14px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#E63B2E',
                    animation: 'db-pulse 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length === 1 && (
          <div
            style={{
              padding: '0 16px 12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {[
              'Ho un ristorante',
              'Sono un professionista',
              'Ho una palestra',
              'Sono un artigiano',
              'Sono un agente immobiliare',
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  border: '1px solid #4A3838',
                  background: 'transparent',
                  color: '#F2B8A2',
                  fontFamily: 'var(--db-jetbrains)',
                  fontSize: '10px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'border-color 150ms, color 150ms',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = '#E63B2E'
                  el.style.color = '#E63B2E'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = '#4A3838'
                  el.style.color = '#F2B8A2'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #4A3838',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Scrivi qui..."
            disabled={loading}
            style={{
              flex: 1,
              background: '#2A1F1F',
              border: '1px solid #4A3838',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#F4EFE6',
              fontFamily: 'var(--db-archivo)',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 150ms',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
            onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: input.trim() ? '#E63B2E' : '#2A1F1F',
              border: 'none',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 150ms',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 8L2 2L5 8L2 14L14 8Z"
                fill={input.trim() ? '#F4EFE6' : '#4A3838'}
                stroke={input.trim() ? '#F4EFE6' : '#4A3838'}
                strokeWidth="0.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* CSS animations + responsive positioning */}
      <style>{`
        @keyframes db-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }

        /* Default (desktop): bottom 24px / panel 92px */
        .db-chat-toggle { bottom: 24px; }
        .db-chat-panel  { bottom: 92px; }

        /* Mobile (<1024px): solleva il widget sopra la StickyMobileCTA (~64px tall) */
        @media (max-width: 1023px) {
          .db-chat-toggle { bottom: 88px; }
          .db-chat-panel  { bottom: 156px; max-height: calc(100vh - 200px); }
        }
      `}</style>
    </>
  )
}
