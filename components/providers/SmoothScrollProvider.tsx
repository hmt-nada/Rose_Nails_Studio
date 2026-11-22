"use client";

import { useEffect, useState, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import CustomCursor from "@/components/ui/CustomCursor";
import PageIntro from "@/components/ui/PageIntro";
import { useIntro } from "@/components/providers/IntroProvider";

// Register GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const { isDone } = useIntro();

  const refreshScrollTrigger = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    if (isDone) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [isDone]);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches);

    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    // 1. On touch devices: keep native scrolling (no Lenis smoothing on touch)
    if (!isTouch) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.8,
      });

      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

      // 2. Connect Lenis to GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    } else {
      // Touch device: use native window scrolling with ScrollTrigger
      window.addEventListener("scroll", ScrollTrigger.update, { passive: true });
    }

    // 3. Call ScrollTrigger.refresh() after fonts, images, and hero video load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshScrollTrigger).catch(() => {});
    }

    if (document.readyState === "complete") {
      refreshScrollTrigger();
    } else {
      window.addEventListener("load", refreshScrollTrigger, { once: true });
    }

    // Hero video loaded trigger
    const video = document.querySelector("video");
    if (video) {
      video.addEventListener("loadeddata", refreshScrollTrigger, { once: true });
      video.addEventListener("canplay", refreshScrollTrigger, { once: true });
    }

    // Check images
    const images = Array.from(document.images);
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", refreshScrollTrigger, { once: true });
      }
    });

    // Staggered initial refreshes to catch dynamic layout adjustments
    const t1 = setTimeout(refreshScrollTrigger, 400);
    const t2 = setTimeout(refreshScrollTrigger, 1200);
    const t3 = setTimeout(refreshScrollTrigger, 2200);

    // 4. Safety net: If any animated element is still hidden 3 seconds after its section is in view, force it visible
    const sections = document.querySelectorAll("section, footer, main");
    const sectionTimers = new Map<Element, ReturnType<typeof setTimeout>>();

    const safetyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !sectionTimers.has(entry.target)) {
            const timer = setTimeout(() => {
              const sec = entry.target as HTMLElement;
              const targets = sec.querySelectorAll<HTMLElement>(
                '[data-split-text], [data-reveal], [style*="opacity: 0"], [style*="opacity:0"]'
              );
              targets.forEach((el) => {
                const computed = window.getComputedStyle(el);
                if (computed.opacity === "0") {
                  el.style.opacity = "1";
                  el.style.transform = "none";
                  el.style.filter = "none";
                  el.style.clipPath = "none";
                }
              });
            }, 3000);
            sectionTimers.set(entry.target, timer);
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((sec) => safetyObserver.observe(sec));

    // 5. Intercept internal anchor clicks for smooth gliding (uses Lenis on desktop, smooth scrollIntoView on touch)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href === "#") return;

      const element = document.querySelector(href);
      if (element) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(href, {
            offset: 0,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("load", refreshScrollTrigger);
      window.removeEventListener("scroll", ScrollTrigger.update);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      sectionTimers.forEach((timer) => clearTimeout(timer));
      safetyObserver.disconnect();
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [refreshScrollTrigger]);

  return (
    <>
      {/* ── Page Load Liquid Intro ── */}
      <PageIntro />

      {/* ── Top Scroll Progress Bar (only after intro) ── */}
      {isDone && <ScrollProgressBar />}

      {/* ── Custom Luxury Cursor (Desktop only, only after intro) ── */}
      {isDone && <CustomCursor />}

      {/* ── Main Site Content ── */}
      <div data-intro-ready={isDone ? "true" : "false"}>{children}</div>
    </>
  );
}
