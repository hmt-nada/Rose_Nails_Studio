"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Sparkles, CheckCircle2, Clock, Ban } from "lucide-react";

export type ReservationStatus = "new" | "confirmed" | "completed" | "cancelled";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  onChangeStatus: (newStatus: ReservationStatus) => void;
  onRequestCancel: () => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<
  ReservationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeStyle: string;
    dotStyle: string;
  }
> = {
  new: {
    label: "New",
    icon: Sparkles,
    badgeStyle: "bg-rose/15 text-deep-rose border-rose/30 hover:bg-rose/25",
    dotStyle: "bg-deep-rose",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badgeStyle: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 hover:bg-emerald-500/25",
    dotStyle: "bg-emerald-600",
  },
  completed: {
    label: "Completed",
    icon: Clock,
    badgeStyle: "bg-plum/10 text-plum border-plum/20 hover:bg-plum/15",
    dotStyle: "bg-plum",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    badgeStyle: "bg-plum/5 text-plum/50 border-plum/15 hover:bg-plum/10",
    dotStyle: "bg-plum/40",
  },
};

const STATUS_OPTIONS: ReservationStatus[] = [
  "new",
  "confirmed",
  "completed",
  "cancelled",
];

export default function ReservationStatusBadge({
  status,
  onChangeStatus,
  onRequestCancel,
  disabled = false,
}: ReservationStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const CurrentIcon = current.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newStatus: ReservationStatus) => {
    setIsOpen(false);
    if (newStatus === status) return;

    if (newStatus === "cancelled") {
      onRequestCancel();
    } else {
      onChangeStatus(newStatus);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.97 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
          current.badgeStyle
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotStyle}`} />
        <CurrentIcon className="w-3 h-3" />
        <span>{current.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-40 w-36 rounded-2xl bg-white/95 dark:bg-surface-elevated/95 backdrop-blur-2xl border border-rose/20 p-1.5 shadow-[0_12px_32px_rgba(184,74,110,0.15)] dark:shadow-[0_0_25px_rgba(243,166,189,0.1)]"
          >
            <div className="space-y-0.5">
              {STATUS_OPTIONS.map((opt) => {
                const config = STATUS_CONFIG[opt];
                const OptIcon = config.icon;
                const isSelected = opt === status;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-rose/15 text-plum font-semibold"
                        : "text-plum/70 hover:text-plum hover:bg-rose/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotStyle}`} />
                      <OptIcon className="w-3.5 h-3.5" />
                      <span>{config.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-deep-rose" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
