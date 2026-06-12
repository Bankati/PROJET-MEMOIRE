'use client'
/**
 * Composeur d'appel pour l'agent.
 * Affiche les numéros disponibles et permet de sélectionner lequel appeler.
 */
import { useState } from 'react'
import { Check, ChevronDown, MessageCircle, Phone, PhoneCall, PhoneOff } from 'lucide-react'

type PhoneDialerProps = Readonly<{
  phonePrimary: string
  phoneSecondary: string | null
  contactName: string
  onPhoneSelect?: (phone: string) => void
}>

export const PhoneDialer = ({
  phonePrimary,
  phoneSecondary,
  contactName,
  onPhoneSelect,
}: PhoneDialerProps): React.JSX.Element => {
  const [selectedPhone, setSelectedPhone] = useState<string>(phonePrimary)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle')

  const phones: readonly { label: string; value: string }[] = [
    { label: 'Principal', value: phonePrimary },
    ...(phoneSecondary ? [{ label: 'Secondaire', value: phoneSecondary }] : []),
  ]

  const handlePhoneSelect = (phone: string): void => {
    setSelectedPhone(phone)
    onPhoneSelect?.(phone)
    setIsDropdownOpen(false)
  }

  const handleStartCall = (): void => {
    setCallStatus('calling')
    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCallStatus('connected')
    }, 2000)
  }

  const handleEndCall = (): void => {
    setCallStatus('ended')
    setTimeout(() => {
      setCallStatus('idle')
    }, 1000)
  }

  const formatPhoneDisplay = (phone: string): string => {
    return phone.replace(/(\+\d{2,3})(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3 $4')
  }

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
          <Phone className="size-4 text-blue-400" />
          Composeur d&apos;appel
        </h3>
        {callStatus === 'connected' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            En ligne
          </span>
        ) : callStatus === 'calling' ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <span className="size-2 animate-pulse rounded-full bg-amber-500" />
            Appel en cours...
          </span>
        ) : null}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Numéro à appeler
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={callStatus !== 'idle'}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:hover:border-white/25"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-white">
                  {formatPhoneDisplay(selectedPhone)}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {phones.find((p) => p.value === selectedPhone)?.label ?? 'Principal'}
                </p>
              </div>
            </div>
            {phones.length > 1 ? (
              <ChevronDown
                className={`size-5 text-zinc-400 transition ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            ) : null}
          </button>
          {isDropdownOpen && phones.length > 1 ? (
            <div className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-white/15 dark:bg-[#1a2332]">
              {phones.map((phone) => (
                <button
                  key={phone.value}
                  type="button"
                  onClick={() => handlePhoneSelect(phone.value)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-white">
                      {formatPhoneDisplay(phone.value)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{phone.label}</p>
                  </div>
                  {selectedPhone === phone.value ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {callStatus === 'idle' || callStatus === 'ended' ? (
          <button
            type="button"
            onClick={handleStartCall}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <PhoneCall className="size-4" />
            Appeler {contactName.split(' ')[0]}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEndCall}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <PhoneOff className="size-4" />
            Raccrocher
          </button>
        )}
        <a
          href={`https://wa.me/${selectedPhone.replace(/\s+/g, '').replace(/^\+/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="grid size-12 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
          title="Ouvrir WhatsApp"
        >
          <MessageCircle className="size-5" />
        </a>
      </div>

      <p className="mt-3 text-center text-[11px] text-zinc-400">
        L&apos;intégration Twilio sera activée prochainement
      </p>
    </div>
  )
}
