"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download,
  RefreshCw,
} from "lucide-react";

interface ReservationItem {
  id: string;
  client: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  price: string;
  note?: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
}

const INITIAL_RESERVATIONS: ReservationItem[] = [
  {
    id: "res-001",
    client: "Sarah Benali",
    phone: "+213 550 12 34 56",
    service: "Gel Polish Application",
    date: "2026-11-22",
    time: "10:00",
    price: "2 500 DA",
    note: "Prefers soft nude shades.",
    status: "confirmed",
  },
  {
    id: "res-002",
    client: "Amina Kaci",
    phone: "+213 661 98 76 54",
    service: "Russian Manicure & Nail Art",
    date: "2026-11-22",
    time: "11:30",
    price: "4 200 DA",
    note: "Minimalist floral nail art on two fingers.",
    status: "new",
  },
  {
    id: "res-003",
    client: "Yasmine Meziane",
    phone: "+213 770 45 67 89",
    service: "BIAB Nail Strengthening",
    date: "2026-11-22",
    time: "14:00",
    price: "3 800 DA",
    status: "confirmed",
  },
  {
    id: "res-004",
    client: "Nadia Belkacem",
    phone: "+213 555 33 22 11",
    service: "Classic Manicure Express",
    date: "2026-11-23",
    time: "10:00",
    price: "1 800 DA",
    status: "new",
  },
  {
    id: "res-005",
    client: "Leila Haddad",
    phone: "+213 662 44 55 66",
    service: "Luxury Spa Pedicure & Polish",
    date: "2026-11-21",
    time: "16:00",
    price: "4 500 DA",
    status: "completed",
  },
  {
    id: "res-006",
    client: "Meriem Ouali",
    phone: "+213 551 77 88 99",
    service: "Gel Extension Full Set",
    date: "2026-11-20",
    time: "15:30",
    price: "5 500 DA",
    status: "cancelled",
  },
];

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default function AdminReservationsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [reservations, setReservations] = useState<ReservationItem[]>(INITIAL_RESERVATIONS);

  const filteredReservations = reservations.filter((item) => {
    const matchesSearch =
      item.client.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      item.service.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === "all" || item.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const updateStatus = (id: string, newStatus: ReservationItem["status"]) => {
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const getStatusBadge = (status: ReservationItem["status"]) => {
    switch (status) {
      case "new":
        return "bg-rose/15 text-deep-rose border-rose/30";
      case "confirmed":
        return "bg-plum/10 text-plum border-plum/20";
      case "completed":
        return "bg-blush/30 text-plum border-blush";
      case "cancelled":
        return "bg-plum/5 text-plum/50 border-plum/10";
      default:
        return "bg-rose/10 text-plum";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light text-plum">
            Reservations Management
          </h1>
          <p className="text-sm text-plum/70 font-light mt-1">
            Review, confirm, and update studio appointment bookings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReservations(INITIAL_RESERVATIONS)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 hover:bg-white border border-rose/20 text-xs sm:text-sm font-medium text-plum transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-deep-rose" />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-deep-rose hover:bg-plum text-pearl text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-md shadow-deep-rose/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-rose/15 p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, phone, service..."
            className="w-full pl-10 pr-4 py-2.5 bg-pearl/60 border border-rose/25 rounded-2xl text-xs sm:text-sm text-plum placeholder:text-plum/40 focus:outline-none focus:ring-2 focus:ring-rose/30 focus:border-rose transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-deep-rose text-pearl shadow-sm shadow-deep-rose/20"
                    : "bg-white/60 text-plum/70 hover:text-plum hover:bg-rose/10 border border-rose/15"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Reservations Table Shell (Desktop) & Cards (Mobile) ── */}
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-rose/15 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-plum">
            <thead>
              <tr className="border-b border-rose/15 bg-pearl/40 uppercase tracking-wider text-[11px] font-semibold text-plum/60">
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Date &amp; Time</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose/10">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-plum/50">
                    No reservations match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((item) => (
                  <tr key={item.id} className="hover:bg-rose/5 transition-colors">
                    {/* Client */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose/15 flex items-center justify-center text-deep-rose font-heading font-medium text-sm">
                          {item.client[0]}
                        </div>
                        <div>
                          <p className="font-medium text-plum">{item.client}</p>
                          <p className="text-[11px] text-plum/60 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-deep-rose" />
                            {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-6">
                      <p className="font-medium text-plum">{item.service}</p>
                      {item.note && (
                        <p className="text-[11px] text-plum/55 italic line-clamp-1 max-w-xs mt-0.5">
                          &ldquo;{item.note}&rdquo;
                        </p>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-deep-rose" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-plum/60 mt-0.5">
                        <Clock className="w-3 h-3 text-deep-rose" />
                        <span>{item.time}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6 font-semibold text-deep-rose">
                      {item.price}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === "new" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "confirmed")}
                            title="Confirm Booking"
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "cancelled" && item.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(item.id, "cancelled")}
                            title="Cancel Booking"
                            className="p-1.5 rounded-lg text-plum/40 hover:text-plum hover:bg-rose/10 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="More options"
                          className="p-1.5 rounded-lg text-plum/40 hover:text-plum hover:bg-rose/10 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-rose/10">
          {filteredReservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-plum/50">
              No reservations match your filter.
            </div>
          ) : (
            filteredReservations.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-rose/15 flex items-center justify-center text-deep-rose font-heading font-medium">
                      {item.client[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-plum">{item.client}</p>
                      <p className="text-xs text-plum/60 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-deep-rose" />
                        {item.phone}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-pearl/50 rounded-2xl p-3 border border-rose/10">
                  <p className="font-medium text-plum">{item.service}</p>
                  <div className="flex items-center justify-between text-plum/70 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-deep-rose" />
                      {item.date} at {item.time}
                    </span>
                    <span className="font-semibold text-deep-rose">{item.price}</span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {item.status === "new" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "confirmed")}
                      className="px-3 py-1.5 rounded-full bg-emerald-600 text-pearl text-xs font-medium cursor-pointer"
                    >
                      Confirm
                    </button>
                  )}
                  {item.status !== "cancelled" && item.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, "cancelled")}
                      className="px-3 py-1.5 rounded-full bg-rose/15 text-deep-rose text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
