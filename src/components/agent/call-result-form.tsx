'use client'
/**
 * Formulaire de saisie du résultat d'appel.
 * Permet à l'agent de documenter le résultat après chaque appel.
 */
import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  PhoneMissed,
  PhoneOff,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'

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
}>

const outcomeOptions: readonly {
  value: CallOutcome
  label: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    value: 'interested',
    label: 'Intéressé',
    icon: <ThumbsUp className="size-4" />,
    color: 'emerald',
  },
  {
    value: 'not_interested',
    label: 'Pas intéressé',
    icon: <ThumbsDown className="size-4" />,
    color: 'rose',
  },
  { value: 'callback', label: 'Rappeler', icon: <Clock className="size-4" />, color: 'amber' },
  {
    value: 'no_answer',
    label: 'Pas de réponse',
    icon: <PhoneOff className="size-4" />,
    color: 'zinc',
  },
  {
    value: 'false_number',
    label: 'Faux numéro',
    icon: <PhoneMissed className="size-4" />,
    color: 'red',
  },
  {
    value: 'whatsapp_follow_up',
    label: 'Suivi WhatsApp',
    icon: <MessageCircle className="size-4" />,
    color: 'green',
  },
  { value: 'other', label: 'Autre', icon: <Phone className="size-4" />, color: 'blue' },
]

export const CallResultForm = ({
  assignmentId,
  campaignId,
  contactId,
  dialedPhone,
  submitAction,
}: CallResultFormProps): React.JSX.Element => {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showWhatsappOption, setShowWhatsappOption] = useState<boolean>(false)

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
      <input
        type="hidden"
        name="isWhatsappRedirected"
        value={showWhatsappOption ? 'true' : 'false'}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Résultat de l&apos;appel *
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {outcomeOptions.map((option) => {
            const isSelected: boolean = selectedOutcome === option.value
            const colorClasses: Record<string, string> = {
              emerald: isSelected
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : '',
              rose: isSelected
                ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                : '',
              amber: isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                : '',
              zinc: isSelected
                ? 'border-zinc-500 bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300'
                : '',
              red: isSelected
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                : '',
              green: isSelected
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                : '',
              blue: isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                : '',
            }
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedOutcome(option.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  isSelected
                    ? colorClasses[option.color]
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5'
                }`}
              >
                {option.icon}
                <span className="truncate">{option.label}</span>
              </button>
            )
          })}
        </div>
        <input type="hidden" name="outcome" value={selectedOutcome ?? ''} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Durée de l&apos;appel (secondes)
          </label>
          <input
            type="number"
            name="durationSeconds"
            min="0"
            defaultValue="0"
            className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
          />
        </div>
        <div className="flex items-end">
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
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Ajoutez des notes sur cet appel..."
          className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-white/10">
        <button
          type="submit"
          disabled={selectedOutcome === null || isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" />
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le résultat'}
        </button>
      </div>
    </form>
  )
}
