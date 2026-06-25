'use client'
import { useState, useRef } from 'react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Contact,
  Edit3,
  FileText,
  Globe,
  Loader2,
  Lock,
  Megaphone,
  Save,
  Trash2,
  X,
} from 'lucide-react'

type CampaignData = Readonly<{
  id: string
  title: string
  year: number
  baseScript: string
  details: string | null
  pdfUrl: string | null
  status: string
  visibility: 'public' | 'private'
  createdAt: Date
  contactCount: number
}>

type CampaignEditPanelProps = Readonly<{
  campaign: CampaignData
  updateAction: (formData: FormData) => void
  deleteAction: (formData: FormData) => void
}>

const STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Brouillon',
    color:
      'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-300 dark:border-white/10',
  },
  {
    value: 'active',
    label: 'Active',
    color:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  {
    value: 'paused',
    label: 'En pause',
    color:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  {
    value: 'completed',
    label: 'Terminée',
    color:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  },
  {
    value: 'archived',
    label: 'Archivée',
    color:
      'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-400 dark:border-white/10',
  },
] as const

const SCRIPT_MAX = 2000

export const CampaignEditPanel = ({
  campaign,
  updateAction,
  deleteAction,
}: CampaignEditPanelProps): React.JSX.Element => {
  const [title, setTitle] = useState(campaign.title)
  const [year, setYear] = useState(String(campaign.year))
  const [status, setStatus] = useState(campaign.status)
  const [visibility, setVisibility] = useState<'public' | 'private'>(campaign.visibility)
  const [scriptLen, setScriptLen] = useState(campaign.baseScript.length)
  const [scriptError, setScriptError] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const scriptColor =
    scriptLen >= SCRIPT_MAX
      ? 'text-rose-500 font-medium'
      : scriptLen >= SCRIPT_MAX * 0.9
        ? 'text-amber-500'
        : 'text-zinc-400'

  const isDirty =
    title !== campaign.title ||
    year !== String(campaign.year) ||
    status !== campaign.status ||
    visibility !== campaign.visibility

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
      {/* ── Sticky header ── */}
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <a
          href="/dashboard/admin/campaigns"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-700 dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="size-3.5" />
          Retour
        </a>

        <div className="min-w-0 flex-1">
          <input
            form="edit-form"
            name="title-display"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Titre de la campagne"
            className="focus:text-lbs-blue w-full truncate bg-transparent text-xl font-bold text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-white dark:focus:text-blue-300"
            placeholder="Titre de la campagne"
          />
          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="size-3" />
            Créée le {campaign.createdAt.toLocaleDateString('fr-FR')}
            <span className="text-zinc-200 dark:text-zinc-700">·</span>
            <Contact className="size-3" />
            {campaign.contactCount} contact{campaign.contactCount !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="size-3.5" />
              Supprimer
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-500/30 dark:bg-rose-500/10">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
                Confirmer ?
              </span>
              <form action={deleteAction} className="inline-flex gap-1">
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-700"
                >
                  Oui
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-1.5 py-1 text-zinc-400 transition hover:text-zinc-600"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <button
            type="submit"
            form="edit-form"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* ── Status quick-select ── */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Statut de la campagne
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                status === opt.value
                  ? `${opt.color} shadow-sm ring-2 ring-current/30 ring-offset-1`
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-400'
              }`}
            >
              {status === opt.value && <CheckCircle2 className="size-3" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main form ── */}
      <form
        id="edit-form"
        ref={formRef}
        action={updateAction}
        onSubmit={(e) => {
          const el = formRef.current?.elements.namedItem('baseScript')
          const script = (el instanceof HTMLTextAreaElement ? el.value : undefined)?.trim() ?? ''
          if (script.length === 0) {
            e.preventDefault()
            setScriptError(true)
            return
          }
          setScriptError(false)
          setIsPending(true)
        }}
      >
        <input type="hidden" name="campaignId" value={campaign.id} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="visibility" value={visibility} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left: Script + Détails ── */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-lbs-blue/10 grid size-7 place-items-center rounded-lg dark:bg-blue-500/15">
                    <Megaphone className="text-lbs-blue size-3.5 dark:text-blue-300" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-white">
                    Script d&apos;appel
                  </span>
                  <span className="text-[10px] text-rose-400">*</span>
                </div>
                <span className={`text-[11px] tabular-nums ${scriptColor}`}>
                  {scriptLen} / {SCRIPT_MAX}
                </span>
              </div>
              <textarea
                name="baseScript"
                rows={10}
                defaultValue={campaign.baseScript}
                onChange={(e) => {
                  setScriptLen(e.target.value.length)
                  if (e.target.value.trim().length > 0) setScriptError(false)
                }}
                maxLength={SCRIPT_MAX}
                placeholder="Bonjour, je vous appelle de la part de LBS…"
                className={`w-full resize-none rounded-xl border bg-zinc-50/50 px-4 py-3 text-sm leading-relaxed text-zinc-800 transition-all placeholder:text-zinc-400 focus:ring-2 focus:outline-none dark:bg-white/5 dark:text-white ${
                  scriptError
                    ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                    : 'focus:border-lbs-blue focus:ring-lbs-blue/20 border-zinc-200 dark:border-white/10'
                }`}
              />
              {scriptError ? (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Le script est obligatoire.
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-zinc-400">
                  Ce texte sera lu par vos agents lors des appels téléphoniques.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
                  <Edit3 className="size-3.5 text-violet-600 dark:text-violet-300" />
                </div>
                <span className="text-sm font-semibold text-zinc-800 dark:text-white">Détails</span>
                <span className="text-[10px] text-zinc-400">(optionnel)</span>
              </div>
              <textarea
                name="details"
                rows={4}
                defaultValue={campaign.details ?? ''}
                placeholder="Objectifs, consignes particulières, contexte de la campagne…"
                className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm leading-relaxed text-zinc-800 transition-all placeholder:text-zinc-400 focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          {/* ── Right: Metadata sidebar ── */}
          <div className="space-y-5">
            {/* Infos générales */}
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <p className="mb-4 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                Informations
              </p>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ep-year"
                    className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Année
                  </label>
                  <input
                    id="ep-year"
                    name="year"
                    type="number"
                    min={2020}
                    max={2035}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-white/5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Contacts importés
                  </span>
                  <span className="text-sm font-bold text-zinc-800 dark:text-white">
                    {campaign.contactCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Visibilité */}
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                Visibilité
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition ${
                    visibility === 'private'
                      ? 'border-lbs-blue bg-lbs-blue/5 dark:border-blue-400 dark:bg-blue-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-white/10'
                  }`}
                >
                  <div
                    className={`grid size-8 place-items-center rounded-lg ${visibility === 'private' ? 'bg-lbs-blue text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'}`}
                  >
                    <Lock className="size-4" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${visibility === 'private' ? 'text-lbs-blue dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    Privée
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition ${
                    visibility === 'public'
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-white/10'
                  }`}
                >
                  <div
                    className={`grid size-8 place-items-center rounded-lg ${visibility === 'public' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'}`}
                  >
                    <Globe className="size-4" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${visibility === 'public' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    Publique
                  </span>
                </button>
              </div>
              <p
                className={`mt-2 rounded-lg px-3 py-2 text-[11px] ${visibility === 'public' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'}`}
              >
                {visibility === 'public'
                  ? 'Les autres administrateurs peuvent importer des contacts dans cette campagne.'
                  : 'Seul vous pouvez gérer les contacts de cette campagne.'}
              </p>
            </div>

            {/* PDF */}
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid size-7 place-items-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
                  <FileText className="size-3.5 text-amber-600 dark:text-amber-300" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                  Document PDF
                </span>
              </div>
              <input
                name="pdfUrl"
                type="url"
                defaultValue={campaign.pdfUrl ?? ''}
                placeholder="https://exemple.com/brochure.pdf"
                className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <p className="mt-1.5 text-[11px] text-zinc-400">
                Accessible par les agents pendant l&apos;appel.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom save bar (mobile sticky) ── */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-white px-5 py-3 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="text-xs text-zinc-400">
            {isDirty ? (
              <span className="text-amber-500">● Modifications non sauvegardées</span>
            ) : (
              <span className="text-emerald-500">● À jour</span>
            )}
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
