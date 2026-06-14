'use client'
/**
 * Composant de sélection multiple et attribution en masse de contacts.
 * Permet à l'admin de sélectionner plusieurs contacts et de les attribuer à un agent ou à lui-même.
 */
import { useState, useCallback } from 'react'
import {
  CheckCircle2,
  Contact as ContactIcon,
  Loader2,
  MessageCircle,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'

type ContactData = Readonly<{
  ccId: string
  firstName: string
  lastName: string | null
  phonePrimary: string
  phoneSecondary: string | null
  email: string | null
  schoolName: string | null
  isAssigned: boolean
  assignedTo: string | null
}>

type Agent = Readonly<{
  id: string
  fullName: string
}>

type BulkAssignContactsProps = Readonly<{
  contacts: readonly ContactData[]
  agents: readonly Agent[]
  adminId: string
  adminName: string
  bulkAssignAction: (formData: FormData) => Promise<void>
}>

export const BulkAssignContacts = ({
  contacts,
  agents,
  adminId,
  adminName,
  bulkAssignAction,
}: BulkAssignContactsProps): React.JSX.Element => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const unassignedContacts = contacts.filter((c) => !c.isAssigned)
  const allSelected =
    unassignedContacts.length > 0 && unassignedContacts.every((c) => selectedIds.has(c.ccId))
  const someSelected = selectedIds.size > 0

  const toggleSelect = useCallback((ccId: string): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(ccId)) {
        next.delete(ccId)
      } else {
        next.add(ccId)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((): void => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(unassignedContacts.map((c) => c.ccId)))
    }
  }, [allSelected, unassignedContacts])

  const handleAssign = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true)
    try {
      await bulkAssignAction(formData)
      setSelectedIds(new Set())
      setShowAssignModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearSelection = useCallback((): void => {
    setSelectedIds(new Set())
  }, [])

  return (
    <>
      {someSelected ? (
        <div className="border-lbs-blue/30 bg-lbs-blue/5 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 dark:border-blue-400/30 dark:bg-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="bg-lbs-blue/10 grid size-10 place-items-center rounded-lg dark:bg-blue-500/20">
              <CheckCircle2 className="text-lbs-blue size-5 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lbs-blue text-sm font-medium dark:text-blue-300">
                {selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''} sélectionné
                {selectedIds.size > 1 ? 's' : ''}
              </p>
              <p className="text-lbs-blue/70 text-xs dark:text-blue-400/70">
                Prêts pour attribution
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              <UserPlus className="size-4" />
              Attribuer
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
              title="Annuler la sélection"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <ContactIcon className="mx-auto mb-3 size-12 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            Aucun contact trouvé. Importez ou ajoutez des contacts.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                  <th className="w-12 px-5 py-3">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={unassignedContacts.length === 0}
                        className="text-lbs-blue focus:ring-lbs-blue size-4 rounded border-zinc-300 disabled:opacity-50"
                      />
                    </label>
                  </th>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">École</th>
                  <th className="px-5 py-3">Attribué à</th>
                  <th className="px-5 py-3">WhatsApp</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.ccId}
                    className={`border-b border-zinc-100 transition dark:border-white/5 ${
                      selectedIds.has(c.ccId)
                        ? 'bg-lbs-blue/5 dark:bg-blue-500/10'
                        : 'hover:bg-zinc-50/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="px-5 py-3">
                      <label className="flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.ccId)}
                          onChange={() => toggleSelect(c.ccId)}
                          disabled={c.isAssigned}
                          className="text-lbs-blue focus:ring-lbs-blue size-4 rounded border-zinc-300 disabled:opacity-50"
                        />
                      </label>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-800 dark:text-white">
                        {c.firstName} {c.lastName ?? ''}
                      </p>
                      {c.email ? (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.email}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-zinc-700 dark:text-zinc-200">{c.phonePrimary}</p>
                      {c.phoneSecondary ? (
                        <p className="text-xs text-zinc-400">{c.phoneSecondary}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {c.schoolName ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      {c.isAssigned && c.assignedTo ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                          {c.assignedTo}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">Non assigné</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`https://wa.me/${c.phonePrimary.replace(/\s+/g, '').replace(/^\+/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-emerald-500 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        title="Ouvrir WhatsApp"
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {!c.isAssigned ? (
                          <Link
                            href={`/dashboard/admin/contacts?assign=${c.ccId}`}
                            className="hover:text-lbs-blue rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
                            title="Attribuer individuellement"
                          >
                            <UserPlus className="size-4" />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAssignModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
                <Users className="text-lbs-blue size-5" />
                Attribuer {selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''}
              </h2>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </div>
            <form action={handleAssign} className="space-y-4">
              <input type="hidden" name="contactIds" value={Array.from(selectedIds).join(',')} />
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Attribuer à *
                </label>
                <select
                  name="agentId"
                  required
                  className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
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
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Les {selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''} sélectionné
                  {selectedIds.size > 1 ? 's' : ''} seront attribué{selectedIds.size > 1 ? 's' : ''}{' '}
                  à la personne choisie.
                  {selectedIds.size > 1 ? ' Chaque contact sera traité individuellement.' : ''}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  {isSubmitting ? 'Attribution...' : 'Attribuer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
