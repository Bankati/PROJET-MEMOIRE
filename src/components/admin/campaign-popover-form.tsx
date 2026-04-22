"use client";
/**
 * Formulaire de création et modification de campagne dans un MorphingPopover.
 * Animation fluide à l'ouverture/fermeture avec transition blur + scale.
 */
import { useRef } from "react";
import * as motion from "motion/react-client";
import { Edit3, Plus } from "lucide-react";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/ui/morphing-popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CampaignData = Readonly<{
  id: string;
  title: string;
  year: number;
  baseScript: string;
  details: string | null;
  status: string;
}>;

type CampaignPopoverFormProps = Readonly<{
  mode: "create" | "edit";
  campaign?: CampaignData;
  createAction: (formData: FormData) => void;
  updateAction: (formData: FormData) => void;
}>;

export const CampaignPopoverForm = ({
  mode,
  campaign,
  createAction,
  updateAction,
}: CampaignPopoverFormProps): React.JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit: boolean = mode === "edit" && campaign !== undefined;
  const formAction = isEdit ? updateAction : createAction;
  const layoutId: string = isEdit
    ? `campaign-edit-${campaign?.id}`
    : "campaign-create";
  return (
    <MorphingPopover
      variants={{
        initial: { opacity: 0, filter: "blur(8px)", scale: 0.96 },
        animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
        exit: { opacity: 0, filter: "blur(8px)", scale: 0.96 },
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <MorphingPopoverTrigger asChild>
        <Button
          variant={isEdit ? "outline" : "default"}
          className={
            isEdit
              ? "gap-1.5 rounded-lg border-zinc-200 text-zinc-600 hover:text-lbs-blue dark:border-white/15 dark:text-zinc-400"
              : "gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110"
          }
        >
          <motion.span
            layoutId={`${layoutId}-label`}
            layout="position"
            className="inline-flex items-center gap-2"
          >
            {isEdit ? (
              <>
                <Edit3 className="size-4" />
                Modifier
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Nouvelle campagne
              </>
            )}
          </motion.span>
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="right-0 top-full mt-2 w-[480px] p-5 shadow-xl">
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit ? (
            <input type="hidden" name="campaignId" value={campaign?.id} />
          ) : null}
          <motion.h3
            layoutId={`${layoutId}-label`}
            layout="position"
            className="text-base font-semibold leading-none text-zinc-800 dark:text-white"
          >
            {isEdit ? "Modifier la campagne" : "Créer une campagne"}
          </motion.h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isEdit
              ? "Mettez à jour les informations de votre campagne."
              : "Remplissez les informations pour lancer une nouvelle campagne."}
          </p>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor={`${layoutId}-title`}>Titre *</Label>
              <Input
                id={`${layoutId}-title`}
                name="title"
                required
                defaultValue={campaign?.title ?? ""}
                placeholder="Ex: Campagne Rentrée 2026"
                className="col-span-2"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor={`${layoutId}-year`}>Année *</Label>
              <Input
                id={`${layoutId}-year`}
                name="year"
                type="number"
                required
                defaultValue={campaign?.year ?? new Date().getFullYear()}
                className="col-span-2"
              />
            </div>
            {isEdit ? (
              <div className="grid grid-cols-3 items-center gap-3">
                <Label htmlFor={`${layoutId}-status`}>Statut</Label>
                <select
                  id={`${layoutId}-status`}
                  name="status"
                  defaultValue={campaign?.status ?? "draft"}
                  className="col-span-2 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Active</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminée</option>
                  <option value="archived">Archivée</option>
                </select>
              </div>
            ) : null}
            <div className="grid grid-cols-3 items-start gap-3">
              <Label htmlFor={`${layoutId}-script`} className="pt-2.5">
                Script *
              </Label>
              <textarea
                id={`${layoutId}-script`}
                name="baseScript"
                required
                rows={3}
                defaultValue={campaign?.baseScript ?? ""}
                placeholder="Script que les agents utiliseront..."
                className="col-span-2 flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:border-lbs-blue focus:outline-none focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              />
            </div>
            <div className="grid grid-cols-3 items-start gap-3">
              <Label htmlFor={`${layoutId}-details`} className="pt-2.5">
                Détails
              </Label>
              <textarea
                id={`${layoutId}-details`}
                name="details"
                rows={2}
                defaultValue={campaign?.details ?? ""}
                placeholder="Notes supplémentaires..."
                className="col-span-2 flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:border-lbs-blue focus:outline-none focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              {isEdit ? (
                <>
                  <Edit3 className="size-3.5" />
                  Enregistrer
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
};
