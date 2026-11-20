"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  children: string;
  by?: "word" | "char" | "line";
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
}

export default function SplitText({
  children,
  by = "word",
  className,
  delay = 0,
  stagger = 0.04,
  duration = 0.6,
  once = true,
}: SplitTextProps) {
  const shouldReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Once in view, start 3s safety countdown: if still not revealed, force it visible
            if (!safetyTimer) {
              safetyTimer = setTimeout(() => {
                setForceVisible(true);
              }, 3000);
            }
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  // SSR or reduced motion or forced visible: content is 100% visible by default in DOM
  if (!mounted || shouldReduce || forceVisible) {
    return (
      <span
        ref={containerRef}
        className={cn("inline-block", className)}
        data-split-text="visible"
      >
        {children}
      </span>
    );
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: "105%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Word splitting
  if (by === "word") {
    const words = children.split(" ");
    return (
      <motion.span
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.15 }}
        className={cn("inline-block", className)}
        data-split-text="animated"
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block will-change-transform"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // Character splitting
  if (by === "char") {
    const chars = Array.from(children);
    return (
      <motion.span
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.15 }}
        className={cn("inline-block", className)}
        data-split-text="animated"
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="inline-block overflow-hidden align-top"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block will-change-transform"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // Line splitting (by newline)
  const lines = children.split("\n");
  return (
    <motion.span
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      className={cn("inline-block", className)}
      data-split-text="animated"
    >
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="block overflow-hidden">
          <motion.span
            variants={itemVariants}
            className="inline-block will-change-transform"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
