"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

interface PageIntroProps {
  onIntroComplete?: () => void;
}

export default function PageIntro({ onIntroComplete }: PageIntroProps) {
  const shouldReduce = useReducedMotion();
  const [phase, setPhase] = useState<"logo" | "wipe" | "done">("logo");

  useEffect(() => {
    if (shouldReduce) {
      setPhase("done");
      onIntroComplete?.();
      return;
    }

    // Step 1: Logo display for 750ms
    const timer1 = setTimeout(() => {
      setPhase("wipe");
    }, 750);

    // Step 2: Wipe animation completes at 1500ms total
    const timer2 = setTimeout(() => {
      setPhase("done");
      onIntroComplete?.();
    }, 1500);

    // Step 3: Hard fallback safety net so intro NEVER blocks rendering or interaction
    const hardFallback = setTimeout(() => {
      setPhase("done");
      onIntroComplete?.();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(hardFallback);
    };
  }, [shouldReduce, onIntroComplete]);

  // Once done, unmount completely from DOM
  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="page-intro-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`fixed inset-0 z-[10000] select-none overflow-hidden ${
          phase === "wipe" ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        {/* ── Layer 1: Pearl Screen with Brand Center ── */}
        <motion.div
          animate={
            phase === "wipe"
              ? {
                  clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
                }
              : {
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                }
          }
          transition={{
            duration: 0.7,
            ease: [0.65, 0, 0.35, 1],
          }}
          className="absolute inset-0 bg-pearl flex flex-col items-center justify-center will-change-[clip-path]"
        >
          {/* Subtle Ambient Glow Behind Logo */}
          <div
            aria-hidden
            className="absolute w-[360px] h-[360px] rounded-full bg-blush/35 blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-4 text-center px-6"
          >
            {/* Logo Emblem */}
            <div className="w-16 h-16 rounded-full bg-white/95 border border-blush/70 shadow-lg shadow-deep-rose/10 flex items-center justify-center p-3 relative overflow-hidden">
              <Image
                src="/imag/logo/logo.png"
                alt="Rosé Nails Studio"
                width={56}
                height={56}
                priority
                className="w-full h-full object-contain"
              />
            </div>

            {/* Brand Title */}
            <div className="flex flex-col items-center">
              <span className="font-heading text-3xl sm:text-4xl text-plum font-normal tracking-wide">
                {SITE_NAME}
              </span>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-body tracking-[0.3em] uppercase text-deep-rose">
                <Sparkles size={11} className="text-deep-rose" />
                <span>Haute Nail Couture</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Layer 2: Pink Liquid-Style Wipe Follower Ribbon ── */}
        {phase === "wipe" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "-100%" }}
            transition={{
              duration: 0.75,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="absolute inset-0 bg-gradient-to-t from-deep-rose/30 via-blush/40 to-transparent pointer-events-none will-change-transform"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
