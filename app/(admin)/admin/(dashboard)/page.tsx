import Link from "next/link";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight,
  HeartHandshake,
} from "lucide-react";

export default function AdminOverviewPage() {
  const stats = [
    {
      title: "Total Appointments",
      value: "28",
      change: "+14% this month",
      icon: Calendar,
      color: "from-deep-rose to-rose",
      badge: "Active",
    },
    {
      title: "Pending Requests",
      value: "4",
      change: "Requires review",
      icon: Sparkles,
      color: "from-rose to-blush",
      badge: "Action needed",
      highlight: true,
    },
    {
      title: "Confirmed Today",
      value: "6",
      change: "Starting 10:00",
      icon: CheckCircle2,
      color: "from-plum to-deep-rose",
      badge: "Today",
    },
    {
      title: "Estimated Revenue",
      value: "72 500 DA",
      change: "+8.5% vs last week",
      icon: TrendingUp,
      color: "from-deep-rose to-plum",
      badge: "Financials",
    },
  ];

  const recentBookings = [
    {
      id: "1",
      client: "Sarah Benali",
      phone: "+213 550 12 34 56",
      service: "Gel Polish Application",
      date: "Today, 10:00",
      price: "2 500 DA",
      status: "confirmed",
    },
    {
      id: "2",
      client: "Amina Kaci",
      phone: "+213 661 98 76 54",
      service: "Russian Manicure & Nail Art",
      date: "Today, 11:30",
      price: "4 200 DA",
      status: "new",
    },
    {
      id: "3",
      client: "Yasmine Meziane",
      phone: "+213 770 45 67 89",
      service: "BIAB Nail Strengthening",
      date: "Today, 14:00",
      price: "3 800 DA",
      status: "confirmed",
    },
    {
      id: "4",
      client: "Nadia Belkacem",
      phone: "+213 555 33 22 11",
      service: "Express Classic Manicure",
      date: "Tomorrow, 10:00",
      price: "1 800 DA",
      status: "new",
    },
  ];

  const statusStyles: Record<string, string> = {
    new: "bg-rose/15 text-deep-rose border-rose/30",
    confirmed: "bg-plum/10 text-plum border-plum/20",
    completed: "bg-blush/30 text-plum border-blush",
    cancelled: "bg-plum/5 text-plum/50 border-plum/10",
  };

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-rose/15 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(184,74,110,0.04)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose/10 border border-rose/20 text-xs font-semibold uppercase tracking-wider text-deep-rose mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Rosé Studio Command Center
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light text-plum">
            Welcome to Studio Overview
          </h1>
          <p className="text-sm text-plum/70 font-light mt-1.5 max-w-2xl">
            Monitor appointment bookings, review pending client requests, and manage studio availability.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/reservations"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-deep-rose hover:bg-plum text-pearl text-sm font-medium transition-all shadow-md shadow-deep-rose/20 cursor-pointer"
          >
            <span>Manage Reservations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── 4 Key Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${
                stat.highlight
                  ? "bg-gradient-to-br from-white/90 via-white/70 to-rose/10 border-2 border-rose/30 shadow-[0_8px_30px_rgba(184,74,110,0.08)]"
                  : "bg-white/70 backdrop-blur-xl border border-rose/15 hover:border-rose/25 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-pearl shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose/10 text-deep-rose border border-rose/20">
                  {stat.badge}
                </span>
              </div>
              <h3 className="font-heading text-3xl font-normal text-plum tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs text-plum/80 font-medium mt-1">
                {stat.title}
              </p>
              <p className="text-[11px] text-plum/50 font-light mt-0.5">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Main 2-Column Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments Preview */}
        <div className="lg:col-span-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-rose/15 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-rose/10 mb-4">
              <div>
                <h2 className="font-heading text-2xl font-light text-plum">
                  Recent Appointments
                </h2>
                <p className="text-xs text-plum/60 font-light mt-0.5">
                  Latest bookings submitted through the online studio portal
                </p>
              </div>
              <Link
                href="/admin/reservations"
                className="text-xs font-semibold text-deep-rose hover:text-plum flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-rose/10">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-rose/5 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose/15 flex items-center justify-center text-deep-rose font-heading text-sm font-semibold shrink-0">
                      {b.client[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-plum">{b.client}</p>
                      <p className="text-xs text-plum/60 font-light">
                        {b.service} &bull;{" "}
                        <span className="font-medium text-plum/70">{b.price}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0">
                    <div className="text-right text-xs text-plum/70 font-light">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-deep-rose" />
                        {b.date}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        statusStyles[b.status] || "bg-rose/10 text-plum"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-rose/10 flex items-center justify-between text-xs text-plum/60">
            <span>Showing 4 most recent reservations</span>
            <Link
              href="/admin/reservations"
              className="text-deep-rose font-medium hover:underline"
            >
              Open reservations table &rarr;
            </Link>
          </div>
        </div>

        {/* Studio Availability & Quick Info */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-rose/15 p-6 sm:p-7">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-deep-rose/10 text-deep-rose flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-light text-plum">
                  Studio Schedule
                </h3>
                <p className="text-xs text-plum/60">Today&apos;s hours &amp; capacity</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-rose/10">
                <span className="text-plum/70">Operating Hours</span>
                <span className="font-medium text-plum">10:00 — 19:00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-rose/10">
                <span className="text-plum/70">Max Capacity / Day</span>
                <span className="font-medium text-plum">8 sessions</span>
              </div>
              <div className="flex justify-between py-2 border-b border-rose/10">
                <span className="text-plum/70">Booked Slots</span>
                <span className="font-medium text-deep-rose">6 / 8 filled</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-plum/70">Walk-in Availability</span>
                <span className="font-medium text-plum">Limited</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-rose/15 via-white/80 to-blush/20 border border-rose/25 p-6">
            <div className="flex items-center gap-2.5 mb-2 text-deep-rose font-semibold text-xs uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4" />
              <span>Studio Quality Standard</span>
            </div>
            <p className="text-xs text-plum/75 leading-relaxed">
              Every appointment includes sterilised medical-grade tools, disposable files, and a complimentary hand massage with rose water.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
