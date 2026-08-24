'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'

export default function GlobalErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>): React.JSX.Element {
  useEffect(() => {
    console.error('Erreur applicative interceptée :', error)

    // Après un déploiement, un onglet déjà ouvert peut référencer un chunk JS qui
    // n'existe plus sur le serveur (hash remplacé) — rechargement automatique une
    // seule fois plutôt que de laisser l'utilisateur bloqué sur un écran vide.
    const isChunkLoadError =
      /loading chunk|chunkloaderror|failed to fetch dynamically imported module/i.test(
        `${error.name} ${error.message}`
      )
    if (isChunkLoadError && !sessionStorage.getItem('chunk-reload-attempted')) {
      sessionStorage.setItem('chunk-reload-attempted', '1')
      window.location.reload()
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center dark:bg-[#0b1120]">
      <div className="grid size-16 place-items-center rounded-2xl bg-red-50 dark:bg-red-500/10">
        <AlertTriangle className="size-8 text-red-500 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-white">
          Une erreur inattendue est survenue
        </h1>
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Cette page a rencontré un problème technique. Réessayez, ou retournez au tableau de bord —
          vos données n&apos;ont pas été perdues.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="from-lbs-blue to-lbs-blue-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          <RotateCw className="size-4" />
          Réessayer
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5"
        >
          <Home className="size-4" />
          Tableau de bord
        </a>
      </div>
    </div>
  )
}
