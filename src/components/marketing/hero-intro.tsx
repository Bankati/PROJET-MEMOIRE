/**
 * Hero gauche : entrée en cascade (spring) au chargement.
 */
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 320, damping: 28 },
  },
};

export function HeroIntro({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="relative">{children}</div>;
  }

  return (
    <motion.div
      className="relative"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {React.Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
