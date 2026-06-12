'use client'
/**
 * Barre de filtres interactifs de la page Campagnes.
 * Utilise les composants FilterSelect pour statut et admin, même style que le dashboard.
 */
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Filter, Sparkles } from 'lucide-react'

import { FilterSelect } from '@/components/ui/filter-select'

type AdminOption = Readonly<{ value: string; label: string }>
type CampaignsFiltersProps = Readonly<{
  adminOptions: readonly AdminOption[]
  currentStatus: string
  currentAdmin: string
  currentQuery: string
  currentMinCalls: number
}>

export const CampaignsFilters = ({
  adminOptions,
  currentStatus,
  currentAdmin,
  currentQuery,
  currentMinCalls,
}: CampaignsFiltersProps): React.JSX.Element => {
  const router = useRouter()
  const queryRef = useRef<HTMLInputElement>(null)
  const minCallsRef = useRef<HTMLInputElement>(null)
  const statusOptions: readonly { value: string; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Terminée' },
  ]
  const handleApply = useCallback((): void => {
    const params: URLSearchParams = new URLSearchParams()
    const statusInput: HTMLInputElement | null =
      document.querySelector<HTMLInputElement>("input[name='status']")
    const adminInput: HTMLInputElement | null =
      document.querySelector<HTMLInputElement>("input[name='admin']")
    const statusValue: string = statusInput?.value ?? ''
    const adminValue: string = adminInput?.value ?? ''
    const queryValue: string = queryRef.current?.value.trim() ?? ''
    const minCallsValue: string = minCallsRef.current?.value.trim() ?? ''
    if (queryValue.length > 0) {
      params.set('q', queryValue)
    }
    if (statusValue.length > 0) {
      params.set('status', statusValue)
    }
    if (adminValue.length > 0) {
      params.set('admin', adminValue)
    }
    if (minCallsValue.length > 0 && Number(minCallsValue) > 0) {
      params.set('minCalls', minCallsValue)
    }
    const qs: string = params.toString()
    router.push(`/dashboard/super-admin/campaigns${qs.length > 0 ? `?${qs}` : ''}`)
  }, [router])
  return (
    <div
      className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
      suppressHydrationWarning
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        <Filter className="text-lbs-blue size-4" />
        Filtres
      </h3>
      <div className="grid items-end gap-3 md:grid-cols-5" suppressHydrationWarning>
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Recherche</p>
          <input
            ref={queryRef}
            type="text"
            defaultValue={currentQuery}
            placeholder="Rechercher..."
            className="focus:border-lbs-blue focus:ring-lbs-blue/20 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-100"
          />
        </div>
        <FilterSelect
          name="status"
          label="Statut"
          options={statusOptions}
          defaultValue={currentStatus}
          placeholder="Tous les statuts"
          searchable={false}
        />
        <FilterSelect
          name="admin"
          label="Administrateur"
          options={adminOptions}
          defaultValue={currentAdmin}
          placeholder="Tous les admins"
          searchPlaceholder="Rechercher un admin..."
        />
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Appels min.</p>
          <input
            ref={minCallsRef}
            type="number"
            min={0}
            defaultValue={currentMinCalls > 0 ? String(currentMinCalls) : ''}
            placeholder="0"
            className="focus:border-lbs-blue focus:ring-lbs-blue/20 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-100"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <Sparkles className="size-3.5" />
            Appliquer
          </button>
        </div>
      </div>
    </div>
  )
}
