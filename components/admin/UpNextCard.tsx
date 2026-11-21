"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ChevronRight, Sparkles, CheckCircle2, Coffee } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TodayReservationItem } from "@/lib/admin/stats";

interface UpNextCardProps {
  initialReservations: TodayReservationItem[];
  todayStr: string;
}

/**
 * Computes live countdown or status for appointment HH:mm today.
 */
function computeCountdown(timeStr: string): { label: string; isNow: boolean } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return { label: timeStr, isNow: false };
  }

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  // Between -30 and +10 min considered "Now"
  if (diffMins >= -30 && diffMins <= 10) {
    return { label: "Now", isNow: true };
  }

  if (diffMins < -30) {
    return { label: "Now", isNow: true };
  }

  if (diffMins < 60) {
    return { label: `in ${diffMins} min`, isNow: false };
  }

  const hrs = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  if (remMins === 0) {
    return { label: `in ${hrs}h`, isNow: false };
  }
  return { label: `in ${hrs}h ${remMins}m`, isNow: false };
}

export default function UpNextCard({
  initialReservations,
  todayStr,
}: UpNextCardProps) {
  const [reservations, setReservations] = useState<TodayReservationItem[]>(initialReservations);
  const [, setTick] = useState(0);

  // Sync prop updates
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  // Tick every 30s for live countdown update
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Supabase realtime subscription
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const channel = supabase
      .channel("up-next-card-realtime")
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

  // Derived state
  const activeReservations = useMemo(
    () => reservations.filter((r) => r.status !== "cancelled"),
    [reservations]
  );

  const completedCount = useMemo(
    () => reservations.filter((r) => r.status === "completed").length,
    [reservations]
  );

  const totalActive = activeReservations.length;
  const progressPercent = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

  // Next upcoming or current appointment (earliest non-cancelled, non-completed)
  const nextAppointment = useMemo(() => {
    return [...activeReservations]
      .sort((a, b) => a.time.localeCompare(b.time))
      .find((r) => r.status === "new" || r.status === "confirmed");
  }, [activeReservations]);

  const countdown = useMemo(() => {
    if (!nextAppointment) return null;
    return computeCountdown(nextAppointment.time);
  }, [nextAppointment]);

  return (
    <Link
      href="/admin/today"
      className="group block rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-5 sm:p-6 shadow-[0_4px_24px_rgba(184,74,110,0.04)] dark:shadow-[0_0_24px_rgba(243,166,189,0.04)] hover:border-rose/35 dark:hover:border-rose/40 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Soft ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-rose/10 via-rose/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose/10 dark:bg-rose/15 border border-rose/20 text-xs font-semibold uppercase tracking-wider text-deep-rose">
            <Clock className="w-3.5 h-3.5" />
            <span>Up Next Today</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-medium text-plum/60 group-hover:text-deep-rose transition-colors">
            <span>View day timeline</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Content Body */}
        {nextAppointment && countdown ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3.5">
              {/* Time Slot Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-deep-rose/10 dark:bg-deep-rose/20 border border-deep-rose/20 shrink-0">
                <span className="text-lg sm:text-xl font-semibold text-plum tabular-nums tracking-tight">
                  {nextAppointment.time}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-plum tracking-tight group-hover:text-deep-rose transition-colors">
                    {nextAppointment.name}
                  </h3>

                  {/* Live countdown or "Now" badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums uppercase tracking-wider border ${
                      countdown.isNow
                        ? "bg-rose/20 text-deep-rose border-rose/35 animate-pulse"
                        : "bg-deep-rose/15 text-deep-rose border-deep-rose/25"
                    }`}
                  >
                    {countdown.isNow && (
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-rose animate-ping" />
                    )}
                    {countdown.label}
                  </span>
                </div>

                <p className="text-xs text-plum/70 font-normal mt-0.5">
                  {nextAppointment.service}
                </p>
              </div>
            </div>
          </div>
        ) : totalActive > 0 && completedCount === totalActive ? (
          /* All appointments completed for today */
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-plum tracking-tight">
                All done for today ✨
              </h3>
              <p className="text-xs text-plum/60 font-normal mt-0.5">
                Every scheduled appointment has been completed.
              </p>
            </div>
          </div>
        ) : (
          /* No appointments scheduled for today */
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-2xl bg-rose/15 text-deep-rose flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-plum tracking-tight">
                No appointments today
              </h3>
              <p className="text-xs text-plum/60 font-normal mt-0.5">
                Enjoy your calm day or review upcoming bookings.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Line: Day's Progress */}
        <div className="pt-2 border-t border-rose/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-plum/70 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-deep-rose shrink-0" />
            <span className="tabular-nums">
              {completedCount} of {totalActive} completed
            </span>
          </div>

          <div className="w-32 sm:w-48 h-1.5 rounded-full bg-rose/15 dark:bg-rose/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-deep-rose to-rose rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
