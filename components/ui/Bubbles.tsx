"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, MotionValue } from "framer-motion";

interface BubbleConfig {
  id: number;
  size: number;
  top: string;
  left: string;
  opacity: number;
  delay: number;
  duration: number;
  px: number; // parallax x multiplier (signed, small)
  py: number; // parallax y multiplier (signed, small)
}

const BUBBLES: BubbleConfig[] = [
  { id: 1, size: 180, top: "10%", left: "55%", opacity: 0.52, delay: 0,   duration: 7,  px:  0.025, py:  0.02  },
  { id: 2, size: 90,  top: "30%", left: "88%", opacity: 0.42, delay: 1,   duration: 9,  px: -0.04,  py:  0.03  },
  { id: 3, size: 60,  top: "65%", left: "92%", opacity: 0.50, delay: 2,   duration: 6,  px:  0.06,  py: -0.05  },
  { id: 4, size: 130, top: "78%", left: "60%", opacity: 0.38, delay: 0.5, duration: 11, px: -0.02,  py:  0.025 },
  { id: 5, size: 50,  top: "15%", left: "80%", opacity: 0.58, delay: 3,   duration: 8,  px:  0.07,  py: -0.06  },
  { id: 6, size: 100, top: "48%", left: "95%", opacity: 0.33, delay: 1.5, duration: 10, px: -0.03,  py:  0.04  },
  { id: 7, size: 70,  top: "5%",  left: "70%", opacity: 0.48, delay: 2.5, duration: 7,  px:  0.05,  py:  0.03  },
];

/**
 * Glass bubbles that float and react to mouse parallax.
 * Rendered as a sibling overlay inside the Hero's right column area.
 */
export default function Bubbles() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw mouse offset from centre of container (px)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the raw values once; each bubble will scale these
  const smoothX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 55, damping: 22 });

  const [prefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    if (prefersReduced) return;

    function onMove(e: MouseEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [prefersReduced, mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    >
      {BUBBLES.map((b) => (
        <Bubble
          key={b.id}
          config={b}
          smoothX={smoothX}
          smoothY={smoothY}
          prefersReduced={prefersReduced}
        />
      ))}
    </div>
  );
}

// ─── Individual bubble ────────────────────────────────────────────────────────
function Bubble({
  config,
  smoothX,
  smoothY,
  prefersReduced,
}: {
  config: BubbleConfig;
  smoothX: MotionValue<number>;
  smoothY: MotionValue<number>;
  prefersReduced: boolean;
}) {
  // Derive per-bubble motion values by scaling the shared smooth values
  const bx = useSpring(0, { stiffness: 60, damping: 20 });
  const by = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (prefersReduced) return;
    const unsubX = smoothX.on("change", (v) => bx.set(v * config.px));
    const unsubY = smoothY.on("change", (v) => by.set(v * config.py));
    return () => { unsubX(); unsubY(); };
  }, [smoothX, smoothY, bx, by, config.px, config.py, prefersReduced]);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width:  config.size,
        height: config.size,
        top:    config.top,
        left:   config.left,
        x:      bx,
        y:      by,
        opacity: config.opacity,
        background:
          "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.72), rgba(249,198,212,0.28))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.65)",
        boxShadow: "0 4px 24px rgba(184,74,110,0.08)",
      }}
      animate={prefersReduced ? {} : { y: ["0px", "-18px", "0px"] }}
      transition={
        prefersReduced
          ? {}
          : {
              duration: config.duration,
              delay:    config.delay,
              repeat:   Infinity,
              ease:     "easeInOut",
            }
      }
    />
  );
}
