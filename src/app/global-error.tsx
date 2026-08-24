'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>): React.JSX.Element {
  useEffect(() => {
    console.error('Erreur applicative critique (root layout) :', error)
  }, [error])

  return (
    <html lang="fr">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '1.5rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#ffffff',
          color: '#18181b',
        }}
      >
        <div style={{ maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Une erreur critique est survenue
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#71717a' }}>
            L&apos;application n&apos;a pas pu se charger correctement. Rechargez la page — si le
            problème persiste, contactez le support technique.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.75rem',
            background: '#0b3d91',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Recharger
        </button>
      </body>
    </html>
  )
}
