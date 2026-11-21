"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Camera } from "lucide-react";
import { REVIEWS, type ReviewItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import SplitText from "@/components/ui/animations/SplitText";

export default function Reviews() {
  const shouldReduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [screenCategory, setScreenCategory] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const totalReviews = REVIEWS.length;
  const isDragging = useRef(false);

  // Responsive screen category for adaptive card stack physics
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      if (w < 640) {
        setScreenCategory("mobile");
      } else if (w < 1024) {
        setScreenCategory("tablet");
      } else {
        setScreenCategory("desktop");
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Safety net: ensure cards fan out if inView trigger is delayed
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEnteredView(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Next review card (slides out and rotates)
  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalReviews);
  }, [totalReviews]);

  // Previous review card
  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  }, [totalReviews]);

  const goToCard = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Auto-advance every 6 seconds, paused when hovering over the card stack
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextCard();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextCard]);

  // Keyboard navigation when the section is in the viewport
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const section = document.getElementById("reviews");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevCard();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextCard();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevCard, nextCard]);

  return (
    <section
      id="reviews"
      className="relative py-28 w-full bg-pearl overflow-hidden select-none"
    >
      {/* Decorative ambient blurred blobs */}
      <div
        aria-hidden
        className="absolute top-1/3 -right-36 w-60 h-60 sm:w-[450px] sm:h-[450px] rounded-full bg-blush/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -left-32 w-56 h-56 sm:w-[420px] sm:h-[420px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* ─── Header: Heading split-text reveal ─── */}
        <div className="flex flex-col items-center text-center mb-14 md:mb-20">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">Reviews</SplitText>
          </span>
          <h2 className="font-heading text-5xl md:text-6xl xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Loved by our clients
            </SplitText>
          </h2>
        </div>

        {/* ─── Card Stack Container (Fans out from single pile upon entrance) ─── */}
        <motion.div
          onViewportEnter={() => setHasEnteredView(true)}
          viewport={{ once: true, amount: 0.2 }}
          className="relative max-w-[760px] mx-auto flex items-center justify-center px-3 xs:px-4 sm:px-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Button (Tablet & Desktop) */}
          <button
            onClick={prevCard}
            aria-label="Previous review"
            className={cn(
              "hidden sm:flex absolute -left-6 md:-left-12 lg:-left-14 z-40",
              "w-11 h-11 md:w-12 md:h-12 rounded-full min-h-[44px] min-w-[44px]",
              "glass items-center justify-center text-plum",
              "border border-white/70 dark:border-rose/30 shadow-md shadow-deep-rose/10",
              "hover:bg-white dark:hover:bg-surface-elevated hover:text-deep-rose hover:border-deep-rose/40 hover:scale-110",
              "active:scale-95 transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 cursor-pointer"
            )}
          >
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Card Deck Area (Adaptive height prevents text clipping on small phones) */}
          <div className="relative w-full max-w-[680px] h-[460px] xs:h-[410px] sm:h-[370px] md:h-[350px]">
            {REVIEWS.map((review, i) => {
              // Calculate offset from current activeIndex in circular loop
              const offset = (i - activeIndex + totalReviews) % totalReviews;
              const isFront = offset === 0;
              const isFirstPeek = offset === 1;
              const isSecondPeek = offset === 2;

              // Stack physics when fanned out:
              // Preserves desktop layout (1440px) exactly: y 0/18/36, scale 1/0.94/0.88, rotate 0/-3/3.
              // On phone/tablet, scales down offset and rotation so cards never poke out or overflow viewport.
              const targetY = isFront
                ? 0
                : screenCategory === "mobile"
                ? isFirstPeek
                  ? 10
                  : isSecondPeek
                  ? 20
                  : 28
                : screenCategory === "tablet"
                ? isFirstPeek
                  ? 14
                  : isSecondPeek
                  ? 28
                  : 36
                : isFirstPeek
                ? 18
                : isSecondPeek
                ? 36
                : 48;

              const targetScale = isFront
                ? 1
                : screenCategory === "mobile"
                ? isFirstPeek
                  ? 0.96
                  : isSecondPeek
                  ? 0.92
                  : 0.88
                : screenCategory === "tablet"
                ? isFirstPeek
                  ? 0.95
                  : isSecondPeek
                  ? 0.90
                  : 0.85
                : isFirstPeek
                ? 0.94
                : isSecondPeek
                ? 0.88
                : 0.82;

              const targetRotate = shouldReduce
                ? 0
                : isFront
                ? 0
                : screenCategory === "mobile"
                ? isFirstPeek
                  ? -1.2
                  : isSecondPeek
                  ? 1.2
                  : 0
                : screenCategory === "tablet"
                ? isFirstPeek
                  ? -2
                  : isSecondPeek
                  ? 2
                  : 0
                : isFirstPeek
                ? -3
                : isSecondPeek
                ? 3
                : 0;

              // Before entering view, pile cards tight; once entered, fan out with spring physics
              const yOffset = hasEnteredView ? targetY : 0;
              const scale = hasEnteredView ? targetScale : 0.92;
              const rotate = hasEnteredView ? targetRotate : 0;
              const opacity = hasEnteredView
                ? isFront
                  ? 1
                  : isFirstPeek
                  ? 0.88
                  : isSecondPeek
                  ? 0.65
                  : 0
                : isFront
                ? 1
                : 0;
              const zIndex = isFront ? 30 : isFirstPeek ? 20 : isSecondPeek ? 10 : 5;

              return (
                <motion.div
                  key={review.id}
                  animate={{
                    y: yOffset,
                    scale,
                    rotate,
                    opacity,
                    zIndex,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 24,
                    mass: 0.8,
                  }}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.65}
                  onDragStart={() => {
                    isDragging.current = true;
                  }}
                  onDragEnd={(_, { offset: dragOffset, velocity }) => {
                    setTimeout(() => {
                      isDragging.current = false;
                    }, 50);
                    if (dragOffset.x > 80 || velocity.x > 300) {
                      nextCard();
                    } else if (dragOffset.x < -80 || velocity.x < -300) {
                      prevCard();
                    }
                  }}
                  onClick={() => {
                    if (isFront && !isDragging.current) {
                      nextCard();
                    }
                  }}
                  className={cn(
                    "absolute inset-x-0 top-0 will-change-transform",
                    isFront
                      ? "cursor-grab active:cursor-grabbing pointer-events-auto"
                      : "pointer-events-none"
                  )}
                  style={{
                    transformOrigin: "bottom center",
                  }}
                >
                  <ReviewCard
                    review={review}
                    isFront={isFront}
                    isFirstPeek={isFirstPeek}
                    isSecondPeek={isSecondPeek}
                    shouldReduce={shouldReduce}
                    activeIndex={activeIndex}
                    hasEnteredView={hasEnteredView}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Right Arrow Button (Tablet & Desktop) */}
          <button
            onClick={nextCard}
            aria-label="Next review"
            className={cn(
              "hidden sm:flex absolute -right-6 md:-right-12 lg:-right-14 z-40",
              "w-11 h-11 md:w-12 md:h-12 rounded-full min-h-[44px] min-w-[44px]",
              "glass items-center justify-center text-plum",
              "border border-white/70 dark:border-rose/30 shadow-md shadow-deep-rose/10",
              "hover:bg-white dark:hover:bg-surface-elevated hover:text-deep-rose hover:border-deep-rose/40 hover:scale-110",
              "active:scale-95 transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 cursor-pointer"
            )}
          >
            <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>

        {/* ─── Controls & Pagination (Mobile includes arrows, desktop has centered dots) ─── */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12">
          {/* Mobile Prev Button */}
          <button
            onClick={prevCard}
            aria-label="Previous review"
            className="sm:hidden w-11 h-11 min-h-[44px] min-w-[44px] rounded-full glass border border-blush/60 dark:border-rose/30 flex items-center justify-center text-plum active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1 sm:gap-2">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToCard(i)}
                aria-label={`Go to review ${i + 1}`}
                className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 cursor-pointer"
              >
                <span
                  className={cn(
                    "block rounded-full border-2 transition-all duration-300",
                    i === activeIndex
                      ? "w-3.5 h-3.5 border-deep-rose bg-deep-rose scale-110 shadow-sm shadow-deep-rose/40"
                      : "w-2.5 h-2.5 border-blush dark:border-rose/40 bg-transparent hover:border-deep-rose/60 hover:bg-blush/30"
                  )}
                />
              </button>
            ))}
          </div>

          {/* Mobile Next Button */}
          <button
            onClick={nextCard}
            aria-label="Next review"
            className="sm:hidden w-11 h-11 min-h-[44px] min-w-[44px] rounded-full glass border border-blush/60 dark:border-rose/30 flex items-center justify-center text-plum active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Individual Card Design ───────────────────────────────────────────────────
interface ReviewCardProps {
  review: ReviewItem;
  isFront: boolean;
  isFirstPeek: boolean;
  isSecondPeek: boolean;
  shouldReduce: boolean | null;
  activeIndex: number;
  hasEnteredView: boolean;
}

function ReviewCard({
  review,
  isFront,
  isFirstPeek,
  shouldReduce,
  activeIndex,
  hasEnteredView,
}: ReviewCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full">
      {/* 1. Soft blush-to-rose offset shape sitting behind the card (shifted down-right) */}
      <div
        aria-hidden
        className={cn(
          "absolute -inset-1 translate-x-1.5 translate-y-1.5 sm:translate-x-3 sm:translate-y-3 md:translate-x-3.5 md:translate-y-3.5 rounded-[28px] xs:rounded-[32px] sm:rounded-[40px] rounded-tr-[16px] -z-10 blur-[1px]",
          isFront
            ? "bg-gradient-to-br from-blush/70 via-rose/45 to-deep-rose/35 opacity-90"
            : isFirstPeek
            ? "bg-gradient-to-br from-blush/50 to-rose/30 opacity-60"
            : "bg-rose/20 opacity-40"
        )}
      />

      {/* 2. Main Card Body (organic asymmetrical border radius, white background) */}
      <div
        className={cn(
          "relative w-full",
          "rounded-[28px] xs:rounded-[32px] sm:rounded-[40px] rounded-tr-[16px]",
          isFront
            ? "bg-white dark:bg-surface-elevated"
            : isFirstPeek
            ? "bg-gradient-to-br from-white via-white to-[#FDE8EF] dark:from-surface-elevated dark:via-surface-elevated dark:to-[#2A1A25]"
            : "bg-gradient-to-br from-white via-white to-[#F9DCE5] dark:from-surface-elevated dark:via-surface-elevated dark:to-[#2F1C29]",
          "shadow-[0_16px_45px_rgba(184,74,110,0.13),0_4px_16px_rgba(249,198,212,0.25)] dark:shadow-[0_0_24px_rgba(243,166,189,0.08)]",
          "border border-blush/35 dark:border-rose/20",
          "pt-5 xs:pt-6 sm:pt-8 pb-5 xs:pb-6 sm:pb-8 px-3.5 xs:px-5 sm:px-10"
        )}
      >
        {/* Overlapping Round Nail-Result Photo (scales in with a tiny rotation on entrance) */}
        <motion.div
          initial={
            shouldReduce
              ? {}
              : {
                  scale: 0.65,
                  rotate: -8,
                  opacity: 0,
                }
          }
          animate={
            shouldReduce
              ? {}
              : {
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                  y: isFront ? [0, -5, 0] : 0,
                }
          }
          transition={{
            scale: { type: "spring", stiffness: 320, damping: 20, delay: 0.2 },
            rotate: { type: "spring", stiffness: 320, damping: 20, delay: 0.2 },
            opacity: { duration: 0.4, delay: 0.15 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className={cn(
            "absolute -top-7 xs:-top-9 sm:-top-11 md:-top-13 left-2.5 xs:left-4 sm:left-9 z-20 will-change-transform",
            "w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full",
            "ring-3 sm:ring-4 ring-white dark:ring-surface-elevated shadow-lg overflow-visible",
            "flex items-center justify-center bg-pearl"
          )}
        >
          {/* Circular photo container */}
          <div
            className={cn(
              "relative w-full h-full rounded-full overflow-hidden flex items-center justify-center",
              "bg-gradient-to-br",
              review.gradient
            )}
          >
            {review.image && !imgError ? (
              <Image
                src={review.image}
                alt={`${review.name}'s nail manicure`}
                fill
                sizes="(max-width: 480px) 64px, (max-width: 640px) 80px, 112px"
                onError={() => setImgError(true)}
                className="object-cover rounded-full"
              />
            ) : (
              // Gradient initials placeholder fallback
              <div className="flex flex-col items-center justify-center text-center p-2">
                <span className="font-body font-bold text-pearl text-sm sm:text-lg tracking-wider drop-shadow-sm">
                  {review.initials}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-body tracking-wider text-pearl/80">
                  Nails
                </span>
              </div>
            )}
          </div>

          {/* Tiny glass badge on the photo corner: camera icon suggesting "photo sent by client" */}
          <div
            aria-label="Photo sent by client"
            title="Photo sent by client"
            className={cn(
              "absolute bottom-0 right-0 z-30",
              "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full",
              "glass border border-white/90 dark:border-rose/30 shadow-sm",
              "flex items-center justify-center text-deep-rose"
            )}
          >
            <Camera size={12} className="text-deep-rose drop-shadow-xs" />
          </div>
        </motion.div>

        {/* Top Header Row: Client Info + Decorative Quote Mark (pops in with spring) */}
        <div className="flex items-start justify-between gap-2 sm:gap-4 pl-18 xs:pl-22 sm:pl-28 md:pl-32 min-h-[46px] xs:min-h-[52px] sm:min-h-[66px]">
          <div className="flex flex-col justify-center">
            {/* Client name: first name + initial */}
            <h3 className="font-body font-semibold text-sm xs:text-base sm:text-xl text-plum leading-snug">
              {review.name}
            </h3>
            {/* Service subtitle */}
            <span className="font-body text-[10px] xs:text-[11px] sm:text-sm font-medium tracking-wide uppercase text-deep-rose/85">
              {review.service}
            </span>
          </div>

          {/* Big decorative quote mark in deep rose (pops in upon entrance) */}
          <motion.span
            aria-hidden
            initial={shouldReduce ? {} : { scale: 0, opacity: 0 }}
            animate={
              shouldReduce
                ? {}
                : hasEnteredView
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 18,
              delay: 0.25,
            }}
            className="font-heading text-3xl sm:text-6xl font-bold text-deep-rose/30 leading-none select-none -mt-1 sm:-mt-2 will-change-transform"
          >
            “
          </motion.span>
        </div>

        {/* Review text in Cormorant Garamond italic (fluid font size) */}
        <p className="font-heading italic text-[clamp(0.95rem,2.8vw,1.45rem)] md:text-2xl text-plum/90 leading-relaxed my-2.5 xs:my-3 sm:my-5 font-normal">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* 5 gold/rose stars that pop in one by one with a small sparkle spring */}
        <div
          className="flex items-center gap-1.5 pt-1"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <motion.div
              key={`${activeIndex}-${starIndex}`}
              initial={
                shouldReduce
                  ? {}
                  : { scale: 0, opacity: 0, rotate: -25 }
              }
              animate={
                shouldReduce
                  ? {}
                  : hasEnteredView
                  ? { scale: 1, opacity: 1, rotate: 0 }
                  : { scale: 0, opacity: 0 }
              }
              transition={{
                delay: shouldReduce
                  ? 0
                  : 0.35 + starIndex * 0.08,
                type: "spring",
                stiffness: 440,
                damping: 16,
              }}
              className="relative text-[#E88AA6] will-change-transform"
            >
              <Star
                size={18}
                className="fill-[#E88AA6] stroke-[#B84A6E] stroke-1 drop-shadow-[0_1px_4px_rgba(232,138,166,0.35)]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
