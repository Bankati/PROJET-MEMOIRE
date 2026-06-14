'use client'

import { useState } from 'react'
import { CheckCircle2, MessageCircle, Pencil } from 'lucide-react'

type CallOutcome =
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'no_answer'
  | 'false_number'
  | 'whatsapp_follow_up'
  | 'other'

type CallResultFormProps = Readonly<{
  assignmentId: string
  campaignId: string
  contactId: string
  dialedPhone: string
  submitAction: (formData: FormData) => Promise<void>
  mode?: 'create' | 'edit'
  callResultId?: string
  defaultOutcome?: CallOutcome
  defaultNotes?: string | null
  defaultDuration?: number
  defaultWhatsapp?: boolean
}>

const outcomeOptions: readonly { value: CallOutcome; label: string }[] = [
  { value: 'interested', label: 'Intéressé' },
  { value: 'not_interested', label: 'Pas intéressé' },
  { value: 'callback', label: 'Rappeler' },
  { value: 'no_answer', label: 'Pas de réponse' },
  { value: 'false_number', label: 'Faux numéro' },
  { value: 'whatsapp_follow_up', label: 'Suivi WhatsApp' },
  { value: 'other', label: 'Autre' },
]

export const CallResultForm = ({
  assignmentId,
  campaignId,
  contactId,
  dialedPhone,
  submitAction,
  mode = 'create',
  callResultId,
  defaultOutcome,
  defaultNotes,
  defaultWhatsapp,
}: CallResultFormProps): React.JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showWhatsappOption, setShowWhatsappOption] = useState<boolean>(defaultWhatsapp ?? false)
  const [outcome, setOutcome] = useState<CallOutcome | ''>(defaultOutcome ?? '')

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
    try {
      await submitAction(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="contactId" value={contactId} />
      <input type="hidden" name="dialedPhone" value={dialedPhone} />
      <input type="hidden" name="durationSeconds" value="0" />
      <input
        type="hidden"
        name="isWhatsappRedirected"
        value={showWhatsappOption ? 'true' : 'false'}
      />
      {mode === 'edit' && callResultId ? (
        <input type="hidden" name="callResultId" value={callResultId} />
      ) : null}

      <div>
        <label
          htmlFor="outcome-select"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Résultat de l&apos;appel *
        </label>
        <select
          id="outcome-select"
          name="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value as CallOutcome | '')}
          required
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none focus:border-[#244976] focus:ring-2 focus:ring-[#244976]/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
        >
          <option value="" disabled>
            — Sélectionner un résultat —
          </option>
          {outcomeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm transition hover:bg-zinc-50 dark:border-white/15 dark:bg-[#0f1729] dark:hover:bg-white/5">
          <input
            type="checkbox"
            checked={showWhatsappOption}
            onChange={(e) => setShowWhatsappOption(e.target.checked)}
            className="size-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
          />
          <MessageCircle className="size-4 text-emerald-500" />
          <span className="text-zinc-700 dark:text-zinc-300">Continuer sur WhatsApp</span>
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultNotes ?? ''}
          placeholder="Ajoutez des notes sur cet appel..."
          className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-white/10">
        <button
          type="submit"
          disabled={outcome === '' || isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === 'edit' ? (
            <>
              <Pencil className="size-4" />
              {isSubmitting ? 'Modification...' : 'Modifier le résultat'}
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le résultat'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
