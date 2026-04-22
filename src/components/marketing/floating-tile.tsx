/**
 * Carte média avec léger flottement + scale au survol (plus "vivant").
 */
"use client";

import type * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function FloatingTile({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 30,
        delay: reduce ? 0 : delay,
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { type: "spring", stiffness: 400, damping: 22 },
            }
      }
    >
      {children}
    </motion.div>
  );
}
