'use client'
import { useRouter } from 'next/navigation'

type Campaign = Readonly<{ id: string; title: string }>

type ContactFiltersProps = Readonly<{
  campaigns: readonly Campaign[]
  schoolOptions: readonly string[]
  currentCampaign: string
  currentSchool: string
}>

export const ContactFilters = ({
  campaigns,
  schoolOptions,
  currentCampaign,
  currentSchool,
}: ContactFiltersProps): React.JSX.Element | null => {
  const router = useRouter()

  if (campaigns.length === 0) return null

  const buildHref = (campaign: string, school: string): string => {
    const params = new URLSearchParams()
    if (campaign.length > 0) params.set('campaign', campaign)
    if (school.length > 0) params.set('school', school)
    const qs = params.toString()
    return `/dashboard/admin/contacts${qs.length > 0 ? `?${qs}` : ''}`
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Campagne :</label>
        <select
          value={currentCampaign}
          onChange={(e) => router.push(buildHref(e.target.value, currentSchool))}
          className="focus:border-lbs-blue focus:ring-lbs-blue/20 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-zinc-200"
        >
          <option value="">Toutes</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Établissement :
        </label>
        <select
          value={currentSchool}
          onChange={(e) => router.push(buildHref(currentCampaign, e.target.value))}
          disabled={schoolOptions.length === 0}
          className="focus:border-lbs-blue focus:ring-lbs-blue/20 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-zinc-200"
        >
          <option value="">Tous</option>
          {schoolOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
