"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export default function ScrollProgressBar() {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  if (shouldReduce) return null;

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blush via-rose to-deep-rose origin-left z-[100] pointer-events-none shadow-[0_1px_8px_rgba(232,138,166,0.35)]"
    />
  );
}
