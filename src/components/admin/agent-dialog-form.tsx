'use client'
/**
 * Formulaire de création d'agent dans un dialog centré animé.
 * Inclut l'alerte sur la durée de vie liée à la campagne.
 */
import { useState } from 'react'
import { Shield, Users, UserPlus } from 'lucide-react'

import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type CampaignOption = Readonly<{ id: string; title: string }>

type AgentDialogFormProps = Readonly<{
  campaigns: readonly CampaignOption[]
  createAction: (formData: FormData) => void
}>

export const AgentDialogForm = ({
  campaigns,
  createAction,
}: AgentDialogFormProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110"
      >
        <UserPlus className="size-4" />
        Nouvel agent
      </Button>
      <FormDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Créer un agent"
        description="Créez un compte agent lié à votre campagne."
        icon={<Users className="text-lbs-blue size-5 dark:text-blue-300" />}
        maxWidth="max-w-lg"
      >
        <form action={createAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-agent-fullName">Nom complet *</Label>
              <Input
                id="dialog-agent-fullName"
                name="fullName"
                required
                placeholder="Prénom Nom"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-agent-email">Email *</Label>
              <Input
                id="dialog-agent-email"
                name="email"
                type="email"
                required
                placeholder="agent@email.com"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-agent-password">Mot de passe *</Label>
              <Input
                id="dialog-agent-password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min. 6 caractères"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-agent-campaignId">Campagne associée</Label>
              <select
                id="dialog-agent-campaignId"
                name="campaignId"
                className="focus:border-lbs-blue flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              >
                <option value="">Aucune campagne</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Shield className="mr-1 mb-0.5 inline size-3.5" />
            La durée de vie de l&apos;agent est liée à la campagne sélectionnée. À l&apos;expiration
            de la campagne, l&apos;agent sera automatiquement désactivé.
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
              Créer l&apos;agent
            </button>
          </div>
        </form>
      </FormDialog>
    </>
  )
}
