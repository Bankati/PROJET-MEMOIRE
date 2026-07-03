/**
 * Libellés et styles partagés pour les statuts/résultats affichés dans les dashboards.
 * Source unique de vérité pour éviter les palettes divergentes selon la page
 * (ex: un même résultat d'appel qui change de couleur d'un écran à l'autre).
 */
import type { CallOutcome, CampaignStatus, UserStatus } from '@/db/schema'

export const CALL_OUTCOME_LABELS: Readonly<Record<CallOutcome, string>> = {
  interested: 'Intéressé',
  not_interested: 'Pas intéressé',
  callback: 'Rappel',
  no_answer: 'Pas de réponse',
  false_number: 'Faux numéro',
  whatsapp_follow_up: 'Suivi WhatsApp',
  other: 'Autre',
}

export const CALL_OUTCOME_BADGE_STYLES: Readonly<Record<CallOutcome, string>> = {
  interested: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  not_interested: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  callback: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  no_answer: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
  false_number: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  whatsapp_follow_up: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  other: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
}

export const CALL_OUTCOME_ACCENT_STYLES: Readonly<Record<CallOutcome, string>> = {
  interested: 'border-emerald-400 dark:border-emerald-500/50',
  not_interested: 'border-rose-400 dark:border-rose-500/50',
  callback: 'border-amber-400 dark:border-amber-500/50',
  no_answer: 'border-zinc-300 dark:border-white/20',
  false_number: 'border-red-400 dark:border-red-500/50',
  whatsapp_follow_up: 'border-blue-400 dark:border-blue-500/50',
  other: 'border-zinc-300 dark:border-white/20',
}

export const CALL_OUTCOME_CHART_COLORS: Readonly<Record<CallOutcome, string>> = {
  interested: '#10b981',
  not_interested: '#f43f5e',
  callback: '#f59e0b',
  no_answer: '#71717a',
  false_number: '#ef4444',
  whatsapp_follow_up: '#3b82f6',
  other: '#a1a1aa',
}

export const CAMPAIGN_STATUS_LABELS: Readonly<Record<CampaignStatus, string>> = {
  draft: 'Brouillon',
  active: 'Active',
  paused: 'En pause',
  completed: 'Terminée',
  archived: 'Archivée',
}

export const CAMPAIGN_STATUS_STYLES: Readonly<Record<CampaignStatus, string>> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700/40 dark:text-zinc-400',
}

export const USER_STATUS_LABELS: Readonly<Record<UserStatus, string>> = {
  active: 'Actif',
  inactive: 'Inactif',
  expired: 'Expiré',
}

export const USER_STATUS_STYLES: Readonly<Record<UserStatus, string>> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300',
  expired: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}
