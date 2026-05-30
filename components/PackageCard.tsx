'use client'

type PkgKey = 'BASIC' | 'PRO' | 'PREMIUM'

interface PkgData {
  label: string
  price: string
  days: string
  features: string[]
  badge: string | null
}

interface Props {
  pkg: PkgData
  pkgKey: PkgKey
  selected: boolean
  onSelect: () => void
  onQuote: () => void
}

export default function PackageCard({ pkg, selected, onSelect, onQuote }: Props) {
  return (
    <div
      style={{
        background: '#2A1F1F',
        border: `1.5px solid ${selected ? '#E63B2E' : '#4A3838'}`,
        borderRadius: '8px',
        padding: '14px',
        transition: 'border-color 200ms',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--db-archivo)',
            fontWeight: 900,
            fontSize: '13px',
            color: '#E63B2E',
            letterSpacing: '0.05em',
          }}
        >
          {pkg.label}
        </span>
        {pkg.badge && (
          <span
            style={{
              fontFamily: 'var(--db-jetbrains)',
              fontSize: '9px',
              color: '#1A1414',
              background: '#E63B2E',
              padding: '2px 6px',
              borderRadius: '3px',
              letterSpacing: '0.06em',
            }}
          >
            {pkg.badge}
          </span>
        )}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: 'var(--db-archivo)',
          fontWeight: 700,
          fontSize: '16px',
          color: '#F4EFE6',
          marginBottom: '2px',
        }}
      >
        {pkg.price}
      </div>

      {/* Days */}
      <div
        style={{
          fontFamily: 'var(--db-jetbrains)',
          fontSize: '10px',
          color: '#F2B8A2',
          letterSpacing: '0.06em',
          marginBottom: '10px',
        }}
      >
        {pkg.days}
      </div>

      {/* Features */}
      <ul style={{ margin: '0 0 12px', padding: 0, listStyle: 'none' }}>
        {pkg.features.map((f) => (
          <li
            key={f}
            style={{
              fontFamily: 'var(--db-archivo)',
              fontSize: '12px',
              color: '#F4EFE6',
              opacity: 0.8,
              marginBottom: '3px',
              paddingLeft: '14px',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', left: 0, color: '#E63B2E' }}>—</span>
            {f}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onSelect}
          style={{
            flex: 1,
            padding: '8px',
            background: '#E63B2E',
            border: 'none',
            borderRadius: '5px',
            color: '#F4EFE6',
            fontFamily: 'var(--db-jetbrains)',
            fontSize: '10px',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          INIZIA CON QUESTO →
        </button>
        <button
          onClick={onQuote}
          style={{
            padding: '8px 10px',
            background: 'transparent',
            border: '1px solid #4A3838',
            borderRadius: '5px',
            color: '#F2B8A2',
            fontFamily: 'var(--db-jetbrains)',
            fontSize: '10px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
            transition: 'border-color 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#E63B2E')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#4A3838')}
        >
          PREVENTIVO
        </button>
      </div>
    </div>
  )
}
