"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Calendar } from "lucide-react";

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
];

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Admin Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-surface/90 backdrop-blur-2xl border-t border-rose/15 dark:border-rose/20 safe-bottom px-4 py-2 shadow-lg flex items-center justify-around"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center py-1.5 px-6 rounded-2xl text-xs font-medium transition-colors ${
              isActive ? "text-plum font-semibold" : "text-plum/60 hover:text-plum"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="admin-mobile-active-pill"
                className="absolute inset-0 bg-rose/15 rounded-2xl border border-rose/25 -z-10"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
            <Icon
              className={`w-5 h-5 mb-0.5 transition-colors ${
                isActive ? "text-deep-rose" : "text-plum/50"
              }`}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
