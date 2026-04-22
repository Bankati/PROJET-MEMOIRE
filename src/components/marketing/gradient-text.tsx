/**
 * Texte avec gradient animé premium, utilisé pour les titres héros.
 * Le gradient se déplace subtilement pour attirer l'attention.
 */
"use client";

import { motion, useReducedMotion } from "framer-motion";

type GradientTextProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

export function GradientText({ children, className = "" }: GradientTextProps) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`bg-[linear-gradient(90deg,#244976_0%,#21416C_25%,#800000_50%,#244976_75%,#21416C_100%)] bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      animate={
        reduce
          ? undefined
          : { backgroundPosition: ["0% center", "200% center"] }
      }
      transition={
        reduce
          ? undefined
          : { duration: 6, repeat: Infinity, ease: "linear" }
      }
    >
      {children}
    </motion.span>
  );
}
