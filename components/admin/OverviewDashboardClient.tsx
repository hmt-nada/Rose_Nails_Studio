"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Phone,
  BarChart3,
  PieChart as PieIcon,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/currency";
import type { DashboardStats, MonthClientsData, MonthRevenueData } from "@/lib/admin/stats";
import ReservationContactActions from "./ReservationContactActions";

interface OverviewDashboardClientProps {
  stats: DashboardStats;
}

// Design token palette for Donut chart slices
const DONUT_COLORS = [
  "var(--color-deep-rose)",
  "var(--color-rose)",
  "var(--color-blush)",
  "var(--color-plum)",
  "rgba(184, 74, 110, 0.45)",
];

/**
 * Animated count-up component for KPI cards.
 */
function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (value - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/**
 * Custom glass tooltip for Recharts.
 */
function GlassTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
  formatter?: (val: number) => string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-white/95 dark:bg-surface-elevated/95 backdrop-blur-xl border border-rose/25 p-3 shadow-[0_12px_32px_rgba(184,74,110,0.14)] dark:shadow-[0_0_24px_rgba(243,166,189,0.1)] text-xs text-plum min-w-[140px] font-body">
        {label && <p className="font-semibold text-plum mb-1.5 pb-1 border-b border-rose/10">{label}</p>}
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-plum/70">{entry.name}:</span>
              </div>
              <span className="font-bold text-plum tabular-nums">
                {formatter ? formatter(entry.value) : entry.value.toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function OverviewDashboardClient({
  stats,
}: OverviewDashboardClientProps) {
  const [periodMonths, setPeriodMonths] = useState<6 | 12>(6);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clientsData: MonthClientsData[] =
    periodMonths === 6
      ? stats.clientsMonthly.last6Months
      : stats.clientsMonthly.last12Months;

  const revenueData: MonthRevenueData[] =
    periodMonths === 6
      ? stats.revenueMonthly.last6Months
      : stats.revenueMonthly.last12Months;

  const { kpis } = stats;

  return (
    <div className="space-y-8">
      {/* ── 1. Page Header with Greeting & Today's Date ── */}
      <div className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(184,74,110,0.04)] dark:shadow-[0_0_24px_rgba(243,166,189,0.04)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose/10 border border-rose/20 text-xs font-semibold uppercase tracking-wider text-deep-rose mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Studio Analytics &bull; Live
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light text-plum">
            {stats.greeting}
          </h1>
          <p className="text-xs sm:text-sm text-plum/70 font-light mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-deep-rose shrink-0" />
            <span>{stats.todayDateFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/reservations"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs sm:text-sm font-medium transition-all shadow-md shadow-deep-rose/20 cursor-pointer"
          >
            <span>View All Reservations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── 2. Four KPI Cards with Animated Numbers ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Clients this month */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 shadow-sm hover:border-rose/25 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-deep-rose to-rose flex items-center justify-center text-pearl shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            {kpis.clientsChangePercent !== null && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  kpis.clientsChangePercent >= 0
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                    : "bg-rose/15 text-deep-rose border-rose/30"
                }`}
              >
                {kpis.clientsChangePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="tabular-nums">
                  {kpis.clientsChangePercent >= 0 ? "+" : ""}
                  {kpis.clientsChangePercent}%
                </span>
              </span>
            )}
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl font-normal text-plum tracking-tight tabular-nums">
            <CountUpNumber value={kpis.clientsThisMonth} />
          </h3>
          <p className="text-xs text-plum/80 font-medium mt-1">Clients This Month</p>
          <p className="text-[11px] text-plum/50 font-light mt-0.5">
            Non-cancelled booking requests
          </p>
        </motion.div>

        {/* KPI 2: Revenue this month */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 shadow-sm hover:border-rose/25 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose to-blush flex items-center justify-center text-pearl shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            {kpis.revenueChangePercent !== null && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  kpis.revenueChangePercent >= 0
                    ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                    : "bg-rose/15 text-deep-rose border-rose/30"
                }`}
              >
                {kpis.revenueChangePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="tabular-nums">
                  {kpis.revenueChangePercent >= 0 ? "+" : ""}
                  {kpis.revenueChangePercent}%
                </span>
              </span>
            )}
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl font-normal text-plum tracking-tight tabular-nums">
            <CountUpNumber value={kpis.revenueThisMonth} suffix=" DA" />
          </h3>
          <p className="text-xs text-plum/80 font-medium mt-1">Revenue This Month</p>
          <p className="text-[11px] text-plum/50 font-light mt-0.5">
            Completed reservations sum
          </p>
        </motion.div>

        {/* KPI 3: Today's appointments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 shadow-sm hover:border-rose/25 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-plum to-deep-rose flex items-center justify-center text-pearl shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose/10 text-deep-rose border border-rose/20">
              Today
            </span>
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl font-normal text-plum tracking-tight tabular-nums">
            <CountUpNumber value={kpis.todayAppointments} />
          </h3>
          <p className="text-xs text-plum/80 font-medium mt-1">Today&apos;s Appointments</p>
          <p className="text-[11px] text-plum/50 font-light mt-0.5">
            Scheduled sessions today
          </p>
        </motion.div>

        {/* KPI 4: New requests waiting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="rounded-3xl bg-gradient-to-br from-white/90 via-white/75 to-rose/15 dark:from-surface-elevated/90 dark:via-surface-elevated/75 dark:to-rose/10 border-2 border-rose/30 p-6 shadow-[0_8px_30px_rgba(184,74,110,0.08)] dark:shadow-[0_0_24px_rgba(243,166,189,0.08)] transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-deep-rose to-plum flex items-center justify-center text-pearl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-deep-rose text-pearl">
              Pending
            </span>
          </div>
          <h3 className="font-heading text-3xl sm:text-4xl font-normal text-plum tracking-tight tabular-nums">
            <CountUpNumber value={kpis.pendingRequests} />
          </h3>
          <p className="text-xs text-plum/80 font-medium mt-1">New Requests Waiting</p>
          <p className="text-[11px] text-deep-rose font-medium mt-0.5">
            Awaiting admin confirmation
          </p>
        </motion.div>
      </div>

      {/* ── 3. Charts Row 1: Clients Per Month (Stacked Bar) + Revenue Per Month (Smooth Area) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Clients Per Month (Stacked Bar) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-rose/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-deep-rose" />
                  <h2 className="font-heading text-2xl font-light text-plum">
                    Clients Per Month
                  </h2>
                </div>
                <p className="text-xs text-plum/60 font-light mt-0.5">
                  Completed vs. upcoming bookings (non-cancelled)
                </p>
              </div>

              {/* Period toggle: 6 or 12 months */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-pearl/80 dark:bg-surface/80 border border-rose/20 text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPeriodMonths(6)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    periodMonths === 6
                      ? "bg-deep-rose text-pearl shadow-xs"
                      : "text-plum/60 hover:text-plum"
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodMonths(12)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    periodMonths === 12
                      ? "bg-deep-rose text-pearl shadow-xs"
                      : "text-plum/60 hover:text-plum"
                  }`}
                >
                  12 Months
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-64 sm:h-72 mt-2">
              {isMounted && clientsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientsData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(184, 74, 110, 0.12)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "currentColor", opacity: 0.65, fontSize: 11, fontFamily: "var(--font-body)" }}
                      axisLine={{ stroke: "rgba(184, 74, 110, 0.2)" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "currentColor", opacity: 0.65, fontSize: 11, fontFamily: "var(--font-body)" }}
                      axisLine={{ stroke: "rgba(184, 74, 110, 0.2)" }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<GlassTooltip />}
                      cursor={{ fill: "rgba(232, 138, 166, 0.1)" }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontFamily: "var(--font-body)" }}
                    />
                    <Bar
                      dataKey="completed"
                      name="Completed"
                      stackId="clients"
                      fill="var(--color-deep-rose)"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar
                      dataKey="upcoming"
                      name="Upcoming"
                      stackId="clients"
                      fill="var(--color-rose)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-plum/50">
                  Loading chart statistics...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-rose/10 flex items-center justify-between text-[11px] text-plum/55">
            <span>Aggregated by reservation date</span>
            <span className="font-medium text-deep-rose">
              Total {clientsData.reduce((acc, curr) => acc + curr.total, 0)} clients
            </span>
          </div>
        </motion.div>

        {/* Chart 2: Revenue Per Month (Smooth Area Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-rose/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-deep-rose" />
                  <h2 className="font-heading text-2xl font-light text-plum">
                    Revenue Per Month
                  </h2>
                </div>
                <p className="text-xs text-plum/60 font-light mt-0.5">
                  Sum of completed client reservations
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose/10 text-deep-rose border border-rose/20 self-start sm:self-auto">
                {periodMonths} Months Trend
              </span>
            </div>

            {/* Area Chart with Pink Gradient Fill */}
            <div className="w-full h-64 sm:h-72 mt-2">
              {isMounted && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-deep-rose)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-rose)"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(184, 74, 110, 0.12)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "currentColor", opacity: 0.65, fontSize: 11, fontFamily: "var(--font-body)" }}
                      axisLine={{ stroke: "rgba(184, 74, 110, 0.2)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "currentColor", opacity: 0.65, fontSize: 11, fontFamily: "var(--font-body)" }}
                      axisLine={{ stroke: "rgba(184, 74, 110, 0.2)" }}
                      tickLine={false}
                      tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                    />
                    <Tooltip
                      content={
                        <GlassTooltip
                          formatter={(val) => formatPrice(val)}
                        />
                      }
                      cursor={{ stroke: "var(--color-rose)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="var(--color-deep-rose)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-plum/50">
                  Loading revenue statistics...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-rose/10 flex items-center justify-between text-[11px] text-plum/55">
            <span>Completed services only</span>
            <span className="font-semibold text-deep-rose tabular-nums">
              {formatPrice(
                revenueData.reduce((acc, curr) => acc + curr.revenue, 0)
              )}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── 4. Charts Row 2: Most Booked Services (Donut) + Upcoming Appointments List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Most Booked Services (Donut Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-rose/10 mb-4">
              <PieIcon className="w-4 h-4 text-deep-rose" />
              <div>
                <h2 className="font-heading text-2xl font-light text-plum">
                  Most Booked Services
                </h2>
                <p className="text-xs text-plum/60 font-light mt-0.5">
                  Popularity breakdown by appointment count
                </p>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="w-full h-52 sm:h-56 relative flex items-center justify-center">
              {isMounted && stats.mostBookedServices.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={
                          <GlassTooltip
                            formatter={(val) => `${val} booking(s)`}
                          />
                        }
                      />
                      <Pie
                        data={stats.mostBookedServices}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {stats.mostBookedServices.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-semibold text-plum tabular-nums">
                      {stats.mostBookedServices.reduce(
                        (acc, curr) => acc + curr.count,
                        0
                      )}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-deep-rose tracking-wider">
                      Bookings
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-plum/50">No service data available</div>
              )}
            </div>

            {/* Interactive Donut Legend */}
            <div className="space-y-2 mt-4 pt-3 border-t border-rose/10">
              {stats.mostBookedServices.slice(0, 4).map((service, idx) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length],
                      }}
                    />
                    <span className="truncate font-medium text-plum">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-deep-rose tabular-nums">
                      {service.count}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose/10 text-plum/70 font-semibold tabular-nums">
                      {service.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Appointments List (Next 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 rounded-3xl bg-white/75 dark:bg-surface-elevated/75 backdrop-blur-xl border border-rose/15 dark:border-rose/20 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-rose/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-deep-rose" />
                  <h2 className="font-heading text-2xl font-light text-plum">
                    Upcoming Appointments
                  </h2>
                </div>
                <p className="text-xs text-plum/60 font-light mt-0.5">
                  Next 5 sessions scheduled with quick contact actions
                </p>
              </div>

              <Link
                href="/admin/reservations"
                className="text-xs font-semibold text-deep-rose hover:text-plum flex items-center gap-1 transition-colors"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List */}
            {stats.upcomingAppointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-plum/50">
                No upcoming appointments scheduled at this moment.
              </div>
            ) : (
              <div className="divide-y divide-rose/10">
                {stats.upcomingAppointments.map((apt) => {
                  const initials = apt.name
                    ? apt.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "R";

                  return (
                    <div
                      key={apt.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose/5 px-2 rounded-2xl transition-colors"
                    >
                      {/* Left: Avatar, Name & Service */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-deep-rose via-rose to-blush flex items-center justify-center text-pearl font-semibold text-xs shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-plum truncate">
                            {apt.name}
                          </p>
                          <p className="text-xs text-plum/60 truncate">
                            {apt.service} &bull;{" "}
                            <span className="font-semibold text-deep-rose tabular-nums">
                              {formatPrice(apt.price)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Middle: Schedule */}
                      <div className="flex items-center gap-2 text-xs text-plum/75 pl-13 sm:pl-0 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-deep-rose shrink-0" />
                        <span className="font-medium">{apt.date}</span>
                        <span className="text-plum/40">&bull;</span>
                        <span className="font-semibold text-plum">{apt.time}</span>
                      </div>

                      {/* Right: Quick Contact Actions & Status */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                        <ReservationContactActions
                          phone={apt.phone}
                          clientName={apt.name}
                        />

                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                            apt.status === "new"
                              ? "bg-rose/15 text-deep-rose border-rose/30"
                              : "bg-emerald-500/15 text-emerald-700 border-emerald-500/25"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-rose/10 flex items-center justify-between text-xs text-plum/60">
            <span>Showing next 5 studio appointments</span>
            <Link
              href="/admin/reservations"
              className="text-deep-rose font-medium hover:underline"
            >
              Open reservations management &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
