"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function CustomCursor() {
  const shouldReduce = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Mouse coordinate motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for the outer follower ring
  const ringX = useSpring(mouseX, { stiffness: 220, damping: 22, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 220, damping: 22, mass: 0.6 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    const media = window.matchMedia("(pointer: fine) and (hover: hover)");
    setIsDesktop(media.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    media.addEventListener("change", handleMediaChange);

    return () => media.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (!isDesktop || shouldReduce) return;

    function handleMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, [role="button"], input, textarea, select, label, [data-cursor-hover], [data-carousel-card], .cursor-pointer'
        );
        setIsHovered(Boolean(interactive));
      }
    }

    function handleMouseLeave() {
      setIsVisible(false);
      setIsHovered(false);
    }

    function handleMouseEnter() {
      setIsVisible(true);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isDesktop, shouldReduce, isVisible, mouseX, mouseY]);

  if (!isDesktop || shouldReduce || !isVisible) return null;

  return (
    <>
      {/* ── Outer Follower Ring ── */}
      <motion.div
        aria-hidden
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 56 : 32,
          height: isHovered ? 56 : 32,
          scale: isHovered ? 1.15 : 1,
          borderColor: isHovered ? "rgba(184, 74, 110, 0.85)" : "rgba(232, 138, 166, 0.65)",
          backgroundColor: isHovered ? "rgba(232, 138, 166, 0.22)" : "rgba(249, 198, 212, 0.15)",
          boxShadow: isHovered
            ? "0 0 28px rgba(232, 138, 166, 0.65), inset 0 0 12px rgba(232, 138, 166, 0.3)"
            : "0 0 12px rgba(249, 198, 212, 0.3)",
        }}
        transition={{
          duration: 0.22,
          ease: "easeOut",
        }}
        className="fixed top-0 left-0 rounded-full border pointer-events-none z-[9998] will-change-transform backdrop-blur-[0.5px]"
      />

      {/* ── Inner Rose Dot ── */}
      <motion.div
        aria-hidden
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 0.6 : 1,
          backgroundColor: isHovered ? "#B84A6E" : "#B84A6E",
        }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] will-change-transform shadow-[0_0_8px_rgba(184,74,110,0.5)]"
      />
    </>
  );
}
