import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  CheckCircle2,
  FileDown,
  Headset,
  Landmark,
  MapPinned,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

import { AnimatedCounter } from '@/components/marketing/animated-counter'
import { AnimatedPill } from '@/components/marketing/animated-pill'
import { GlowCard } from '@/components/marketing/glow-card'
import { GradientText } from '@/components/marketing/gradient-text'
import { InteractiveImageAccordion } from '@/components/ui/interactive-image-accordion'
import { HeroIntro } from '@/components/marketing/hero-intro'
import { LiveHeroBg } from '@/components/marketing/live-hero-bg'
import { Navbar } from '@/components/marketing/navbar'
import { PersonasShowcase } from '@/components/marketing/personas-showcase'
import { Reveal } from '@/components/marketing/reveal'
import { SectionHeading } from '@/components/marketing/section-heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { featureCoverImages } from '@/lib/feature-covers'

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    "Modernisez la prospection téléphonique de votre établissement grâce à l'IA: campagnes, attribution intelligente, interface agent assistée (RAG) et KPI en temps réel.",
}

/* ─────────────────────── Types ─────────────────────── */

type Feature = Readonly<{
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  image: string
  imageAlt: string
}>

type StatTone = 'blue' | 'emerald' | 'amber' | 'rose'

/* ─────────────────────── Données ─────────────────────── */

const features: readonly Feature[] = [
  {
    title: 'Campagnes intelligentes',
    description:
      'Scripts personnalisables, parcours par étapes, et réutilisation des contacts sans duplication.',
    icon: Sparkles,
    image: featureCoverImages.callcenter,
    imageAlt: "Campagnes et centre d'appels",
  },
  {
    title: 'Import & attribution fluide',
    description:
      'Import Excel/.xls, déduplication logique, et distribution rapide par agent/campagne.',
    icon: Users,
    image: featureCoverImages.attributionFluide,
    imageAlt: 'Import et attribution fluide des contacts',
  },
  {
    title: 'Interface Agent + RAG IA',
    description:
      "Fiche prospect, composeur, historique, et assistant IA contextuel pendant l'appel.",
    icon: Bot,
    image: featureCoverImages.ia,
    imageAlt: 'Interface agent et assistant IA',
  },
  {
    title: 'KPI par rôle',
    description: 'Super-Admin, Admin, Agent: dashboards différenciés pour piloter la performance.',
    icon: ChartNoAxesCombined,
    image: featureCoverImages.kpi,
    imageAlt: 'Indicateurs et tableaux de bord par rôle',
  },
  {
    title: 'WhatsApp (à venir)',
    description: 'Envoi de messages WhatsApp après appel positif, suivi et tracking des échanges.',
    icon: PhoneCall,
    image: featureCoverImages.whatsapp,
    imageAlt: 'Canaux messagerie WhatsApp pour le suivi',
  },
  {
    title: 'Exports & carte des écoles',
    description: 'Exports PDF, vues synthèse, et cartographie des établissements pour les admins.',
    icon: MapPinned,
    image: featureCoverImages.map,
    imageAlt: 'Carte des écoles et exports',
  },
] as const

const statToneClasses: Record<StatTone, Readonly<{ card: string; iconWrap: string }>> = {
  blue: {
    card: 'border-lbs-blue/25 bg-gradient-to-br from-lbs-blue/10 via-blue-50/80 to-white shadow-lbs-blue/8 dark:border-lbs-blue/30 dark:from-lbs-blue/18 dark:via-zinc-900 dark:to-zinc-900',
    iconWrap: 'bg-lbs-blue/15 text-lbs-blue dark:bg-lbs-blue/25 dark:text-blue-200',
  },
  emerald: {
    card: 'border-emerald-300/40 bg-gradient-to-br from-emerald-500/10 via-emerald-50/60 to-white dark:border-emerald-900/40 dark:from-emerald-500/15 dark:via-zinc-900 dark:to-zinc-900',
    iconWrap: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200',
  },
  amber: {
    card: 'border-amber-300/40 bg-gradient-to-br from-amber-400/12 via-amber-50/60 to-white dark:border-amber-900/40 dark:from-amber-400/10 dark:via-zinc-900 dark:to-zinc-900',
    iconWrap: 'bg-amber-500/15 text-amber-800 dark:bg-amber-400/20 dark:text-amber-100',
  },
  rose: {
    card: 'border-rose-300/40 bg-gradient-to-br from-lbs-red/10 via-rose-50/60 to-white dark:border-rose-900/40 dark:from-lbs-red/20 dark:via-zinc-900 dark:to-zinc-900',
    iconWrap: 'bg-rose-500/15 text-lbs-red dark:bg-rose-400/20 dark:text-rose-200',
  },
}

/* ─────────────────────── Page ─────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-full text-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main>
        {/* ════════════════════ HERO ════════════════════ */}
        <section
          className="relative overflow-hidden pt-16"
          style={{
            background: 'linear-gradient(180deg, var(--section-cool) 0%, var(--background) 100%)',
          }}
        >
          <LiveHeroBg />

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
            <HeroIntro>
              <div>
                <Badge variant="lbs" className="mb-5 px-3 py-1.5 text-xs font-medium tracking-wide">
                  Conçu pour l&apos;enseignement supérieur
                </Badge>
              </div>

              <div>
                <h1 className="text-4xl font-bold tracking-tight text-balance text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
                  Modernisez votre prospection <GradientText>avec l&apos;IA</GradientText>
                </h1>
              </div>

              <div>
                <p className="mt-6 max-w-xl text-lg leading-8 text-pretty text-zinc-600 dark:text-zinc-300">
                  LBS Call Center est la plateforme de prospection téléphonique des établissements
                  d&apos;enseignement supérieur. Campagnes intelligentes, attribution fluide,
                  assistant IA en temps réel et KPI par rôle.Merci
                </p>
              </div>

              <div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="group">
                    <Link href="#demo">
                      Découvrir la démo
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#pour-qui">Pour les établissements</Link>
                  </Button>
                </div>
              </div>

              <div>
                <div className="mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <AnimatedPill label="Écoles & universités">
                    <Landmark className="size-4" />
                  </AnimatedPill>
                  <AnimatedPill label="KPI par rôle">
                    <ChartNoAxesCombined className="size-4" />
                  </AnimatedPill>
                  <AnimatedPill label="Assistant IA">
                    <Bot className="size-4" />
                  </AnimatedPill>
                </div>
              </div>

              <div>
                <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-lbs-blue size-4" />
                    Déduplication intelligente
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Exports PDF en 1 clic
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-violet-600" />
                    Suivi qualité
                  </div>
                </div>
              </div>
            </HeroIntro>

            <div className="relative hidden lg:block">
              <InteractiveImageAccordion />
            </div>
          </div>
        </section>

        {/* ════════════════════ SOCIAL PROOF — bandeau coloré ════════════════════ */}
        <section
          className="border-lbs-blue/10 relative overflow-hidden border-y py-16"
          style={{
            background:
              'linear-gradient(90deg, rgba(36,73,118,0.06) 0%, rgba(128,0,0,0.04) 50%, rgba(34,197,94,0.04) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="from-lbs-blue/5 absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r to-transparent" />
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="grid gap-8 md:grid-cols-4">
                <ProofMetric
                  value={<AnimatedCounter target={0} suffix=" doublon" />}
                  label="Contacts réutilisables, jamais de duplicata"
                  color="text-lbs-blue"
                />
                <ProofMetric
                  value="KPI live"
                  label="Tableaux de bord par rôle et campagne"
                  color="text-emerald-600 dark:text-emerald-400"
                />
                <ProofMetric
                  value={<AnimatedCounter target={1} suffix=" clic" />}
                  label="Exports et reporting instantanés"
                  color="text-violet-600 dark:text-violet-400"
                />
                <ProofMetric
                  value="IA RAG"
                  label="Assistant contextuel pendant l'appel"
                  color="text-lbs-red"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════ PROBLÈME → SOLUTION ════════════════════ */}
        <section
          className="relative overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(180deg, var(--background) 0%, var(--section-warm) 40%, var(--section-cool) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-lbs-red/6 absolute top-20 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
            <div className="bg-lbs-blue/6 absolute bottom-20 left-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              badge="Le constat"
              title="La prospection traditionnelle ne suffit plus"
              subtitle="Sans suivi, sans scripts adaptatifs et sans indicateurs en temps réel, les équipes peinent à convertir et à standardiser la qualité des échanges."
            />

            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <GlowCard className="h-full" glowColor="rgba(128, 0, 0, 0.12)">
                  <div className="p-8">
                    <div className="text-lbs-red mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-red-100 to-red-50 shadow-sm dark:from-red-950/60 dark:to-red-950/30">
                      <PhoneCall className="size-5" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                      Sans LBS Call Center
                    </h3>
                    <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Fichiers Excel éparpillés, doublons non détectés, pas de script standardisé,
                      aucune visibilité sur la performance des agents. Les responsables naviguent à
                      l&apos;aveugle et les conversions stagnent.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {['Doublons', 'Pas de KPI', 'Fichiers Excel', 'Aucun suivi'].map((pain) => (
                        <span
                          key={pain}
                          className="text-lbs-red rounded-full border border-red-200/60 bg-red-50/80 px-3 py-1 text-xs font-medium dark:border-red-800/40 dark:bg-red-950/30"
                        >
                          {pain}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </Reveal>

              <Reveal delay={0.08}>
                <GlowCard className="h-full" glowColor="rgba(36, 73, 118, 0.14)">
                  <div className="p-8">
                    <div className="text-lbs-blue dark:from-lbs-blue/30 dark:to-lbs-blue/15 mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm">
                      <Zap className="size-5" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                      Avec LBS Call Center
                    </h3>
                    <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-300">
                      Rôles clairs, attribution fluide des contacts, scripts de campagne structurés
                      et assistant IA (RAG) qui aide l&apos;agent pendant l&apos;appel. Le pilotage
                      KPI fiable permet aux responsables de prendre des décisions éclairées.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        '0 doublon',
                        'KPI temps réel',
                        'IA contextuelle',
                        'Traçabilité complète',
                      ].map((benefit) => (
                        <span
                          key={benefit}
                          className="border-lbs-blue/25 bg-lbs-blue/5 text-lbs-blue dark:border-lbs-blue/30 dark:bg-lbs-blue/15 rounded-full border px-3 py-1 text-xs font-medium"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════ COMMENT ÇA MARCHE ════════════════════ */}
        <section
          className="relative overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(135deg, #0c1929 0%, #142640 40%, #1a1030 70%, #0f0a1a 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-lbs-blue/15 absolute top-10 -left-32 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
            <div className="via-lbs-blue/30 absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <Badge className="border-lbs-blue/30 bg-lbs-blue/15 mb-4 text-blue-200">
                  En 3 étapes
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                  Comment ça marche
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-pretty text-zinc-300">
                  Un flux simple pour gagner du temps, améliorer la qualité des appels et suivre
                  l&apos;impact sur les inscriptions.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Créez la campagne et le script',
                  desc: "Définissez l'objectif (admissions, relances, événements), structurez le script et les résultats d'appel.",
                  icon: Sparkles,
                  accent: 'from-lbs-blue to-lbs-blue-2',
                  iconColor: 'text-blue-300',
                },
                {
                  step: '02',
                  title: 'Importez & attribuez les contacts',
                  desc: 'Import Excel/.xls, attribution par agent/campagne, et réutilisation intelligente sans doublons.',
                  icon: Users,
                  accent: 'from-emerald-500 to-emerald-700',
                  iconColor: 'text-emerald-300',
                },
                {
                  step: '03',
                  title: "Appelez avec l'assistant IA + KPI",
                  desc: "Les agents appellent avec une fiche claire, l'IA (RAG) aide en temps réel, et les KPI remontent par rôle.",
                  icon: Bot,
                  accent: 'from-violet-500 to-violet-700',
                  iconColor: 'text-violet-300',
                },
              ].map((s, idx) => (
                <Reveal key={s.step} delay={idx * 0.06}>
                  <DarkStepCard
                    step={s.step}
                    title={s.title}
                    desc={s.desc}
                    icon={s.icon}
                    accentGradient={s.accent}
                    iconColor={s.iconColor}
                  />
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-16" delay={0.1}>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
                <Image
                  src="/2530832.jpg"
                  alt="Illustration: agent et prospect en conversation"
                  width={1200}
                  height={500}
                  className="h-[320px] w-full object-cover lg:h-[380px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1929]/95 via-[#0c1929]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <div className="grid gap-3 md:grid-cols-3">
                    <DarkGlassMiniCard
                      title="Attribution fluide"
                      desc="Contacts distribués, suivi clair."
                    />
                    <DarkGlassMiniCard
                      title="Assistance IA"
                      desc="Réponses contextualisées (RAG)."
                    />
                    <DarkGlassMiniCard
                      title="KPI en temps réel"
                      desc="Performances par rôle et campagne."
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════ FONCTIONNALITÉS ════════════════════ */}
        <section
          id="fonctionnalites"
          className="relative scroll-mt-20 overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(180deg, var(--section-cool) 0%, var(--background) 40%, var(--section-warm) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-lbs-blue/5 absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                badge="Plateforme tout-en-un"
                title="Fonctionnalités clés"
                subtitle="Conçu pour l'enseignement supérieur : campagnes, agents, contacts, IA contextuelle et tableaux de bord."
                align="left"
              />
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      tag: 'Import Excel',
                      color: 'border-lbs-blue/30 bg-lbs-blue/5 text-lbs-blue',
                    },
                    {
                      tag: 'KPI',
                      color:
                        'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
                    },
                    {
                      tag: 'RAG',
                      color:
                        'border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300',
                    },
                    {
                      tag: 'Exports',
                      color:
                        'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300',
                    },
                    { tag: 'Campagnes', color: 'border-lbs-red/30 bg-lbs-red/5 text-lbs-red' },
                  ].map(({ tag, color }) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-transform hover:scale-105 ${color}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, idx) => (
                <Reveal key={f.title} delay={idx * 0.04}>
                  <Card className="group hover:shadow-lbs-blue/10 dark:hover:shadow-lbs-blue/5 h-full overflow-hidden border-0 shadow-lg ring-1 shadow-zinc-900/5 ring-zinc-200/80 transition-all duration-500 hover:shadow-xl dark:bg-zinc-900/60 dark:shadow-black/30 dark:ring-zinc-800">
                    <div className="relative h-44 w-full overflow-hidden sm:h-48">
                      <Image
                        src={f.image}
                        alt={f.imageAlt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/60" />
                      <div className="text-lbs-blue absolute bottom-3 left-3 grid size-11 place-items-center rounded-xl bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110 dark:bg-zinc-900/95 dark:text-white">
                        <f.icon className="size-5" />
                      </div>
                    </div>
                    <CardHeader className="pt-5 pb-2">
                      <CardTitle className="text-lg leading-snug">{f.title}</CardTitle>
                      <CardDescription className="mt-2 leading-relaxed">
                        {f.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <Sparkles className="text-lbs-blue size-4 shrink-0" />
                        <span className="text-lbs-blue group-hover:text-lbs-red text-xs font-medium transition-colors">
                          En savoir plus →
                        </span>
                      </div>
                    </CardContent>
                    <div className="from-lbs-blue to-lbs-red h-0.5 w-full bg-gradient-to-r via-violet-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════ POUR QUI ════════════════════ */}
        <PersonasShowcase />

        {/* ════════════════════ AVANTAGES MESURABLES ════════════════════ */}
        <section
          id="avantages"
          className="relative scroll-mt-20 overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(180deg, var(--section-warm) 0%, var(--section-accent) 50%, var(--section-cool) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-amber-400/8 blur-[100px]" />
            <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/6 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                badge="KPI temps réel"
                title="Avantages mesurables"
                subtitle="Des indicateurs lisibles, comme sur les meilleures plateformes — chiffres fictifs pour la maquette mémoire."
                align="left"
              />
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                tone="blue"
                icon={ChartNoAxesCombined}
                label="Conversion"
                value="+18%"
                hint="vs. process manuel"
              />
              <StatCard
                tone="emerald"
                icon={Headset}
                label="Temps d'appel moyen"
                value="-12%"
                hint="grâce au script + IA"
              />
              <StatCard
                tone="amber"
                icon={FileDown}
                label="Reporting"
                value="1 clic"
                hint="exports PDF"
              />
              <StatCard
                tone="rose"
                icon={MessageCircle}
                label="Relance"
                value="Auto"
                hint="WhatsApp après positif"
              />
            </div>
          </div>
        </section>

        {/* ════════════════════ VALEUR ════════════════════ */}
        <section
          className="relative overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(180deg, var(--section-cool) 0%, var(--background) 60%, var(--section-warm) 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="via-lbs-blue/15 absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent" />
            <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              badge="Pourquoi LBS Call Center"
              title="Une prospection efficace, sans perdre l'exigence académique"
              subtitle="LBS Call Center structure votre discours, accélère les opérations et aligne direction et terrain sur les mêmes indicateurs."
            />

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              <Reveal delay={0.03}>
                <ValuePropCard
                  title="Standardisez votre discours"
                  description="Scripts de campagne et fiches prospect pour une expérience homogène, quelle que soit l'équipe."
                  footer="Idéal pour admissions, bourses, relances et portes ouvertes."
                  image="/communication.jpg"
                  imageAlt="Présentation et prise de parole"
                />
              </Reveal>
              <Reveal delay={0.06}>
                <ValuePropCard
                  title="Réduisez les frictions opérationnelles"
                  description="Import, attribution, suivi et relances pensés pour gagner du temps sans perdre la traçabilité."
                  footer="Moins d'Excel, moins d'erreurs, plus de continuité."
                  image="/operationnel.jpg"
                  imageAlt="Travail sur ordinateur portable"
                />
              </Reveal>
              <Reveal delay={0.09}>
                <ValuePropCard
                  title="Pilotez avec des KPI utiles"
                  description="Tableaux de bord par rôle pour voir ce qui fait mousser la conversion."
                  footer="Volume, qualité, conversion et campagnes."
                  image="/kpi-back.png"
                  imageAlt="Tableau de bord analytique"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ════════════════════ CTA FINAL ════════════════════ */}
        <section
          id="demo"
          className="relative scroll-mt-20 overflow-hidden py-20 lg:py-28"
          style={{
            background:
              'linear-gradient(135deg, #0c1929 0%, #142640 35%, #1a1030 65%, #200c10 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-lbs-blue/15 absolute top-20 -left-20 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-lbs-red/12 absolute -right-20 bottom-10 h-[400px] w-[400px] rounded-full blur-[100px]" />
            <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] [background-size:24px_24px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(36,73,118,0.20),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(139,92,246,0.12),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(128,0,0,0.10),transparent_45%)]" />

                <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:p-16">
                  <div>
                    <Badge className="border-lbs-blue/30 bg-lbs-blue/15 mb-4 text-blue-200">
                      Démo gratuite
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                      Prêt à révolutionner votre prospection ?
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-zinc-300">
                      Demandez une démo et découvrez comment l&apos;IA et les KPI par rôle peuvent
                      moderniser votre centre d&apos;appels.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Button asChild size="lg" className="group">
                        <Link href="#demo">
                          Demander une démo
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Link href="/login">Commencer gratuitement</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-lbs-blue/20 grid size-11 place-items-center rounded-xl">
                        <Bot className="size-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Assistant IA</p>
                        <p className="text-xs text-zinc-400">
                          RAG: réponses depuis les données de l&apos;école.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-zinc-200">
                      &quot;Donne‑moi un argumentaire sur les débouchés du Master X.&quot;
                      <div className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-400">
                        <Sparkles className="size-4 text-blue-400" />
                        Source: base documentaire
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                      <MessageCircle className="size-4 text-emerald-400" />
                      WhatsApp post‑appel automatisé (à venir)
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════ FOOTER ════════════════════ */}
        <footer
          className="border-t border-white/10"
          style={{ background: 'linear-gradient(180deg, #0c1929 0%, #0a0f18 100%)' }}
        >
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-3">
                  <Image
                    src="/LBS%20LOGO.jpeg"
                    alt="Logo LBS"
                    width={56}
                    height={56}
                    className="rounded-xl border border-white/10 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">LBS Call Center</p>
                    <p className="text-xs text-zinc-400">Prospection intelligente</p>
                  </div>
                </div>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
                  La plateforme de prospection téléphonique conçue pour les établissements
                  d&apos;enseignement supérieur.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Navigation
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    { label: 'Fonctionnalités', href: '#fonctionnalites' },
                    { label: 'Pour qui ?', href: '#pour-qui' },
                    { label: 'Avantages', href: '#avantages' },
                    { label: 'Démo', href: '#demo' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Plateforme
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    Connexion
                  </Link>
                  <span className="text-sm text-zinc-500">API & intégrations (bientôt)</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <p className="text-xs text-zinc-500">
                © {new Date().getFullYear()} LBS Call Center — Lomé Business School. Projet mémoire.
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500">Construit avec</span>
                <Sparkles className="size-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">Next.js + IA</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ─────────────────────── Composants locaux ─────────────────────── */

function ProofMetric({
  value,
  label,
  color,
}: Readonly<{
  value: React.ReactNode
  label: string
  color: string
}>) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold tracking-tight md:text-3xl ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
    </div>
  )
}

function StatCard({
  tone,
  icon: Icon,
  label,
  value,
  hint,
}: Readonly<{
  tone: StatTone
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
}>) {
  const t = statToneClasses[tone]
  return (
    <Reveal>
      <Card
        className={`h-full border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${t.card}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{label}</CardTitle>
            <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${t.iconWrap}`}>
              <Icon className="size-4" />
            </div>
          </div>
          <CardDescription className="mt-1">{hint}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
        </CardContent>
      </Card>
    </Reveal>
  )
}

function ValuePropCard({
  title,
  description,
  footer,
  image,
  imageAlt,
}: Readonly<{
  title: string
  description: string
  footer: string
  image: string
  imageAlt: string
}>) {
  return (
    <Card className="group hover:shadow-lbs-blue/10 h-full overflow-hidden border-0 shadow-lg ring-1 ring-zinc-200/80 transition-all duration-500 hover:shadow-xl dark:bg-zinc-900/50 dark:ring-zinc-800">
      <div className="relative h-44 w-full overflow-hidden sm:h-48">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-zinc-900/5 to-transparent transition-opacity group-hover:from-zinc-900/60" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="mt-2 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {footer}
      </CardContent>
    </Card>
  )
}

function DarkStepCard({
  step,
  title,
  desc,
  icon: Icon,
  accentGradient,
  iconColor,
}: Readonly<{
  step: string
  title: string
  desc: string
  icon: React.ComponentType<{ className?: string }>
  accentGradient: string
  iconColor: string
}>) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8 hover:shadow-xl">
      <div className="flex items-start gap-4">
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accentGradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <span className="text-sm font-bold">{step}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className={`size-4 ${iconColor}`} />
            <p className="text-base font-semibold tracking-tight text-white">{title}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{desc}</p>
        </div>
      </div>
    </div>
  )
}

function DarkGlassMiniCard({ title, desc }: Readonly<{ title: string; desc: string }>) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-md">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{desc}</p>
    </div>
  )
}
