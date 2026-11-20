"use client";

/**
 * Universal smooth scroll helper that delegates to Lenis when available,
 * or falls back to native element.scrollIntoView.
 */
export function scrollToSection(target: string | HTMLElement, offset: number = 0) {
  if (typeof window === "undefined") return;

  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: string | HTMLElement, opts?: object) => void } }).__lenis;

  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}
