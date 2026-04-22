/**
 * Compteur animé qui incrémente la valeur affichée lors de l'entrée dans le viewport.
 * Utilise Framer Motion useInView + useSpring pour un effet fluide et premium.
 */
"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

type AnimatedCounterProps = Readonly<{
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}>;

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1.8,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    stiffness: 80,
    damping: 30,
    duration: reduce ? 0 : duration,
  });
  const [display, setDisplay] = React.useState("0");
  React.useEffect(() => {
    if (isInView) {
      motionVal.set(target);
    }
  }, [isInView, target, motionVal]);
  React.useEffect(() => {
    const unsubscribe = springVal.on("change", (latest: number) => {
      setDisplay(Math.round(latest).toString());
    });
    return unsubscribe;
  }, [springVal]);
  return (
    <motion.span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}
