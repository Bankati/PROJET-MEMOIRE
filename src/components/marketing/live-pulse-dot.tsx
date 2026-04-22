/**
 * Point "Live" avec pulsation douce.
 */
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function LivePulseDot({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className} />;
  }

  return (
    <motion.span
      className={className}
      animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
