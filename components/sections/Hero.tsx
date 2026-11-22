"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";
import { HERO_QUOTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import MagneticButton from "@/components/ui/MagneticButton";
import { scrollToSection } from "@/lib/scroll";
import { useIntro } from "@/components/providers/IntroProvider";

// ─── Quote configuration ────────────────────────────────────────────────────
const ACTIVE_QUOTE_INDEX = 0;
const ACTIVE_QUOTE = HERO_QUOTES[ACTIVE_QUOTE_INDEX];

// Words styled in deep rose gradient
const ROSE_PHRASE = "your nails can be";

// ─── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Hero() {
  const shouldReduce = useReducedMotion();
  const { isLiftingOrDone } = useIntro();
  const heroRef = useRef<HTMLElement>(null);

  // Scroll parallax transforms
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Text column moves up and gently fades on scroll
  const textY = useTransform(scrollYProgress, [0, 1], ["0px", "-80px"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.1]);

  // Video scales down slightly and rotates a tiny bit for depth
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 0.91]);
  const videoRotate = useTransform(scrollYProgress, [0, 1], [0, 2]);
  const videoY = useTransform(scrollYProgress, [0, 1], ["0px", "35px"]);

  // Scroll-to-book helper
  function scrollToBook() {
    scrollToSection("#book");
  }

  // Split quote into words
  const words = ACTIVE_QUOTE.split(" ");

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative flex items-center min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-pearl"
    >
      {/* ── Background blobs drifting with scroll ── */}
      <BackgroundBlobs scrollYProgress={scrollYProgress} />

      {/* ── Ambient parallax bubbles (bigger = faster) ── */}
      {!shouldReduce && <ParallaxBubbles scrollYProgress={scrollYProgress} />}

      {/* ── Main two-column grid (Stacked on mobile/tablet < 1024px) ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-8 xl:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-16 items-center pt-24 sm:pt-28 pb-10 sm:pb-16">
        {/* ── LEFT COLUMN (Text moves up & fades on scroll) ── */}
        <motion.div
          style={shouldReduce ? {} : { y: textY, opacity: textOpacity }}
          className="flex flex-col items-start gap-4 sm:gap-6 will-change-transform max-w-xl lg:max-w-none"
        >
          {/* Tagline */}
          <motion.span
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate={isLiftingOrDone ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : 0.44 }}
            className="inline-block font-body text-xs tracking-[0.3em] uppercase text-deep-rose font-medium"
          >
            Nail art &amp; beauty
          </motion.span>

          {/* Headline – word-by-word stagger with fluid clamp */}
          <h1 className="font-heading text-[clamp(2.15rem,5.8vw,4.5rem)] xl:text-7xl 2xl:text-8xl font-bold leading-[1.08] text-plum tracking-tight">
            {words.map((word, i) => {
              const isRose = ROSE_PHRASE.includes(word);
              return (
                <motion.span
                  key={`${word}-${i}`}
                  variants={shouldReduce ? {} : fadeUp}
                  initial="hidden"
                  animate={isLiftingOrDone ? "visible" : "hidden"}
                  transition={{
                    duration: 0.45,
                    delay: shouldReduce ? 0 : 0.48 + i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block mr-[0.22em]"
                >
                  {isRose ? (
                    <span
                      className="bg-gradient-to-r from-deep-rose to-rose bg-clip-text text-transparent"
                      style={{ WebkitBackgroundClip: "text" }}
                    >
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              );
            })}
          </h1>

          {/* Description */}
          <motion.p
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate={isLiftingOrDone ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : 0.85 }}
            className="font-body text-base xl:text-lg font-light text-plum/65 max-w-md leading-relaxed"
          >
            Custom nail art, flawless manicures and designs made just for you.
            Book your appointment in a few clicks.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate={isLiftingOrDone ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: shouldReduce ? 0 : 1.0 }}
          >
            <MagneticButton
              onClick={scrollToBook}
              strength={shouldReduce ? 0 : 0.35}
              aria-label="Book your appointment"
            >
              Book Now ✦
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* ── RIGHT COLUMN – Arch video frame (scroll depth: scales & rotates) ── */}
        <motion.div
          variants={shouldReduce ? {} : scaleIn}
          initial="hidden"
          animate={isLiftingOrDone ? "visible" : "hidden"}
          transition={{
            duration: 0.7,
            delay: shouldReduce ? 0 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={
            shouldReduce
              ? {}
              : {
                scale: videoScale,
                rotate: videoRotate,
                y: videoY,
              }
          }
          className="relative flex justify-center lg:justify-end items-center w-full will-change-transform mt-2 lg:mt-0"
        >
          <VideoFrame heroRef={heroRef} />
        </motion.div>
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        variants={
          shouldReduce
            ? {}
            : { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        }
        initial="hidden"
        animate={isLiftingOrDone ? "visible" : "hidden"}
        transition={{ duration: 0.8, delay: shouldReduce ? 0 : 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-plum/35 text-xs tracking-widest uppercase font-body pointer-events-none"
        aria-hidden
      >
        <span>Scroll</span>
        <span className="w-px h-10 bg-gradient-to-b from-plum/20 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Parallax Floating Bubbles (Bigger = Faster) ─────────────────────────────
interface ParallaxBubblesProps {
  scrollYProgress: MotionValue<number>;
}

function ParallaxBubbles({ scrollYProgress }: ParallaxBubblesProps) {
  const [isMobileOrTouch, setIsMobileOrTouch] = useState(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 1024;
    setIsMobileOrTouch(isTouch);
  }, []);

  // Parallax speed proportional to size: bigger = drifts faster
  const bigY = useTransform(scrollYProgress, [0, 1], ["0px", "-220px"]);
  const medY = useTransform(scrollYProgress, [0, 1], ["0px", "-130px"]);
  const smallY = useTransform(scrollYProgress, [0, 1], ["0px", "-65px"]);

  // On touch/mobile: render only 1 small bubble to keep 60fps
  if (isMobileOrTouch) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
      >
        <motion.div
          style={{ y: smallY }}
          animate={{
            x: [0, 8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[6%] w-16 h-16 rounded-full border border-white/40 dark:border-rose/30 bg-gradient-to-br from-white/20 dark:from-rose/15 via-rose/10 to-transparent backdrop-blur-[1px] dark:shadow-[0_0_20px_rgba(243,166,189,0.2)]"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden z-[5]"
    >
      {/* 1. Large Bubble (130px, fastest drift) */}
      <motion.div
        style={{ y: bigY }}
        animate={{
          x: [0, 18, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] right-[10%] w-32 h-32 rounded-full border border-white/50 dark:border-rose/35 bg-gradient-to-br from-white/30 dark:from-rose/20 via-rose/10 to-transparent backdrop-blur-[2px] shadow-[0_8px_32px_rgba(232,138,166,0.12)] dark:shadow-[0_0_32px_rgba(243,166,189,0.25)]"
      />

      {/* 2. Medium Bubble (80px, medium drift) */}
      <motion.div
        style={{ y: medY }}
        animate={{
          x: [0, -14, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[62%] right-[5%] w-20 h-20 rounded-full border border-white/40 dark:border-rose/30 bg-gradient-to-br from-white/25 dark:from-rose/15 via-blush/15 to-transparent backdrop-blur-[1px] shadow-[0_6px_24px_rgba(184,74,110,0.08)] dark:shadow-[0_0_24px_rgba(243,166,189,0.2)]"
      />

      {/* 3. Small Bubble (45px, slowest drift) */}
      <motion.div
        style={{ y: smallY }}
        animate={{
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[32%] right-[42%] w-11 h-11 rounded-full border border-white/40 dark:border-rose/30 bg-white/20 dark:bg-rose/15 backdrop-blur-[1px] shadow-[0_4px_16px_rgba(232,138,166,0.1)] dark:shadow-[0_0_16px_rgba(243,166,189,0.2)]"
      />
    </div>
  );
}

// ─── Background blobs (animated + scroll drift) ──────────────────────────────
interface BackgroundBlobsProps {
  scrollYProgress: MotionValue<number>;
}

function BackgroundBlobs({ scrollYProgress }: BackgroundBlobsProps) {
  const shouldReduce = useReducedMotion();

  // Scroll drift transforms for background blobs
  const driftY1 = useTransform(scrollYProgress, [0, 1], ["0px", "140px"]);
  const driftY2 = useTransform(scrollYProgress, [0, 1], ["0px", "-110px"]);
  const driftY3 = useTransform(scrollYProgress, [0, 1], ["0px", "90px"]);

  if (shouldReduce) {
    return (
      <>
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blush/25 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden
        style={{ y: driftY1 }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blush/25 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        style={{ y: driftY2 }}
        className="absolute top-1/2 -left-20 w-[300px] h-[300px] rounded-full bg-rose/10 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, -20, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        aria-hidden
        style={{ y: driftY3 }}
        className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-rose/15 blur-3xl pointer-events-none will-change-transform"
        animate={{ x: [0, -30, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </>
  );
}

// ─── Video Frame ─────────────────────────────────────────────────────────────
interface VideoFrameProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

function VideoFrame({ heroRef }: VideoFrameProps) {
  const shouldReduce = useReducedMotion();
  const { introState } = useIntro();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasOutOfViewRef = useRef(false);
  const hasInitialPlayedRef = useRef(false);

  // Helper to seek to the last frame without looping (for reduced motion)
  const seekToLastFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
      video.currentTime = Math.max(0, video.duration - 0.05);
    }
  }, []);

  // Check if video is already ready on mount (e.g. cached by browser)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 1) {
      setIsVideoLoaded(true);
      if (shouldReduce) {
        seekToLastFrame();
      } else if (!hasInitialPlayedRef.current && (introState === "lifting" || introState === "done")) {
        hasInitialPlayedRef.current = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  }, [shouldReduce, seekToLastFrame, introState]);

  // Initial play trigger ONLY when introState transitions to "lifting" or "done"
  useEffect(() => {
    if (shouldReduce) return;
    const video = videoRef.current;
    if (!video) return;

    if ((introState === "lifting" || introState === "done") && !hasInitialPlayedRef.current) {
      hasInitialPlayedRef.current = true;
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, [introState, shouldReduce]);

  // Handle metadata loaded (duration now available)
  const handleLoadedMetadata = useCallback(() => {
    if (shouldReduce) {
      seekToLastFrame();
    }
  }, [shouldReduce, seekToLastFrame]);

  // Handle video ready to play
  const handleCanPlay = useCallback(() => {
    setIsVideoLoaded(true);
    if (shouldReduce) {
      seekToLastFrame();
    } else if (!hasInitialPlayedRef.current && (introState === "lifting" || introState === "done") && videoRef.current) {
      hasInitialPlayedRef.current = true;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [shouldReduce, seekToLastFrame, introState]);

  // Handle video load errors
  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoError(true);
    console.warn(
      "[Rosé Nails Studio] Failed to load hero video at /videos/hero.mp4",
      e
    );
  }, []);

  // IntersectionObserver for Hero section viewport tracking
  useEffect(() => {
    const heroEl = heroRef.current;
    const video = videoRef.current;
    if (!heroEl || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Hero is back in viewport (at least 50% visible)
            if (wasOutOfViewRef.current && hasInitialPlayedRef.current) {
              wasOutOfViewRef.current = false;
              if (!shouldReduce) {
                video.currentTime = 0;
                video.play().catch(() => { });
              }
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
            // Hero has left the viewport completely
            if (hasInitialPlayedRef.current) {
              wasOutOfViewRef.current = true;
              video.pause();
              video.currentTime = 0;
            }
          }
        }
      },
      {
        threshold: [0, 0.5],
      }
    );

    observer.observe(heroEl);

    return () => {
      observer.disconnect();
    };
  }, [heroRef, shouldReduce]);

  return (
    <motion.div
      animate={
        shouldReduce
          ? {}
          : {
              y: [0, -14, 0],
            }
      }
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        // Arch shape: large rounded top, rounded-3xl bottom
        "relative w-full max-w-[420px] xl:max-w-[480px]",
        "aspect-[3/4]",
        "rounded-t-[200px] rounded-b-3xl",
        "overflow-hidden",
        // Thin glass border
        "border border-white/60 dark:border-rose/25",
        // Soft pink glow
        "shadow-[0_12px_60px_rgba(184,74,110,0.28),0_4px_20px_rgba(184,74,110,0.15)] dark:shadow-[0_0_50px_rgba(243,166,189,0.25)]"
      )}
    >
      {/* 1. Animated fallback: always rendered underneath the video */}
      <AnimatedGradientFallback shouldReduce={shouldReduce} />

      {/* 2. Video element: fills the whole arch frame, shows only when successfully loaded.
             No 'loop' attribute: plays once and stays frozen on the last frame. */}
      {!videoError && (
        <video
          ref={videoRef}
          src="/videos/hero.mp4"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleError}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
            isVideoLoaded ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
          )}
          aria-label="Rosé Nails Studio nail art showcase video"
        />
      )}

      {/* 3. Inner glass rim highlight */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-t-[200px] rounded-b-3xl pointer-events-none z-20 ring-1 ring-inset ring-white/30 dark:ring-rose/20"
      />
    </motion.div>
  );
}

// ─── Animated Pink Gradient Fallback with Glossy Blobs & Soft Shine ───────────
function AnimatedGradientFallback({ shouldReduce }: { shouldReduce: boolean | null }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-[#FCD8E3] via-[#EFA4BC] to-[#A8385C]"
    >
      {/* Dynamic drifting gradient layer */}
      <motion.div
        className="absolute -inset-10 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at 25% 25%, #F9C6D4 0%, #E88AA6 45%, #B84A6E 90%)",
        }}
        animate={
          shouldReduce
            ? {}
            : {
                scale: [1, 1.15, 1],
                rotate: [0, 8, 0],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glossy moving blob 1 — Soft blush highlight (top-left) */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-white/45 blur-2xl pointer-events-none"
        animate={
          shouldReduce
            ? {}
            : {
                x: [0, 45, 0],
                y: [0, 35, 0],
                scale: [1, 1.2, 1],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "8%", left: "10%" }}
      />

      {/* Glossy moving blob 2 — Deep rose luminous core (center-bottom) */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-[#B84A6E]/70 blur-3xl pointer-events-none"
        animate={
          shouldReduce
            ? {}
            : {
                x: [0, -35, 0],
                y: [0, -40, 0],
                scale: [1, 1.18, 1],
              }
        }
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ bottom: "10%", right: "5%" }}
      />

      {/* Glossy moving blob 3 — Rose glaze highlight (mid-right) */}
      <motion.div
        className="absolute w-56 h-56 rounded-full bg-[#F9C6D4]/60 blur-xl pointer-events-none"
        animate={
          shouldReduce
            ? {}
            : {
                x: [0, -25, 0],
                y: [0, 30, 0],
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ top: "42%", right: "8%" }}
      />

      {/* Top curved specular gloss reflection (like glossy nail gel) */}
      <div
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 50%, transparent 80%)",
        }}
      />

      {/* Soft shine light sweep animation passing across the arch */}
      <motion.div
        className="absolute -inset-y-20 -inset-x-32 w-[200%] pointer-events-none opacity-40"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.7) 52%, transparent 65%)",
        }}
        animate={
          shouldReduce
            ? {}
            : {
                x: ["-100%", "100%"],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 2,
        }}
      />

      {/* Brand signature & sparkle emblem */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-pearl select-none pointer-events-none z-10 px-6 text-center">
        <motion.span
          className="text-4xl text-pearl drop-shadow-[0_2px_12px_rgba(255,255,255,0.6)]"
          animate={shouldReduce ? {} : { scale: [1, 1.12, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
        <span className="font-heading text-2xl font-light tracking-wider text-pearl drop-shadow-[0_2px_14px_rgba(58,31,43,0.35)]">
          Rosé Nails Studio
        </span>
        <span className="font-body text-[11px] tracking-[0.25em] uppercase text-pearl/80 drop-shadow-[0_1px_8px_rgba(58,31,43,0.25)]">
          Haute Manucure
        </span>
      </div>
    </div>
  );
}
