/**
 * Accordéon d'images interactif pour le hero de la page d'accueil.
 * Au survol, l'image sélectionnée s'étend avec une transition fluide
 * tandis que les autres se réduisent avec le titre en rotation verticale.
 * Utilise next/image pour l'optimisation et Framer Motion pour les animations premium.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/* ─────────────────────── Types ─────────────────────── */

type AccordionItemData = Readonly<{
  id: number;
  title: string;
  imageUrl: string;
  imageAlt: string;
}>;

type AccordionItemProps = Readonly<{
  item: AccordionItemData;
  isActive: boolean;
  onMouseEnter: () => void;
  index: number;
}>;

/* ─────────────────────── Données adaptées LBS Call Center ─────────────────────── */

const accordionItems: readonly AccordionItemData[] = [
  {
    id: 1,
    title: "Campagnes",
    imageUrl: "/callcenter.jpg",
    imageAlt: "Gestion des campagnes de prospection téléphonique",
  },
  {
    id: 2,
    title: "Attribution",
    imageUrl: "/attribution_fluide.jpg",
    imageAlt: "Attribution fluide des contacts aux agents",
  },
  {
    id: 3,
    title: "Assistant IA",
    imageUrl: "/ia.jpg",
    imageAlt: "Assistant IA contextuel pendant l'appel avec RAG",
  },
  {
    id: 4,
    title: "KPI & Dashboards",
    imageUrl: "/kpi.png",
    imageAlt: "Tableaux de bord et indicateurs par rôle",
  },
  {
    id: 5,
    title: "Intégrations",
    imageUrl:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Intégrations Twilio et WhatsApp pour le suivi",
  },
] as const;

/* ─────────────────────── Composant AccordionItem ─────────────────────── */

function AccordionItem({ item, isActive, onMouseEnter, index }: AccordionItemProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-2xl"
      onMouseEnter={onMouseEnter}
      animate={{
        width: isActive ? 320 : 56,
        opacity: 1,
      }}
      initial={{ opacity: 0, width: 56 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              width: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4, delay: index * 0.08 },
            }
      }
      style={{ height: 420 }}
    >
      <Image
        src={item.imageUrl}
        alt={item.imageAlt}
        fill
        className="object-cover"
        sizes={isActive ? "320px" : "56px"}
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 transition-opacity duration-500" />
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset transition-all duration-500 ${
          isActive ? "ring-lbs-blue/40" : "ring-white/0"
        }`}
      />
      <span
        className={`absolute text-white text-sm font-semibold whitespace-nowrap transition-all duration-500 ease-out drop-shadow-lg ${
          isActive
            ? "bottom-5 left-1/2 -translate-x-1/2 rotate-0 text-base"
            : "bottom-20 left-1/2 -translate-x-1/2 rotate-90 text-sm opacity-80"
        }`}
      >
        {item.title}
      </span>
      {isActive && (
        <motion.div
          className="absolute bottom-5 right-5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {item.id}/{accordionItems.length}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────── Composant principal ─────────────────────── */

export function InteractiveImageAccordion() {
  const [activeIndex, setActiveIndex] = React.useState(2);
  const handleItemHover = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  return (
    <div className="flex items-center justify-center gap-3">
      {accordionItems.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => handleItemHover(index)}
          index={index}
        />
      ))}
    </div>
  );
}
