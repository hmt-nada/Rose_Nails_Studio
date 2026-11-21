"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  ChevronRight,
  Coffee,
  MessageSquare,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { TodayReservationItem } from "@/lib/admin/stats";
import ReservationContactActions from "./ReservationContactActions";
import ReservationStatusBadge, { ReservationStatus } from "./ReservationStatusBadge";
import ReservationConfirmDialog from "./ReservationConfirmDialog";
import ReservationsToast, { ToastItem } from "./ReservationsToast";

interface TodayAppointmentsPanelProps {
  initialReservations: TodayReservationItem[];
  todayDateFormatted: string;
  todayStr: string;
}

/**
 * Computes remaining time or status string relative to now for a given HH:mm time today.
 */
function getRelativeTimeLabel(timeStr: string): { label: string; isNow: boolean; isPast: boolean } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return { label: timeStr, isNow: false, isPast: false };
  }

  const now = new Date();
  const appointmentTime = new Date();
  appointmentTime.setHours(hours, minutes, 0, 0);

  const diffMs = appointmentTime.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  // If between -30 mins and +15 mins, consider it "Happening now"
  if (diffMins >= -30 && diffMins <= 10) {
    return { label: "Happening now", isNow: true, isPast: false };
  }

  if (diffMins < -30) {
    const pastHours = Math.floor(Math.abs(diffMins) / 60);
    const pastMins = Math.abs(diffMins) % 60;
    if (pastHours === 0) {
      return { label: `${pastMins}m ago`, isNow: false, isPast: true };
    }
    return { label: `${pastHours}h ${pastMins}m ago`, isNow: false, isPast: true };
  }

  // Future
  if (diffMins < 60) {
    return { label: `in ${diffMins} min`, isNow: false, isPast: false };
  }

  const futureHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  if (remainingMins === 0) {
    return { label: `in ${futureHours}h`, isNow: false, isPast: false };
  }
  return { label: `in ${futureHours}h ${remainingMins}m`, isNow: false, isPast: false };
}

export default function TodayAppointmentsPanel({
  initialReservations,
  todayDateFormatted,
  todayStr,
}: TodayAppointmentsPanelProps) {
  const [reservations, setReservations] = useState<TodayReservationItem[]>(initialReservations);
  const [showCancelled, setShowCancelled] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cancellation confirm dialog state
  const [cancelTarget, setCancelTarget] = useState<TodayReservationItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Periodic tick (every 30s) to keep relative times fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Update reservations when initialReservations prop updates
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  // ── Supabase Realtime Subscription ──
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (err) {
      console.warn("Supabase client init failed for realtime:", err);
      return;
    }

    const channel = supabase
      .channel("today-appointments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservations",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as TodayReservationItem;
            // Check if it belongs to today
            if (newRecord.date === todayStr) {
              setReservations((prev) => {
                if (prev.some((r) => r.id === newRecord.id)) return prev;
                const updated = [...prev, newRecord].sort((a, b) =>
                  a.time.localeCompare(b.time)
                );
                return updated;
              });

              // Highlight with pink glow halo
              setHighlightedIds((prev) => new Set([...prev, newRecord.id]));
              setTimeout(() => {
                setHighlightedIds((prev) => {
                  const next = new Set(prev);
                  next.delete(newRecord.id);
                  return next;
                });
              }, 4000);

              addToast(
                "info",
                `New appointment booked for today: ${newRecord.name} at ${newRecord.time}`
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as TodayReservationItem;
            setReservations((prev) => {
              const exists = prev.some((r) => r.id === updatedRecord.id);
              if (updatedRecord.date === todayStr) {
                if (exists) {
                  return prev.map((r) =>
                    r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
                  );
                } else {
                  return [...prev, updatedRecord].sort((a, b) =>
                    a.time.localeCompare(b.time)
                  );
                }
              } else {
                // Moved away from today
                return prev.filter((r) => r.id !== updatedRecord.id);
              }
            });
          } else if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as { id?: string };
            if (oldRecord?.id) {
              setReservations((prev) => prev.filter((r) => r.id !== oldRecord.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [todayStr]);

  // ── Status Change Handler with Optimistic Update ──
  const handleStatusChange = async (
    reservation: TodayReservationItem,
    newStatus: ReservationStatus
  ) => {
    const previousStatus = reservation.status;
    if (previousStatus === newStatus) return;

    // Optimistic state update
    setReservations((prev) =>
      prev.map((r) => (r.id === reservation.id ? { ...r, status: newStatus } : r))
    );

    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update status (${response.status})`);
      }

      addToast("success", `Status updated to "${newStatus}" for ${reservation.name}`);
    } catch (err: unknown) {
      console.error("Status update failed:", err);
      // Rollback
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id ? { ...r, status: previousStatus } : r
        )
      );
      addToast(
        "error",
        err instanceof Error
          ? err.message
          : "Failed to update reservation status. Changes rolled back."
      );
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    await handleStatusChange(cancelTarget, "cancelled");
    setIsCancelling(false);
    setCancelTarget(null);
  };

  // Toggle notes expansion
  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Derived Metrics ──
  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => a.time.localeCompare(b.time));
  }, [reservations]);

  const activeReservations = useMemo(() => {
    return sortedReservations.filter((r) => r.status !== "cancelled");
  }, [sortedReservations]);

  const cancelledCount = useMemo(() => {
    return sortedReservations.filter((r) => r.status === "cancelled").length;
  }, [sortedReservations]);

  const completedCount = useMemo(() => {
    return sortedReservations.filter((r) => r.status === "completed").length;
  }, [sortedReservations]);

  const totalActive = activeReservations.length;
  const progressPercent = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  // Filtered reservations based on showCancelled toggle
  const visibleReservations = useMemo(() => {
    if (showCancelled) return sortedReservations;
    return activeReservations;
  }, [sortedReservations, activeReservations, showCancelled]);

  // Next upcoming appointment (earliest active that is not completed)
  const nextAppointment = useMemo(() => {
    return activeReservations.find((r) => r.status === "new" || r.status === "confirmed");
  }, [activeReservations]);

  const nextRelativeTime = useMemo(() => {
    if (!nextAppointment) return null;
    return getRelativeTimeLabel(nextAppointment.time);
  }, [nextAppointment]);

  return (
    <>
      <section
        aria-label="Today's Appointments Panel"
        className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/20 dark:border-rose/25 p-6 sm:p-8 shadow-[0_8px_32px_rgba(184,74,110,0.06)] dark:shadow-[0_0_32px_rgba(243,166,189,0.04)] relative overflow-hidden transition-colors"
      >
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-rose/15 via-rose/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* ── 1. Header with Title, Progress, and Cancelled Toggle ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-rose/15 dark:border-rose/20 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-rose/15 dark:bg-deep-rose/25 text-deep-rose text-xs font-semibold uppercase tracking-wider border border-deep-rose/25">
                <span className="w-2 h-2 rounded-full bg-deep-rose animate-pulse" />
                Today&apos;s Schedule
              </span>
              <span className="text-xs text-plum/60 font-medium tabular-nums hidden sm:inline-block">
                {todayDateFormatted}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-semibold text-plum tracking-tight">
                Appointments for Today
              </h2>
              <span className="text-xs sm:text-sm font-medium text-plum/60 tabular-nums">
                ({totalActive} scheduled)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-plum/60 mt-1 sm:hidden">
              {todayDateFormatted}
            </p>
          </div>

          {/* Progress Indicator & Controls */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Completion Progress Bar */}
            <div className="flex flex-col gap-1.5 min-w-[180px] sm:min-w-[210px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-plum/70 font-medium">Daily Progress</span>
                <span className="font-semibold text-plum tabular-nums">
                  {completedCount} of {totalActive} completed
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-rose/15 dark:bg-rose/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-deep-rose to-rose rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Show / Hide Cancelled Toggle */}
            {cancelledCount > 0 && (
              <button
                type="button"
                onClick={() => setShowCancelled((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  showCancelled
                    ? "bg-plum/10 text-plum border-plum/25 dark:bg-white/10 dark:text-pearl"
                    : "bg-white/60 dark:bg-surface-elevated/60 text-plum/70 hover:text-plum border-rose/20 hover:border-rose/35"
                }`}
              >
                {showCancelled ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-deep-rose" />
                )}
                <span>
                  {showCancelled ? "Hide cancelled" : `Show cancelled (${cancelledCount})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── 2. Highlighted Next Appointment Card ── */}
        {nextAppointment && nextRelativeTime && (
          <div className="mt-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-r from-deep-rose/10 via-rose/10 to-blush/10 dark:from-deep-rose/20 dark:via-rose/15 dark:to-blush/10 border border-deep-rose/30 dark:border-rose/35 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-deep-rose to-rose text-pearl flex flex-col items-center justify-center shrink-0 shadow-md shadow-deep-rose/25">
                  <Clock className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Next</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                        nextRelativeTime.isNow
                          ? "bg-rose/20 text-deep-rose border border-rose/35 animate-pulse"
                          : "bg-deep-rose text-pearl"
                      }`}
                    >
                      {nextRelativeTime.isNow && (
                        <span className="w-1.5 h-1.5 rounded-full bg-deep-rose animate-ping" />
                      )}
                      {nextRelativeTime.label}
                    </span>
                    <span className="text-xs text-plum/60 font-medium">
                      at{" "}
                      <strong className="text-plum font-semibold tabular-nums">
                        {nextAppointment.time}
                      </strong>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-plum tracking-tight mt-1">
                    {nextAppointment.name}
                  </h3>
                  <p className="text-xs text-plum/70 font-normal">
                    {nextAppointment.service} &bull;{" "}
                    <span className="font-semibold text-deep-rose tabular-nums">
                      {formatPrice(nextAppointment.price)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Direct Quick Contact Actions for Next Appointment */}
              <div className="flex items-center gap-3 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-rose/15">
                <span className="text-xs text-plum/60 font-medium hidden lg:inline-block">
                  Contact client:
                </span>
                <ReservationContactActions
                  phone={nextAppointment.phone}
                  clientName={nextAppointment.name}
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* ── 3. Vertical Timeline or Clean Empty State ── */}
        <div className="mt-8 relative z-10">
          {visibleReservations.length === 0 ? (
            /* Friendly Empty State with soft floating bubbles */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="py-14 sm:py-16 px-6 text-center rounded-2xl bg-pearl/60 dark:bg-surface-elevated/40 border border-rose/15 relative overflow-hidden flex flex-col items-center justify-center"
            >
              {/* Soft decorative bubbles */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 left-12 w-16 h-16 rounded-full bg-rose/10 blur-xl pointer-events-none"
              />
              <motion.div
                animate={{
                  y: [0, 12, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 right-16 w-20 h-20 rounded-full bg-blush/15 blur-xl pointer-events-none"
              />

              <div className="w-16 h-16 rounded-3xl bg-rose/15 dark:bg-rose/20 text-deep-rose flex items-center justify-center mb-4 shadow-inner">
                <Coffee className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold text-plum tracking-tight mb-1.5">
                No appointments today
              </h3>
              <p className="text-sm text-plum/60 max-w-md mx-auto leading-relaxed mb-6 font-normal">
                {showCancelled && cancelledCount > 0
                  ? "All appointments for today are cancelled."
                  : "You have no bookings scheduled for today. Take time to prep, or review upcoming appointments."}
              </p>

              <Link
                href="/admin/reservations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs font-medium transition-all shadow-md shadow-deep-rose/20 cursor-pointer"
              >
                <span>View Full Reservations Calendar</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* Vertical Timeline */
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-rose/40 before:via-rose/25 before:to-rose/10">
              <AnimatePresence initial={false}>
                {visibleReservations.map((item, index) => {
                  const isHighlighted = highlightedIds.has(item.id);
                  const isNext = nextAppointment?.id === item.id;
                  const isCompleted = item.status === "completed";
                  const isCancelled = item.status === "cancelled";
                  const isNoteExpanded = expandedNotes.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className={`relative group rounded-2xl p-4 sm:p-5 border transition-all ${
                        isHighlighted
                          ? "bg-rose/20 dark:bg-rose/25 border-deep-rose shadow-[0_0_28px_rgba(232,138,166,0.45)] ring-2 ring-deep-rose/40"
                          : isNext
                          ? "bg-white/90 dark:bg-surface-elevated/90 border-rose/35 dark:border-rose/30 shadow-[0_4px_20px_rgba(184,74,110,0.08)]"
                          : isCompleted
                          ? "bg-white/50 dark:bg-surface-elevated/50 border-rose/10 opacity-80"
                          : isCancelled
                          ? "bg-white/30 dark:bg-surface-elevated/30 border-plum/10 opacity-60"
                          : "bg-white/75 dark:bg-surface-elevated/75 border-rose/15 hover:border-rose/30 shadow-xs"
                      }`}
                    >
                      {/* Timeline Node Icon/Dot */}
                      <div
                        className={`absolute -left-[30px] sm:-left-[39px] top-5 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-pearl"
                            : isNext
                            ? "bg-deep-rose border-pearl dark:border-surface-elevated text-pearl shadow-md ring-4 ring-rose/30 animate-pulse"
                            : isCancelled
                            ? "bg-plum/30 border-plum/30 text-pearl"
                            : "bg-white dark:bg-surface-elevated border-deep-rose text-deep-rose shadow-xs"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isNext ? (
                          <span className="w-2 h-2 rounded-full bg-pearl" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-deep-rose" />
                        )}
                      </div>

                      {/* Content Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Time & Client Info */}
                        <div className="flex items-start gap-4">
                          {/* Time badge */}
                          <div className="flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-xl bg-rose/10 dark:bg-rose/15 border border-rose/20 shrink-0">
                            <span className="text-base sm:text-lg font-semibold text-plum tabular-nums tracking-tight">
                              {item.time}
                            </span>
                            <span className="text-[10px] text-plum/60 uppercase font-medium tracking-wider">
                              Slot
                            </span>
                          </div>

                          {/* Client & Service */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-base font-semibold tracking-tight ${
                                  isCancelled
                                    ? "line-through text-plum/50"
                                    : "text-plum"
                                }`}
                              >
                                {item.name}
                              </h4>
                              {isNext && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-deep-rose text-pearl shadow-xs">
                                  Next
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm text-plum/70 font-normal mt-0.5">
                              {item.service} &bull;{" "}
                              <span className="font-semibold text-deep-rose tabular-nums">
                                {formatPrice(item.price)}
                              </span>
                            </p>

                            {/* Client Note snippet or toggle */}
                            {item.note && (
                              <button
                                type="button"
                                onClick={() => toggleNote(item.id)}
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-plum/60 hover:text-deep-rose transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3 text-deep-rose/70" />
                                <span>{isNoteExpanded ? "Hide note" : "View note"}</span>
                              </button>
                            )}

                            {isNoteExpanded && item.note && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-2.5 rounded-xl bg-plum/5 dark:bg-white/5 border border-rose/15 text-xs text-plum/80 italic"
                              >
                                &ldquo;{item.note}&rdquo;
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Status & Contact Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-rose/10">
                          {/* 1-Click Status Badge */}
                          <ReservationStatusBadge
                            status={item.status}
                            onChangeStatus={(newStatus) =>
                              handleStatusChange(item, newStatus)
                            }
                            onRequestCancel={() => setCancelTarget(item)}
                          />

                          {/* Contact quick actions */}
                          <ReservationContactActions
                            phone={item.phone}
                            clientName={item.name}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Cancellation confirmation modal */}
      <ReservationConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        clientName={cancelTarget?.name || ""}
        reservationDate={cancelTarget?.date || ""}
        reservationTime={cancelTarget?.time || ""}
        isSubmitting={isCancelling}
      />

      {/* Toast notifications */}
      <ReservationsToast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
