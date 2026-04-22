"use client";
/**
 * Formulaire de création et modification de campagne dans un dialog centré animé.
 * Remplace le MorphingPopover par un dialog plein écran avec backdrop blur.
 */
import { useState } from "react";
import { Edit3, Megaphone, Plus } from "lucide-react";

import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CampaignData = Readonly<{
  id: string;
  title: string;
  year: number;
  baseScript: string;
  details: string | null;
  pdfUrl: string | null;
  status: string;
}>;

type CampaignDialogFormProps = Readonly<{
  mode: "create" | "edit";
  campaign?: CampaignData;
  createAction: (formData: FormData) => void;
  updateAction: (formData: FormData) => void;
}>;

export const CampaignDialogForm = ({
  mode,
  campaign,
  createAction,
  updateAction,
}: CampaignDialogFormProps): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isEdit: boolean = mode === "edit" && campaign !== undefined;
  const formAction = isEdit ? updateAction : createAction;
  return (
    <>
      <Button
        variant={isEdit ? "outline" : "default"}
        onClick={() => setIsOpen(true)}
        className={
          isEdit
            ? "gap-1.5 rounded-lg border-zinc-200 text-zinc-600 hover:text-lbs-blue dark:border-white/15 dark:text-zinc-400"
            : "gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110"
        }
      >
        {isEdit ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
        {isEdit ? "Modifier" : "Nouvelle campagne"}
      </Button>
      <FormDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEdit ? "Modifier la campagne" : "Créer une campagne"}
        description={isEdit ? "Mettez à jour les informations de votre campagne." : "Remplissez les informations pour lancer une nouvelle campagne."}
        icon={<Megaphone className="size-5 text-lbs-blue dark:text-blue-300" />}
        maxWidth="max-w-xl"
      >
        <form action={formAction} className="space-y-4">
          {isEdit ? (
            <input type="hidden" name="campaignId" value={campaign?.id} />
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dialog-campaign-title">Titre *</Label>
              <Input
                id="dialog-campaign-title"
                name="title"
                required
                defaultValue={campaign?.title ?? ""}
                placeholder="Ex: Campagne Rentrée 2026"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dialog-campaign-year">Année *</Label>
              <Input
                id="dialog-campaign-year"
                name="year"
                type="number"
                required
                defaultValue={campaign?.year ?? new Date().getFullYear()}
              />
            </div>
          </div>
          {isEdit ? (
            <div className="space-y-1.5">
              <Label htmlFor="dialog-campaign-status">Statut</Label>
              <select
                id="dialog-campaign-status"
                name="status"
                defaultValue={campaign?.status ?? "draft"}
                className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Active</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminée</option>
                <option value="archived">Archivée</option>
              </select>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="dialog-campaign-script">Script de base *</Label>
            <textarea
              id="dialog-campaign-script"
              name="baseScript"
              required
              rows={4}
              defaultValue={campaign?.baseScript ?? ""}
              placeholder="Rédigez le script que les agents utiliseront pendant les appels..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:border-lbs-blue focus:outline-none focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dialog-campaign-details">Détails supplémentaires</Label>
            <textarea
              id="dialog-campaign-details"
              name="details"
              rows={2}
              defaultValue={campaign?.details ?? ""}
              placeholder="Notes, objectifs, consignes particulières..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:border-lbs-blue focus:outline-none focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dialog-campaign-pdf">URL du document PDF (onglet Docs)</Label>
            <Input
              id="dialog-campaign-pdf"
              name="pdfUrl"
              type="url"
              defaultValue={campaign?.pdfUrl ?? ""}
              placeholder="https://exemple.com/document.pdf"
            />
            <p className="text-[11px] text-zinc-400">Lien vers le PDF de l&apos;établissement visible par les agents pendant l&apos;appel.</p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-500">
              Annuler
            </Button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              {isEdit ? <Edit3 className="size-3.5" /> : <Plus className="size-3.5" />}
              {isEdit ? "Enregistrer" : "Créer la campagne"}
            </button>
          </div>
        </form>
      </FormDialog>
    </>
  );
};
