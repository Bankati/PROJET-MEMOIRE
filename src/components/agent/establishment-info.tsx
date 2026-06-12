'use client'
/**
 * Section d'informations rapides sur l'établissement.
 * Permet à l'agent d'accéder rapidement aux informations clés sans quitter l'écran.
 */
import { useState } from 'react'
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Info,
  MapPin,
  Users,
} from 'lucide-react'

type EstablishmentInfoProps = Readonly<{
  campaignTitle: string
  campaignDetails: string | null
  schoolName: string | null
  city: string | null
}>

export const EstablishmentInfo = ({
  campaignTitle,
  campaignDetails,
  schoolName,
  city,
}: EstablishmentInfoProps): React.JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const infoItems: readonly { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <Building2 className="size-4 text-blue-400" />,
      label: 'Établissement',
      value: schoolName ?? 'Non spécifié',
    },
    {
      icon: <MapPin className="size-4 text-emerald-400" />,
      label: 'Ville',
      value: city ?? 'Non spécifiée',
    },
    {
      icon: <GraduationCap className="size-4 text-violet-400" />,
      label: 'Campagne',
      value: campaignTitle,
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Info className="size-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-white">
            Infos établissement
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="size-5 text-zinc-400" />
        ) : (
          <ChevronDown className="size-5 text-zinc-400" />
        )}
      </button>

      {isExpanded ? (
        <div className="border-t border-zinc-200 px-5 py-4 dark:border-white/10">
          <div className="space-y-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                {item.icon}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</p>
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {campaignDetails ? (
            <div className="mt-4 rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
              <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Détails de la campagne
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{campaignDetails}</p>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-500/10">
              <Users className="mx-auto mb-1 size-5 text-blue-500" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Capacité</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-white">500+</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-500/10">
              <Calendar className="mx-auto mb-1 size-5 text-emerald-500" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Rentrée</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-white">Sept. 2025</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
