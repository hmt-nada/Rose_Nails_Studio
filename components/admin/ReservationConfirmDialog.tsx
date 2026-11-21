"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ReservationConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  reservationDate: string;
  reservationTime: string;
  isSubmitting?: boolean;
}

export default function ReservationConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  reservationDate,
  reservationTime,
  isSubmitting = false,
}: ReservationConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-plum/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-2xl border border-rose/25 p-6 sm:p-7 shadow-[0_24px_64px_rgba(184,74,110,0.2)] text-plum z-10"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-5 right-5 p-1 rounded-full text-plum/40 hover:text-plum hover:bg-rose/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose/15 text-deep-rose flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-heading text-2xl font-light text-plum">
              Cancel Reservation?
            </h3>
            <p className="text-xs sm:text-sm text-plum/70 font-light mt-1.5 leading-relaxed">
              Are you sure you want to cancel the appointment for{" "}
              <span className="font-semibold text-plum">{clientName}</span> on{" "}
              <span className="font-medium text-plum">{reservationDate}</span> at{" "}
              <span className="font-medium text-plum">{reservationTime}</span>?
            </p>

            <div className="p-3 rounded-2xl bg-rose/10 border border-rose/20 text-[11px] text-plum/70 mt-4">
              The time slot will be freed up for other clients to book. You can manually restore the status later if needed.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-plum/75 hover:text-plum hover:bg-rose/10 transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-deep-rose hover:bg-plum text-pearl transition-all shadow-md shadow-deep-rose/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
