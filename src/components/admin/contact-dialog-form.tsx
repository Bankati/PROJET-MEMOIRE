'use client'
/**
 * Formulaire d'ajout de contact dans un dialog centré animé.
 * Tous les champs métier du modèle contacts avec sélection de campagne.
 */
import { useState } from 'react'
import { Contact, Plus, UserPlus } from 'lucide-react'

import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type CampaignOption = Readonly<{ id: string; title: string }>

type ContactDialogFormProps = Readonly<{
  campaigns: readonly CampaignOption[]
  addAction: (formData: FormData) => void
}>

export const ContactDialogForm = ({
  campaigns,
  addAction,
}: ContactDialogFormProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110"
      >
        <Plus className="size-4" />
        Ajouter
      </Button>
      <FormDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ajouter un contact"
        description="Remplissez les informations du prospect à ajouter à votre campagne."
        icon={<Contact className="text-lbs-blue size-5 dark:text-blue-300" />}
        maxWidth="max-w-xl"
      >
        <form action={addAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-firstName">Prénom *</Label>
              <Input
                id="dialog-contact-firstName"
                name="firstName"
                required
                placeholder="Prénom"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-lastName">Nom</Label>
              <Input id="dialog-contact-lastName" name="lastName" placeholder="Nom de famille" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-phonePrimary">Téléphone principal *</Label>
              <Input
                id="dialog-contact-phonePrimary"
                name="phonePrimary"
                type="tel"
                required
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-phoneSecondary">Téléphone secondaire</Label>
              <Input
                id="dialog-contact-phoneSecondary"
                name="phoneSecondary"
                type="tel"
                placeholder="Optionnel"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-email">Email</Label>
              <Input
                id="dialog-contact-email"
                name="email"
                type="email"
                placeholder="contact@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-schoolName">Établissement</Label>
              <Input
                id="dialog-contact-schoolName"
                name="schoolName"
                placeholder="Nom de l'école"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-city">Ville</Label>
              <Input id="dialog-contact-city" name="city" placeholder="Douala, Yaoundé..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-desiredProgram">Filière souhaitée</Label>
              <Input
                id="dialog-contact-desiredProgram"
                name="desiredProgram"
                placeholder="Ex: Finance, Marketing..."
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-contact-campaignId">Campagne *</Label>
              <select
                id="dialog-contact-campaignId"
                name="campaignId"
                required
                className="focus:border-lbs-blue flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              >
                <option value="">Sélectionner une campagne</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500"
            >
              Annuler
            </Button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              <UserPlus className="size-3.5" />
              Ajouter le contact
            </button>
          </div>
        </form>
      </FormDialog>
    </>
  )
}
