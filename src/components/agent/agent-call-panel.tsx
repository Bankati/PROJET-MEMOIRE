'use client'
import { useState } from 'react'
import { Delete, MessageCircle, Phone } from 'lucide-react'

type CallOutcome =
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'no_answer'
  | 'false_number'
  | 'whatsapp_follow_up'
  | 'other'

type AgentCallPanelProps = Readonly<{
  assignmentId: string
  campaignId: string
  contactId: string
  phonePrimary: string
  phoneSecondary: string | null
  contactName: string
  submitAction: (formData: FormData) => Promise<void>
}>

const OUTCOMES: readonly { value: CallOutcome; label: string }[] = [
  { value: 'interested', label: 'Intéressé' },
  { value: 'not_interested', label: 'Pas intéressé' },
  { value: 'callback', label: 'Rappeler' },
  { value: 'no_answer', label: 'Pas de réponse' },
  { value: 'false_number', label: 'Faux numéro' },
  { value: 'whatsapp_follow_up', label: 'Suivi WhatsApp' },
  { value: 'other', label: 'Autre' },
]

const KEYS: readonly { digit: string; sub: string }[] = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: '' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: '' },
]

export const AgentCallPanel = ({
  assignmentId,
  campaignId,
  contactId,
  phonePrimary,
  phoneSecondary,
  submitAction,
}: AgentCallPanelProps): React.JSX.Element => {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(false)
  const [selectedPhone, setSelectedPhone] = useState<string>(phonePrimary)
  const [dialInput, setDialInput] = useState<string>(phonePrimary)

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
    try {
      await submitAction(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Call result form ── */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-white/10">
          <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            Résultat de l&apos;appel
          </p>
        </div>
        <form action={handleSubmit} className="space-y-4 p-5">
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="contactId" value={contactId} />
          <input type="hidden" name="dialedPhone" value={selectedPhone} />
          <input type="hidden" name="outcome" value={selectedOutcome ?? ''} />
          <input type="hidden" name="isWhatsappRedirected" value={isWhatsapp ? 'true' : 'false'} />
          <input type="hidden" name="durationSeconds" value="0" />

          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
              Calendrier rappel
            </label>
            <input
              type="datetime-local"
              name="callbackAt"
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
              Résultat appel *
            </label>
            <select
              value={selectedOutcome ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setSelectedOutcome(OUTCOMES.find((o) => o.value === v)?.value ?? null)
              }}
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            >
              <option value="">Sélectionner...</option>
              {OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
              Commentaire
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Notes personnelles sur l'échange..."
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition outline-none placeholder:text-zinc-400 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={isWhatsapp}
              onChange={(e) => setIsWhatsapp(e.target.checked)}
              className="size-3.5 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
            />
            <MessageCircle className="size-3.5 text-emerald-500" />
            Continuer sur WhatsApp
          </label>

          <button
            type="submit"
            disabled={selectedOutcome === null || isSubmitting}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le rapport'}
          </button>
        </form>
      </div>

      {/* ── Phone composer / keypad ── */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-white/10">
          <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            Composer
          </p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            En ligne
          </span>
        </div>

        <div className="space-y-3 p-4">
          {/* Phone number display */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
            <p className="font-mono text-sm font-medium tracking-wider text-zinc-800 dark:text-white">
              {dialInput}
            </p>
            <button
              type="button"
              onClick={() => setDialInput((p) => p.slice(0, -1))}
              className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10 dark:hover:text-zinc-200"
            >
              <Delete className="size-3.5" />
            </button>
          </div>

          {/* Secondary phone selector */}
          {phoneSecondary ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Principal', value: phonePrimary },
                { label: 'Secondaire', value: phoneSecondary },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setSelectedPhone(p.value)
                    setDialInput(p.value)
                  }}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    selectedPhone === p.value
                      ? 'border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-white/15 dark:text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}

          {/* Numeric keypad */}
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k.digit}
                type="button"
                onClick={() => setDialInput((p) => p + k.digit)}
                className="flex flex-col items-center justify-center rounded-xl border border-zinc-100 py-3 transition hover:bg-zinc-50 active:scale-95 dark:border-white/10 dark:hover:bg-white/5"
              >
                <span className="text-base leading-none font-semibold text-zinc-800 dark:text-white">
                  {k.digit}
                </span>
                <span className="mt-0.5 text-[8px] font-medium tracking-widest text-zinc-400">
                  {k.sub || ' '}
                </span>
              </button>
            ))}
          </div>

          {/* Call + WhatsApp shortcuts */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${selectedPhone}`}
              className="bg-lbs-blue flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <Phone className="size-4" />
              Appeler
            </a>
            <a
              href={`https://wa.me/${selectedPhone.replace(/[\s+]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
