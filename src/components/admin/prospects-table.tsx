'use client'

import { useState, useMemo, useCallback } from 'react'
import { ArrowRightLeft, Check, ChevronDown, Filter, Loader2, Search, X } from 'lucide-react'

import type { ProspectRow, CampaignOption, AgentOption } from '@/app/dashboard/admin/prospects/page'

// ─── Libellés & couleurs des statuts ──────────────────────────────────────────

const OUTCOME_LABELS: Record<string, string> = {
  interested: 'Intéressé',
  not_interested: 'Pas intéressé',
  callback: 'Rappel nécessaire',
  no_answer: 'Pas de réponse',
  false_number: 'Faux numéro',
  whatsapp_follow_up: 'Suivi WhatsApp',
  other: 'Autre',
}

const OUTCOME_COLORS: Record<string, string> = {
  interested: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  not_interested: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  callback: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  no_answer: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400',
  false_number: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  whatsapp_follow_up: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  other: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400',
}

const SOURCE_LABELS: Record<string, string> = {
  excel_import: 'Import Excel',
  manual_form: 'Formulaire',
  campaign_reuse: 'Transfert',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fullName = (row: ProspectRow): string =>
  [row.firstName, row.lastName].filter(Boolean).join(' ') || '—'

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Filters = {
  search: string
  campaignId: string
  outcome: string
  agentName: string
}

type TransferResult = {
  transferred: number
  skipped: number
  message: string
}

type ApiTransferResult = TransferResult & { ok: boolean }

const isApiTransferResult = (v: unknown): v is ApiTransferResult => {
  if (typeof v !== 'object' || v === null) return false
  // Record<string,unknown> needed to access properties of a narrowed `object`
  const obj = v as Record<string, unknown>
  return (
    typeof obj.ok === 'boolean' &&
    typeof obj.transferred === 'number' &&
    typeof obj.skipped === 'number' &&
    typeof obj.message === 'string'
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

type Props = Readonly<{
  prospects: ProspectRow[]
  campaigns: CampaignOption[]
  agents: AgentOption[]
}>

export const ProspectsTable = ({ prospects, campaigns }: Props): React.JSX.Element => {
  // Filtres
  const [filters, setFilters] = useState<Filters>({
    search: '',
    campaignId: '',
    outcome: '',
    agentName: '',
  })

  // Sélection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Dialog transfert
  const [transferOpen, setTransferOpen] = useState(false)
  const [targetCampaignId, setTargetCampaignId] = useState('')
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null)

  // ── Filtrage client-side ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase()
    return prospects.filter((p) => {
      if (filters.campaignId && p.campaignId !== filters.campaignId) return false
      if (filters.outcome && p.lastOutcome !== filters.outcome) return false
      if (filters.agentName && p.lastAgentName !== filters.agentName) return false
      if (q) {
        const haystack = [
          p.firstName,
          p.lastName,
          p.phonePrimary,
          p.phoneSecondary,
          p.schoolName,
          p.city,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [prospects, filters])

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.ccId))
  const someSelected = selected.size > 0

  // ── Handlers sélection ──────────────────────────────────────────────────────

  const toggleOne = useCallback((ccId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(ccId)) {
        next.delete(ccId)
      } else {
        next.add(ccId)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.delete(p.ccId))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((p) => next.add(p.ccId))
        return next
      })
    }
  }, [allFilteredSelected, filtered])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  // ── Handler transfert ───────────────────────────────────────────────────────

  const handleTransfer = useCallback(async () => {
    if (!targetCampaignId || selected.size === 0) return
    setTransferLoading(true)
    setTransferResult(null)
    try {
      const res = await fetch('/api/contacts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ccIds: [...selected], targetCampaignId }),
      })
      const json: unknown = await res.json()
      if (!isApiTransferResult(json)) {
        setTransferResult({ transferred: 0, skipped: 0, message: 'Réponse invalide du serveur.' })
        return
      }
      setTransferResult(json)
      if (json.ok) {
        clearSelection()
      }
    } catch {
      setTransferResult({ transferred: 0, skipped: 0, message: 'Erreur réseau. Réessayez.' })
    } finally {
      setTransferLoading(false)
    }
  }, [targetCampaignId, selected, clearSelection])

  const openTransfer = (): void => {
    setTransferResult(null)
    setTargetCampaignId('')
    setTransferOpen(true)
  }

  const closeTransfer = (): void => {
    setTransferOpen(false)
    setTransferResult(null)
  }

  // ── Unicité des agents présents dans les données ────────────────────────────
  const agentNames = useMemo(() => {
    const names = new Set(
      prospects.map((p) => p.lastAgentName).filter((x): x is string => x !== null)
    )
    return [...names].sort()
  }, [prospects])

  // ── Rendu ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Barre de filtres ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="size-4 shrink-0 text-zinc-400" />

          {/* Recherche texte */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Nom, téléphone, école…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="focus:ring-lbs-blue w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Filtre campagne */}
          <div className="relative">
            <select
              value={filters.campaignId}
              onChange={(e) => setFilters((f) => ({ ...f, campaignId: e.target.value }))}
              className="focus:ring-lbs-blue appearance-none rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-8 pl-3 text-sm text-zinc-700 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value="">Toutes les campagnes</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {c.year ? `(${c.year})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-zinc-400" />
          </div>

          {/* Filtre statut */}
          <div className="relative">
            <select
              value={filters.outcome}
              onChange={(e) => setFilters((f) => ({ ...f, outcome: e.target.value }))}
              className="focus:ring-lbs-blue appearance-none rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-8 pl-3 text-sm text-zinc-700 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
              <option value="__none__">Jamais appelé</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-zinc-400" />
          </div>

          {/* Filtre agent */}
          {agentNames.length > 0 && (
            <div className="relative">
              <select
                value={filters.agentName}
                onChange={(e) => setFilters((f) => ({ ...f, agentName: e.target.value }))}
                className="focus:ring-lbs-blue appearance-none rounded-lg border border-zinc-200 bg-zinc-50 py-2 pr-8 pl-3 text-sm text-zinc-700 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <option value="">Tous les agents</option>
                {agentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-zinc-400" />
            </div>
          )}

          {/* Reset filtres */}
          {(filters.search || filters.campaignId || filters.outcome || filters.agentName) && (
            <button
              type="button"
              onClick={() => setFilters({ search: '', campaignId: '', outcome: '', agentName: '' })}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <X className="size-3.5" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Barre d'actions sélection ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-white">{filtered.length}</span>{' '}
          prospect(s) affiché(s)
          {someSelected && (
            <>
              {' '}
              — <span className="text-lbs-blue font-medium">{selected.size}</span> sélectionné(s)
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          {someSelected && (
            <>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Désélectionner tout
              </button>
              <button
                type="button"
                onClick={openTransfer}
                className="bg-lbs-blue flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <ArrowRightLeft className="size-4" />
                Transférer ({selected.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Tableau ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="accent-lbs-blue rounded border-zinc-300"
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Prospect
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Campagne
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Dernier statut
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Dernier appel
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Agent
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-400 dark:text-zinc-500"
                  >
                    Aucun prospect ne correspond à ces filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isSelected = selected.has(p.ccId)
                  const outcomeKey = p.lastOutcome ?? ''
                  return (
                    <tr
                      key={p.ccId}
                      onClick={() => toggleOne(p.ccId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-500/10'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.ccId)}
                          className="accent-lbs-blue rounded border-zinc-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-white">
                          {fullName(p)}
                        </div>
                        {p.schoolName && (
                          <div className="text-xs text-zinc-400">{p.schoolName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        <div>{p.phonePrimary ?? '—'}</div>
                        {p.phoneSecondary && (
                          <div className="text-xs text-zinc-400">{p.phoneSecondary}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-zinc-800 dark:text-zinc-200">{p.campaignTitle}</div>
                        {p.campaignYear && (
                          <div className="text-xs text-zinc-400">{p.campaignYear}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {outcomeKey ? (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${OUTCOME_COLORS[outcomeKey] ?? 'bg-zinc-100 text-zinc-500'}`}
                          >
                            {OUTCOME_LABELS[outcomeKey] ?? outcomeKey}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Jamais appelé</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(p.lastCallAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {p.lastAgentName ?? <span className="text-zinc-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                          {SOURCE_LABELS[p.source] ?? p.source}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Dialog de transfert ───────────────────────────────────────────────── */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            {/* En-tête */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Transférer vers une campagne
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {selected.size} prospect(s) sélectionné(s) — les doublons seront ignorés
                  automatiquement.
                </p>
              </div>
              <button
                type="button"
                onClick={closeTransfer}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Résultat affiché après transfert */}
            {transferResult ? (
              <div className="space-y-4">
                <div
                  className={`rounded-xl border p-4 ${
                    transferResult.transferred > 0
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                      : 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={`size-5 ${transferResult.transferred > 0 ? 'text-emerald-600' : 'text-amber-600'}`}
                    />
                    <p
                      className={`text-sm font-medium ${transferResult.transferred > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}
                    >
                      {transferResult.message}
                    </p>
                  </div>
                  {transferResult.transferred > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 p-3 text-center dark:bg-zinc-800/50">
                        <div className="text-2xl font-bold text-emerald-600">
                          {transferResult.transferred}
                        </div>
                        <div className="text-xs text-zinc-500">Transféré(s)</div>
                      </div>
                      <div className="rounded-lg bg-white/70 p-3 text-center dark:bg-zinc-800/50">
                        <div className="text-2xl font-bold text-zinc-400">
                          {transferResult.skipped}
                        </div>
                        <div className="text-xs text-zinc-500">Déjà présent(s)</div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeTransfer}
                  className="bg-lbs-blue w-full rounded-xl py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            ) : (
              /* Formulaire de sélection de campagne cible */
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Campagne cible
                  </label>
                  <div className="relative">
                    <select
                      value={targetCampaignId}
                      onChange={(e) => setTargetCampaignId(e.target.value)}
                      className="focus:ring-lbs-blue w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 pr-8 text-sm text-zinc-900 focus:ring-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value="">— Choisir une campagne —</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} {c.year ? `(${c.year})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>

                {/* Info déduplication */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  L&apos;historique complet des prospects est conservé. Les contacts déjà présents
                  dans la campagne cible ne seront pas dupliqués.
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeTransfer}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleTransfer}
                    disabled={!targetCampaignId || transferLoading}
                    className="bg-lbs-blue flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {transferLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Transfert…
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="size-4" /> Confirmer le transfert
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
