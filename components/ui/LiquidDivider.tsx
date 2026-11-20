"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidDividerProps {
  fromColor?: string; // e.g. "fill-pearl"
  toColor?: string;   // e.g. "bg-[#FDF0F5]"
  flip?: boolean;
  className?: string;
}

export default function LiquidDivider({
  fromColor = "fill-pearl",
  toColor = "bg-[#FDF0F5]",
  flip = false,
  className,
}: LiquidDividerProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Gentle wave shift on scroll (transform only)
  const waveX = useTransform(scrollYProgress, [0, 1], flip ? ["-2%", "2%"] : ["2%", "-2%"]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "relative w-full overflow-hidden leading-none pointer-events-none select-none z-10",
        toColor,
        className
      )}
    >
      <motion.svg
        style={shouldReduce ? {} : { x: waveX }}
        className={cn(
          "relative block w-[104%] -left-[2%] h-10 sm:h-14 md:h-18 lg:h-20",
          flip && "-scale-x-100"
        )}
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
      >
        {/* Soft back shadow wave */}
        <path
          d="M0,32 C240,68 480,12 720,44 C960,76 1200,24 1440,48 L1440,0 L0,0 Z"
          fill="rgba(249, 198, 212, 0.25)"
        />
        {/* Main foreground liquid wave */}
        <path
          d="M0,28 C320,62 580,16 840,46 C1100,74 1320,30 1440,38 L1440,0 L0,0 Z"
          className={fromColor}
        />
      </motion.svg>
    </div>
  );
}
