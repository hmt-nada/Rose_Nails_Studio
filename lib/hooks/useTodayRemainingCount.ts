"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook that tracks the live remaining appointments count for today (status in 'new' | 'confirmed').
 * Updates in realtime via Supabase postgres changes.
 */
export function useTodayRemainingCount(): number {
  const [remainingCount, setRemainingCount] = useState<number>(0);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

    let isMounted = true;

    async function fetchCount() {
      try {
        const { count, error } = await supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("date", todayStr)
          .in("status", ["new", "confirmed"]);

        if (!error && count !== null && isMounted) {
          setRemainingCount(count);
        }
      } catch (err) {
        console.warn("Failed to fetch today remaining count:", err);
      }
    }

    fetchCount();

    // Subscribe to realtime changes with unique channel ID
    const channelId = `today-count-${Math.random().toString(36).slice(2, 9)}`;
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
          const newRecord = payload.new as { date?: string; status?: string } | undefined;
          const oldRecord = payload.old as { date?: string; status?: string } | undefined;

          // If either new or old record touches today's date, refresh count
          if (newRecord?.date === todayStr || oldRecord?.date === todayStr) {
            fetchCount();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return remainingCount;
}
