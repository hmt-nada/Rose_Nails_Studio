"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar, Sparkles } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Reservations",
    href: "/admin/reservations",
    icon: Calendar,
    exact: false,
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Sparkles,
    exact: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white/70 dark:bg-surface/80 backdrop-blur-xl border-r border-rose/15 dark:border-rose/20 p-6 shrink-0 sticky top-0 h-screen justify-between z-30">
      <div>
        {/* Brand Emblem */}
        <div className="flex items-center gap-3 px-2 py-3 mb-8">
          <BrandLogo size={38} priority />
          <div>
            <h2 className="font-heading text-xl font-medium tracking-wide text-plum leading-tight">
              Rosé Nails
            </h2>
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-deep-rose">
              Studio Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-plum font-semibold"
                    : "text-plum/60 hover:text-plum hover:bg-rose/5"
                }`}
              >
                {/* Active sliding pill */}
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-active-pill"
                    className="absolute inset-0 bg-rose/15 rounded-2xl border border-rose/25 -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-deep-rose" : "text-plum/50"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Status */}
      <div className="pt-4 border-t border-rose/15 px-2">
        <div className="flex items-center gap-2.5 text-xs text-plum/70">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-deep-rose opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-deep-rose" />
          </span>
          <span className="font-medium">Studio Live &bull; v1.0</span>
        </div>
      </div>
    </aside>
  );
}
