"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SplitText from "@/components/ui/animations/SplitText";

interface StepItem {
  id: string;
  number: string;
  numInt: number;
  title: string;
  description: string;
  icon: typeof Sparkles;
  badge: string;
}

const STEPS: StepItem[] = [
  {
    id: "step-1",
    number: "01",
    numInt: 1,
    badge: "Step 01",
    title: "Choose your service",
    description:
      "Explore our menu of bespoke nail couture, Japanese soft gels, restorative cuticle care, and hand-painted art.",
    icon: Sparkles,
  },
  {
    id: "step-2",
    number: "02",
    numInt: 2,
    badge: "Step 02",
    title: "Pick a time slot",
    description:
      "Select your ideal appointment date and private studio time slot tailored to your personal schedule.",
    icon: Calendar,
  },
  {
    id: "step-3",
    number: "03",
    numInt: 3,
    badge: "Step 03",
    title: "Confirm your booking",
    description:
      "Receive instant confirmation, atelier arrival rituals, and dedicated concierge care for your visit.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress for the connecting line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 75%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section
      id="how-it-works"
      className="relative py-28 w-full bg-pearl overflow-hidden select-none"
    >
      {/* ── Ambient Background Lighting ── */}
      <div
        aria-hidden
        className="absolute top-1/4 -right-28 w-[480px] h-[480px] rounded-full bg-blush/25 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-1/4 -left-28 w-[450px] h-[450px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6">
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">How It Works</SplitText>
          </span>
          <h2 className="font-heading text-5xl md:text-6xl xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Your Journey to Flawless Nails
            </SplitText>
          </h2>
          <p className="font-body text-base md:text-lg font-light text-plum/65 max-w-md">
            <SplitText by="word" stagger={0.03} delay={0.25}>
              Three simple steps from inspiration to your signature set.
            </SplitText>
          </p>
        </div>

        {/* ── Steps Container with Dynamic Connecting Line ── */}
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto">
          {/* ── Vertical / Curving Connecting Line (SVG Path) ── */}
          <div
            aria-hidden
            className="absolute left-6 md:left-1/2 -translate-x-1/2 top-10 bottom-10 w-2 md:w-4 pointer-events-none z-0"
          >
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 10 600"
            >
              <defs>
                <linearGradient
                  id="lineGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#F9C6D4" />
                  <stop offset="50%" stopColor="#E88AA6" />
                  <stop offset="100%" stopColor="#B84A6E" />
                </linearGradient>
              </defs>

              {/* Faint background track */}
              <line
                x1="5"
                y1="0"
                x2="5"
                y2="600"
                stroke="rgba(249, 198, 212, 0.45)"
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />

              {/* Active drawing line bound to scroll progress */}
              <motion.line
                x1="5"
                y1="0"
                x2="5"
                y2="600"
                stroke="url(#lineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={shouldReduce ? 1 : smoothProgress}
              />
            </svg>
          </div>

          {/* ── 3 Steps (Alternating sides on Desktop) ── */}
          <div className="flex flex-col gap-14 md:gap-20 relative z-10">
            {STEPS.map((step, index) => (
              <StepRow
                key={step.id}
                step={step}
                index={index}
                shouldReduce={shouldReduce}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Single Step Row Component ───────────────────────────────────────────────
interface StepRowProps {
  step: StepItem;
  index: number;
  shouldReduce: boolean | null;
}

function StepRow({ step, index, shouldReduce }: StepRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, amount: 0.2 });
  const [hasRevealed, setHasRevealed] = useState(false);
  const isEven = index % 2 === 0; // step 1 (0) on left, step 2 (1) on right, step 3 (2) on left
  const Icon = step.icon;

  useEffect(() => {
    if (isInView) {
      setHasRevealed(true);
    }
  }, [isInView]);

  // Safety net: force visible after 3s
  useEffect(() => {
    const safety = setTimeout(() => {
      setHasRevealed(true);
    }, 3000);
    return () => clearTimeout(safety);
  }, []);

  // Number count-up effect
  const [displayedNumber, setDisplayedNumber] = useState("00");

  useEffect(() => {
    if (!hasRevealed) return;
    if (shouldReduce) {
      setDisplayedNumber(step.number);
      return;
    }

    let count = 0;
    const target = step.numInt;
    const interval = setInterval(() => {
      count++;
      setDisplayedNumber(`0${count}`);
      if (count >= target) {
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [hasRevealed, shouldReduce, step.number, step.numInt]);

  return (
    <div
      ref={rowRef}
      className={cn(
        "relative flex flex-col md:flex-row items-start md:items-center w-full",
        // Desktop alternation: even steps left-aligned, odd steps right-aligned
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      )}
    >
      {/* ── Step Card Side (Slides in from left or right with blur-to-sharp) ── */}
      <div className="w-full md:w-[calc(50%-40px)] pl-16 md:pl-0">
        <motion.div
          initial={
            shouldReduce
              ? {}
              : {
                  opacity: 0,
                  x: isEven ? -60 : 60,
                  filter: "blur(8px)",
                }
          }
          animate={
            shouldReduce || hasRevealed
              ? {
                  opacity: 1,
                  x: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  x: isEven ? -60 : 60,
                  filter: "blur(8px)",
                }
          }
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            y: -8,
            transition: { duration: 0.28, ease: "easeOut" },
          }}
          className={cn(
            "group relative p-7 sm:p-8 rounded-[32px] bg-white/95 backdrop-blur-md",
            "border border-white/90 shadow-[0_12px_40px_rgba(184,74,110,0.08),0_4px_16px_rgba(249,198,212,0.2)]",
            "hover:shadow-[0_20px_50px_rgba(184,74,110,0.18)] hover:border-blush/60",
            "transition-shadow duration-300 cursor-default will-change-transform",
            isEven ? "md:text-right" : "md:text-left"
          )}
        >
          {/* Subtle glowing corner gradient */}
          <div
            aria-hidden
            className="absolute top-0 right-0 w-32 h-32 rounded-full bg-blush/20 blur-2xl pointer-events-none"
          />

          {/* Badge & Number for mobile / header */}
          <div
            className={cn(
              "flex items-center gap-3 mb-3",
              isEven ? "md:justify-end" : "md:justify-start"
            )}
          >
            <span className="font-body text-[11px] font-semibold tracking-[0.25em] uppercase text-deep-rose/80 px-3 py-1 rounded-full bg-pearl border border-blush/50">
              {step.badge}
            </span>
          </div>

          {/* Step Title */}
          <h3 className="font-heading text-2xl sm:text-3xl font-medium text-plum mb-2 tracking-wide group-hover:text-deep-rose transition-colors duration-300">
            {step.title}
          </h3>

          {/* Step Description */}
          <p className="font-body text-sm font-light text-plum/70 leading-relaxed max-w-sm ml-auto mr-auto md:ml-0 md:mr-0">
            {step.description}
          </p>
        </motion.div>
      </div>

      {/* ── Center Node on the SVG Line (Number + Bouncing Icon) ── */}
      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-auto flex items-center justify-center z-20">
        <motion.div
          initial={
            shouldReduce
              ? {}
              : {
                  scale: 0,
                  rotate: -20,
                  opacity: 0,
                }
          }
          animate={
            shouldReduce || hasRevealed
              ? {
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                }
              : {
                  scale: 0,
                  rotate: -20,
                  opacity: 0,
                }
          }
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 18,
            delay: 0.15,
          }}
          whileHover={{
            scale: 1.15,
            rotate: [0, -8, 8, -6, 6, 0],
            transition: { duration: 0.5 },
          }}
          className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border-2 border-deep-rose shadow-lg shadow-deep-rose/20 flex items-center justify-center cursor-pointer will-change-transform"
        >
          {/* Animated counting number watermark inside node */}
          <span className="absolute -top-6 font-heading text-sm font-bold tracking-wider text-deep-rose/70">
            {displayedNumber}
          </span>

          {/* Icon with bounce & hover wiggle */}
          <Icon
            size={20}
            className="text-deep-rose transition-transform duration-300 group-hover:scale-110"
          />
        </motion.div>
      </div>

      {/* ── Opposite Spacer Side for desktop grid balance ── */}
      <div className="hidden md:block w-[calc(50%-40px)]" aria-hidden />
    </div>
  );
}
