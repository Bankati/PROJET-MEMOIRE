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
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react'

import { AnimatedCounter } from '@/components/marketing/animated-counter'
import { GradientText } from '@/components/marketing/gradient-text'
import { HeroIntro } from '@/components/marketing/hero-intro'
import { Navbar } from '@/components/marketing/navbar'
import { PersonasShowcase } from '@/components/marketing/personas-showcase'
import { Reveal } from '@/components/marketing/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    "Modernisez la prospection téléphonique de votre établissement grâce à l'IA: campagnes, attribution intelligente, interface agent assistée (RAG) et KPI en temps réel.",
}

/* ─────────────────────── Types ─────────────────────── */

type FeatureSection = Readonly<{
  badge: string
  title: string
  description: string
  points: readonly string[]
  image: string
  imageAlt: string
  imageLeft: boolean
  accentColor: string
}>

type StatTone = 'blue' | 'emerald' | 'amber' | 'rose'

/* ─────────────────────── Données ─────────────────────── */

const featureSections: readonly FeatureSection[] = [
  {
    badge: 'Campagnes',
    title: 'Scripts adaptés, campagnes maîtrisées',
    description:
      'Créez des campagnes structurées avec scripts personnalisables, étapes de parcours et réutilisation intelligente des contacts sans aucune duplication.',
    points: [
      'Scripts par campagne et objectif (admissions, relances, événements)',
      "Résultats d'appel configurables selon votre process",
      'Réutilisation des contacts entre campagnes sans doublon',
    ],
    image: '/callcenter.jpg',
    imageAlt: "Campagnes et centre d'appels",
    imageLeft: false,
    accentColor: 'text-lbs-blue',
  },
  {
    badge: 'Contacts & Import',
    title: 'Import Excel, attribution fluide',
    description:
      'Importez vos fichiers .xls/.xlsx en quelques clics. La déduplication logique est automatique, et chaque contact est distribué rapidement par agent et campagne.',
    points: [
      'Import Excel avec détection et fusion des doublons',
      'Attribution rapide par agent, campagne ou groupe',
      'Historique complet de chaque contact et de ses appels',
    ],
    image: '/attribution_fluide.jpg',
    imageAlt: 'Import et attribution fluide des contacts',
    imageLeft: true,
    accentColor: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    badge: 'Intelligence Artificielle',
    title: "Assistant IA RAG pendant l'appel",
    description:
      "L'agent dispose d'une fiche prospect complète, d'un composeur intégré, et d'un assistant IA contextuel qui répond en temps réel depuis la base documentaire de votre école.",
    points: [
      'Réponses contextualisées depuis vos documents (brochures, programmes)',
      'Historique des interactions et notes post-appel',
      'Composeur intégré avec sélection du numéro principal ou secondaire',
    ],
    image: '/ia.jpg',
    imageAlt: 'Interface agent et assistant IA',
    imageLeft: false,
    accentColor: 'text-violet-700 dark:text-violet-400',
  },
  {
    badge: 'Tableaux de bord',
    title: 'KPI par rôle, en temps réel',
    description:
      'Super-Admin, Admin, Agent : chaque rôle dispose de son propre tableau de bord avec les indicateurs qui lui sont utiles, sans bruit superflu.',
    points: [
      'Vue Super-Admin : performance globale de tous les établissements',
      'Vue Admin : campagnes, agents, conversion et relances',
      'Vue Agent : contacts du jour, historique et objectifs',
    ],
    image: '/kpi.png',
    imageAlt: 'Indicateurs et tableaux de bord par rôle',
    imageLeft: true,
    accentColor: 'text-amber-700 dark:text-amber-400',
  },
  {
    badge: 'Exports & Cartographie',
    title: 'Exports instantanés, carte des écoles',
    description:
      'Générez des rapports PDF en un clic et visualisez la distribution géographique de vos prospects sur une carte interactive des établissements.',
    points: [
      'Exports PDF des rapports de campagne et de performance',
      'Cartographie des établissements par région ou statut',
      'Vues synthèse pour la direction et les partenaires',
    ],
    image: '/map.jpg',
    imageAlt: 'Carte des écoles et exports',
    imageLeft: false,
    accentColor: 'text-lbs-red',
  },
]

const statToneClasses: Record<StatTone, Readonly<{ icon: string; value: string }>> = {
  blue: { icon: 'bg-lbs-blue/10 text-lbs-blue', value: 'text-lbs-blue' },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    icon: 'bg-rose-500/10 text-lbs-red dark:text-rose-400',
    value: 'text-lbs-red dark:text-rose-400',
  },
}

/* ─────────────────────── Page ─────────────────────── */

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main>
        {/* ══════════════════════════════════════════════════
            HERO — propre, lumineux, Formester style
        ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-16">
          {/* Background très subtil */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900" />
            <div className="bg-lbs-blue/5 dark:bg-lbs-blue/8 absolute top-0 right-0 h-[600px] w-[600px] rounded-full blur-[140px]" />
            <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/4 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:pt-20 lg:pb-32">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              {/* Texte gauche */}
              <HeroIntro>
                <div>
                  <Badge
                    variant="lbs"
                    className="mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wide"
                  >
                    <Landmark className="size-3.5" />
                    Conçu pour l&apos;enseignement supérieur
                  </Badge>
                </div>

                <div>
                  <h1 className="text-5xl font-bold tracking-tight text-balance text-zinc-900 sm:text-6xl lg:text-[3.75rem] xl:text-[4.25rem] dark:text-white">
                    Modernisez votre <br />
                    prospection <GradientText>avec l&apos;IA</GradientText>
                  </h1>
                </div>

                <div>
                  <p className="mt-6 max-w-lg text-lg leading-8 text-pretty text-zinc-500 dark:text-zinc-400">
                    LBS Call Center centralise vos campagnes téléphoniques, attribue les contacts
                    sans doublons, assiste vos agents avec l&apos;IA et remonte les KPI par rôle —
                    en temps réel.
                  </p>
                </div>

                <div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="group shadow-lbs-blue/20 shadow-lg">
                      <Link href="#fonctionnalites">
                        Découvrir la plateforme
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-700"
                    >
                      <Link href="/login">Se connecter</Link>
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="text-lbs-blue size-4" />
                      Gratuit pour le mémoire
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      Zéro doublon garanti
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-violet-600" />
                      IA RAG incluse
                    </span>
                  </div>
                </div>
              </HeroIntro>

              {/* Visuel droit — grande image hero avec overlay stats */}
              <Reveal delay={0.1} className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 shadow-zinc-900/15 ring-zinc-900/8 dark:shadow-black/40 dark:ring-white/8">
                  <Image
                    src="/operator-hot-line-portrait-cheerful-african-customer-service-representative-with-headset-call-center.jpg"
                    alt="Agent LBS Call Center au travail"
                    width={700}
                    height={500}
                    className="h-[420px] w-full object-cover object-center lg:h-[480px]"
                    priority
                  />
                  {/* Overlay gradient bas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/10 to-transparent" />

                  {/* Floating stat cards */}
                  <div className="absolute top-5 left-5">
                    <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95">
                      <div className="bg-lbs-blue/10 grid size-8 place-items-center rounded-xl">
                        <Bot className="text-lbs-blue size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-white">
                          Assistant IA actif
                        </p>
                        <p className="text-[10px] text-zinc-400">RAG contextuel</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-5 right-5">
                    <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95">
                      <div className="grid size-8 place-items-center rounded-xl bg-emerald-500/10">
                        <ChartNoAxesCombined className="size-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-white">
                          KPI temps réel
                        </p>
                        <p className="text-[10px] text-zinc-400">Par rôle</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom cards */}
                  <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-3">
                    {[
                      { label: '0 doublon', sub: 'Déduplication auto' },
                      { label: '3 rôles', sub: 'Admin · Agent · SA' },
                      { label: 'IA RAG', sub: 'Base documentaire' },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="rounded-xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-xl"
                      >
                        <p className="text-sm font-bold text-white">{c.label}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-200">{c.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            BARRE DE CONFIANCE — chiffres clés
        ══════════════════════════════════════════════════ */}
        <section className="border-y border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <Reveal>
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {[
                  {
                    value: <AnimatedCounter target={0} suffix=" doublon" />,
                    label: 'Contacts réutilisables sans duplication',
                    color: 'text-lbs-blue',
                  },
                  {
                    value: '3 rôles',
                    label: 'Super-Admin, Admin et Agent différenciés',
                    color: 'text-emerald-700 dark:text-emerald-400',
                  },
                  {
                    value: <AnimatedCounter target={1} suffix=" clic" />,
                    label: 'Pour générer un export PDF complet',
                    color: 'text-violet-700 dark:text-violet-400',
                  },
                  {
                    value: 'IA RAG',
                    label: 'Assistant contextuel depuis vos documents',
                    color: 'text-lbs-red',
                  },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                    <p className={`text-3xl font-bold tracking-tight md:text-4xl ${m.color}`}>
                      {m.value}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{m.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTIONS FEATURES ALTERNÉES — style Formester
        ══════════════════════════════════════════════════ */}
        {featureSections.map((feat, idx) => (
          <FeatureSection key={feat.title} feature={feat} index={idx} />
        ))}

        {/* ══════════════════════════════════════════════════
            COMMENT ÇA MARCHE — 3 étapes, fond clair
        ══════════════════════════════════════════════════ */}
        <section className="bg-zinc-50 py-24 lg:py-32 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <Badge variant="lbs" className="mb-4 text-xs">
                  En 3 étapes
                </Badge>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
                  Opérationnel en quelques minutes
                </h2>
                <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                  Un flux simple pour structurer vos appels, améliorer la qualité des échanges et
                  suivre l&apos;impact sur vos admissions.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Créez la campagne',
                  desc: "Définissez l'objectif, structurez le script et configurez les résultats d'appel possibles.",
                  icon: Sparkles,
                  color: 'bg-lbs-blue text-white',
                  points: [
                    'Script étape par étape',
                    'Résultats personnalisables',
                    'Campagnes multi-objectifs',
                  ],
                },
                {
                  step: '02',
                  title: 'Importez & attribuez',
                  desc: 'Import Excel avec déduplication automatique et distribution rapide aux agents.',
                  icon: Users,
                  color: 'bg-emerald-600 text-white',
                  points: ['Import .xls / .xlsx', 'Zéro doublon', 'Attribution par agent'],
                },
                {
                  step: '03',
                  title: 'Appelez & pilotez',
                  desc: "Les agents appellent avec l'IA RAG en appui, les KPI remontent en temps réel.",
                  icon: Bot,
                  color: 'bg-violet-600 text-white',
                  points: ['Fiche prospect complète', 'Assistant IA contextuel', 'KPI par rôle'],
                },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 0.07}>
                  <div className="group relative flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/60">
                    <div
                      className={`mb-6 grid size-14 place-items-center rounded-2xl ${s.color} shadow-lg`}
                    >
                      <s.icon className="size-6" />
                    </div>
                    <div className="mb-1 text-xs font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                      Étape {s.step}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">
                      {s.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {s.desc}
                    </p>
                    <ul className="mt-auto space-y-2">
                      {s.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"
                        >
                          <CheckCircle2 className="text-lbs-blue size-4 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            AVANTAGES MESURABLES — cartes KPI
        ══════════════════════════════════════════════════ */}
        <section id="avantages" className="scroll-mt-20 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <Badge variant="lbs" className="mb-4 text-xs">
                  Résultats
                </Badge>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
                  Des avantages mesurables
                </h2>
                <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                  Indicateurs représentatifs — chiffres illustratifs pour ce projet mémoire.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                tone="blue"
                icon={ChartNoAxesCombined}
                label="Taux de conversion"
                value="+18%"
                hint="vs. process manuel"
              />
              <KpiCard
                tone="emerald"
                icon={Headset}
                label="Durée d'appel"
                value="-12%"
                hint="grâce au script + IA"
              />
              <KpiCard
                tone="amber"
                icon={FileDown}
                label="Reporting"
                value="1 clic"
                hint="exports PDF instantanés"
              />
              <KpiCard
                tone="rose"
                icon={MessageCircle}
                label="Relance"
                value="Auto"
                hint="WhatsApp après positif"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            POUR QUI — personas
        ══════════════════════════════════════════════════ */}
        <PersonasShowcase />

        {/* ══════════════════════════════════════════════════
            CTA FINAL — dark, impact
        ══════════════════════════════════════════════════ */}
        <section
          id="demo"
          className="relative scroll-mt-20 overflow-hidden py-24 lg:py-32"
          style={{
            background:
              'linear-gradient(135deg, #0c1929 0%, #142640 40%, #1a1030 70%, #0f0a1a 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-lbs-blue/20 absolute top-16 -left-24 h-[500px] w-[500px] rounded-full blur-[130px]" />
            <div className="bg-lbs-red/15 absolute -right-24 bottom-8 h-[400px] w-[400px] rounded-full blur-[110px]" />
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/12 blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.025)_1px,transparent_0)] [background-size:28px_28px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(36,73,118,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.10),transparent_45%)]" />

                <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                  <div>
                    <Badge className="border-lbs-blue/30 bg-lbs-blue/15 mb-5 text-blue-200">
                      Démo gratuite
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                      Prêt à révolutionner votre prospection ?
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-zinc-300">
                      Découvrez comment l&apos;IA et les KPI par rôle peuvent transformer votre
                      centre d&apos;appels.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                      <Button
                        asChild
                        size="lg"
                        className="group shadow-lbs-blue/25 w-full shadow-lg sm:w-fit"
                      >
                        <Link href="/login">
                          Commencer maintenant
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 sm:w-fit"
                      >
                        <Link href="#fonctionnalites">Voir les fonctionnalités</Link>
                      </Button>
                    </div>

                    <div className="mt-8 flex flex-col gap-2 text-sm text-zinc-400">
                      {[
                        'Aucune carte bancaire requise',
                        'Accès immédiat à toutes les fonctionnalités',
                        'Support inclus pour votre équipe',
                      ].map((t) => (
                        <span key={t} className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Carte IA demo */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <div className="bg-lbs-blue/20 grid size-10 place-items-center rounded-xl">
                        <Bot className="size-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Assistant IA — RAG</p>
                        <p className="text-xs text-zinc-400">Base documentaire de l&apos;école</p>
                      </div>
                      <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                        En ligne
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-sm text-zinc-300">
                        &ldquo;Quels sont les débouchés du Master Commerce International ?&rdquo;
                      </div>
                      <div className="border-lbs-blue/20 bg-lbs-blue/10 rounded-xl border p-3 text-sm text-blue-100">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-blue-300 uppercase">
                          <Sparkles className="size-3" /> Réponse IA
                        </div>
                        Le Master Commerce International ouvre des postes en export, business
                        development, et gestion internationale dans plus de 40 entreprises
                        partenaires…
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-zinc-400">
                      <MessageCircle className="size-3.5 text-emerald-400" />
                      WhatsApp post-appel automatisé — bientôt disponible
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FOOTER — étendu, Formester style
        ══════════════════════════════════════════════════ */}
        <footer
          className="border-t border-white/8"
          style={{ background: 'linear-gradient(180deg, #0c1929 0%, #07101a 100%)' }}
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/LBS%20LOGO.jpeg"
                    alt="Logo LBS"
                    width={48}
                    height={48}
                    className="rounded-xl border border-white/10 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">LBS Call Center</p>
                    <p className="text-xs text-zinc-500">Prospection intelligente</p>
                  </div>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
                  La plateforme de prospection téléphonique conçue pour les établissements
                  d&apos;enseignement supérieur. Campagnes, IA, KPI et attribution — tout au même
                  endroit.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Campagnes', 'IA RAG', 'KPI', 'Exports'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <p className="mb-5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Plateforme
                </p>
                <ul className="space-y-3">
                  {[
                    { label: 'Fonctionnalités', href: '#fonctionnalites' },
                    { label: 'Pour qui ?', href: '#pour-qui' },
                    { label: 'Avantages', href: '#avantages' },
                    { label: 'Démo', href: '#demo' },
                    { label: 'Se connecter', href: '/login' },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fonctionnalités */}
              <div>
                <p className="mb-5 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Fonctionnalités
                </p>
                <ul className="space-y-3">
                  {[
                    'Campagnes intelligentes',
                    'Import & déduplication',
                    'Assistant IA RAG',
                    'KPI par rôle',
                    'Exports PDF',
                    'Carte des écoles',
                  ].map((f) => (
                    <li key={f}>
                      <span className="text-sm text-zinc-400">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 sm:flex-row">
              <p className="text-xs text-zinc-600">
                © {new Date().getFullYear()} LBS Call Center — Lomé Business School. Projet mémoire
                M2.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                Construit avec
                <Sparkles className="size-3 text-blue-400" />
                <span className="text-blue-400">Next.js 15 · IA · Drizzle</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ─────────────────────── Section Feature alternée ─────────────────────── */

function FeatureSection({
  feature,
  index,
}: Readonly<{ feature: FeatureSection; index: number }>): React.JSX.Element {
  const isEven = index % 2 === 0

  return (
    <section
      id={index === 0 ? 'fonctionnalites' : undefined}
      className={`scroll-mt-20 py-20 lg:py-28 ${
        isEven ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50/80 dark:bg-zinc-900/50'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div
            className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
              feature.imageLeft ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Texte */}
            <div className={feature.imageLeft ? 'lg:order-2' : ''}>
              <Badge variant="lbs" className="mb-4 text-xs">
                {feature.badge}
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 lg:text-4xl dark:text-white">
                {feature.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>

              <ul className="mt-8 space-y-4">
                {feature.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="#demo"
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3 ${feature.accentColor}`}
                >
                  En savoir plus
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className={feature.imageLeft ? 'lg:order-1' : ''}>
              <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 shadow-zinc-900/10 ring-zinc-900/6 dark:shadow-black/30 dark:ring-white/6">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  width={700}
                  height={460}
                  className="h-[320px] w-full object-cover lg:h-[380px]"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────── Carte KPI ─────────────────────── */

function KpiCard({
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
}>): React.JSX.Element {
  const t = statToneClasses[tone]
  return (
    <Reveal>
      <div className="group flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/50">
        <div className={`grid size-11 place-items-center rounded-xl ${t.icon}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className={`text-4xl font-bold tracking-tight ${t.value}`}>{value}</p>
          <p className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-100">{label}</p>
          <p className="mt-1 text-sm text-zinc-400">{hint}</p>
        </div>
      </div>
    </Reveal>
  )
}
