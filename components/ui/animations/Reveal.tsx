"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  blur?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  y = 24,
  blur = 6,
  once = true,
}: RevealProps) {
  const shouldReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !timer) {
            timer = setTimeout(() => {
              setForceVisible(true);
            }, 3000);
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // SSR or reduced motion or forced: 100% visible by default
  if (!mounted || shouldReduce || forceVisible) {
    return (
      <div ref={ref} className={className} data-reveal="visible">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: blur ? "blur(0px)" : undefined,
      }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("will-change-transform", className)}
      data-reveal="animated"
    >
      {children}
    </motion.div>
  );
}
