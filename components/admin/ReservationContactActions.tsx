"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Send } from "lucide-react";
import { getContactLinks } from "@/lib/phone";

interface ReservationContactActionsProps {
  phone: string;
  clientName: string;
}

export default function ReservationContactActions({
  phone,
  clientName,
}: ReservationContactActionsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const { callUrl, whatsappUrl, telegramUrl } = getContactLinks(phone);

  const actions = [
    {
      id: "call",
      label: `Call ${clientName} (${phone})`,
      shortLabel: "Call client",
      href: callUrl,
      icon: Phone,
      color: "hover:bg-deep-rose hover:text-pearl text-deep-rose bg-rose/10 border-rose/25",
    },
    {
      id: "whatsapp",
      label: "Open WhatsApp chat",
      shortLabel: "WhatsApp",
      href: whatsappUrl,
      icon: MessageCircle,
      color: "hover:bg-emerald-600 hover:text-pearl text-emerald-700 bg-emerald-500/15 border-emerald-500/30",
    },
    {
      id: "telegram",
      label: "Open Telegram chat",
      shortLabel: "Telegram",
      href: telegramUrl,
      icon: Send,
      color: "hover:bg-sky-600 hover:text-pearl text-sky-700 bg-sky-500/15 border-sky-500/30",
    },
  ];

  return (
    <div className="flex items-center gap-1.5 relative">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.id} className="relative">
            <motion.a
              href={action.href}
              target={action.id === "call" ? undefined : "_blank"}
              rel={action.id === "call" ? undefined : "noopener noreferrer"}
              aria-label={action.label}
              whileHover={{ scale: 1.12, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setActiveTooltip(action.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip(action.id)}
              onBlur={() => setActiveTooltip(null)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-xs ${action.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </motion.a>

            {/* Tooltip */}
            <AnimatePresence>
              {activeTooltip === action.id && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap px-2.5 py-1 rounded-xl bg-plum text-pearl text-[11px] font-medium shadow-md shadow-plum/20"
                >
                  {action.shortLabel}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-plum" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
