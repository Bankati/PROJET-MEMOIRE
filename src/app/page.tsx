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
  MessageCircle,
  Phone,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react'

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

/* ──────────────────────── Types ──────────────────────── */

type StatTone = 'blue' | 'emerald' | 'amber' | 'rose'

/* ──────────────────────── Helpers ──────────────────────── */

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

/* ──────────────────────── Sub-components ──────────────────────── */

function AvatarOrbit({ src, alt }: Readonly<{ src: string; alt: string }>): React.JSX.Element {
  return (
    <div className="relative size-20">
      <div className="absolute inset-0 overflow-hidden rounded-full shadow-xl ring-4 ring-white dark:ring-zinc-900">
        <Image src={src} alt={alt} fill className="object-cover" sizes="80px" />
      </div>
      <div className="bg-lbs-blue absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full shadow-md ring-2 ring-white dark:ring-zinc-900">
        <Phone className="size-3 text-white" />
      </div>
    </div>
  )
}

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

/* ──────────────────────── Page ──────────────────────── */

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />

      <main>
        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-white pt-20 dark:bg-zinc-950">
          {/* Fond subtil */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950" />
          </div>

          {/* Anneaux décoratifs */}
          <div
            className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex"
            aria-hidden
          >
            <div className="size-[700px] rounded-full border border-zinc-200/70 dark:border-zinc-800/50" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex"
            aria-hidden
          >
            <div className="size-[500px] rounded-full border border-zinc-100/80 dark:border-zinc-800/30" />
          </div>

          {/* Avatars flottants */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
            <div className="absolute top-[22%] left-[8%]">
              <AvatarOrbit src="/agent.jpg" alt="Agent LBS Call Center" />
            </div>
            <div className="absolute top-[16%] right-[8%]">
              <AvatarOrbit src="/admin.jpg" alt="Admin LBS Call Center" />
            </div>
            <div className="absolute top-[50%] left-[2%] -translate-y-1/2">
              <AvatarOrbit
                src="/african-american-helpline-employee-working-call-center-reception-with-multiple-monitors-male-operator-using-telecommunication-help-clients-customer-service-support-remote-network.jpg"
                alt="Opérateur call center"
              />
            </div>
            <div className="absolute top-[50%] right-[2%] -translate-y-1/2">
              <AvatarOrbit
                src="/operator-hot-line-portrait-cheerful-african-customer-service-representative-with-headset-call-center.jpg"
                alt="Opérateur hot-line"
              />
            </div>
            <div className="absolute bottom-[24%] left-[12%]">
              <AvatarOrbit
                src="/smiling-call-center-agent-dealing-with-unhappy-customers.jpg"
                alt="Agent souriant call center"
              />
            </div>
            <div className="absolute right-[12%] bottom-[24%]">
              <AvatarOrbit src="/superadmin.jpg" alt="Super Admin LBS" />
            </div>
          </div>

          {/* Contenu centré */}
          <div className="relative z-10 mx-auto flex min-h-[640px] max-w-2xl items-center justify-center px-4 pb-8 text-center lg:min-h-[700px]">
            <HeroIntro>
              <div>
                <span className="inline-block text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
                  Bienvenue sur LBS Call Center
                </span>
              </div>

              <div>
                <h1 className="mt-4 text-5xl leading-[1.12] font-bold tracking-tight text-balance text-zinc-900 sm:text-6xl lg:text-[3.5rem] dark:text-white">
                  Solution d&apos;Appels <GradientText>Intelligente</GradientText>
                  <br />
                  Pour Vos Établissements
                </h1>
              </div>

              <div>
                <div className="to-lbs-blue mx-auto mt-5 h-1.5 w-44 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400" />
              </div>

              <div>
                <p className="mt-6 text-lg leading-8 text-zinc-500 dark:text-zinc-400">
                  Centralisez vos campagnes téléphoniques, attribuez les contacts sans doublons,
                  assistez vos agents avec l&apos;IA et suivez les KPI par rôle — en temps réel.
                </p>
              </div>

              <div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="group bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500"
                  >
                    <Link href="#fonctionnalites">
                      Commencer
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
            </HeroIntro>
          </div>

          {/* Barre fonctionnalités clés */}
          <div
            className="relative"
            style={{ background: 'linear-gradient(90deg, #15803d 0%, #244976 100%)' }}
          >
            <div className="mx-auto max-w-6xl px-4 py-5">
              <div className="flex flex-wrap items-center justify-around gap-6 opacity-90">
                {[
                  { label: 'Lomé Business School', icon: '🎓' },
                  { label: 'Campagnes IA', icon: '🤖' },
                  { label: 'Import Excel', icon: '📊' },
                  { label: 'Exports PDF', icon: '📄' },
                  { label: 'Assistant RAG', icon: '💬' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm font-medium text-white/80"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            INSIGHTS — Fonctionnalités (style screenshot 2)
        ══════════════════════════════════════════════════ */}
        <section
          id="fonctionnalites"
          className="scroll-mt-20 bg-white py-20 lg:py-28 dark:bg-zinc-950"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-400">
                    Fonctionnalités
                  </p>
                  <h2 className="mt-3 text-4xl leading-tight font-bold tracking-tight text-zinc-900 lg:text-5xl dark:text-white">
                    Tirez le meilleur de chaque interaction.
                  </h2>
                </div>
                <div className="flex items-center">
                  <p className="text-lg leading-8 text-zinc-500 dark:text-zinc-400">
                    LBS Call Center transforme chaque appel en opportunité mesurable. Scripts
                    adaptés, attribution fluide, IA contextuelle et tableaux de bord différenciés
                    par rôle — tout en une seule plateforme.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Grande image avec bloc décoratif */}
            <Reveal delay={0.08} className="relative mt-12">
              <div
                className="pointer-events-none absolute -top-4 -right-4 hidden size-32 rounded-2xl lg:block"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #244976 100%)' }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-8 -bottom-4 hidden size-20 rounded-xl opacity-60 lg:block"
                style={{ background: 'linear-gradient(135deg, #244976 0%, #1a1030 100%)' }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 shadow-zinc-900/12 ring-zinc-900/6 dark:ring-white/6">
                <Image
                  src="/lbs.jpg"
                  alt="Agents LBS Call Center en action"
                  width={1400}
                  height={600}
                  quality={100}
                  className="h-[320px] w-full object-cover object-center sm:h-[420px] lg:h-[500px]"
                  style={{ filter: 'brightness(1.06) contrast(1.08) saturate(1.12)' }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
              </div>
            </Reveal>

            {/* 3 tiles au pied de l'image */}
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: Users,
                  color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                  title: 'Support Multi-Rôle',
                  desc: 'Super-Admin, Admin et Agent disposent chacun de leur interface et permissions adaptées à leurs responsabilités.',
                },
                {
                  icon: Zap,
                  color: 'bg-lbs-blue/10 text-lbs-blue',
                  title: 'Campagnes Intelligentes',
                  desc: "Scripts personnalisables par objectif (admissions, relances, événements) avec résultats d'appel configurables.",
                },
                {
                  icon: ChartNoAxesCombined,
                  color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  title: 'KPI & Rapports',
                  desc: 'Indicateurs détaillés par rôle, exports PDF instantanés et suivi des performances individuelles en temps réel.',
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06}>
                  <div className="flex gap-4">
                    <div
                      className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${f.color}`}
                    >
                      <f.icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-zinc-900 dark:text-white">{f.title}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURES ALTERNÉES — 3 modules clés
        ══════════════════════════════════════════════════ */}
        {featureSections.map((feat, idx) => (
          <FeatureBlock key={feat.title} feature={feat} index={idx} />
        ))}

        {/* ══════════════════════════════════════════════════
            COMMENT ÇA MARCHE — 3 étapes
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
                  icon: Upload,
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
            AVANTAGES MESURABLES — KPI cards
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
            CTA FINAL
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
            <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.025)_1px,transparent_0)] [background-size:28px_28px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                  <div>
                    <Badge className="mb-5 border-emerald-500/30 bg-emerald-500/15 text-emerald-200">
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
                        className="group w-full bg-emerald-600 shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 sm:w-fit"
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
            FOOTER
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
                    'Campagnes & Scripts',
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
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ──────────────────────── Feature blocks alternés ──────────────────────── */

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

const featureSections: readonly FeatureSection[] = [
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
    imageLeft: false,
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
    imageLeft: true,
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
    imageLeft: false,
    accentColor: 'text-amber-700 dark:text-amber-400',
  },
]

function FeatureBlock({
  feature,
  index,
}: Readonly<{ feature: FeatureSection; index: number }>): React.JSX.Element {
  const isEven = index % 2 === 0

  return (
    <section
      className={`py-20 lg:py-28 ${
        isEven ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50/80 dark:bg-zinc-900/50'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
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
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
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
