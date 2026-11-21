"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WORK_ITEMS, type WorkItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import SplitText from "@/components/ui/animations/SplitText";
import Parallax from "@/components/ui/animations/Parallax";

export default function Gallery() {
  const shouldReduce = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
    skipSnaps: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ─── Smooth Tween Scale & Opacity based on distance from center slide ─────
  const tweenScale = useCallback(
    (api: EmblaCarouselType) => {
      if (shouldReduce) {
        api.slideNodes().forEach((slideNode) => {
          const card = slideNode.querySelector<HTMLElement>("[data-carousel-card]");
          if (card) {
            card.style.transform = "scale(1)";
            card.style.opacity = "1";
          }
        });
        return;
      }

      const engine = api.internalEngine();
      const scrollProgress = api.scrollProgress();
      const snaps = api.scrollSnapList();

      snaps.forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          // Distance measured in number of slides (0 = centered, 1 = adjacent)
          const slideDistance = Math.abs(diffToTarget * snaps.length);
          // Normalized factor from 1 (center) down to 0 (side cards)
          const factor = Math.max(0, 1 - Math.min(slideDistance, 1.25));

          // Center: scale ~ 1.1, opacity 1.0; Sides: scale ~ 0.9, opacity 0.55
          const scale = 0.9 + factor * 0.2;
          const opacity = 0.55 + factor * 0.45;

          const slideNode = api.slideNodes()[slideIndex];
          const cardNode = slideNode?.querySelector<HTMLElement>("[data-carousel-card]");
          if (cardNode) {
            cardNode.style.transform = `scale(${scale.toFixed(3)})`;
            cardNode.style.opacity = `${opacity.toFixed(3)}`;
            cardNode.style.zIndex = factor > 0.5 ? "10" : "1";
          }
        });
      });
    },
    [shouldReduce]
  );

  // Sync scroll listeners
  useEffect(() => {
    if (!emblaApi) return;

    tweenScale(emblaApi);
    emblaApi.on("scroll", tweenScale);
    emblaApi.on("reInit", tweenScale);

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("scroll", tweenScale);
      emblaApi.off("reInit", tweenScale);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, tweenScale]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!emblaApi) return;
      const section = document.getElementById("work");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      id="work"
      className="relative py-28 w-full bg-[var(--divider-wave-bg)] overflow-hidden select-none"
    >
      {/* ─── Ambient background blur blobs with Parallax ─── */}
      <div
        aria-hidden
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blush/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-10 -right-28 w-96 h-96 rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      {/* ─── Parallax Pinkish Blob Behind Carousel ─── */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      >
        <Parallax speed={0.4}>
          <div className="w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-rose/20 via-blush/25 to-transparent blur-3xl" />
        </Parallax>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        {/* ─── Header: Reveal line by line with masked slide-up (SplitText) ─── */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">Our Work</SplitText>
          </span>
          <h2 className="font-heading text-5xl md:text-6xl xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Designs we love
            </SplitText>
          </h2>
          <p className="font-body text-base md:text-lg font-light text-plum/65 max-w-md">
            <SplitText by="word" stagger={0.03} delay={0.25}>
              Every set is made to match your style.
            </SplitText>
          </p>
        </div>

        {/* ─── Carousel Wrapper with Side Arrows ─── */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative w-full flex items-center justify-center">
            {/* Left Arrow Button (Desktop / Tablet overlaid) */}
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous work slide"
              className={cn(
                "hidden sm:flex absolute left-2 sm:left-4 md:left-6 lg:left-8 z-30",
                "w-11 h-11 md:w-14 md:h-14 rounded-full min-h-[44px] min-w-[44px]",
                "glass items-center justify-center text-plum",
                "border border-white/70 dark:border-rose/30 shadow-md shadow-deep-rose/10",
                "hover:bg-white dark:hover:bg-surface-elevated hover:border-deep-rose/40 hover:text-deep-rose hover:scale-110",
                "active:scale-95 transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60",
                "disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              )}
            >
              <ChevronLeft size={22} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* Embla Viewport showing 1 card with peeks on phone, partial neighbors on tablet, 3 on desktop */}
            <div
              ref={emblaRef}
              className="overflow-hidden w-full max-w-[1100px] py-6 sm:py-10 md:py-12"
              tabIndex={0}
              aria-label="Designs we love carousel, swipe or use arrow keys to navigate"
            >
              <div className="flex touch-pan-y">
                {WORK_ITEMS.map((item, index) => {
                  const isCenter = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      className="min-w-0 flex-[0_0_80%] xs:flex-[0_0_75%] sm:flex-[0_0_48%] md:flex-[0_0_42%] lg:flex-[0_0_33.333%] px-2 sm:px-3 flex justify-center items-center"
                    >
                      {/* Cards fly in from below with a stagger, slightly rotated and blurred, settling into place */}
                      <motion.div
                        initial={
                          shouldReduce
                            ? {}
                            : {
                                opacity: 0,
                                y: 75,
                                rotate: index % 2 === 0 ? -3.5 : 3.5,
                                filter: "blur(6px)",
                              }
                        }
                        whileInView={
                          shouldReduce
                            ? {}
                            : {
                                opacity: 1,
                                y: 0,
                                rotate: 0,
                                filter: "blur(0px)",
                              }
                        }
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{
                          duration: 0.85,
                          // Centered card lands last with spring bounce
                          delay:
                            index === 0
                              ? 0.12
                              : index === 2
                              ? 0.22
                              : index === 1
                              ? 0.38
                              : 0.45,
                          type: "spring",
                          stiffness: 75,
                          damping: index === 1 ? 12 : 16,
                        }}
                        className="w-full flex justify-center items-center will-change-transform"
                      >
                        <WorkCard
                          item={item}
                          index={index}
                          isActive={isCenter}
                          onCardClick={() => emblaApi?.scrollTo(index)}
                        />
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Arrow Button (Desktop / Tablet overlaid) */}
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next work slide"
              className={cn(
                "hidden sm:flex absolute right-2 sm:right-4 md:right-6 lg:right-8 z-30",
                "w-11 h-11 md:w-14 md:h-14 rounded-full min-h-[44px] min-w-[44px]",
                "glass items-center justify-center text-plum",
                "border border-white/70 dark:border-rose/30 shadow-md shadow-deep-rose/10",
                "hover:bg-white dark:hover:bg-surface-elevated hover:border-deep-rose/40 hover:text-deep-rose hover:scale-110",
                "active:scale-95 transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60",
                "disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              )}
            >
              <ChevronRight size={22} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* ── Mobile-Only Controls Bar (Below carousel on screens < 640px) ── */}
          <div className="flex sm:hidden items-center justify-center gap-4 mt-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous slide"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full glass border border-blush/60 dark:border-rose/30 flex items-center justify-center text-plum active:scale-95 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-heading text-xs tracking-widest uppercase text-deep-rose/85 px-3 select-none">
              {String(selectedIndex + 1).padStart(2, "0")} / {String(WORK_ITEMS.length).padStart(2, "0")}
            </span>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next slide"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full glass border border-blush/60 dark:border-rose/30 flex items-center justify-center text-plum active:scale-95 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Individual Capsule Card Component ─────────────────────────────────────────
interface WorkCardProps {
  item: WorkItem;
  index: number;
  isActive: boolean;
  onCardClick: () => void;
}

function WorkCard({ item, isActive, onCardClick }: WorkCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-carousel-card
      onClick={onCardClick}
      className={cn(
        "group relative flex flex-col items-center",
        // Fluid width scaling from mobile (240px) to desktop (305px)
        "w-[240px] xs:w-[260px] sm:w-[285px] md:w-[305px]",
        // Fully rounded capsule / pill shape top and bottom
        "rounded-[9999px] bg-white dark:bg-surface-elevated",
        "border border-blush/40 dark:border-rose/20",
        "cursor-pointer select-none",
        "pt-4 sm:pt-6 pb-6 sm:pb-8 px-3.5 sm:px-4",
        "transition-all duration-500",
        // Active (center) card gets a gentle breathing glow pulse
        isActive
          ? "shadow-[0_16px_45px_rgba(232,138,166,0.38),0_4px_20px_rgba(184,74,110,0.16)] dark:shadow-[0_0_35px_rgba(243,166,189,0.3)] ring-2 ring-rose/35"
          : "shadow-[0_12px_40px_rgba(184,74,110,0.12),0_4px_16px_rgba(249,198,212,0.3)] dark:shadow-[0_0_24px_rgba(243,166,189,0.1)] hover:-translate-y-2 hover:shadow-[0_20px_55px_rgba(184,74,110,0.22)] dark:hover:shadow-[0_0_30px_rgba(243,166,189,0.25)]"
      )}
      style={{
        transition:
          "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-out, box-shadow 0.4s ease",
        transformOrigin: "center center",
      }}
    >
      {/* 1. Round photo: large relative to card (~84% width) */}
      <div className="relative w-[84%] aspect-square rounded-full overflow-hidden p-1.5 bg-gradient-to-br from-blush/50 via-white to-rose/30 dark:from-rose/30 dark:via-surface dark:to-blush/40 shadow-inner">
        <div className="relative w-full h-full rounded-full overflow-hidden bg-pearl">
          {!imgError ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 210px, (max-width: 1024px) 250px, 280px"
              onError={() => setImgError(true)}
              className="object-cover rounded-full group-hover:scale-108 transition-transform duration-500 ease-out"
            />
          ) : (
            // Elegant pink gradient placeholder when image is absent
            <div
              className={cn(
                "w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden",
                "bg-gradient-to-br",
                item.gradient
              )}
            >
              {/* Glossy curved top shine reflection */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none opacity-45"
                style={{
                  background:
                    "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.9) 0%, transparent 60%)",
                }}
              />
              <span className="text-pearl/90 text-2xl drop-shadow-[0_2px_8px_rgba(58,31,43,0.25)] group-hover:scale-115 transition-transform duration-500">
                ✦
              </span>
              <span className="font-heading text-xs italic tracking-wider text-pearl/90 mt-1">
                Rosé
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Model name: 20-24px under photo, bold, uppercase, wide letter-spacing, plum */}
      <div className="mt-5 sm:mt-6 px-3 flex flex-col items-center">
        <span className="font-body text-base sm:text-lg md:text-xl font-semibold tracking-[0.2em] uppercase text-plum group-hover:text-deep-rose transition-colors duration-300 text-center leading-tight">
          {item.name}
        </span>
      </div>
    </div>
  );
}
