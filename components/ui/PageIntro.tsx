"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  SITE_NAME,
  INTRO_MIN_MS,
  INTRO_MAX_MS,
  LIFT_DURATION,
} from "@/lib/constants";
import { useIntro } from "@/components/providers/IntroProvider";
import BrandLogo from "@/components/ui/BrandLogo";

interface PageIntroProps {
  onIntroComplete?: () => void;
}

export default function PageIntro({ onIntroComplete }: PageIntroProps) {
  const shouldReduce = useReducedMotion();
  const { introState, setIntroState } = useIntro();

  const [minTimePassed, setMinTimePassed] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [maxTimeoutPassed, setMaxTimeoutPassed] = useState(false);

  // ─── Lock body scroll while intro is active ───
  useEffect(() => {
    if (introState !== "done") {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [introState]);

  // ─── Timer: Minimum duration ───
  useEffect(() => {
    const minMs = shouldReduce ? 1000 : INTRO_MIN_MS;
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, minMs);

    return () => clearTimeout(timer);
  }, [shouldReduce]);

  // ─── Timer: Maximum fallback timeout (never wait longer than INTRO_MAX_MS) ───
  useEffect(() => {
    const maxMs = shouldReduce ? 2000 : INTRO_MAX_MS;
    const timer = setTimeout(() => {
      setMaxTimeoutPassed(true);
    }, maxMs);

    return () => clearTimeout(timer);
  }, [shouldReduce]);

  // ─── Readiness: fonts.ready + hero video first frame loaded (or fallback) ───
  useEffect(() => {
    let isMounted = true;

    // 1. Check fonts
    const fontsPromise =
      typeof document !== "undefined" && document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();

    // 2. Check hero video first frame
    const videoPromise = new Promise<void>((resolve) => {
      if (typeof window === "undefined") {
        resolve();
        return;
      }

      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Poll briefly for video element in case Hero mounts slightly after PageIntro
      const startTime = Date.now();
      const interval = setInterval(() => {
        const video = document.querySelector("video");
        if (video) {
          if (video.readyState >= 2) {
            clearInterval(interval);
            done();
            return;
          }
          video.addEventListener("loadeddata", done, { once: true });
          video.addEventListener("canplay", done, { once: true });
          video.addEventListener("error", done, { once: true });
        }

        // If not found or not ready within 1200ms, proceed
        if (Date.now() - startTime > 1200) {
          clearInterval(interval);
          done();
        }
      }, 50);
    });

    Promise.allSettled([fontsPromise, videoPromise]).then(() => {
      if (isMounted) {
        setPageReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Sequence Step 1: Trigger curtain lift when ready ───
  useEffect(() => {
    if (introState !== "playing") return;

    // Lift only when BOTH min time elapsed AND page ready, OR max timeout reached
    if ((minTimePassed && pageReady) || maxTimeoutPassed) {
      setIntroState("lifting");
    }
  }, [minTimePassed, pageReady, maxTimeoutPassed, introState, setIntroState]);

  // ─── Sequence Step 2: Complete lift after LIFT_DURATION ───
  useEffect(() => {
    if (introState !== "lifting") return;

    const liftMs = shouldReduce ? 500 : LIFT_DURATION * 1000;
    const liftTimer = setTimeout(() => {
      setIntroState("done");
      onIntroComplete?.();
    }, liftMs);

    return () => clearTimeout(liftTimer);
  }, [introState, shouldReduce, setIntroState, onIntroComplete]);

  // When completely finished, unmount from the DOM
  if (introState === "done") {
    return null;
  }

  return (
    <motion.div
      id="page-intro-overlay"
      aria-hidden="true"
      initial={{ y: "0%", opacity: 1 }}
      animate={
        shouldReduce
          ? introState === "lifting"
            ? { opacity: 0 }
            : { opacity: 1 }
          : introState === "lifting"
          ? { y: "-100%" }
          : { y: "0%" }
      }
      transition={
        shouldReduce
          ? { duration: 0.5, ease: "easeOut" }
          : {
              duration: LIFT_DURATION,
              ease: [0.76, 0, 0.24, 1], // Smooth cubic-bezier specified in requirements
            }
      }
      className={`fixed inset-0 z-[100000] bg-pearl flex flex-col items-center justify-center select-none overflow-hidden will-change-transform intro-safety-fallback ${
        introState === "lifting" ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Subtle Ambient Glow Behind Logo */}
      <div
        aria-hidden
        className="absolute w-[420px] h-[420px] rounded-full bg-blush/35 dark:bg-rose/20 blur-3xl pointer-events-none"
      />

      {/* Brand Identity Center Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        {/* Logo Emblem */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/95 dark:bg-surface-elevated/95 border border-blush/70 dark:border-rose/30 shadow-lg shadow-deep-rose/10 flex items-center justify-center p-3 relative overflow-hidden">
          <BrandLogo size={46} priority />
        </div>

        {/* Brand Title */}
        <div className="flex flex-col items-center mt-4">
          <span className="font-heading text-3xl sm:text-4xl text-plum font-normal tracking-wide">
            {SITE_NAME}
          </span>
          <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-body tracking-[0.3em] uppercase text-deep-rose font-medium">
            <Sparkles size={11} className="text-deep-rose" />
            <span>Haute Nail Couture</span>
          </div>
        </div>

        {/* Thin Pink Progress Line (Fills over INTRO_MIN_MS so the wait feels intentional) */}
        {!shouldReduce && (
          <div className="w-36 h-[2px] bg-rose/20 dark:bg-rose/15 rounded-full overflow-hidden mt-4">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: INTRO_MIN_MS / 1000,
                ease: "easeInOut",
              }}
              className="h-full bg-gradient-to-r from-rose via-deep-rose to-rose rounded-full will-change-[width]"
            />
          </div>
        )}
      </motion.div>

      {/* Pink Liquid Curtain Bottom Edge Ribbon */}
      <div
        aria-hidden
        className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-transparent via-deep-rose/25 to-blush/35 pointer-events-none blur-sm"
      />
    </motion.div>
  );
}
