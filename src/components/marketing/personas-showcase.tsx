/**
 * Section « Pour qui ? » — Cards animées avec layout animations (motion.dev style).
 * Chaque persona est une carte qui s'expand au clic avec une transition spring.
 * Utilise AnimatePresence et layoutId pour des morphings fluides entre les états.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  Check,
  GraduationCap,
  Headset,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";


/* ─────────────────────── Types ─────────────────────── */

type PersonaAccent = "blue" | "emerald" | "violet" | "crimson";

type Persona = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  bullets: readonly string[];
  portrait: string;
  portraitAlt: string;
  accent: PersonaAccent;
  Icon: LucideIcon;
}>;

type AccentStyle = Readonly<{
  card: string;
  cardHover: string;
  iconBgActive: string;
  iconBgIdle: string;
  chip: string;
  gradient: string;
  glow: string;
  bullet: string;
  indicator: string;
}>;

/* ─────────────────────── Styles par accent ─────────────────────── */

const accentStyles: Record<PersonaAccent, AccentStyle> = {
  blue: {
    card: "border-lbs-blue/20 bg-gradient-to-br from-lbs-blue/6 via-white to-blue-50/50 dark:from-lbs-blue/12 dark:via-zinc-900 dark:to-zinc-900",
    cardHover: "hover:border-lbs-blue/40 hover:shadow-lbs-blue/15",
    iconBgActive: "bg-lbs-blue text-white",
    iconBgIdle: "bg-blue-100 text-lbs-blue dark:bg-lbs-blue/20 dark:text-blue-200",
    chip: "bg-lbs-blue/10 text-lbs-blue border-lbs-blue/20",
    gradient: "from-lbs-blue/50 via-lbs-blue/20 to-transparent",
    glow: "bg-lbs-blue/20",
    bullet: "bg-lbs-blue/15 text-lbs-blue",
    indicator: "bg-lbs-blue",
  },
  emerald: {
    card: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/6 via-white to-emerald-50/50 dark:from-emerald-500/10 dark:via-zinc-900 dark:to-zinc-900",
    cardHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/15",
    iconBgActive: "bg-emerald-600 text-white dark:bg-emerald-500",
    iconBgIdle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
    gradient: "from-emerald-500/45 via-emerald-500/15 to-transparent",
    glow: "bg-emerald-500/20",
    bullet: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    indicator: "bg-emerald-500",
  },
  violet: {
    card: "border-violet-500/20 bg-gradient-to-br from-violet-500/6 via-white to-violet-50/50 dark:from-violet-500/10 dark:via-zinc-900 dark:to-zinc-900",
    cardHover: "hover:border-violet-500/40 hover:shadow-violet-500/15",
    iconBgActive: "bg-violet-600 text-white dark:bg-violet-500",
    iconBgIdle: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
    chip: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300",
    gradient: "from-violet-500/45 via-violet-500/15 to-transparent",
    glow: "bg-violet-500/20",
    bullet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    indicator: "bg-violet-500",
  },
  crimson: {
    card: "border-lbs-red/20 bg-gradient-to-br from-lbs-red/6 via-white to-red-50/50 dark:from-lbs-red/10 dark:via-zinc-900 dark:to-zinc-900",
    cardHover: "hover:border-lbs-red/40 hover:shadow-lbs-red/15",
    iconBgActive: "bg-lbs-red text-white",
    iconBgIdle: "bg-red-100 text-lbs-red dark:bg-lbs-red/20 dark:text-red-200",
    chip: "bg-lbs-red/10 text-lbs-red border-lbs-red/20",
    gradient: "from-lbs-red/45 via-lbs-red/15 to-transparent",
    glow: "bg-lbs-red/20",
    bullet: "bg-lbs-red/15 text-lbs-red",
    indicator: "bg-lbs-red",
  },
};

/* ─────────────────────── Données ─────────────────────── */

const personas: readonly Persona[] = [
  {
    id: "super",
    title: "Super‑Administrateur",
    subtitle: "Vision globale, gouvernance et KPI consolidés.",
    bullets: [
      "Création des admins et gestion multi‑entités",
      "KPI globaux (qualité, productivité, conversion)",
      "Audit & sécurité (préparation permissions fines)",
    ],
    portrait: "/superadmin.jpg",
    portraitAlt: "Super-administrateur en gouvernance",
    accent: "blue",
    Icon: ShieldCheck,
  },
  {
    id: "admin",
    title: "Administrateur prospection",
    subtitle: "Orchestration des campagnes et des équipes.",
    bullets: [
      "Création de campagnes + scripts",
      "Import Excel/.xls + attribution contacts",
      "Création d'agents et suivi de performance",
    ],
    portrait: "/admin.jpg",
    portraitAlt: "Administrateur prospection",
    accent: "emerald",
    Icon: Activity,
  },
  {
    id: "agent",
    title: "Agent téléprospecteur",
    subtitle: "Une interface ultra‑fluide pour appeler et convertir.",
    bullets: [
      "Composeur + fiche détaillée prospect",
      "Résultats d'appel et prochaines actions",
      "Assistant IA (RAG) pendant l'appel",
    ],
    portrait: "/agent.jpg",
    portraitAlt: "Agent téléprospecteur",
    accent: "violet",
    Icon: Headset,
  },
  {
    id: "direction",
    title: "Direction / Établissement",
    subtitle: "Pilotage par les résultats, décisions rapides.",
    bullets: [
      "Amélioration du taux de conversion",
      "Réduction du temps moyen d'appel",
      "Transparence KPI et qualité des échanges",
    ],
    portrait: "/administration.jpg",
    portraitAlt: "Direction et administration de l'établissement",
    accent: "crimson",
    Icon: GraduationCap,
  },
] as const;

/* ─────────────────────── Composant principal ─────────────────────── */

export function PersonasShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState<number | null>(null);

  return (
    <section
      id="pour-qui"
      className="scroll-mt-20 relative overflow-hidden py-24 md:py-32"
      style={{
        background:
          "linear-gradient(135deg, var(--section-cool) 0%, var(--section-warm) 35%, var(--section-accent) 65%, var(--section-cool) 100%)",
      }}
    >
      {/* Mesh decoratif vivant */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-lbs-blue/12 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-lbs-red/8 blur-[100px]" />
        <div className="absolute right-1/4 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(36,73,118,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-lbs-blue/20 bg-lbs-blue/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-lbs-blue backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-lbs-blue opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-lbs-blue" />
            </span>
            Équipes & rôles
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl lg:text-5xl">
            Conçu pour{" "}
            <span className="bg-gradient-to-r from-lbs-blue via-violet-600 to-lbs-red bg-clip-text text-transparent">
              chaque profil
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            Même produit, des écrans et des indicateurs qui parlent le
            langage du métier — du terrain à la direction.
          </p>
        </motion.div>

        {/* Grille de cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((persona, index) => {
            const isActive = active === index;
            const styles = accentStyles[persona.accent];
            return (
              <motion.div
                key={persona.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 32, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: index * 0.08,
                }}
                onClick={() => setActive(isActive ? null : index)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-6 shadow-md backdrop-blur-sm transition-all duration-500 ${styles.card} ${styles.cardHover} ${
                  isActive ? "shadow-xl lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                {/* Glow derriere la carte */}
                <div
                  className={`pointer-events-none absolute -inset-1 -z-10 rounded-[inherit] ${styles.glow} opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100`}
                  aria-hidden
                />

                {/* Indicateur actif */}
                <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all duration-500 ${isActive ? styles.indicator : "bg-transparent"}`} />

                {/* En-tête de la carte */}
                <div className="flex items-start gap-4">
                  <motion.div
                    layout={!reduce}
                    className={`grid shrink-0 place-items-center rounded-xl shadow-lg transition-all duration-300 ${isActive ? styles.iconBgActive : styles.iconBgIdle} ${isActive ? "size-14" : "size-12"}`}
                  >
                    <persona.Icon className={isActive ? "size-6" : "size-5"} />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <motion.h3
                      layout={!reduce}
                      className={`font-bold tracking-tight text-zinc-900 dark:text-white ${isActive ? "text-xl" : "text-base"}`}
                    >
                      {persona.title}
                    </motion.h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {persona.subtitle}
                    </p>
                  </div>
                </div>

                {/* Contenu expand */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        opacity: { duration: 0.2 },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 grid gap-5 lg:grid-cols-2">
                        {/* Photo portrait */}
                        <div className="relative overflow-hidden rounded-xl">
                          <motion.div
                            initial={reduce ? false : { scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
                            className="relative aspect-[4/3] w-full"
                          >
                            <Image
                              src={persona.portrait}
                              alt={persona.portraitAlt}
                              fill
                              className="rounded-xl object-cover"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-tr ${styles.gradient}`} />
                          </motion.div>
                        </div>
                        {/* Bullets animées */}
                        <div className="flex flex-col justify-center gap-3">
                          {persona.bullets.map((bullet, bulletIdx) => (
                            <motion.div
                              key={bullet}
                              initial={reduce ? false : { opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 28,
                                delay: 0.15 + bulletIdx * 0.08,
                              }}
                              className="flex items-start gap-3 rounded-xl bg-white/60 p-3 shadow-sm backdrop-blur dark:bg-zinc-800/40"
                            >
                              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg ${styles.bullet}`}>
                                <Check className="size-3.5" strokeWidth={3} />
                              </span>
                              <span className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                                {bullet}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Indicateur "cliquer pour expand" */}
                {!isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-5 flex items-center gap-2"
                  >
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles.chip}`}>
                      Vue métier
                    </span>
                    <ArrowRight className="size-3.5 text-zinc-500 transition-transform group-hover:translate-x-1 dark:text-zinc-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
