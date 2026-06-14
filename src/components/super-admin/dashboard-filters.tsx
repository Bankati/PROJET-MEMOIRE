'use client'
/**
 * Barre de filtres du dashboard super-admin.
 * Composant client pour intégrer le DatePicker et le CampaignSelect interactifs.
 */
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { LbsDatePicker } from '@/components/ui/date-picker'
import { CampaignSelect } from '@/components/ui/campaign-select'

type CampaignOption = Readonly<{ id: string; title: string }>
type DashboardFiltersProps = Readonly<{
  campaigns: readonly CampaignOption[]
  currentCampaign: string
  currentFrom: string
  currentTo: string
  hero?: boolean
}>

export const DashboardFilters = ({
  campaigns,
  currentCampaign,
  currentFrom,
  currentTo,
  hero = false,
}: DashboardFiltersProps): React.JSX.Element => {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState<string>(currentFrom)
  const [dateTo, setDateTo] = useState<string>(currentTo)
  const handleApply = useCallback((): void => {
    const params: URLSearchParams = new URLSearchParams()
    const campaignInput: HTMLInputElement | null =
      document.querySelector<HTMLInputElement>("input[name='campaign']")
    const campaignValue: string = campaignInput?.value ?? ''
    if (campaignValue.length > 0) {
      params.set('campaign', campaignValue)
    }
    if (dateFrom.length > 0) {
      params.set('from', dateFrom)
    }
    if (dateTo.length > 0) {
      params.set('to', dateTo)
    }
    const queryString: string = params.toString()
    const url: string = queryString.length > 0 ? `?${queryString}` : ''
    router.push(`/dashboard/super-admin${url}`)
  }, [dateFrom, dateTo, router])
  return (
    <div
      className={
        hero
          ? 'rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm'
          : 'rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]'
      }
      suppressHydrationWarning
    >
      <div className="grid items-end gap-3 md:grid-cols-4" suppressHydrationWarning>
        <CampaignSelect
          name="campaign"
          label="Campagne"
          options={campaigns}
          defaultValue={currentCampaign}
        />
        <LbsDatePicker
          label="Date de début"
          name="from"
          defaultValue={currentFrom}
          onValueChange={(v) => setDateFrom(v)}
        />
        <LbsDatePicker
          label="Date de fin"
          name="to"
          defaultValue={currentTo}
          onValueChange={(v) => setDateTo(v)}
        />
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleApply}
            suppressHydrationWarning
            className={
              hero
                ? 'inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-[#244976] shadow-sm transition hover:bg-white/90'
                : 'inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-sm font-medium text-white shadow-sm transition hover:brightness-110'
            }
          >
            <Sparkles className="size-3.5" />
            {hero ? 'Actualiser' : 'Appliquer les filtres'}
          </button>
        </div>
      </div>
    </div>
  )
}
