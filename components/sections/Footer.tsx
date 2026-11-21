"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUp,
  Sparkles,
  Calendar,
  Check,
  ArrowRight,
} from "lucide-react";
import { STUDIO_CONTACT, SITE_NAME } from "@/lib/constants";
import { scrollToSection } from "@/lib/scroll";

export default function Footer() {
  const shouldReduce = useReducedMotion();
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
    setEmailInput("");
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const scrollTo = (hash: string) => {
    scrollToSection(hash);
  };

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://instagram.com",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
    {
      name: "TikTok",
      href: "https://tiktok.com",
      path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.36a6.34 6.34 0 0 0-.85-.06 6.34 6.34 0 1 0 6.34 6.34V8.58a8.27 8.27 0 0 0 4.77 1.52v-3.41z",
    },
    {
      name: "Pinterest",
      href: "https://pinterest.com",
      path: "M12 0a12 12 0 0 0-4.37 23.18c-.06-.94-.12-2.39.02-3.42l1.01-4.28s-.26-.52-.26-1.28c0-1.2.7-2.1 1.57-2.1.74 0 1.1.56 1.1 1.23 0 .75-.48 1.86-.72 2.89-.2.87.43 1.58 1.29 1.58 1.55 0 2.74-1.64 2.74-4 0-2.09-1.5-3.56-3.65-3.56-2.49 0-3.95 1.87-3.95 3.8 0 .75.29 1.56.65 2 .07.09.08.17.06.26l-.25 1.01c-.04.16-.14.2-.32.12-1.18-.55-1.92-2.28-1.92-3.67 0-2.98 2.17-5.72 6.26-5.72 3.28 0 5.84 2.34 5.84 5.47 0 3.26-2.06 5.89-4.91 5.89-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.82-.79 1.85-1.17 2.48A12 12 0 1 0 12 0z",
    },
    {
      name: "Facebook",
      href: "https://facebook.com",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-pearl via-[#FDF0F5] to-[#F8DCE5] text-plum overflow-hidden select-none">
      {/* ─── Ambient Glow Blobs ─── */}
      <div
        aria-hidden
        className="absolute top-12 left-1/4 -translate-x-1/2 w-64 h-64 sm:w-[600px] sm:h-[600px] rounded-full bg-blush/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-10 right-10 w-60 h-60 sm:w-[500px] sm:h-[500px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      {/* ─── Pre-Footer Invitation Banner (CTA) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-6 sm:pb-8 relative z-10">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-12 overflow-hidden bg-white/85 backdrop-blur-md border border-white/90 shadow-[0_16px_40px_rgba(184,74,110,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 will-change-transform"
        >
          {/* Subtle decorative glow in CTA */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blush/30 blur-2xl pointer-events-none"
          />

          <div className="flex flex-col gap-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 self-center md:self-start px-3.5 py-1 rounded-full bg-pearl/90 border border-blush/50 text-deep-rose text-xs font-medium tracking-widest uppercase">
              <Sparkles size={13} className="text-deep-rose animate-pulse" />
              <span>Bespoke Nail Sanctuary</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-plum font-normal leading-tight">
              Ready for your signature manicure?
            </h2>
            <p className="font-body text-xs sm:text-sm md:text-base text-plum/70 leading-relaxed">
              Step into an elevated world of nail couture, non-toxic formulations, and
              unhurried artistry tailored exclusively to you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto shrink-0">
            <button
              onClick={() => scrollTo("#book")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-deep-rose text-white font-body text-xs sm:text-sm font-medium tracking-wide shadow-md shadow-deep-rose/25 hover:bg-[#A33D5E] hover:shadow-lg hover:shadow-deep-rose/30 active:scale-[0.98] transition-all duration-300 cursor-pointer min-h-[44px]"
            >
              <Calendar size={16} />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => scrollTo("#work")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/70 hover:bg-white text-plum border border-blush/60 font-body text-xs sm:text-sm font-medium tracking-wide hover:border-deep-rose/40 active:scale-[0.98] transition-all duration-300 cursor-pointer min-h-[44px]"
            >
              <span>View Gallery</span>
              <ArrowRight size={15} className="text-deep-rose" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Delicate Separator Line ─── */}
      <div className="max-w-7xl mx-auto px-6 my-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blush/60 to-transparent" />
      </div>

      {/* ─── Main Footer Columns (Fade-up reveal) ─── */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-6 pt-6 pb-12 relative z-10 will-change-transform"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Identity (span 4) */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <div className="flex flex-col sm:flex-row items-center lg:items-start text-center sm:text-left gap-3">
              <div className="w-12 h-12 rounded-full bg-white/90 border border-blush/50 shadow-sm flex items-center justify-center p-2 shrink-0">
                <img
                  src="/imag/logo/logo.png"
                  alt={`${SITE_NAME} Emblem`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-plum block leading-none">
                  {SITE_NAME}
                </span>
                <span className="font-body text-[11px] tracking-[0.25em] uppercase text-deep-rose/80 font-medium block mt-1">
                  Haute Nail Couture
                </span>
              </div>
            </div>

            <p className="font-body text-sm text-plum/70 leading-relaxed max-w-sm">
              An intimate studio dedicated to Japanese gel precision, restorative nail
              therapy, and bespoke hand aesthetics in Beverly Hills.
            </p>

            {/* Quality Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-blush/50 text-[11px] font-medium text-plum/80">
                <Sparkles size={11} className="text-deep-rose" />
                Clean &amp; Non-Toxic
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-blush/50 text-[11px] font-medium text-plum/80">
                <Sparkles size={11} className="text-deep-rose" />
                Master Artistry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-blush/50 text-[11px] font-medium text-plum/80">
                <Sparkles size={11} className="text-deep-rose" />
                Sterile Care
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links (with Sliding Underline on hover) */}
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-deep-rose">
              Navigation
            </span>
            <ul className="flex flex-col items-center lg:items-start gap-3 font-body text-sm text-plum/75">
              {[
                { name: "Our Work", href: "#work" },
                { name: "Client Reviews", href: "#reviews" },
                { name: "Our Services", href: "#services" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Book Appointment", href: "#book" },
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="group flex items-center gap-2 hover:text-deep-rose transition-colors duration-200 cursor-pointer min-h-[44px] py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blush group-hover:bg-deep-rose group-hover:scale-125 transition-all duration-200" />
                    <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover:after:w-full after:bg-deep-rose after:transition-all after:duration-300">
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <a
                  href={STUDIO_CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 hover:text-deep-rose transition-colors duration-200 min-h-[44px] py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blush group-hover:bg-deep-rose group-hover:scale-125 transition-all duration-200" />
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover:after:w-full after:bg-deep-rose after:transition-all after:duration-300">
                    Studio Map ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio & Hours */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-deep-rose">
              Atelier &amp; Hours
            </span>
            <div className="flex flex-col items-center lg:items-start gap-3.5 font-body text-sm text-plum/75 w-full max-w-xs">
              {/* Address */}
              <a
                href={STUDIO_CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-center lg:justify-start gap-2.5 hover:text-deep-rose transition-colors duration-200 text-center lg:text-left"
              >
                <MapPin size={17} className="text-deep-rose shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-medium text-plum group-hover:text-deep-rose transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover:after:w-full after:bg-deep-rose after:transition-all after:duration-300">
                    {STUDIO_CONTACT.address}
                  </span>
                  <span className="text-xs text-plum/60">{STUDIO_CONTACT.city}</span>
                </div>
              </a>

              {/* Phone & Email */}
              <div className="flex flex-col items-center lg:items-start gap-2 pt-1 border-t border-blush/40 w-full">
                <a
                  href={`tel:${STUDIO_CONTACT.phoneRaw}`}
                  className="group flex items-center gap-2.5 hover:text-deep-rose transition-colors duration-200 min-h-[44px] py-1"
                >
                  <Phone size={15} className="text-deep-rose shrink-0" />
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover:after:w-full after:bg-deep-rose after:transition-all after:duration-300">
                    {STUDIO_CONTACT.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${STUDIO_CONTACT.email}`}
                  className="group flex items-center gap-2.5 hover:text-deep-rose transition-colors duration-200 min-h-[44px] py-1"
                >
                  <Mail size={15} className="text-deep-rose shrink-0" />
                  <span className="break-all relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 group-hover:after:w-full after:bg-deep-rose after:transition-all after:duration-300">
                    {STUDIO_CONTACT.email}
                  </span>
                </a>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-blush/40 text-xs w-full">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 font-medium text-plum">
                  <Clock size={13} className="text-deep-rose" />
                  <span>Opening Schedule</span>
                </div>
                <div className="flex justify-between text-plum/70">
                  <span>Mon – Fri</span>
                  <span className="font-medium text-plum">{STUDIO_CONTACT.hours.weekdays}</span>
                </div>
                <div className="flex justify-between text-plum/70">
                  <span>Saturday</span>
                  <span className="font-medium text-plum">{STUDIO_CONTACT.hours.saturday}</span>
                </div>
                <div className="flex justify-between text-plum/70">
                  <span>Sunday</span>
                  <span className="font-medium text-plum">{STUDIO_CONTACT.hours.sunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: The Rosé Journal & Staggered Social Icons with Bounce */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-deep-rose">
              The Rosé Journal
            </span>
            <p className="font-body text-sm text-plum/70 leading-relaxed max-w-sm">
              Subscribe for seasonal palette launches, secret opening alerts, and bespoke
              care rituals.
            </p>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full max-w-sm">
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your email…"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-white/90 border border-blush/70 rounded-full px-4 py-2.5 pr-24 font-body text-base sm:text-xs text-plum placeholder:text-plum/40 focus:outline-none focus:border-deep-rose focus:ring-2 focus:ring-deep-rose/20 transition-all min-h-[44px]"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-4 py-1.5 rounded-full bg-deep-rose text-white font-body text-xs font-medium hover:bg-[#A33D5E] transition-colors cursor-pointer min-h-[36px]"
                >
                  Join
                </button>
              </div>
              {isSubscribed && (
                <div className="inline-flex items-center justify-center lg:justify-start gap-1 text-[11px] text-deep-rose font-medium">
                  <Check size={12} />
                  <span>Welcome to our private list ✨</span>
                </div>
              )}
            </form>

            {/* Social Media Links (Staggered pop-in + hover bounce) */}
            <div className="flex flex-col items-center lg:items-start gap-2.5 pt-3">
              <span className="font-body text-[11px] uppercase tracking-wider text-plum/60 font-medium">
                Follow Our Creations
              </span>
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    initial={shouldReduce ? {} : { scale: 0, opacity: 0 }}
                    whileInView={shouldReduce ? {} : { scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: shouldReduce ? 0 : 0.2 + i * 0.08,
                      type: "spring",
                      stiffness: 380,
                      damping: 15,
                    }}
                    whileHover={{
                      y: -6,
                      scale: 1.15,
                      transition: { duration: 0.25 },
                    }}
                    className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/80 border border-blush/60 shadow-sm flex items-center justify-center text-plum hover:text-white hover:bg-deep-rose hover:border-deep-rose hover:shadow-md hover:shadow-deep-rose/25 transition-colors duration-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Very Large Brand Wordmark Sliding Up at the Bottom ─── */}
      <motion.div
        initial={shouldReduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full overflow-hidden text-center select-none pointer-events-none px-4 pt-4 pb-2 overflow-x-clip"
        data-reveal="wordmark"
      >
        <motion.h2
          variants={{
            hidden: { y: "80%", opacity: 0 },
            visible: {
              y: "0%",
              opacity: 1,
              transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          className="font-heading text-[clamp(1.75rem,7.5vw,8.5rem)] xl:text-[135px] font-normal tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-deep-rose/20 via-rose/30 to-blush/20 uppercase will-change-transform"
        >
          {SITE_NAME}
        </motion.h2>
      </motion.div>

      {/* ─── Bottom Sub-Footer Bar ─── */}
      <div className="w-full border-t border-blush/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 font-body text-xs text-plum/65">
          <div className="flex items-center gap-2">
            <span>© 2026 {SITE_NAME}. All rights reserved.</span>
            <span className="hidden sm:inline text-plum/30">•</span>
            <span className="hidden sm:inline text-plum/50">Haute Nail Artistry</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-plum/50">Sanitation Certified</span>
            <span className="text-plum/30">•</span>
            <button
              onClick={() => scrollTo("#hero")}
              className="inline-flex items-center gap-1.5 text-deep-rose font-medium hover:text-[#A33D5E] transition-colors cursor-pointer group min-h-[44px] min-w-[44px] py-2 px-3"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp
                size={14}
                className="group-hover:-translate-y-1 transition-transform duration-200"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
