'use client'
import { useRouter } from 'next/navigation'

type SchoolFilterSelectProps = Readonly<{
  basePath: string
  otherParams: Readonly<Record<string, string>>
  schools: readonly string[]
  currentSchool: string
}>

// Menu déroulant d'établissements — style unique utilisé sur toutes les interfaces
// qui filtrent par établissement, pour que la liste (issue des données importées)
// apparaisse de façon identique partout au lieu d'un mélange de menus et de pastilles.
export const SchoolFilterSelect = ({
  basePath,
  otherParams,
  schools,
  currentSchool,
}: SchoolFilterSelectProps): React.JSX.Element | null => {
  const router = useRouter()

  if (schools.length === 0) return null

  const buildHref = (school: string): string => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(otherParams)) {
      if (v.length > 0) params.set(k, v)
    }
    if (school.length > 0) params.set('school', school)
    const qs = params.toString()
    return `${basePath}${qs.length > 0 ? `?${qs}` : ''}`
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Établissement :
      </label>
      <select
        value={currentSchool}
        onChange={(e) => router.push(buildHref(e.target.value))}
        className="focus:border-lbs-blue focus:ring-lbs-blue/20 dark:bg-lbs-surface-dark-2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition outline-none focus:ring-2 dark:border-white/15 dark:text-zinc-200"
      >
        <option value="">Tous</option>
        {schools.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}
