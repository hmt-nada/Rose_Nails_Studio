"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, CheckCircle2, ChevronDown, X, Sparkles, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKING_TIME_SLOTS } from "@/lib/constants";
import { formatPrice, formatDuration } from "@/lib/currency";
import SplitText from "@/components/ui/animations/SplitText";

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration_min: number;
  active: boolean;
  position: number;
}

const TIME_SLOTS = BOOKING_TIME_SLOTS;

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

  // Services State (Loaded dynamically from /api/services)
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const selectedServiceObj = services.find((s) => s.id === selectedServiceId);

  // Submission & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Input Focus States for Floating Labels & Animated Underlines
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Smooth scroll active field into view when mobile on-screen keyboard appears
  const handleFieldFocus = (
    field: string,
    e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    setFocusedField(field);
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 320);
  };

  // Dropdown & Toast State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [serviceError, setServiceError] = useState(false);

  // Button Morph & Sparkles Burst
  const [isSuccessMorphed, setIsSuccessMorphed] = useState(false);
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch active services on mount
  const loadServices = async () => {
    try {
      setIsLoadingServices(true);
      setServicesError(false);
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to load services");
      const data: ServiceItem[] = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
      setServicesError(true);
    } finally {
      setIsLoadingServices(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

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
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // ── Client-side Validation ──
    const trimmedName = firstName.trim();
    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    const digitsOnly = phoneNumber.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setErrorMessage("Please enter a valid phone number with 8 to 15 digits.");
      return;
    }

    if (!selectedServiceId || !selectedServiceObj) {
      setServiceError(true);
      setErrorMessage("Please choose a service from our menu.");
      return;
    }
    setServiceError(false);

    if (!preferredDate) {
      setErrorMessage("Please select your preferred appointment date.");
      return;
    }

    if (!selectedTimeSlot) {
      setErrorMessage("Please select an available studio time slot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          phone: phoneNumber.trim(),
          service_id: selectedServiceId,
          date: preferredDate,
          time: selectedTimeSlot,
          note: note.trim() || undefined,
          honeypot: honeypot || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "An unexpected error occurred. Please try again.");
        setIsSubmitting(false);
        return;
      }

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
      setSubmittedName(trimmedName);

      // 3. Show friendly confirmation toast
      setShowToast(true);

      // 4. Reset Form fields
      setFirstName("");
      setPhoneNumber("");
      setSelectedServiceId("");
      setPreferredDate("");
      setSelectedTimeSlot("");
      setNote("");
      setHoneypot("");
      setErrorMessage(null);

      // Reset morph state after 3.5s
      setTimeout(() => {
        setIsSuccessMorphed(false);
        setParticles([]);
      }, 3500);
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage("Network error. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const [minDate, setMinDate] = useState<string>("");

  useEffect(() => {
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <section
      id="book"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 w-full bg-[#FDF0F5] overflow-hidden select-none"
    >
      {/* Soft decorative background ambient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-60 h-60 sm:w-[480px] sm:h-[480px] rounded-full bg-blush/25 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-28 -left-28 w-56 h-56 sm:w-[450px] sm:h-[450px] rounded-full bg-rose/15 blur-3xl pointer-events-none"
      />

      {/* ─── Elegant Success Toast Notification ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[max(1.25rem,env(safe-area-inset-top))] inset-x-4 sm:inset-x-auto sm:right-6 z-50 max-w-sm w-auto glass bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-blush/60 shadow-xl shadow-deep-rose/15 flex items-start gap-3.5"
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
              className="text-plum/40 hover:text-plum transition-colors p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close notification"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* ─── Header: SplitText reveal ─── */}
        <div className="flex flex-col items-center mb-10 sm:mb-12 md:mb-14">
          <span className="font-body text-xs tracking-[0.3em] uppercase text-deep-rose mb-3">
            <SplitText by="word">Make an appointment</SplitText>
          </span>
          <h2 className="font-heading text-[clamp(2.15rem,5.5vw,4.5rem)] xl:text-7xl font-light text-plum tracking-tight mb-4">
            <SplitText by="word" stagger={0.06} delay={0.1}>
              Book Your Session
            </SplitText>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg font-light text-plum/65 max-w-md leading-relaxed">
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
            "w-full glass bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[32px]",
            "border border-white/90 shadow-[0_16px_50px_rgba(184,74,110,0.1),0_4px_20px_rgba(249,198,212,0.2)]",
            "p-5 xs:p-6 sm:p-10 md:p-12 text-left space-y-6 sm:space-y-7 will-change-transform"
          )}
        >
          {/* 2x2 Form Grid (single-column on phone, two-column on tablet & desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
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
                  onFocus={(e) => handleFieldFocus("firstName", e)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent px-4 pt-6 pb-2.5 font-body text-base text-plum focus:outline-none"
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
                  onFocus={(e) => handleFieldFocus("phoneNumber", e)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent px-4 pt-6 pb-2.5 font-body text-base text-plum focus:outline-none"
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
                  if (servicesError) {
                    loadServices();
                  } else {
                    setIsDropdownOpen((prev) => !prev);
                  }
                  setServiceError(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between min-h-[48px]",
                  "bg-pearl/80 hover:bg-white border rounded-2xl px-4 py-3.5",
                  "font-body text-base text-plum text-left transition-all duration-200 cursor-pointer",
                  serviceError
                    ? "border-red-400 ring-2 ring-red-400/20"
                    : isDropdownOpen
                    ? "border-deep-rose ring-2 ring-deep-rose/25 bg-white shadow-[0_0_20px_rgba(232,138,166,0.3)]"
                    : "border-blush/60 hover:border-deep-rose/40"
                )}
              >
                {isLoadingServices ? (
                  <span className="text-plum/50 flex items-center gap-2 font-light text-sm">
                    <RefreshCw size={14} className="animate-spin text-deep-rose" />
                    <span>Loading services menu…</span>
                  </span>
                ) : servicesError ? (
                  <span className="text-red-500 font-light text-xs sm:text-sm">
                    Unable to load services. Click to retry.
                  </span>
                ) : selectedServiceObj ? (
                  <span className="text-plum font-normal truncate">
                    {selectedServiceObj.name} — {formatPrice(selectedServiceObj.price)}
                  </span>
                ) : (
                  <span className="text-plum/40 font-light">Choose a service…</span>
                )}
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-deep-rose transition-transform duration-300 shrink-0 ml-2",
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
                    className="absolute z-50 inset-x-0 top-full mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-blush/60 shadow-xl shadow-deep-rose/12 p-2 space-y-1 max-h-64 overflow-y-auto"
                  >
                    {isLoadingServices ? (
                      <div className="p-4 text-center text-xs text-plum/60 flex items-center justify-center gap-2">
                        <RefreshCw size={13} className="animate-spin text-deep-rose" />
                        <span>Fetching services…</span>
                      </div>
                    ) : servicesError ? (
                      <div className="p-4 text-center">
                        <p className="text-xs text-plum/70 mb-2">Failed to load services.</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadServices();
                          }}
                          className="px-3 py-1 text-xs rounded-lg bg-deep-rose text-white cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    ) : services.length === 0 ? (
                      <div className="p-4 text-center text-xs text-plum/50">
                        No active services found.
                      </div>
                    ) : (
                      services.map((service) => {
                        const isSelected = selectedServiceId === service.id;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(service.id);
                              setIsDropdownOpen(false);
                              setServiceError(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl min-h-[46px]",
                              "font-body text-base text-left transition-all duration-150 cursor-pointer",
                              isSelected
                                ? "bg-blush/35 text-deep-rose font-medium shadow-xs"
                                : "text-plum/85 hover:bg-blush/15 hover:text-plum"
                            )}
                          >
                            <div className="flex flex-col text-left pr-2">
                              <span className="font-medium text-plum leading-snug">
                                {service.name}
                              </span>
                              <span className="text-xs text-deep-rose font-medium mt-0.5">
                                {formatPrice(service.price)} • {formatDuration(service.duration_min)}
                              </span>
                            </div>
                            {isSelected && <Check size={16} className="text-deep-rose shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Small Animated Summary Card with Selected Price & Duration */}
              <AnimatePresence>
                {selectedServiceObj && (
                  <motion.div
                    initial={shouldReduce ? {} : { opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={shouldReduce ? {} : { opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="mt-1 p-3 sm:p-3.5 rounded-2xl bg-white/90 border border-blush/60 shadow-sm flex items-center justify-between gap-3 text-plum will-change-transform"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blush/35 flex items-center justify-center text-deep-rose shrink-0">
                        <Sparkles size={14} className="text-deep-rose" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-body text-xs font-semibold text-plum">
                          {selectedServiceObj.name}
                        </span>
                        <span className="font-body text-[11px] text-plum/60 flex items-center gap-1">
                          <Clock size={11} className="text-deep-rose/80" />
                          <span>Est. {formatDuration(selectedServiceObj.duration_min)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-heading text-base sm:text-lg font-medium text-deep-rose block leading-tight">
                        {formatPrice(selectedServiceObj.price)}
                      </span>
                      <span className="font-body text-[10px] uppercase tracking-wider text-plum/50">
                        Studio rate
                      </span>
                    </div>
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
                onFocus={(e) => handleFieldFocus("date", e)}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={cn(
                  "w-full bg-pearl/80 hover:bg-white focus:bg-white min-h-[48px]",
                  "border border-blush/60 focus:border-deep-rose",
                  "rounded-2xl px-4 py-3.5 font-body text-base text-plum",
                  "focus:outline-none focus:ring-2 focus:ring-deep-rose/25 focus:shadow-[0_0_20px_rgba(232,138,166,0.3)]",
                  "transition-all duration-200"
                )}
              />
            </motion.div>

            {/* 5. Special Notes / Preferences (Optional, spans 2 columns on tablet/desktop) */}
            <motion.div
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="sm:col-span-2 relative flex flex-col justify-end"
            >
              <div
                className={cn(
                  "relative rounded-2xl bg-pearl/80 hover:bg-white border transition-all duration-300 overflow-hidden",
                  focusedField === "note"
                    ? "border-deep-rose ring-2 ring-deep-rose/25 bg-white shadow-[0_0_20px_rgba(232,138,166,0.3)]"
                    : "border-blush/60 hover:border-deep-rose/40"
                )}
              >
                <label
                  htmlFor="booking-note"
                  className={cn(
                    "absolute left-4 transition-all duration-200 pointer-events-none font-body select-none",
                    note || focusedField === "note"
                      ? "top-2 text-[10px] uppercase tracking-widest font-semibold text-deep-rose"
                      : "top-4 text-sm text-plum/50 font-normal"
                  )}
                >
                  Special Notes or Requests (Optional)
                </label>

                <input
                  id="booking-note"
                  type="text"
                  maxLength={500}
                  value={note}
                  onFocus={(e) => handleFieldFocus("note", e)}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-transparent px-4 pt-6 pb-2.5 font-body text-base text-plum focus:outline-none"
                />

                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-blush via-rose to-deep-rose origin-center transition-transform duration-300",
                    focusedField === "note" ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>
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
              <span>Select Time Slot <span className="text-deep-rose">*</span></span>
            </div>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
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
                      "py-3 px-2 text-center font-body text-xs sm:text-xs md:text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center",
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

          {/* Hidden Honeypot Anti-Bot Field */}
          <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
            <label htmlFor="b_comment">Leave this empty</label>
            <input
              id="b_comment"
              type="text"
              name="b_comment"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* ── Friendly Inline Error Message ── */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-2xl p-4 bg-[#FFF0F3] border border-rose/40 text-plum flex items-start gap-3 shadow-sm shadow-rose/10"
                role="alert"
                aria-live="assertive"
              >
                <div className="w-5 h-5 rounded-full bg-deep-rose/15 flex items-center justify-center text-deep-rose shrink-0 mt-0.5">
                  <AlertCircle size={14} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 font-body text-xs sm:text-sm text-plum/90 leading-relaxed">
                  {errorMessage}
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-plum/40 hover:text-plum p-1 transition-colors cursor-pointer"
                  aria-label="Dismiss error"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
              disabled={isSubmitting || isSuccessMorphed}
              whileTap={isSubmitting || isSuccessMorphed ? {} : { scale: 0.97 }}
              className={cn(
                "w-full relative overflow-hidden min-h-[52px]",
                "bg-deep-rose hover:bg-[#A33D5E] text-pearl",
                "font-body text-sm font-semibold tracking-widest uppercase",
                "py-4 rounded-full",
                "shadow-lg shadow-deep-rose/25 hover:shadow-xl hover:shadow-deep-rose/35",
                "transition-all duration-300",
                isSubmitting || isSuccessMorphed
                  ? "cursor-not-allowed opacity-95"
                  : "cursor-pointer",
                "flex items-center justify-center gap-2 group",
                isSuccessMorphed && "bg-emerald-600 hover:bg-emerald-600 shadow-emerald-600/30"
              )}
            >
              {/* Shine sweep animation */}
              {!isSubmitting && !isSuccessMorphed && (
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                />
              )}

              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="flex items-center gap-2.5 text-white">
                    <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                    <span>Confirming Reservation…</span>
                  </div>
                ) : isSuccessMorphed ? (
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
