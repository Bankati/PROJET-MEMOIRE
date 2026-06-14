'use client'
import { useCallback, useState } from 'react'
import { Loader2, UserPlus, Zap } from 'lucide-react'

type Agent = Readonly<{ id: string; fullName: string }>

type AutoAssignPanelProps = Readonly<{
  agents: readonly Agent[]
  adminId: string
  adminName: string
  unassignedCount: number
  autoAssignAction: (formData: FormData) => Promise<void>
  schoolFilter: string
  campaignFilter: string
}>

export const AutoAssignPanel = ({
  agents,
  adminId,
  adminName,
  unassignedCount,
  autoAssignAction,
  schoolFilter,
  campaignFilter,
}: AutoAssignPanelProps): React.JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = useCallback(
    async (formData: FormData): Promise<void> => {
      setIsSubmitting(true)
      try {
        await autoAssignAction(formData)
      } finally {
        setIsSubmitting(false)
      }
    },
    [autoAssignAction]
  )

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] text-white shadow-sm">
          <Zap className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-white">
            Attribution automatique
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {unassignedCount} contact{unassignedCount !== 1 ? 's' : ''} non attribué
            {unassignedCount !== 1 ? 's' : ''} disponible{unassignedCount !== 1 ? 's' : ''}
            {schoolFilter.length > 0 ? ` · ${schoolFilter}` : ''}
          </p>
        </div>
      </div>
      <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="school" value={schoolFilter} />
        <input type="hidden" name="campaign" value={campaignFilter} />
        <div className="min-w-[180px] flex-1">
          <label
            htmlFor="auto-agent"
            className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Attribuer à
          </label>
          <select
            id="auto-agent"
            name="agentId"
            required
            className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
          >
            <option value="">Sélectionner un destinataire</option>
            <optgroup label="Moi-même (Admin)">
              <option value={adminId}>👤 {adminName} (Moi)</option>
            </optgroup>
            {agents.length > 0 ? (
              <optgroup label="Mes agents">
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
        </div>
        <div className="w-40">
          <label
            htmlFor="auto-count"
            className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Nombre de contacts
          </label>
          <input
            id="auto-count"
            type="number"
            name="count"
            required
            min={1}
            max={500}
            placeholder="Ex : 10"
            className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || unassignedCount === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {isSubmitting ? 'Attribution…' : 'Attribuer'}
        </button>
      </form>
    </div>
  )
}
