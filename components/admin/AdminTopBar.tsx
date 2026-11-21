"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Loader2, Sparkles, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useManageServicesModal } from "./ManageServicesContext";

interface AdminTopBarProps {
  initialEmail?: string | null;
}

export default function AdminTopBar({ initialEmail }: AdminTopBarProps) {
  const router = useRouter();
  const { openModal } = useManageServicesModal();
  const [userEmail, setUserEmail] = useState<string | null>(initialEmail || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (userEmail) return;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });
    } catch {
      // Ignore if offline or not logged in yet
    }
  }, [userEmail]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-rose/15 bg-white/70 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand / Page Indicator */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-deep-rose to-rose flex items-center justify-center text-pearl shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-heading text-lg font-medium text-plum leading-none">
            Rosé Nails
          </span>
        </div>
      </div>

      <div className="hidden md:block">
        <p className="text-xs uppercase tracking-widest text-plum/50 font-medium">
          Management Portal
        </p>
      </div>

      {/* Right controls: Manage Services Button, Admin Email & Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Manage Services Button */}
        <button
          type="button"
          onClick={openModal}
          title="Open services and pricing management modal"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-deep-rose bg-rose/10 hover:bg-rose/20 border border-rose/25 transition-all cursor-pointer shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Manage Services</span>
          <span className="sm:hidden">Services</span>
        </button>

        {/* Admin Email Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose/10 border border-rose/20 text-xs sm:text-sm font-medium text-plum/85 max-w-[150px] sm:max-w-xs truncate">
          <User className="w-3.5 h-3.5 text-deep-rose shrink-0" />
          <span className="truncate">{userEmail || "admin@rosenails.com"}</span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Log out"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-plum/80 hover:text-plum hover:bg-rose/10 border border-transparent hover:border-rose/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-deep-rose" />
          ) : (
            <LogOut className="w-3.5 h-3.5 text-deep-rose" />
          )}
          <span className="hidden sm:inline">
            {isLoggingOut ? "Signing out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
