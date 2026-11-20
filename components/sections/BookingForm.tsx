"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, CheckCircle2, ChevronDown, X, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import SplitText from "@/components/ui/animations/SplitText";

const SERVICES_OPTIONS = [
  "Gel Extensions",
  "Bespoke Nail Art",
  "Refill & Rebalance",
  "Deluxe Manicure",
  "Classic Gel Nails",
  "Chrome Glaze Finish",
];

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "2:30 PM",
  "4:00 PM",
  "5:30 PM",
];

// Sparkle Particle definition for button burst
interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  color: string;
}

export default function BookingForm() {
  const shouldReduce = useReducedMotion();

  // Form State
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Input Focus States for Floating Labels & Animated Underlines
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dropdown & Toast State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [serviceError, setServiceError] = useState(false);

  // Button Morph & Sparkles Burst
  const [isSuccessMorphed, setIsSuccessMorphed] = useState(false);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-dismiss toast notification after 5 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Handle Form Submission
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedService) {
      setServiceError(true);
      return;
    }
    setServiceError(false);

    // 1. Generate Sparkle Particles Burst around button
    const burstCount = 16;
    const colors = ["#B84A6E", "#E88AA6", "#F9C6D4", "#FFF8FA", "#FFD1DC"];
    const newParticles: SparkleParticle[] = [];

    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * 2 * Math.PI;
      const distance = 45 + Math.random() * 55;
      newParticles.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0.5 + Math.random() * 0.8,
        color: colors[i % colors.length],
      });
    }
    setParticles(newParticles);

    // 2. Button morphs to checkmark
    setIsSuccessMorphed(true);
    setSubmittedName(firstName);

    // 3. Show friendly confirmation toast
    setShowToast(true);

    // Reset morph state after 3.5s
    setTimeout(() => {
      setIsSuccessMorphed(false);
      setParticles([]);
    }, 3500);

    // Reset Form fields
    setFirstName("");
    setPhoneNumber("");
    setSelectedService("");
    setPreferredDate("");
    setSelectedTimeSlot("");
  }

  const [minDate, setMinDate] = useState<string>("");

  useEffect(() => {
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <section
      id="book"
      className="relative py-28 w-full bg-[#FDF0F5] overflow-hidden select-none"
    >
      {/* Soft decorative background ambient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blush/25 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -left-28 w-[450px] h-[450px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      {/* ─── Elegant Success Toast Notification ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-6 right-6 z-50 max-w-sm w-[calc(100%-3rem)] sm:w-full glass bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-blush/60 shadow-xl shadow-deep-rose/15 flex items-start gap-3.5"
            role="status"
            aria-live="polite"
          >
            <div className="w-9 h-9 rounded-full bg-blush/40 flex items-center justify-center text-deep-rose shrink-0 mt-0.5">
              <CheckCircle2 size={18} className="text-deep-rose" />
            </div>
            <div className="flex-1 pr-1">
              <h4 className="font-heading text-lg font-medium text-plum leading-snug">
                Booking Request Sent!
              </h4>
              <p className="font-body text-xs text-plum/70 mt-1 leading-relaxed">
                Thank you{submittedName ? `, ${submittedName}` : ""}! We have received your request and will contact you promptly.
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-plum/40 hover:text-plum transition-colors p-1 cursor-pointer"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
        {/* ─── Header: SplitText reveal ─── */}
        <div className="flex flex-col items-center mb-12 md:mb-14">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">Make an appointment</SplitText>
          </span>
          <h2 className="font-heading text-5xl md:text-6xl xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Book Your Session
            </SplitText>
          </h2>
          <p className="font-body text-base md:text-lg font-light text-plum/65 max-w-md leading-relaxed">
            <SplitText by="word" stagger={0.03} delay={0.25}>
              Choose your service and preferred date. We will prepare an exquisite experience for you.
            </SplitText>
          </p>
        </div>

        {/* ─── Form Card: Rises with clip-path reveal and blur-to-sharp ─── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={
            shouldReduce
              ? {}
              : {
                  opacity: 0,
                  y: 45,
                  filter: "blur(10px)",
                  clipPath: "inset(8% 0% 8% 0% round 32px)",
                }
          }
          whileInView={
            shouldReduce
              ? {}
              : {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  clipPath: "inset(0% 0% 0% 0% round 32px)",
                }
          }
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn(
            "w-full glass bg-white/95 backdrop-blur-md rounded-[32px]",
            "border border-white/90 shadow-[0_16px_50px_rgba(184,74,110,0.1),0_4px_20px_rgba(249,198,212,0.2)]",
            "p-8 sm:p-12 text-left space-y-7 will-change-transform"
          )}
        >
          {/* 2x2 Form Grid with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. First Name Field with Floating Label & Underline Animation */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex flex-col justify-end"
            >
              <div
                className={cn(
                  "relative rounded-2xl bg-pearl/80 hover:bg-white border transition-all duration-300 overflow-hidden",
                  focusedField === "firstName"
                    ? "border-deep-rose ring-2 ring-deep-rose/25 bg-white shadow-[0_0_20px_rgba(232,138,166,0.3)]"
                    : "border-blush/60 hover:border-deep-rose/40"
                )}
              >
                {/* Floating label */}
                <label
                  htmlFor="booking-first-name"
                  className={cn(
                    "absolute left-4 transition-all duration-200 pointer-events-none font-body select-none",
                    firstName || focusedField === "firstName"
                      ? "top-2 text-[10px] uppercase tracking-widest font-semibold text-deep-rose"
                      : "top-4 text-sm text-plum/50 font-normal"
                  )}
                >
                  First Name <span className="text-deep-rose">*</span>
                </label>

                <input
                  id="booking-first-name"
                  type="text"
                  required
                  value={firstName}
                  onFocus={() => setFocusedField("firstName")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent px-4 pt-6 pb-2.5 font-body text-sm text-plum focus:outline-none"
                />

                {/* Smooth Underline Expansion Animation */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-blush via-rose to-deep-rose origin-center transition-transform duration-300",
                    focusedField === "firstName" ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
            </motion.div>

            {/* 2. Phone Number Field with Floating Label & Underline Animation */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex flex-col justify-end"
            >
              <div
                className={cn(
                  "relative rounded-2xl bg-pearl/80 hover:bg-white border transition-all duration-300 overflow-hidden",
                  focusedField === "phoneNumber"
                    ? "border-deep-rose ring-2 ring-deep-rose/25 bg-white shadow-[0_0_20px_rgba(232,138,166,0.3)]"
                    : "border-blush/60 hover:border-deep-rose/40"
                )}
              >
                {/* Floating label */}
                <label
                  htmlFor="booking-phone"
                  className={cn(
                    "absolute left-4 transition-all duration-200 pointer-events-none font-body select-none",
                    phoneNumber || focusedField === "phoneNumber"
                      ? "top-2 text-[10px] uppercase tracking-widest font-semibold text-deep-rose"
                      : "top-4 text-sm text-plum/50 font-normal"
                  )}
                >
                  Phone Number <span className="text-deep-rose">*</span>
                </label>

                <input
                  id="booking-phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onFocus={() => setFocusedField("phoneNumber")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent px-4 pt-6 pb-2.5 font-body text-sm text-plum focus:outline-none"
                />

                {/* Smooth Underline Expansion */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-blush via-rose to-deep-rose origin-center transition-transform duration-300",
                    focusedField === "phoneNumber" ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
            </motion.div>

            {/* 3. Custom Elegant Service Dropdown */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-2 relative"
              ref={dropdownRef}
            >
              <span className="font-body text-[11px] font-semibold tracking-widest uppercase text-plum/75">
                Service <span className="text-deep-rose">*</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen((prev) => !prev);
                  setServiceError(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between",
                  "bg-pearl/80 hover:bg-white border rounded-2xl px-4 py-3.5",
                  "font-body text-sm text-plum text-left transition-all duration-200 cursor-pointer",
                  serviceError
                    ? "border-red-400 ring-2 ring-red-400/20"
                    : isDropdownOpen
                    ? "border-deep-rose ring-2 ring-deep-rose/25 bg-white shadow-[0_0_20px_rgba(232,138,166,0.3)]"
                    : "border-blush/60 hover:border-deep-rose/40"
                )}
              >
                <span className={selectedService ? "text-plum font-normal" : "text-plum/40 font-light"}>
                  {selectedService || "Choose a service…"}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-deep-rose transition-transform duration-300",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Animated Custom Dropdown Popover */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute z-50 inset-x-0 top-full mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-blush/60 shadow-xl shadow-deep-rose/12 p-2 space-y-1"
                  >
                    {SERVICES_OPTIONS.map((service) => {
                      const isSelected = selectedService === service;
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setSelectedService(service);
                            setIsDropdownOpen(false);
                            setServiceError(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl",
                            "font-body text-sm text-left transition-all duration-150 cursor-pointer",
                            isSelected
                              ? "bg-blush/35 text-deep-rose font-medium"
                              : "text-plum/85 hover:bg-blush/15 hover:text-plum"
                          )}
                        >
                          <span>{service}</span>
                          {isSelected && <Check size={15} className="text-deep-rose" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 4. Preferred Date Field */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col gap-2"
            >
              <span className="font-body text-[11px] font-semibold tracking-widest uppercase text-plum/75">
                Preferred Date <span className="text-deep-rose">*</span>
              </span>
              <input
                type="date"
                required
                min={minDate || undefined}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={cn(
                  "w-full bg-pearl/80 hover:bg-white focus:bg-white",
                  "border border-blush/60 focus:border-deep-rose",
                  "rounded-2xl px-4 py-3.5 font-body text-sm text-plum",
                  "focus:outline-none focus:ring-2 focus:ring-deep-rose/25 focus:shadow-[0_0_20px_rgba(232,138,166,0.3)]",
                  "transition-all duration-200"
                )}
              />
            </motion.div>
          </div>

          {/* ── 5. Staggered Time Slot Options ── */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 15 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col gap-2.5 pt-1 border-t border-blush/40"
          >
            <div className="flex items-center gap-1.5 font-body text-[11px] font-semibold tracking-widest uppercase text-plum/75">
              <Clock size={12} className="text-deep-rose" />
              <span>Select Time Slot</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map((slot, index) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <motion.button
                    key={slot}
                    type="button"
                    initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
                    whileInView={shouldReduce ? {} : { opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: shouldReduce ? 0 : 0.48 + index * 0.05,
                      duration: 0.35,
                    }}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={cn(
                      "py-2 px-1 text-center font-body text-xs rounded-xl border transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "bg-deep-rose text-white border-deep-rose shadow-md shadow-deep-rose/30 scale-105"
                        : "bg-pearl/80 hover:bg-white border-blush/60 text-plum/75 hover:border-deep-rose/40"
                    )}
                  >
                    {slot}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── 6. Submit Button with Magnetic Hover, Morph & Sparkles Burst ── */}
          <div className="relative pt-2">
            {/* Sparkles Particle Burst */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
            >
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    scale: [0, p.scale, 0],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ backgroundColor: p.color }}
                  className="absolute w-2.5 h-2.5 rounded-full shadow-md"
                />
              ))}
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full relative overflow-hidden",
                "bg-deep-rose hover:bg-[#A33D5E] text-pearl",
                "font-body text-sm font-semibold tracking-widest uppercase",
                "py-4 rounded-full",
                "shadow-lg shadow-deep-rose/25 hover:shadow-xl hover:shadow-deep-rose/35",
                "transition-all duration-300 cursor-pointer",
                "flex items-center justify-center gap-2 group",
                isSuccessMorphed && "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-600/30"
              )}
            >
              {/* Shine sweep animation */}
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSuccessMorphed ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <Check size={18} className="stroke-[3]" />
                    <span>Booking Confirmed!</span>
                  </motion.span>
                ) : (
                  <>
                    <span>Confirm Booking</span>
                    <Sparkles
                      size={15}
                      className="text-pearl/80 group-hover:rotate-12 transition-transform duration-300"
                    />
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
