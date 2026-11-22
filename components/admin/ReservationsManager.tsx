"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  User,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Sparkles,
  Phone,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import ReservationStatusBadge, {
  type ReservationStatus,
} from "./ReservationStatusBadge";
import ReservationContactActions from "./ReservationContactActions";
import ReservationConfirmDialog from "./ReservationConfirmDialog";
import ReservationsToast, { type ToastItem } from "./ReservationsToast";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown";

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  time: string;
  note?: string | null;
  status: ReservationStatus;
  created_at?: string;
}

interface ReservationsManagerProps {
  initialReservations: Reservation[];
}

type FilterChip = "all" | "today" | "new" | "confirmed" | "completed" | "cancelled";
type SortOption = "upcoming" | "latest" | "created";

const SORT_OPTIONS: DropdownOption<SortOption>[] = [
  { value: "upcoming", label: "Upcoming first" },
  { value: "latest", label: "Latest date first" },
  { value: "created", label: "Recently created" },
];

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatRelativeDate(dateStr: string, timeStr: string) {
  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  if (dateStr === todayStr) {
    return { isToday: true, isTomorrow: false, text: `Today, ${timeStr}` };
  }
  if (dateStr === tomorrowStr) {
    return { isToday: false, isTomorrow: true, text: `Tomorrow, ${timeStr}` };
  }
  return { isToday: false, isTomorrow: false, text: `${dateStr} at ${timeStr}` };
}

function getInitials(name: string): string {
  if (!name) return "R";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ReservationsManager({
  initialReservations,
}: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<FilterChip>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("upcoming");

  // Expanded notes state (set of reservation IDs)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Realtime highlight ID
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Cancellation confirm dialog state
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Toast system state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem["type"], message: string) => {
    const id = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Supabase Realtime Subscription ──
  useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const channelId = `admin-res-${Math.random().toString(36).slice(2, 9)}`;
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
            const newItem = payload.new as Reservation;
            setReservations((prev) => {
              // Avoid duplicates if already present
              if (prev.some((r) => r.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });

            // Highlight with soft glow
            setHighlightedId(newItem.id);
            setTimeout(() => setHighlightedId(null), 6000);

            // Toast notification
            addToast("info", `New booking from ${newItem.name}`);
          } else if (payload.eventType === "UPDATE") {
            const updatedItem = payload.new as Reservation;
            setReservations((prev) =>
              prev.map((r) => (r.id === updatedItem.id ? { ...r, ...updatedItem } : r))
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            if (deleted?.id) {
              setReservations((prev) => prev.filter((r) => r.id !== deleted.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [addToast]);

  // ── Compute Live Counts for Filter Chips ──
  const counts = useMemo(() => {
    const todayStr = getTodayString();
    return {
      all: reservations.length,
      today: reservations.filter((r) => r.date === todayStr).length,
      new: reservations.filter((r) => r.status === "new").length,
      confirmed: reservations.filter((r) => r.status === "confirmed").length,
      completed: reservations.filter((r) => r.status === "completed").length,
      cancelled: reservations.filter((r) => r.status === "cancelled").length,
    };
  }, [reservations]);

  // ── Filter & Sort Logic ──
  const filteredAndSorted = useMemo(() => {
    const todayStr = getTodayString();
    const query = search.trim().toLowerCase();

    return reservations
      .filter((item) => {
        // 1. Search by name or phone
        if (query) {
          const matchName = item.name.toLowerCase().includes(query);
          const matchPhone = item.phone.toLowerCase().includes(query);
          const matchService = item.service.toLowerCase().includes(query);
          if (!matchName && !matchPhone && !matchService) return false;
        }

        // 2. Chip filter
        if (activeChip === "today" && item.date !== todayStr) return false;
        if (activeChip === "new" && item.status !== "new") return false;
        if (activeChip === "confirmed" && item.status !== "confirmed") return false;
        if (activeChip === "completed" && item.status !== "completed") return false;
        if (activeChip === "cancelled" && item.status !== "cancelled") return false;

        // 3. Date range filter
        if (dateFrom && item.date < dateFrom) return false;
        if (dateTo && item.date > dateTo) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "upcoming") {
          // Ascending date, then time
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        }
        if (sortBy === "latest") {
          // Descending date, then time
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return b.time.localeCompare(a.time);
        }
        if (sortBy === "created") {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        }
        return 0;
      });
  }, [reservations, search, activeChip, dateFrom, dateTo, sortBy]);

  // ── Optimistic Status Update with Rollback ──
  const handleUpdateStatus = async (
    reservationId: string,
    newStatus: ReservationStatus
  ) => {
    const previous = reservations.find((r) => r.id === reservationId);
    if (!previous || previous.status === newStatus) return;

    // 1. Optimistic update
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: newStatus } : r))
    );

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status on server");
      }

      addToast("success", `Status updated to ${newStatus}`);
    } catch {
      // Rollback on error
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, status: previous.status } : r
        )
      );
      addToast("error", "Could not update status. Reverted changes.");
    }
  };

  // ── Handle Confirm Cancellation ──
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    await handleUpdateStatus(cancelTarget.id, "cancelled");
    setIsCancelling(false);
    setCancelTarget(null);
  };

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearDateRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  const resetAllFilters = () => {
    setSearch("");
    setActiveChip("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("upcoming");
  };

  const chipOptions: { id: FilterChip; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "today", label: "Today", count: counts.today },
    { id: "new", label: "New", count: counts.new },
    { id: "confirmed", label: "Confirmed", count: counts.confirmed },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* ── Toolbar: Search, Filters & Controls ── */}
      <div className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-5 sm:p-6 shadow-[0_4px_24px_rgba(184,74,110,0.04)] dark:shadow-[0_0_24px_rgba(243,166,189,0.04)] space-y-4">
        {/* Top row: Search input + Date Range + Sort */}
        <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
          {/* Search by Name or Phone */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum/40">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, phone number, service..."
              className="w-full pl-10 pr-4 py-2.5 bg-pearl/60 dark:bg-surface/60 border border-rose/25 rounded-2xl text-xs sm:text-sm text-plum placeholder:text-plum/35 focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-all"
            />
          </div>

          {/* Date range picker & Sort dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range: From / To */}
            <div className="flex items-center gap-1.5 bg-pearl/60 dark:bg-surface/60 border border-rose/20 rounded-2xl px-2.5 py-1.5 text-xs text-plum">
              <CalendarIcon className="w-3.5 h-3.5 text-deep-rose shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                title="Filter starting date"
                className="bg-transparent text-plum text-xs focus:outline-none cursor-pointer tabular-nums"
              />
              <span className="text-plum/40">&rarr;</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                title="Filter end date"
                className="bg-transparent text-plum text-xs focus:outline-none cursor-pointer tabular-nums"
              />
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={clearDateRange}
                  className="ml-1 text-[10px] text-deep-rose hover:text-plum font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <Dropdown<SortOption>
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              icon={<ArrowUpDown className="w-3.5 h-3.5" />}
              aria-label="Sort reservations"
              align="right"
              size="md"
            />
          </div>
        </div>

        {/* Filter chips with live counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <div className="flex items-center gap-1.5 text-xs text-plum/50 font-medium mr-1 shrink-0">
            <Filter className="w-3 h-3 text-deep-rose" />
            <span>Filter:</span>
          </div>

          {chipOptions.map((chip) => {
            const isSelected = activeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveChip(chip.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-deep-rose text-pearl shadow-sm shadow-deep-rose/25"
                    : "bg-white/60 dark:bg-surface/60 text-plum/70 hover:text-plum hover:bg-rose/10 border border-rose/15 dark:border-rose/20"
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold tabular-nums ${
                    isSelected
                      ? "bg-pearl/20 text-pearl"
                      : "bg-rose/15 text-deep-rose"
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active Result Summary Bar ── */}
      <div className="flex items-center justify-between px-2 text-xs text-plum/60">
        <p>
          Showing <span className="font-semibold text-plum tabular-nums">{filteredAndSorted.length}</span>{" "}
          of <span className="font-semibold text-plum tabular-nums">{reservations.length}</span> reservations
        </p>

        {(search || activeChip !== "all" || dateFrom || dateTo) && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-deep-rose hover:text-plum font-medium cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* ── Reservations List: Table-like Glass Rows (Desktop) & Stacked Cards (Mobile) ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAndSorted.length === 0 ? (
            /* ── Luxury Pink Glass Empty State ── */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-surface-elevated/70 backdrop-blur-xl border border-rose/20 p-10 sm:p-14 text-center shadow-sm"
            >
              {/* Floating decorative bubbles in empty state */}
              <div className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full bg-rose/15 blur-xl" />
              <div className="pointer-events-none absolute -bottom-10 -right-8 w-36 h-36 rounded-full bg-blush/25 blur-xl" />
              <div className="pointer-events-none absolute top-1/4 right-1/4 w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white/80" />

              <div className="relative z-10 max-w-sm mx-auto flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose to-blush flex items-center justify-center text-pearl shadow-md shadow-rose/20 mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-plum tracking-tight">
                  No reservations found
                </h3>
                <p className="text-xs sm:text-sm text-plum/70 font-light mt-2 leading-relaxed">
                  We couldn&apos;t find any bookings matching your active filters. Try clearing your search, selecting another date, or resetting your filter chips.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-6 px-5 py-2.5 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs font-semibold shadow-md shadow-deep-rose/20 transition-all cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            </motion.div>
          ) : (
            filteredAndSorted.map((item, index) => {
              const { text: relativeDateText, isToday, isTomorrow } = formatRelativeDate(
                item.date,
                item.time
              );
              const initials = getInitials(item.name);
              const hasNote = Boolean(item.note && item.note.trim().length > 0);
              const isNoteExpanded = expandedNotes.has(item.id);
              const isHighlighted = highlightedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: isHighlighted
                      ? "0 0 28px rgba(232, 138, 166, 0.45)"
                      : "0 2px 16px rgba(184, 74, 110, 0.03)",
                  }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{
                    duration: 0.28,
                    delay: Math.min(index * 0.03, 0.3),
                    layout: { duration: 0.25 },
                  }}
                  className={`rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border transition-all duration-300 overflow-hidden ${
                    isHighlighted
                      ? "border-rose/60 bg-gradient-to-r from-rose/10 via-white/80 dark:via-surface-elevated/90 to-blush/10"
                      : "border-rose/15 dark:border-rose/20 hover:border-rose/30"
                  }`}
                >
                  {/* Card Content: Table row on Desktop, Stacked on Mobile */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Avatar + Client Name & Phone */}
                    <div className="flex items-center gap-3.5 min-w-[210px]">
                      {/* Initials Avatar with Pink Gradient */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-deep-rose via-rose to-blush flex items-center justify-center text-pearl font-semibold text-sm shadow-sm shrink-0">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-base text-plum truncate leading-snug">
                            {item.name}
                          </p>
                          {isToday && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-deep-rose text-pearl">
                              Today
                            </span>
                          )}
                          {isTomorrow && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose/20 text-deep-rose border border-rose/30">
                              Tomorrow
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-plum/60 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-deep-rose shrink-0" />
                          <span className="tabular-nums font-medium">{item.phone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Middle-Left: Service & Price */}
                    <div className="min-w-[190px]">
                      <p className="text-xs uppercase tracking-wider text-plum/45 font-semibold">
                        Service
                      </p>
                      <p className="text-sm font-medium text-plum leading-snug">
                        {item.service}
                      </p>
                      <p className="text-xs font-bold text-deep-rose mt-0.5 tabular-nums">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Middle-Right: Date & Time */}
                    <div className="min-w-[170px]">
                      <p className="text-xs uppercase tracking-wider text-plum/45 font-semibold">
                        Schedule
                      </p>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-plum mt-0.5 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-deep-rose shrink-0" />
                        <span>{relativeDateText}</span>
                      </div>
                      <p className="text-[11px] text-plum/50 font-light mt-0.5 tabular-nums">
                        {item.date} &bull; {item.time}
                      </p>
                    </div>

                    {/* Right: Contact Actions + Status Badge */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-rose/10">
                      {/* Contact Buttons (Call, WhatsApp, Telegram) */}
                      <ReservationContactActions
                        phone={item.phone}
                        clientName={item.name}
                      />

                      {/* Status Pill with Animated Dropdown */}
                      <ReservationStatusBadge
                        status={item.status}
                        onChangeStatus={(newStatus) =>
                          handleUpdateStatus(item.id, newStatus)
                        }
                        onRequestCancel={() => setCancelTarget(item)}
                      />
                    </div>
                  </div>

                  {/* Expandable Note Section */}
                  {hasNote && (
                    <div className="border-t border-rose/10 bg-pearl/40 dark:bg-surface/40 px-4 sm:px-5 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleNote(item.id)}
                        className="flex items-center gap-1.5 text-xs text-plum/70 hover:text-plum font-medium cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-deep-rose" />
                        <span>
                          Client note {isNoteExpanded ? "(hide)" : "(view message)"}
                        </span>
                        {isNoteExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-plum/50" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-plum/50" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isNoteExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-xs text-plum/80 italic bg-white/70 dark:bg-surface-elevated/80 rounded-xl p-3 border border-rose/15 mt-2 leading-relaxed">
                              &ldquo;{item.note}&rdquo;
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Cancel Confirmation Dialog ── */}
      <ReservationConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        clientName={cancelTarget?.name || ""}
        reservationDate={cancelTarget?.date || ""}
        reservationTime={cancelTarget?.time || ""}
        isSubmitting={isCancelling}
      />

      {/* ── Toast Notifications ── */}
      <ReservationsToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
