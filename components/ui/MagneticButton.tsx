"use client";

import { useRef, useState, useEffect, ReactNode, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  "aria-label"?: string;
}

/**
 * A button whose content follows the cursor with a magnetic pull effect.
 * On touch devices or when prefers-reduced-motion is active, magnetic translation is disabled.
 */
export default function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.4,
  "aria-label": ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const shouldReduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
  }, []);

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    if (isTouchDevice || shouldReduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  const useMagnetic = !isTouchDevice && !shouldReduce;

  return (
    <motion.button
      ref={ref}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        if (!isTouchDevice) setIsHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
      onTapStart={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.96 }}
      style={useMagnetic ? { x: springX, y: springY } : {}}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        "bg-deep-rose text-pearl",
        "font-body text-xs sm:text-sm font-medium tracking-widest uppercase",
        "px-7 sm:px-10 py-3.5 sm:py-4 rounded-full min-h-[48px] min-w-[44px]",
        "shadow-lg shadow-deep-rose/30",
        "transition-shadow duration-300 select-none",
        isHovered && "shadow-xl shadow-deep-rose/40",
        className
      )}
    >
      {/* Glow ring */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full ring-0 ring-deep-rose/40 transition-all duration-300",
          isHovered && "ring-4"
        )}
      />
      {children}
    </motion.button>
  );
}
