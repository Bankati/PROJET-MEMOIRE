"use client";
/**
 * Formulaire de création d'agent dans un MorphingPopover animé.
 * Inclut l'alerte sur la durée de vie liée à la campagne.
 */
import * as motion from "motion/react-client";
import { Shield, UserPlus } from "lucide-react";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/ui/morphing-popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CampaignOption = Readonly<{ id: string; title: string }>;

type AgentPopoverFormProps = Readonly<{
  campaigns: readonly CampaignOption[];
  createAction: (formData: FormData) => void;
}>;

export const AgentPopoverForm = ({
  campaigns,
  createAction,
}: AgentPopoverFormProps): React.JSX.Element => {
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
            layoutId="agent-create-label"
            layout="position"
            className="inline-flex items-center gap-2"
          >
            <UserPlus className="size-4" />
            Nouvel agent
          </motion.span>
        </Button>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="right-0 top-full mt-2 w-[460px] p-5 shadow-xl">
        <form action={createAction} className="space-y-4">
          <motion.h3
            layoutId="agent-create-label"
            layout="position"
            className="text-base font-semibold leading-none text-zinc-800 dark:text-white"
          >
            Créer un agent
          </motion.h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Créez un compte agent lié à votre campagne.
          </p>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="agent-fullName">Nom complet *</Label>
                <Input
                  id="agent-fullName"
                  name="fullName"
                  required
                  placeholder="Prénom  &  Nom"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agent-email">Email *</Label>
                <Input
                  id="agent-email"
                  name="email"
                  type="email"
                  required
                  placeholder="agent@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="agent-password">Mot de passe *</Label>
                <Input
                  id="agent-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 caractères"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agent-campaignId">Campagne</Label>
                <select
                  id="agent-campaignId"
                  name="campaignId"
                  className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
                >
                  <option value="">Aucune</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <Shield className="mb-0.5 inline size-3.5" /> La durée de vie de
            l&apos;agent est liée à la campagne. À l&apos;expiration, il sera
            automatiquement désactivé.
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
            >
              <UserPlus className="size-3.5" />
              Créer l&apos;agent
            </button>
          </div>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
};
