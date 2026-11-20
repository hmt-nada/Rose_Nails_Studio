"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import NavLink from "@/components/ui/NavLink";
import { GOOGLE_MAPS_URL, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";

const NAV_LINKS = [
  { href: "#hero",         label: "Home"         },
  { href: "#work",         label: "Our Work"     },
  { href: "#reviews",      label: "Reviews"      },
  { href: "#services",     label: "Our Services" },
  { href: "#how-it-works", label: "How It Works" },
] as const;

type SectionId = typeof NAV_LINKS[number]["href"];

/** Smooth-scroll helper used by multiple buttons */
function scrollTo(hash: string) {
  scrollToSection(hash);
}

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [activeLink, setActiveLink]  = useState<SectionId>("#hero");
  const observerRef                  = useRef<IntersectionObserver | null>(null);

  /* ── Scroll → glass bar ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active link via IntersectionObserver ── */
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveLink(`#${visible.target.id}` as SectionId);
        }
      },
      { threshold: [0.3, 0.5] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        "transition-all duration-500 ease-in-out",
        scrolled
          ? [
              "glass",
              "border-b border-white/40",
              "py-3 shadow-sm shadow-deep-rose/5",
            ]
          : "py-5 bg-transparent border-b border-transparent"
      )}
    >
      <nav
        className="max-w-[1440px] mx-auto px-8 flex items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <button
          onClick={() => scrollTo("#hero")}
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 rounded-sm cursor-pointer"
          aria-label="Scroll to top"
        >
          {/* Official logo with transparent background */}
          <img
            src="/imag/logo/logo.png"
            alt="Rosé Nails Studio logo"
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-heading text-xl font-semibold tracking-wide text-plum group-hover:text-deep-rose transition-colors duration-300">
            {SITE_NAME}
          </span>
        </button>

        {/* ── Center links ── */}
        <div className="flex items-center gap-8 relative">
          {NAV_LINKS.map((link) => {
            const isActive = activeLink === link.href;
            return (
              <div key={link.href} className="relative">
                {/* Sliding pill background for active link */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-x-0 -inset-y-1 rounded-full bg-blush/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative z-10 px-3 py-1">
                  <NavLink
                    href={link.href}
                    label={link.label}
                    isActive={isActive}
                    onClick={() => setActiveLink(link.href)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right: Book Now + Location ── */}
        <div className="flex items-center gap-3">
          {/* Book Now pill */}
          <BookNowButton />

          {/* Location ghost button */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open studio location in Google Maps"
            className={cn(
              "group flex items-center gap-1.5",
              "glass rounded-full px-4 py-2",
              "font-body text-xs font-medium tracking-wide text-plum/70",
              "border border-blush/50",
              "hover:border-deep-rose/50 hover:text-deep-rose",
              "transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60"
            )}
          >
            <MapPin
              size={13}
              className="transition-transform duration-300 group-hover:scale-110"
              aria-hidden
            />
            <span>Location</span>
          </a>
        </div>
      </nav>
    </motion.header>
  );
}

/* ── Reusable Book Now button with shine effect ── */
function BookNowButton() {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => scrollTo("#book")}
      className={cn(
        "relative overflow-hidden",
        "bg-deep-rose text-pearl",
        "font-body text-xs font-semibold tracking-widest uppercase",
        "px-6 py-2.5 rounded-full",
        "shadow-md shadow-deep-rose/30",
        "transition-shadow duration-300",
        "hover:shadow-lg hover:shadow-deep-rose/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60",
        "group"
      )}
    >
      {/* Shine sweep */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-gradient-to-r from-transparent via-white/25 to-transparent",
          "group-hover:translate-x-full",
          "transition-transform duration-700 ease-in-out"
        )}
      />
      <span className="relative">Book Now</span>
    </motion.button>
  );
}
