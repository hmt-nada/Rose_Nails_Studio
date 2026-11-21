import { SupabaseClient } from "@supabase/supabase-js";

/**
 * ============================================================================
 * ROSÉ NAILS STUDIO — ADMIN OVERVIEW METRIC DEFINITIONS
 * ============================================================================
 * 
 * 1. CLIENTS PER MONTH:
 *    Number of reservations that are NOT cancelled (status != 'cancelled'),
 *    grouped by the reservation date month (YYYY-MM).
 *    Visualized as stacked bars:
 *      - Completed: reservations with status === 'completed'
 *      - Upcoming: reservations with status === 'new' OR status === 'confirmed'
 * 
 * 2. REVENUE:
 *    Sum of the price snapshot of COMPLETED reservations only (status === 'completed'),
 *    grouped by the reservation date month (YYYY-MM).
 * 
 * ============================================================================
 */

export interface MonthClientsData {
  monthKey: string; // e.g. "2026-06"
  label: string; // e.g. "Jun 26"
  completed: number;
  upcoming: number; // new + confirmed
  total: number;
}

export interface MonthRevenueData {
  monthKey: string;
  label: string;
  revenue: number;
}

export interface ServiceBookedData {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface UpcomingAppointment {
  id: string;
  name: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  time: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
}

export interface TodayReservationItem {
  id: string;
  name: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  time: string;
  note?: string | null;
  status: "new" | "confirmed" | "completed" | "cancelled";
  created_at?: string;
}

export interface DashboardStats {
  greeting: string;
  todayDateFormatted: string;
  todayStr: string;
  todayReservations: TodayReservationItem[];
  kpis: {
    clientsThisMonth: number;
    clientsChangePercent: number | null;
    revenueThisMonth: number;
    revenueChangePercent: number | null;
    todayAppointments: number;
    pendingRequests: number;
  };
  clientsMonthly: {
    last6Months: MonthClientsData[];
    last12Months: MonthClientsData[];
  };
  revenueMonthly: {
    last6Months: MonthRevenueData[];
    last12Months: MonthRevenueData[];
  };
  mostBookedServices: ServiceBookedData[];
  upcomingAppointments: UpcomingAppointment[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthLabel(year: number, monthIndex: number): string {
  const shortYear = String(year).slice(-2);
  return `${MONTH_NAMES[monthIndex]} ${shortYear}`;
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Computes dashboard aggregates on the server.
 */
export async function computeDashboardStats(
  supabase: SupabaseClient
): Promise<DashboardStats> {
  // Fetch all reservations
  const { data: records, error } = await supabase
    .from("reservations")
    .select("id, name, phone, service, price, date, time, note, status, created_at")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  const reservations = records || [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentHour = now.getHours();

  const greeting = `${getGreeting(currentHour)}, Admin`;

  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const todayDateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Current and previous month keys: e.g. "2026-11" and "2026-10"
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(
    prevMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  // 1. Generate month ranges for the last 12 months
  const months12Keys: { monthKey: string; label: string }[] = [];
  for (let offset = -11; offset <= 0; offset++) {
    const d = new Date(currentYear, currentMonth + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    months12Keys.push({
      monthKey: key,
      label: formatMonthLabel(y, m),
    });
  }

  // 2. Aggregate Clients and Revenue by month
  // Clients per month = not cancelled, stacked by completed vs upcoming (new + confirmed)
  // Revenue per month = sum of price for completed reservations only
  const clientsMap = new Map<string, { completed: number; upcoming: number }>();
  const revenueMap = new Map<string, number>();

  reservations.forEach((item) => {
    if (!item.date) return;
    const monthKey = item.date.substring(0, 7); // "YYYY-MM"
    const isCancelled = item.status === "cancelled";
    const isCompleted = item.status === "completed";
    const isUpcoming = item.status === "new" || item.status === "confirmed";

    // Track clients (non-cancelled)
    if (!isCancelled) {
      const entry = clientsMap.get(monthKey) || { completed: 0, upcoming: 0 };
      if (isCompleted) {
        entry.completed += 1;
      } else if (isUpcoming) {
        entry.upcoming += 1;
      }
      clientsMap.set(monthKey, entry);
    }

    // Track revenue (completed only)
    if (isCompleted && item.price) {
      const rev = revenueMap.get(monthKey) || 0;
      revenueMap.set(monthKey, rev + Number(item.price));
    }
  });

  const clients12Months: MonthClientsData[] = months12Keys.map(({ monthKey, label }) => {
    const counts = clientsMap.get(monthKey) || { completed: 0, upcoming: 0 };
    return {
      monthKey,
      label,
      completed: counts.completed,
      upcoming: counts.upcoming,
      total: counts.completed + counts.upcoming,
    };
  });

  const revenue12Months: MonthRevenueData[] = months12Keys.map(({ monthKey, label }) => {
    const revenue = revenueMap.get(monthKey) || 0;
    return {
      monthKey,
      label,
      revenue,
    };
  });

  const clients6Months = clients12Months.slice(-6);
  const revenue6Months = revenue12Months.slice(-6);

  // 3. KPI Calculations
  const curClients = clientsMap.get(currentMonthKey) || { completed: 0, upcoming: 0 };
  const clientsThisMonth = curClients.completed + curClients.upcoming;

  const prevClients = clientsMap.get(prevMonthKey) || { completed: 0, upcoming: 0 };
  const clientsPrevMonth = prevClients.completed + prevClients.upcoming;

  let clientsChangePercent: number | null = null;
  if (clientsPrevMonth > 0) {
    clientsChangePercent =
      Math.round(((clientsThisMonth - clientsPrevMonth) / clientsPrevMonth) * 1000) / 10;
  } else if (clientsThisMonth > 0) {
    clientsChangePercent = 100;
  } else {
    clientsChangePercent = 0;
  }

  const revenueThisMonth = revenueMap.get(currentMonthKey) || 0;
  const revenuePrevMonth = revenueMap.get(prevMonthKey) || 0;

  let revenueChangePercent: number | null = null;
  if (revenuePrevMonth > 0) {
    revenueChangePercent =
      Math.round(((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 1000) / 10;
  } else if (revenueThisMonth > 0) {
    revenueChangePercent = 100;
  } else {
    revenueChangePercent = 0;
  }

  // Today's appointments (non-cancelled)
  const todayAppointments = reservations.filter(
    (r) => r.status !== "cancelled" && r.date === todayStr
  ).length;

  // New requests waiting
  const pendingRequests = reservations.filter((r) => r.status === "new").length;

  // 4. Most Booked Services (non-cancelled only)
  const servicesCountMap = new Map<string, { count: number; revenue: number }>();
  let totalNonCancelled = 0;

  reservations.forEach((item) => {
    if (item.status === "cancelled") return;
    const name = item.service || "Standard Manicure";
    totalNonCancelled += 1;
    const currentEntry = servicesCountMap.get(name) || { count: 0, revenue: 0 };
    currentEntry.count += 1;
    if (item.status === "completed" && item.price) {
      currentEntry.revenue += Number(item.price);
    }
    servicesCountMap.set(name, currentEntry);
  });

  const mostBookedServices: ServiceBookedData[] = Array.from(
    servicesCountMap.entries()
  )
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage:
        totalNonCancelled > 0 ? Math.round((data.count / totalNonCancelled) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 5. Upcoming appointments (next 5 non-cancelled, upcoming first)
  const upcomingCandidates = reservations
    .filter((r) => r.status !== "cancelled" && r.date >= todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || "").localeCompare(b.time || "");
    });

  // If there are fewer than 5 future appointments, backfill with most recent non-cancelled bookings
  let finalUpcoming = upcomingCandidates.slice(0, 5);
  if (finalUpcoming.length < 5) {
    const recentOthers = reservations
      .filter((r) => r.status !== "cancelled" && !finalUpcoming.some((u) => u.id === r.id))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5 - finalUpcoming.length);
    finalUpcoming = [...finalUpcoming, ...recentOthers].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  const upcomingAppointments: UpcomingAppointment[] = finalUpcoming.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    service: r.service,
    price: r.price,
    date: r.date,
    time: r.time,
    status: r.status,
  }));

  // Today's all reservations (for the prominent Today panel)
  const todayReservations: TodayReservationItem[] = reservations
    .filter((r) => r.date === todayStr)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      service: r.service,
      price: r.price,
      date: r.date,
      time: r.time,
      note: r.note,
      status: r.status,
      created_at: r.created_at,
    }));

  return {
    greeting,
    todayDateFormatted,
    todayStr,
    todayReservations,
    kpis: {
      clientsThisMonth,
      clientsChangePercent,
      revenueThisMonth,
      revenueChangePercent,
      todayAppointments,
      pendingRequests,
    },
    clientsMonthly: {
      last6Months: clients6Months,
      last12Months: clients12Months,
    },
    revenueMonthly: {
      last6Months: revenue6Months,
      last12Months: revenue12Months,
    },
    mostBookedServices,
    upcomingAppointments,
  };
}
