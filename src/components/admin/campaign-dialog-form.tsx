'use client'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Edit3, Globe, Lock, Loader2, Megaphone, Plus } from 'lucide-react'

import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type CampaignData = Readonly<{
  id: string
  title: string
  year: number
  baseScript: string
  details: string | null
  pdfUrl: string | null
  status: string
  visibility: 'public' | 'private'
}>

type CampaignDialogFormProps = Readonly<{
  mode: 'create' | 'edit'
  campaign?: CampaignData
  createAction: (formData: FormData) => void
  updateAction: (formData: FormData) => void
}>

const SCRIPT_MAX = 2000

const STEPS = ['Informations', 'Contenu'] as const

export const CampaignDialogForm = ({
  mode,
  campaign,
  createAction,
  updateAction,
}: CampaignDialogFormProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [isPending, setIsPending] = useState(false)

  // Controlled fields for step-1 validation + visibility UI
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    campaign?.visibility ?? 'private'
  )
  const [titleVal, setTitleVal] = useState(campaign?.title ?? '')
  const [yearVal, setYearVal] = useState(String(campaign?.year ?? new Date().getFullYear()))
  const [scriptLen, setScriptLen] = useState(campaign?.baseScript?.length ?? 0)
  const [scriptError, setScriptError] = useState(false)

  const isEdit = mode === 'edit' && campaign !== undefined
  const formAction = isEdit ? updateAction : createAction

  const handleOpen = () => {
    setStep(1)
    setIsPending(false)
    setTitleVal(campaign?.title ?? '')
    setYearVal(String(campaign?.year ?? new Date().getFullYear()))
    setVisibility(campaign?.visibility ?? 'private')
    setScriptLen(campaign?.baseScript?.length ?? 0)
    setScriptError(false)
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  const step1Valid = titleVal.trim().length > 0 && yearVal.trim().length > 0

  const scriptColor =
    scriptLen >= SCRIPT_MAX
      ? 'text-rose-500 font-medium'
      : scriptLen >= SCRIPT_MAX * 0.9
        ? 'text-amber-500'
        : 'text-zinc-400'

  return (
    <>
      <Button
        variant={isEdit ? 'outline' : 'default'}
        onClick={handleOpen}
        className={
          isEdit
            ? 'hover:text-lbs-blue gap-1.5 rounded-lg border-zinc-200 text-zinc-600 dark:border-white/15 dark:text-zinc-400'
            : 'gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110'
        }
      >
        {isEdit ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
        {isEdit ? 'Modifier' : 'Nouvelle campagne'}
      </Button>

      <FormDialog
        isOpen={isOpen}
        onClose={handleClose}
        title={isEdit ? 'Modifier la campagne' : 'Nouvelle campagne'}
        description={
          isEdit
            ? 'Mettez à jour les informations de votre campagne.'
            : 'Configurez votre campagne en deux étapes rapides.'
        }
        icon={<Megaphone className="text-lbs-blue size-5 dark:text-blue-300" />}
        maxWidth="max-w-xl"
      >
        {/* ── Indicateur de progression (création uniquement) ── */}
        {!isEdit && (
          <div className="mb-6 flex items-center gap-2">
            {STEPS.map((label, idx) => {
              const n = idx + 1
              const active = step === n
              const done = step > n
              return (
                <div key={label} className="flex items-center gap-2">
                  {idx > 0 && (
                    <div
                      className={`h-px w-10 transition-colors sm:w-16 ${
                        done || active ? 'bg-lbs-blue' : 'bg-zinc-200 dark:bg-white/10'
                      }`}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        active
                          ? 'bg-lbs-blue text-white'
                          : done
                            ? 'bg-lbs-blue/20 text-lbs-blue dark:bg-blue-500/20 dark:text-blue-300'
                            : 'bg-zinc-100 text-zinc-400 dark:bg-white/10 dark:text-zinc-500'
                      }`}
                    >
                      {n}
                    </div>
                    <span
                      className={`hidden text-xs font-medium sm:block ${
                        active
                          ? 'text-zinc-800 dark:text-white'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <form
          action={formAction}
          onSubmit={(e) => {
            // Bloquer toute soumission si on n'est pas sur l'étape finale
            if (step === 1 && !isEdit) {
              e.preventDefault()
              return
            }
            const form = e.currentTarget
            const script =
              (
                form.elements.namedItem('baseScript') as HTMLTextAreaElement | null
              )?.value?.trim() ?? ''
            if (script.length === 0) {
              e.preventDefault()
              setScriptError(true)
              return
            }
            setScriptError(false)
            setIsPending(true)
          }}
          className="space-y-5"
        >
          {isEdit && <input type="hidden" name="campaignId" value={campaign.id} />}
          <input type="hidden" name="visibility" value={visibility} />

          {/* ══ ÉTAPE 1 — Informations générales ══
              Toujours dans le DOM (même cachée) → inputs soumis avec le formulaire */}
          <div className={step === 1 || isEdit ? 'space-y-4' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dialog-title">
                  Titre <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="dialog-title"
                  name="title"
                  value={titleVal}
                  onChange={(e) => setTitleVal(e.target.value)}
                  placeholder="Ex : Campagne Rentrée 2026"
                  autoFocus={step === 1}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dialog-year">
                  Année <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="dialog-year"
                  name="year"
                  type="number"
                  min={2020}
                  max={2035}
                  value={yearVal}
                  onChange={(e) => setYearVal(e.target.value)}
                />
              </div>
            </div>

            {/* Visibilité */}
            <div className="space-y-2">
              <Label>Visibilité</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                    visibility === 'private'
                      ? 'border-lbs-blue bg-lbs-blue/5 dark:border-blue-400 dark:bg-blue-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-white/15 dark:hover:border-white/25'
                  }`}
                >
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      visibility === 'private'
                        ? 'bg-lbs-blue text-white'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'
                    }`}
                  >
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        visibility === 'private'
                          ? 'text-lbs-blue dark:text-blue-300'
                          : 'text-zinc-800 dark:text-white'
                      }`}
                    >
                      Privée
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      Vous seul pouvez gérer
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                    visibility === 'public'
                      ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-white/15 dark:hover:border-white/25'
                  }`}
                >
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      visibility === 'public'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400'
                    }`}
                  >
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        visibility === 'public'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-800 dark:text-white'
                      }`}
                    >
                      Publique
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      Tout admin peut contribuer
                    </p>
                  </div>
                </button>
              </div>
              <p
                className={`rounded-lg px-3 py-2 text-[11px] transition-all ${
                  visibility === 'public'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'
                }`}
              >
                {visibility === 'public'
                  ? 'Les autres administrateurs pourront importer des contacts et les attribuer à leurs agents dans cette campagne.'
                  : 'Seul vous pouvez importer des contacts et gérer les attributions de cette campagne.'}
              </p>
            </div>

            {/* Statut — modification uniquement */}
            {isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="dialog-status">Statut</Label>
                <select
                  id="dialog-status"
                  name="status"
                  defaultValue={campaign.status}
                  className="focus:border-lbs-blue flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Active</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminée</option>
                  <option value="archived">Archivée</option>
                </select>
              </div>
            )}
          </div>

          {/* ══ ÉTAPE 2 — Contenu de la campagne ══ */}
          <div className={step === 2 || isEdit ? 'space-y-4' : 'hidden'}>
            {/* Script */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="dialog-script">
                  Script de base <span className="text-rose-400">*</span>
                </Label>
                <span className={`text-[11px] tabular-nums transition-colors ${scriptColor}`}>
                  {scriptLen} / {SCRIPT_MAX}
                </span>
              </div>
              <textarea
                id="dialog-script"
                name="baseScript"
                rows={5}
                defaultValue={campaign?.baseScript ?? ''}
                onChange={(e) => {
                  setScriptLen(e.target.value.length)
                  if (e.target.value.trim().length > 0) setScriptError(false)
                }}
                maxLength={SCRIPT_MAX}
                placeholder="Bonjour, je vous appelle de la part de LBS. Je vous contacte au sujet de..."
                className={`w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:ring-2 focus:outline-none dark:bg-[#0f1729] dark:text-white ${
                  scriptError
                    ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                    : 'focus:border-lbs-blue focus:ring-lbs-blue/20 border-zinc-200 dark:border-white/15'
                }`}
              />
              {scriptError ? (
                <p className="text-[11px] font-medium text-rose-500">
                  Le script est obligatoire pour créer une campagne.
                </p>
              ) : (
                <p className="text-[11px] text-zinc-400">
                  Ce texte sera lu par vos agents lors des appels téléphoniques.
                </p>
              )}
            </div>

            {/* Détails */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-details">
                Détails <span className="text-[11px] font-normal text-zinc-400">(optionnel)</span>
              </Label>
              <textarea
                id="dialog-details"
                name="details"
                rows={2}
                defaultValue={campaign?.details ?? ''}
                placeholder="Objectifs, consignes particulières, contexte de la campagne..."
                className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:ring-2 focus:outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              />
            </div>

            {/* URL PDF */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-pdf">
                Document PDF{' '}
                <span className="text-[11px] font-normal text-zinc-400">(optionnel)</span>
              </Label>
              <Input
                id="dialog-pdf"
                name="pdfUrl"
                type="url"
                defaultValue={campaign?.pdfUrl ?? ''}
                placeholder="https://exemple.com/brochure.pdf"
              />
              <p className="text-[11px] text-zinc-400">
                Accessible par les agents depuis l&apos;onglet Docs pendant l&apos;appel.
              </p>
            </div>
          </div>

          {/* ── Pied de formulaire ── */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
            {/* Bouton gauche */}
            {step === 2 && !isEdit ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="gap-1.5 text-zinc-500"
              >
                <ArrowLeft className="size-4" />
                Retour
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={handleClose} className="text-zinc-500">
                Annuler
              </Button>
            )}

            {/* Bouton droit */}
            {step === 1 && !isEdit ? (
              <button
                type="button"
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Suivant
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : isEdit ? (
                  <Edit3 className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                {isPending
                  ? 'Enregistrement…'
                  : isEdit
                    ? 'Enregistrer les modifications'
                    : 'Créer la campagne'}
              </button>
            )}
          </div>
        </form>
      </FormDialog>
    </>
  )
}
