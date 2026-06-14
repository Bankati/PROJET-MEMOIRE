'use client'
import { useState } from 'react'
import { Trophy, X } from 'lucide-react'

type AgentStat = Readonly<{
  agentName: string
  totalCalls: number
  whatsappCount: number
}>

type CampaignDetail = Readonly<{
  id: string
  title: string
  adminName: string
  totalContacts: number
  totalCalls: number
  whatsappConversions: number
  falseNumbers: number
  interestedCount: number
  topAgents: readonly AgentStat[]
}>

type CampaignDetailsModalProps = Readonly<{
  campaigns: readonly CampaignDetail[]
}>

export const CampaignDetailsModal = ({
  campaigns,
}: CampaignDetailsModalProps): React.JSX.Element => {
  const [selected, setSelected] = useState<CampaignDetail | null>(null)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
              <th className="px-4 py-3">Campagne</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Contacts</th>
              <th className="px-4 py-3">Conv. WhatsApp</th>
              <th className="px-4 py-3 text-right">Détails</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                  Aucune campagne.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-white">{c.title}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.adminName}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{c.totalContacts}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {c.whatsappConversions}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      className="hover:border-lbs-blue hover:text-lbs-blue rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition dark:border-white/15 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {selected.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Admin : {selected.adminName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="grid size-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: 'Contacts',
                  value: selected.totalContacts,
                  color: 'text-blue-600 dark:text-blue-300',
                },
                {
                  label: 'Appels',
                  value: selected.totalCalls,
                  color: 'text-violet-600 dark:text-violet-300',
                },
                {
                  label: 'Intéressés',
                  value: selected.interestedCount,
                  color: 'text-emerald-600 dark:text-emerald-300',
                },
                {
                  label: 'Faux n°',
                  value: selected.falseNumbers,
                  color: 'text-rose-600 dark:text-rose-300',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-white/5"
                >
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                <Trophy className="size-4 text-amber-400" />
                Top agents
              </h3>
              {selected.topAgents.length === 0 ? (
                <p className="text-center text-sm text-zinc-400">Aucun appel enregistré.</p>
              ) : (
                <div className="space-y-2">
                  {selected.topAgents.map((a, idx) => (
                    <div key={a.agentName} className="flex items-center gap-3">
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                            : idx === 1
                              ? 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                              : 'bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-white">
                        {a.agentName}
                      </p>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {a.totalCalls} appels
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {a.whatsappCount} WA
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
