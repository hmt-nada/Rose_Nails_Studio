"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // e.g. 0.2 (gentle drift), 0.5 (medium), -0.3 (counter drift)
  className?: string;
}

export default function Parallax({
  children,
  speed = 0.25,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate distance in pixels based on speed: for speed=0.25, drifts by ~60px
  const distance = speed * 200;
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  if (shouldReduce || speed === 0) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
