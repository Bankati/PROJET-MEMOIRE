"use client";
/**
 * Formulaire d'ajout de contact dans un MorphingPopover animé.
 * Tous les champs métier du modèle contacts avec sélection de campagne.
 */
import * as motion from "motion/react-client";
import { Plus, UserPlus } from "lucide-react";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/ui/morphing-popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CampaignOption = Readonly<{ id: string; title: string }>;

type ContactPopoverFormProps = Readonly<{
  campaigns: readonly CampaignOption[];
  addAction: (formData: FormData) => void;
}>;

export const ContactPopoverForm = ({
  campaigns,
  addAction,
}: ContactPopoverFormProps): React.JSX.Element => {
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
        <Button className="gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-white shadow-sm hover:brightness-110">
          <motion.span
            layoutId="contact-add-label"
            layout="position"
            className="inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            Ajouter
          </motion.span>
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="right-0 top-full mt-2 w-[520px] p-5 shadow-xl">
        <form action={addAction} className="space-y-4">
          <motion.h3
            layoutId="contact-add-label"
            layout="position"
            className="text-base font-semibold leading-none text-zinc-800 dark:text-white"
          >
            Ajouter un contact
          </motion.h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Remplissez les informations du prospect à ajouter à votre campagne.
          </p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-firstName">Prénom *</Label>
                <Input
                  id="contact-firstName"
                  name="firstName"
                  required
                  placeholder="Prénom"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-lastName">Nom</Label>
                <Input
                  id="contact-lastName"
                  name="lastName"
                  placeholder="Nom de famille"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-phonePrimary">Téléphone *</Label>
                <Input
                  id="contact-phonePrimary"
                  name="phonePrimary"
                  type="tel"
                  required
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phoneSecondary">Tél. secondaire</Label>
                <Input
                  id="contact-phoneSecondary"
                  name="phoneSecondary"
                  type="tel"
                  placeholder="Optionnel"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="contact@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-schoolName">Établissement</Label>
                <Input
                  id="contact-schoolName"
                  name="schoolName"
                  placeholder="Nom de l'école"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-city">Ville</Label>
                <Input
                  id="contact-city"
                  name="city"
                  placeholder="Douala, Yaoundé..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-campaignId">Campagne *</Label>
                <select
                  id="contact-campaignId"
                  name="campaignId"
                  required
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
                >
                  <option value="">Sélectionner</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              <UserPlus className="size-3.5" />
              Ajouter le contact
            </button>
          </div>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
};
