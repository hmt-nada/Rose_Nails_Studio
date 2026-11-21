"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Sparkles, X } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ReservationsToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ReservationsToast({
  toasts,
  onDismiss,
}: ReservationsToastProps) {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isInfo = toast.type === "info";

          const Icon = isError
            ? AlertCircle
            : isInfo
            ? Sparkles
            : CheckCircle2;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto rounded-2xl p-3.5 pr-4 flex items-center justify-between gap-3 shadow-[0_12px_36px_rgba(184,74,110,0.18)] backdrop-blur-2xl border ${
                isError
                  ? "bg-white/95 border-rose/40 text-deep-rose"
                  : isInfo
                  ? "bg-white/95 border-rose/30 text-plum"
                  : "bg-white/95 border-rose/25 text-plum"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isError
                      ? "bg-rose/20 text-deep-rose"
                      : isInfo
                      ? "bg-deep-rose/15 text-deep-rose"
                      : "bg-emerald-500/15 text-emerald-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium leading-snug">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-plum/40 hover:text-plum p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
