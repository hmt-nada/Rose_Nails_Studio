"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import NavLink from "@/components/ui/NavLink";
import { GOOGLE_MAPS_URL, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";

const NAV_LINKS = [
  { href: "#hero", label: "Home" },
  { href: "#work", label: "Our Work" },
  { href: "#reviews", label: "Reviews" },
  { href: "#services", label: "Our Services" },
  { href: "#how-it-works", label: "How It Works" },
] as const;

type SectionId = typeof NAV_LINKS[number]["href"];

/** Smooth-scroll helper used by multiple buttons */
function scrollTo(hash: string) {
  scrollToSection(hash);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState<SectionId>("#hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Scroll → glass bar ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active link via IntersectionObserver ── */
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href.replace("#", ""));
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveLink(`#${visible.target.id}` as SectionId);
        }
      },
      { threshold: [0.2, 0.5] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  /* ── Lock body scroll when mobile menu is open ── */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMenuOpen]);

  /* ── Close menu on Escape key press ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ── Close mobile menu on desktop resize ── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  const handleMobileNavClick = (href: string) => {
    setIsMenuOpen(false);
    // Allow sheet close transition to begin before scrolling
    setTimeout(() => {
      scrollTo(href);
    }, 150);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "transition-all duration-500 ease-in-out",
          "pt-[env(safe-area-inset-top,0px)]",
          scrolled
            ? [
              "glass",
              "border-b border-white/40",
              "py-2.5 sm:py-3 shadow-sm shadow-deep-rose/5",
            ]
            : "py-3.5 sm:py-5 bg-transparent border-b border-transparent"
        )}
      >
        <nav
          className="max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60 rounded-full min-h-[44px] cursor-pointer"
            aria-label="Scroll to top"
          >
            <div className="relative h-8 sm:h-9 w-8 sm:w-9 flex-shrink-0">
              <Image
                src="/imag/logo/logo.png"
                alt="Rosé Nails Studio logo"
                width={36}
                height={36}
                priority
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-heading text-lg sm:text-xl font-semibold tracking-wide text-plum group-hover:text-deep-rose transition-colors duration-300 whitespace-nowrap">
              {SITE_NAME}
            </span>
          </button>

          {/* ── Desktop Center links (Hidden below 1024px) ── */}
          <div className="hidden lg:flex items-center gap-8 relative">
            {NAV_LINKS.map((link) => {
              const isActive = activeLink === link.href;
              return (
                <div key={link.href} className="relative">
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

          {/* ── Desktop Right: Book Now + Location (Hidden below 1024px) ── */}
          <div className="hidden lg:flex items-center gap-3">
            <BookNowButton />

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open studio location in Google Maps"
              className={cn(
                "group flex items-center gap-1.5",
                "glass rounded-full px-4 py-2 min-h-[44px]",
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

          {/* ── Mobile / Tablet Hamburger Button (Visible below 1024px) ── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-11 h-11 rounded-full glass border border-blush/60 flex flex-col items-center justify-center gap-1 text-plum focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose cursor-pointer z-50 min-h-[44px] min-w-[44px]"
              aria-label={isMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
            >
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-5 h-0.5 bg-plum rounded-full origin-center"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-0.5 bg-plum rounded-full"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-5 h-0.5 bg-plum rounded-full origin-center"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* ── Full-screen Mobile Glass Overlay Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden bg-pearl/95 backdrop-blur-2xl flex flex-col justify-between pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-[max(2rem,env(safe-area-inset-bottom))] px-6 sm:px-10 overflow-y-auto"
          >
            {/* Ambient decorative background glow in overlay */}
            <div
              aria-hidden
              className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-blush/30 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden
              className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-rose/20 blur-3xl pointer-events-none"
            />

            {/* Nav links stack */}
            <div className="relative z-10 flex flex-col gap-5 sm:gap-6 my-auto py-6">
              <span className="font-body text-[11px] font-semibold tracking-[0.3em] uppercase text-deep-rose">
                Navigation
              </span>

              {NAV_LINKS.map((link, index) => {
                const isActive = activeLink === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.08 + index * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <button
                      onClick={() => handleMobileNavClick(link.href)}
                      className={cn(
                        "group flex items-center justify-between w-full py-2.5 text-left font-heading text-3xl sm:text-4xl tracking-tight transition-colors min-h-[48px]",
                        isActive
                          ? "text-deep-rose font-normal"
                          : "text-plum/85 hover:text-deep-rose font-light"
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        size={20}
                        className={cn(
                          "transition-transform duration-300 text-deep-rose",
                          isActive
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        )}
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Actions: Book Now + Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45 }}
              className="relative z-10 flex flex-col gap-3 pt-6 border-t border-blush/50"
            >
              <button
                onClick={() => handleMobileNavClick("#book")}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-full bg-deep-rose text-white font-body text-xs font-semibold tracking-widest uppercase shadow-lg shadow-deep-rose/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Book Appointment</span>
                <span className="text-blush">✦</span>
              </button>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-full glass border border-blush/60 text-plum font-body text-xs font-medium tracking-wide flex items-center justify-center gap-2 hover:border-deep-rose/50 transition-colors"
              >
                <MapPin size={14} className="text-deep-rose" />
                <span>Beverly Hills Studio Location</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Reusable Book Now button with shine effect (Desktop) ── */
function BookNowButton() {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => scrollTo("#book")}
      className={cn(
        "relative overflow-hidden min-h-[44px]",
        "bg-deep-rose text-pearl",
        "font-body text-xs font-semibold tracking-widest uppercase",
        "px-6 py-2.5 rounded-full",
        "shadow-md shadow-deep-rose/30",
        "transition-shadow duration-300",
        "hover:shadow-lg hover:shadow-deep-rose/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose/60",
        "group cursor-pointer"
      )}
    >
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
