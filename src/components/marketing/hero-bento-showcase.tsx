/**
 * Bento hero : séquence au montage (requestAnimationFrame), stagger net,
 * ressorts plus francés, Ken Burns, shine sur la barre KPI — respecte reduced-motion.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { LivePulseDot } from "@/components/marketing/live-pulse-dot";

const cardSurface =
  "relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/60 shadow-lg shadow-zinc-900/10 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/40 dark:shadow-black/40";

const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 26,
  mass: 0.85,
};

const springPop: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 22,
  mass: 0.7,
};

function MockMetric({
  label,
  value,
  tone,
}: Readonly<{
  label: string;
  value: string;
  tone: "blue" | "green" | "red";
}>) {
  const valueColor =
    tone === "green"
      ? "text-emerald-200"
      : tone === "red"
        ? "text-red-200"
        : "text-sky-200";

  return (
    <div className="rounded-xl bg-white/10 p-2">
      <p className="text-[10px] text-white/70">{label}</p>
      <p className={`mt-0.5 text-base font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

export function HeroBentoShowcase() {
  const reduce = useReducedMotion();
  const [play, setPlay] = React.useState(!!reduce);

  React.useEffect(() => {
    if (reduce) return;
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, [reduce]);

  const phase = play ? "show" : "idle";

  const variants = React.useMemo(() => buildVariants(!!reduce), [reduce]);

  return (
    <div className="relative isolate w-full">
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(100,116,139,0.14)_1.5px,transparent_1.5px)] bg-[length:22px_22px] opacity-70 dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_1.5px,transparent_1.5px)] dark:opacity-60"
        aria-hidden
      />

      <motion.div
        className={`${perspectiveClass} grid grid-cols-1 gap-5 md:grid-cols-2 md:grid-rows-2 md:gap-6`}
        variants={variants.grid}
        initial="idle"
        animate={phase}
      >
        <motion.div
          className={`${cardSurface} md:row-span-2`}
          variants={variants.mainCard}
          whileHover={
            reduce
              ? undefined
              : {
                  y: -10,
                  scale: 1.02,
                  boxShadow:
                    "0 32px 64px -16px rgba(36, 73, 118, 0.35), 0 0 0 1px rgba(255,255,255,0.08)",
                  transition: springPop,
                }
          }
        >
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] bg-[linear-gradient(135deg,rgba(36,73,118,0.35),rgba(128,0,0,0.2),rgba(36,73,118,0.25))] opacity-60 blur-xl"
              animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          )}

          <div className="relative h-64 w-full overflow-hidden md:h-full md:min-h-[340px]">
            <motion.div
              className="size-full"
              animate={
                reduce
                  ? undefined
                  : {
                      scale: [1, 1.065, 1],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 14, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Image
                src="/african-american-helpline-employee-working-call-center-reception-with-multiple-monitors-male-operator-using-telecommunication-help-clients-customer-service-support-remote-network.jpg"
                alt="Plateforme de gestion de centre d’appels pour établissements d’enseignement supérieur"
                width={960}
                height={720}
                className="size-full object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>

          <motion.div
            className="absolute bottom-4 left-4 right-4 z-10 md:right-[340px]"
            variants={variants.fadeUpLate}
          >
            <Badge variant="secondary" className="bg-white/90 text-zinc-900 shadow-md backdrop-blur">
              Supervision • Campagnes • KPI
            </Badge>
            <p className="mt-2 text-pretty text-sm font-semibold text-white drop-shadow-md md:text-base">
              Suivez la performance en temps réel, sans perdre le contrôle.
            </p>
          </motion.div>

          <motion.div
            className="absolute right-4 top-4 z-20 hidden md:block"
            variants={variants.glassEnter}
          >
            <motion.div
              className="relative w-[min(100%,320px)] overflow-hidden rounded-2xl border border-white/25 bg-black/45 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
              whileHover={
                reduce
                  ? undefined
                  : { scale: 1.03, borderColor: "rgba(255,255,255,0.45)" }
              }
              transition={springPop}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/90">KPI • Aujourd’hui</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-100">
                  <LivePulseDot className="inline-block size-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <motion.div
                className="mt-3 grid grid-cols-3 gap-2"
                variants={variants.metricsContainer}
                initial="idle"
                animate={phase}
              >
                {[
                  { label: "Appels", value: "128", tone: "blue" as const },
                  { label: "Positifs", value: "23", tone: "green" as const },
                  { label: "RDV", value: "9", tone: "red" as const },
                ].map((m) => (
                  <motion.div key={m.label} variants={variants.metricItem}>
                    <MockMetric label={m.label} value={m.value} tone={m.tone} />
                  </motion.div>
                ))}
              </motion.div>

              <div className="relative mt-3 overflow-hidden rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-white/85">Campagne “Admissions”</p>
                <div className="relative mt-2 h-10 w-full overflow-hidden rounded-lg bg-black/25">
                  <motion.div
                    className="h-full rounded-lg bg-[linear-gradient(90deg,rgba(36,73,118,0.95),rgba(33,65,108,0.85),rgba(128,0,0,0.65))]"
                    variants={variants.barFill}
                    initial="idle"
                    animate={phase}
                  />
                  {!reduce && (
                    <motion.div
                      className="pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"
                      initial={{ x: "-100%" }}
                      animate={{ x: ["-100%", "280%"] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 1.2,
                        ease: "easeInOut",
                      }}
                      aria-hidden
                    />
                  )}
                </div>
                <motion.p
                  className="mt-2 text-[11px] text-white/75"
                  variants={variants.fadeUpLate}
                >
                  Qualité: 4.6/5 • Durée moyenne: 3m12
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className={cardSurface}
          variants={variants.sideCard}
          whileHover={
            reduce
              ? undefined
              : {
                  y: -12,
                  rotateX: 4,
                  rotateY: -5,
                  scale: 1.03,
                  boxShadow:
                    "0 28px 56px -20px rgba(36, 73, 118, 0.3), 0 0 0 1px rgba(255,255,255,0.06)",
                  transition: springPop,
                }
          }
        >
          <div className="relative h-44 overflow-hidden sm:h-48">
            <motion.div
              className="size-full"
              whileHover={reduce ? undefined : { scale: 1.09 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                src="/operator-hot-line-portrait-cheerful-african-customer-service-representative-with-headset-call-center.jpg"
                alt="Agent téléprospecteur assisté pendant l’appel"
                width={960}
                height={720}
                className="size-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            <motion.div className="absolute bottom-4 left-4 right-4" variants={variants.badgeRise}>
              <Badge variant="secondary" className="bg-white/90 text-zinc-900 shadow-md backdrop-blur">
                Interface Agent • Script • Assistant IA
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className={cardSurface}
          variants={variants.sideCard}
          whileHover={
            reduce
              ? undefined
              : {
                  y: -12,
                  rotateX: 4,
                  rotateY: 5,
                  scale: 1.03,
                  boxShadow:
                    "0 28px 56px -20px rgba(128, 0, 0, 0.22), 0 0 0 1px rgba(255,255,255,0.06)",
                  transition: springPop,
                }
          }
        >
          <div className="relative h-44 overflow-hidden sm:h-48">
            <motion.div
              className="size-full"
              whileHover={reduce ? undefined : { scale: 1.09 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                src="/smiling-call-center-agent-dealing-with-unhappy-customers.jpg"
                alt="Qualité des échanges et relances après appel"
                width={960}
                height={720}
                className="size-full object-cover"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            <motion.div className="absolute bottom-4 left-4 right-4" variants={variants.badgeRise}>
              <Badge variant="secondary" className="bg-white/90 text-zinc-900 shadow-md backdrop-blur">
                Qualité • Suivi • Relances
              </Badge>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const perspectiveClass = "[perspective:1400px] [transform-style:preserve-3d]";

function buildVariants(reduce: boolean) {
  const idleMain = reduce
    ? { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }
    : {
        opacity: 0,
        y: 110,
        scale: 0.86,
        rotateX: 12,
        filter: "blur(14px)",
      };

  const idleSide = reduce
    ? { opacity: 1, x: 0, y: 0, rotateY: 0, scale: 1 }
    : { opacity: 0, x: 120, y: 50, rotateY: 22, scale: 0.92 };

  const idleMini = reduce
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 45, scale: 0.75 };

  const idleGlass = reduce
    ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
    : { opacity: 0, y: 55, scale: 0.82, rotate: -5 };

  const idleBar = reduce ? { width: "88%" } : { width: "0%" };

  return {
    grid: {
      idle: {},
      show: {
        transition: { staggerChildren: 0.16, delayChildren: 0.04 },
      },
    },

    mainCard: {
      idle: idleMain,
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: "blur(0px)",
        transition: springSnappy,
      },
    },

    sideCard: {
      idle: idleSide,
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        rotateY: 0,
        scale: 1,
        transition: { ...springSnappy },
      },
    },

    glassEnter: {
      idle: idleGlass,
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: {
          type: "spring" as const,
          stiffness: 460,
          damping: 24,
          delay: 0.38,
        },
      },
    },

    fadeUpLate: {
      idle: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
      show: {
        opacity: 1,
        y: 0,
        transition: { ...springSnappy, delay: reduce ? 0 : 0.26 },
      },
    },

    badgeRise: {
      idle: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
      show: {
        opacity: 1,
        y: 0,
        transition: { ...springSnappy, delay: reduce ? 0 : 0.42 },
      },
    },

    metricsContainer: {
      idle: {},
      show: {
        transition: {
          staggerChildren: reduce ? 0 : 0.12,
          delayChildren: reduce ? 0 : 0.58,
        },
      },
    },

    metricItem: {
      idle: idleMini,
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springPop,
      },
    },

    barFill: {
      idle: idleBar,
      show: {
        width: "88%",
        transition: {
          delay: reduce ? 0 : 0.92,
          duration: reduce ? 0 : 1.1,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      },
    },
  };
}
