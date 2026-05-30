'use client'

import { useState } from 'react'

type FormType = 'quote' | 'contact'
type PkgKey = 'BASIC' | 'PRO' | 'PREMIUM' | null

interface Props {
  type: FormType
  selectedPackage: PkgKey
  onSuccess: (name: string) => void
}

const inputStyle = {
  width: '100%',
  background: '#1A1414',
  border: '1px solid #4A3838',
  borderRadius: '5px',
  padding: '8px 10px',
  color: '#F4EFE6',
  fontFamily: 'var(--db-archivo)',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  marginBottom: '8px',
  display: 'block',
}

const labelStyle = {
  fontFamily: 'var(--db-jetbrains)',
  fontSize: '9px',
  color: '#E63B2E',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '4px',
}

export default function ChatForm({ type, selectedPackage, onSuccess }: Props) {
  const isQuote = type === 'quote'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit() {
    if (!form.name || !form.email) return
    setStatus('loading')

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          ...form,
          package: selectedPackage,
          source: 'chatbot',
        }),
      })
      setStatus('done')
      onSuccess(form.name)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div
        style={{
          background: '#2A1F1F',
          border: '1.5px solid #E63B2E',
          borderRadius: '8px',
          padding: '14px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '20px', marginBottom: '6px' }}>✓</div>
        <div
          style={{
            fontFamily: 'var(--db-archivo)',
            fontWeight: 700,
            fontSize: '13px',
            color: '#F4EFE6',
            marginBottom: '4px',
          }}
        >
          Ricevuto, {form.name.split(' ')[0]}.
        </div>
        <div
          style={{
            fontFamily: 'var(--db-archivo)',
            fontSize: '12px',
            color: '#F2B8A2',
          }}
        >
          Ti rispondiamo entro 24 ore. Veloci, ma non frettolosi.
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#2A1F1F',
        border: '1px solid #4A3838',
        borderRadius: '8px',
        padding: '14px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--db-archivo)',
          fontWeight: 700,
          fontSize: '12px',
          color: '#F4EFE6',
          marginBottom: '12px',
          letterSpacing: '0.02em',
        }}
      >
        {isQuote ? '— Preventivo gratuito' : '— Contattaci'}
      </div>

      {selectedPackage && isQuote && (
        <div
          style={{
            fontFamily: 'var(--db-jetbrains)',
            fontSize: '9px',
            color: '#E63B2E',
            background: 'rgba(230,59,46,0.1)',
            padding: '4px 8px',
            borderRadius: '3px',
            marginBottom: '10px',
            display: 'inline-block',
          }}
        >
          PACCHETTO {selectedPackage} SELEZIONATO
        </div>
      )}

      <label style={labelStyle}>NOME *</label>
      <input
        style={inputStyle}
        placeholder="Marco Rossi"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
        onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
      />

      <label style={labelStyle}>EMAIL *</label>
      <input
        style={inputStyle}
        type="email"
        placeholder="marco@trattoria.it"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
        onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
      />

      <label style={labelStyle}>TELEFONO</label>
      <input
        style={inputStyle}
        type="tel"
        placeholder="+39 333 000 0000"
        value={form.phone}
        onChange={(e) => update('phone', e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
        onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
      />

      {isQuote && (
        <>
          <label style={labelStyle}>TIPO DI ATTIVITÀ</label>
          <input
            style={inputStyle}
            placeholder="Es: Trattoria, Studio dentistico..."
            value={form.business}
            onChange={(e) => update('business', e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
            onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
          />
        </>
      )}

      <label style={labelStyle}>
        {isQuote ? 'COSA TI SERVE' : 'MESSAGGIO'}
      </label>
      <textarea
        style={{
          ...inputStyle,
          resize: 'none',
          minHeight: '64px',
          marginBottom: '12px',
        }}
        placeholder={
          isQuote
            ? 'Descrivi brevemente cosa vorresti nel sito...'
            : 'Come possiamo aiutarti?'
        }
        value={form.message}
        onChange={(e) => update('message', e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = '#E63B2E')}
        onBlur={(e) => (e.target.style.borderColor = '#4A3838')}
      />

      <button
        onClick={submit}
        disabled={!form.name || !form.email || status === 'loading'}
        style={{
          width: '100%',
          padding: '10px',
          background: form.name && form.email ? '#E63B2E' : '#2A1F1F',
          border: `1px solid ${form.name && form.email ? '#E63B2E' : '#4A3838'}`,
          borderRadius: '5px',
          color: '#F4EFE6',
          fontFamily: 'var(--db-jetbrains)',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          cursor: form.name && form.email ? 'pointer' : 'default',
          transition: 'background 150ms, border-color 150ms',
        }}
      >
        {status === 'loading'
          ? 'INVIO IN CORSO...'
          : isQuote
          ? 'RICHIEDI PREVENTIVO GRATUITO →'
          : 'INVIA MESSAGGIO →'}
      </button>

      {status === 'error' && (
        <div
          style={{
            marginTop: '8px',
            fontFamily: 'var(--db-archivo)',
            fontSize: '11px',
            color: '#F2B8A2',
            textAlign: 'center',
          }}
        >
          Errore nell&apos;invio. Scrivici a info@diecibottega.it
        </div>
      )}
    </div>
  )
}
