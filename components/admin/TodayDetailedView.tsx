"use client";

import { useState, useEffect, useMemo } from "react";
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
  Coffee,
  Check,
  Ban,
  Phone,
  MessageCircle,
  Send,
  ArrowRight,
  TrendingUp,
  Receipt,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { getContactLinks } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import type { TodayReservationItem } from "@/lib/admin/stats";
import ReservationStatusBadge, { ReservationStatus } from "./ReservationStatusBadge";
import ReservationConfirmDialog from "./ReservationConfirmDialog";
import ReservationsToast, { ToastItem } from "./ReservationsToast";

interface TodayDetailedViewProps {
  initialReservations: TodayReservationItem[];
  servicesDurationMap: Record<string, number>;
  todayDateFormatted: string;
  todayStr: string;
}

/**
 * Parses "HH:mm" to minutes from midnight.
 */
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

/**
 * Calculates end time formatted as "HH:mm" given start time and duration in minutes.
 */
function calculateEndTime(startTime: string, durationMin: number): string {
  const startMins = parseTimeToMinutes(startTime);
  const totalMins = startMins + durationMin;
  const endHours = Math.floor(totalMins / 60) % 24;
  const endMins = totalMins % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
}

/**
 * Formats a free gap into a readable label (e.g. "Free 1h 30", "Free 45 min").
 */
function formatGapLabel(gapMinutes: number): string {
  const hours = Math.floor(gapMinutes / 60);
  const mins = gapMinutes % 60;
  if (hours === 0) return `Free ${mins} min`;
  if (mins === 0) return `Free ${hours}h`;
  return `Free ${hours}h ${mins}m`;
}

/**
 * Computes live countdown or status for an appointment start time.
 */
function getRelativeCountdown(timeStr: string, isCurrent: boolean): string {
  if (isCurrent) return "Happening now";

  const targetMins = parseTimeToMinutes(timeStr);
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const diffMins = targetMins - currentMins;

  if (diffMins <= 0) return "Starting now";
  if (diffMins < 60) return `in ${diffMins} min`;

  const hrs = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  if (remMins === 0) return `in ${hrs}h`;
  return `in ${hrs}h ${remMins}m`;
}

export default function TodayDetailedView({
  initialReservations,
  servicesDurationMap,
  todayDateFormatted,
  todayStr,
}: TodayDetailedViewProps) {
  const [reservations, setReservations] = useState<TodayReservationItem[]>(initialReservations);
  const [showCancelled, setShowCancelled] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

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

  // Cancellation confirm modal state
  const [cancelTarget, setCancelTarget] = useState<TodayReservationItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Sync prop updates
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  // Periodic tick (every 30s) to keep time calculations fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Supabase Realtime Subscription ──
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const channelId = `today-page-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelId)
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
            if (newRecord.date === todayStr) {
              setReservations((prev) => {
                if (prev.some((r) => r.id === newRecord.id)) return prev;
                return [...prev, newRecord].sort((a, b) => a.time.localeCompare(b.time));
              });

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
            const updated = payload.new as TodayReservationItem;
            setReservations((prev) => {
              if (updated.date === todayStr) {
                const exists = prev.some((r) => r.id === updated.id);
                if (exists) {
                  return prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r));
                }
                return [...prev, updated].sort((a, b) => a.time.localeCompare(b.time));
              }
              return prev.filter((r) => r.id !== updated.id);
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

    // Optimistic update
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
        prev.map((r) => (r.id === reservation.id ? { ...r, status: previousStatus } : r))
      );
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to update status. Rolled back."
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

  // Helper to get duration for a service
  const getDuration = (serviceName: string) => {
    const key = (serviceName || "").trim().toLowerCase();
    return servicesDurationMap[key] || 60;
  };

  // ── Derived Timeline and Metrics ──
  const sortedReservations = useMemo(() => {
    return [...reservations].sort((a, b) => a.time.localeCompare(b.time));
  }, [reservations]);

  const activeReservations = useMemo(() => {
    return sortedReservations.filter((r) => r.status !== "cancelled");
  }, [sortedReservations]);

  const totalAppointments = activeReservations.length;
  const completedCount = useMemo(
    () => sortedReservations.filter((r) => r.status === "completed").length,
    [sortedReservations]
  );
  const remainingCount = useMemo(
    () =>
      sortedReservations.filter((r) => r.status === "new" || r.status === "confirmed").length,
    [sortedReservations]
  );
  const cancelledCount = useMemo(
    () => sortedReservations.filter((r) => r.status === "cancelled").length,
    [sortedReservations]
  );

  const revenueEarned = useMemo(() => {
    return sortedReservations
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  }, [sortedReservations]);

  const expectedRevenue = useMemo(() => {
    return sortedReservations
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + (Number(r.price) || 0), 0);
  }, [sortedReservations]);

  const progressPercent =
    totalAppointments > 0 ? Math.round((completedCount / totalAppointments) * 100) : 0;

  // Filtered reservations based on showCancelled
  const visibleReservations = useMemo(() => {
    if (showCancelled) return sortedReservations;
    return activeReservations;
  }, [sortedReservations, activeReservations, showCancelled]);

  // Current time in minutes
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find the "Now" or "Next" appointment
  const { currentOrNextAppointment, isHappeningNow } = useMemo(() => {
    // 1. Look for appointment currently happening (now within [start, end])
    for (const apt of activeReservations) {
      if (apt.status === "completed") continue;
      const duration = getDuration(apt.service);
      const startMins = parseTimeToMinutes(apt.time);
      const endMins = startMins + duration;
      if (currentMinutes >= startMins && currentMinutes < endMins) {
        return { currentOrNextAppointment: apt, isHappeningNow: true };
      }
    }

    // 2. Earliest non-completed active appointment
    const next = activeReservations.find(
      (r) => r.status === "new" || r.status === "confirmed"
    );

    return { currentOrNextAppointment: next || null, isHappeningNow: false };
  }, [activeReservations, currentMinutes, servicesDurationMap]);

  return (
    <div className="space-y-8">
      {/* ── 1. Page Header with Full Date, Summary Row, Progress & Cancelled Toggle ── */}
      <section
        aria-label="Today Overview Header"
        className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-8 shadow-[0_4px_24px_rgba(184,74,110,0.04)] dark:shadow-[0_0_24px_rgba(243,166,189,0.04)] space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-rose/15 text-deep-rose text-xs font-semibold uppercase tracking-wider border border-deep-rose/25 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-deep-rose animate-pulse" />
              <span>Today&apos;s Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-plum tracking-tight">
              {todayDateFormatted}
            </h1>
            <p className="text-xs sm:text-sm text-plum/60 font-normal mt-1">
              Live timeline, current appointment actions, and daily revenue tracking.
            </p>
          </div>

          {/* Cancelled Toggle */}
          {cancelledCount > 0 && (
            <button
              type="button"
              onClick={() => setShowCancelled((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer self-start md:self-auto ${
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

        {/* Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total */}
          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-4 flex flex-col justify-between">
            <span className="text-xs text-plum/60 font-medium">Total Appointments</span>
            <span className="text-2xl sm:text-3xl font-semibold text-plum tabular-nums mt-1">
              {totalAppointments}
            </span>
          </div>

          {/* Completed */}
          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-4 flex flex-col justify-between">
            <span className="text-xs text-plum/60 font-medium">Completed</span>
            <span className="text-2xl sm:text-3xl font-semibold text-emerald-600 tabular-nums mt-1">
              {completedCount}
            </span>
          </div>

          {/* Remaining */}
          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-4 flex flex-col justify-between">
            <span className="text-xs text-plum/60 font-medium">Remaining</span>
            <span className="text-2xl sm:text-3xl font-semibold text-deep-rose tabular-nums mt-1">
              {remainingCount}
            </span>
          </div>

          {/* Revenue Earned */}
          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-4 flex flex-col justify-between">
            <span className="text-xs text-plum/60 font-medium">Revenue Earned</span>
            <span className="text-xl sm:text-2xl font-semibold text-plum tabular-nums mt-1">
              {formatPrice(revenueEarned)}
            </span>
          </div>

          {/* Expected Revenue */}
          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-xs text-plum/60 font-medium">Expected Total</span>
            <span className="text-xl sm:text-2xl font-semibold text-plum/70 tabular-nums mt-1">
              {formatPrice(expectedRevenue)}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-plum/70 font-medium">Daily Schedule Progress</span>
            <span className="font-semibold text-plum tabular-nums">
              {completedCount} of {totalAppointments} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-rose/15 dark:bg-rose/10 overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-deep-rose to-rose rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </section>

      {/* ── 2. "Now / Next" Highlight Block at Top ── */}
      {currentOrNextAppointment && (
        <section aria-label="Current or Upcoming Appointment">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-gradient-to-br from-rose/15 via-white/85 to-blush/15 dark:from-deep-rose/25 dark:via-surface-elevated/90 dark:to-blush/10 backdrop-blur-2xl border-2 border-deep-rose/35 dark:border-rose/40 p-6 sm:p-7 shadow-[0_12px_40px_rgba(184,74,110,0.1)] dark:shadow-[0_0_35px_rgba(243,166,189,0.08)] relative overflow-hidden"
          >
            {/* Ambient halo glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-rose/25 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Card Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose/15">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-deep-rose to-rose text-pearl flex items-center justify-center shrink-0 shadow-md shadow-deep-rose/25">
                    <Clock className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          isHappeningNow
                            ? "bg-rose/20 text-deep-rose border-rose/40 animate-pulse"
                            : "bg-deep-rose text-pearl border-deep-rose"
                        }`}
                      >
                        {isHappeningNow && (
                          <span className="w-2 h-2 rounded-full bg-deep-rose animate-ping" />
                        )}
                        <span>{isHappeningNow ? "Happening Now" : "Up Next"}</span>
                      </span>

                      <span className="text-xs font-semibold text-plum tabular-nums">
                        {getRelativeCountdown(
                          currentOrNextAppointment.time,
                          isHappeningNow
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-plum/60 font-medium mt-1">
                      Scheduled window:{" "}
                      <strong className="text-plum font-semibold tabular-nums">
                        {currentOrNextAppointment.time} –{" "}
                        {calculateEndTime(
                          currentOrNextAppointment.time,
                          getDuration(currentOrNextAppointment.service)
                        )}
                      </strong>{" "}
                      ({getDuration(currentOrNextAppointment.service)} min)
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="self-start sm:self-auto">
                  <ReservationStatusBadge
                    status={currentOrNextAppointment.status}
                    onChangeStatus={(newStatus) =>
                      handleStatusChange(currentOrNextAppointment, newStatus)
                    }
                    onRequestCancel={() => setCancelTarget(currentOrNextAppointment)}
                  />
                </div>
              </div>

              {/* Client & Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-plum tracking-tight">
                    {currentOrNextAppointment.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-plum/60 font-mono mt-0.5">
                    {currentOrNextAppointment.phone}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm sm:text-base font-medium text-plum">
                      {currentOrNextAppointment.service}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-deep-rose tabular-nums">
                      {formatPrice(currentOrNextAppointment.price)}
                    </span>
                  </div>
                </div>

                {/* Client Note if present */}
                {currentOrNextAppointment.note ? (
                  <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-rose/20 p-4 text-xs sm:text-sm text-plum/85 italic flex flex-col justify-center">
                    <span className="text-[11px] font-semibold text-deep-rose uppercase tracking-wider not-italic mb-1">
                      Client Note:
                    </span>
                    &ldquo;{currentOrNextAppointment.note}&rdquo;
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/40 dark:bg-white/5 border border-rose/10 p-4 text-xs text-plum/50 flex items-center">
                    No special instructions provided by the client.
                  </div>
                )}
              </div>

              {/* Action Buttons & Contact Shortcuts */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Large Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {currentOrNextAppointment.status === "new" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(currentOrNextAppointment, "confirmed")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </button>
                  )}

                  {currentOrNextAppointment.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(currentOrNextAppointment, "completed")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-deep-rose hover:bg-plum text-pearl text-xs font-semibold transition-all shadow-md shadow-deep-rose/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as Completed</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCancelTarget(currentOrNextAppointment)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose/10 hover:bg-rose/20 text-deep-rose border border-rose/25 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Contact Shortcuts */}
                {(() => {
                  const links = getContactLinks(currentOrNextAppointment.phone);
                  return (
                    <div className="flex items-center gap-2">
                      <a
                        href={links.callUrl}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose/15 hover:bg-deep-rose hover:text-pearl text-deep-rose border border-rose/30 text-xs font-medium transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={links.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 hover:text-pearl text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={links.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-600 hover:text-pearl text-sky-700 dark:text-sky-400 border border-sky-500/30 text-xs font-medium transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Telegram</span>
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── 3. Full Timeline of the Day ── */}
      <section aria-label="Today Schedule Timeline" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-plum tracking-tight flex items-center gap-2">
            <span>Schedule Timeline</span>
            <span className="text-xs text-plum/60 font-medium tabular-nums">
              ({visibleReservations.length} sessions)
            </span>
          </h2>
        </div>

        {visibleReservations.length === 0 ? (
          /* Friendly Empty State with soft floating bubbles */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 sm:py-20 px-6 text-center rounded-3xl bg-white/75 dark:bg-surface-elevated/75 border border-rose/15 relative overflow-hidden flex flex-col items-center justify-center shadow-xs"
          >
            {/* Soft floating bubbles */}
            <motion.div
              animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 left-12 w-16 h-16 rounded-full bg-rose/10 blur-xl pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 12, 0], scale: [1, 1.08, 1] }}
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
                ? "All appointments scheduled for today are cancelled."
                : "You have no bookings on the calendar for today. Enjoy your day or review upcoming bookings."}
            </p>

            <Link
              href="/admin/reservations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs font-medium transition-all shadow-md shadow-deep-rose/20 cursor-pointer"
            >
              <span>View Full Reservations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* Timeline Container */
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-rose/40 before:via-rose/25 before:to-rose/10">
            <AnimatePresence initial={false}>
              {visibleReservations.map((item, index) => {
                const duration = getDuration(item.service);
                const startTime = item.time;
                const endTime = calculateEndTime(startTime, duration);
                const startMins = parseTimeToMinutes(startTime);
                const endMins = startMins + duration;

                const isCurrent = currentMinutes >= startMins && currentMinutes < endMins;
                const isPast = currentMinutes >= endMins;
                const isCompleted = item.status === "completed";
                const isCancelled = item.status === "cancelled";
                const isHighlighted = highlightedIds.has(item.id);

                // Check gap with previous reservation
                let freeGapMinutes = 0;
                if (index > 0) {
                  const prev = visibleReservations[index - 1];
                  if (prev.status !== "cancelled" && item.status !== "cancelled") {
                    const prevDuration = getDuration(prev.service);
                    const prevEndMins = parseTimeToMinutes(prev.time) + prevDuration;
                    const gap = startMins - prevEndMins;
                    if (gap >= 30) {
                      freeGapMinutes = gap;
                    }
                  }
                }

                const links = getContactLinks(item.phone);

                return (
                  <div key={item.id} className="space-y-6">
                    {/* Free Time Separator if gap >= 30 min */}
                    {freeGapMinutes >= 30 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative flex items-center gap-3 py-1"
                      >
                        <div className="absolute -left-[30px] sm:-left-[39px] w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pearl dark:bg-surface border-2 border-rose/30 flex items-center justify-center text-rose/60">
                          <Coffee className="w-3 h-3 text-deep-rose" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose/10 dark:bg-rose/15 border border-dashed border-rose/30 text-xs font-semibold text-deep-rose tabular-nums">
                          <span>☕</span>
                          <span>{formatGapLabel(freeGapMinutes)} free window</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Timeline Item Card */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`relative rounded-3xl p-5 sm:p-6 border transition-all ${
                        isHighlighted
                          ? "bg-rose/20 dark:bg-rose/25 border-deep-rose shadow-[0_0_28px_rgba(232,138,166,0.45)] ring-2 ring-deep-rose/40"
                          : isCurrent
                          ? "bg-white/95 dark:bg-surface-elevated/95 border-deep-rose/40 shadow-[0_8px_32px_rgba(184,74,110,0.12)] ring-2 ring-deep-rose/30"
                          : isPast || isCompleted
                          ? "bg-white/55 dark:bg-surface-elevated/55 border-rose/10 opacity-75 hover:opacity-100"
                          : isCancelled
                          ? "bg-white/35 dark:bg-surface-elevated/35 border-plum/10 opacity-55"
                          : "bg-white/75 dark:bg-surface-elevated/75 border-rose/15 hover:border-rose/30 shadow-xs"
                      }`}
                    >
                      {/* Timeline Node Icon/Dot */}
                      <div
                        className={`absolute -left-[30px] sm:-left-[39px] top-6 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-pearl"
                            : isCurrent
                            ? "bg-deep-rose border-pearl dark:border-surface-elevated text-pearl shadow-md ring-4 ring-rose/30 animate-pulse"
                            : isCancelled
                            ? "bg-plum/30 border-plum/30 text-pearl"
                            : "bg-white dark:bg-surface-elevated border-deep-rose text-deep-rose shadow-xs"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-pearl" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-deep-rose" />
                        )}
                      </div>

                      {/* Header Row: Time Window, Status Badge, Contact */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose/10">
                        {/* Time Window */}
                        <div className="flex items-center gap-3">
                          <div className="px-3.5 py-1.5 rounded-xl bg-rose/10 dark:bg-rose/15 border border-rose/20 text-plum font-semibold tabular-nums text-base sm:text-lg tracking-tight">
                            {startTime} – {endTime}
                          </div>
                          <span className="text-xs text-plum/60 font-medium">
                            ({duration} min)
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-deep-rose text-pearl text-[11px] font-semibold uppercase tracking-wider animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-pearl animate-ping" />
                              Current
                            </span>
                          )}
                          {isPast && !isCompleted && !isCancelled && (
                            <span className="px-2 py-0.5 rounded-full bg-plum/10 text-plum/60 text-[11px] font-medium">
                              Past time
                            </span>
                          )}
                        </div>

                        {/* Status Badge & Direct Actions */}
                        <div className="flex items-center gap-3 self-end md:self-auto">
                          <ReservationStatusBadge
                            status={item.status}
                            onChangeStatus={(newStatus) =>
                              handleStatusChange(item, newStatus)
                            }
                            onRequestCancel={() => setCancelTarget(item)}
                          />

                          {/* Contact buttons */}
                          <div className="flex items-center gap-1.5">
                            <a
                              href={links.callUrl}
                              aria-label={`Call ${item.name}`}
                              className="w-8 h-8 rounded-full border border-rose/25 bg-rose/10 hover:bg-deep-rose hover:text-pearl text-deep-rose flex items-center justify-center transition-colors shadow-xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={links.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`WhatsApp ${item.name}`}
                              className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-600 hover:text-pearl text-emerald-700 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={links.telegramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Telegram ${item.name}`}
                              className="w-8 h-8 rounded-full border border-sky-500/30 bg-sky-500/15 hover:bg-sky-600 hover:text-pearl text-sky-700 dark:text-sky-400 flex items-center justify-center transition-colors shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Main Info Row */}
                      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-lg font-semibold tracking-tight ${
                                isCancelled ? "line-through text-plum/50" : "text-plum"
                              }`}
                            >
                              {item.name}
                            </h3>
                            <span className="text-xs text-plum/60 font-mono">
                              {item.phone}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-sm text-plum/80">
                            <span className="font-medium">{item.service}</span>
                            <span className="font-semibold text-deep-rose tabular-nums">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Full Client Note */}
                        {item.note ? (
                          <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-rose/15 p-3.5 text-xs text-plum/85 italic">
                            <span className="font-semibold text-deep-rose not-italic block mb-1">
                              Client Note:
                            </span>
                            &ldquo;{item.note}&rdquo;
                          </div>
                        ) : (
                          <div className="text-xs text-plum/40 italic flex items-center">
                            No special note for this reservation.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Cancellation confirmation dialog */}
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
    </div>
  );
}
