import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import TodayDetailedView from "@/components/admin/TodayDetailedView";
import { TodaySkeleton } from "@/components/admin/AdminSkeletons";
import type { TodayReservationItem } from "@/lib/admin/stats";

export const metadata = {
  title: "Today's Schedule | Rosé Nails Admin",
  description: "Live schedule, now/next actions, and timeline for today's appointments.",
};

async function TodayDataLoader() {
  await connection();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const todayDateFormatted = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let reservations: TodayReservationItem[] = [];
  const servicesDurationMap: Record<string, number> = {};

  try {
    const supabase = await createClient();

    // 1. Fetch today's reservations
    const { data: records, error: resError } = await supabase
      .from("reservations")
      .select("id, name, phone, service, price, date, time, note, status, created_at")
      .eq("date", todayStr)
      .order("time", { ascending: true });

    if (!resError && records) {
      reservations = records as TodayReservationItem[];
    }

    // 2. Fetch services to build duration mapping
    const { data: servicesData, error: servicesError } = await supabase
      .from("services")
      .select("name, duration_min");

    if (!servicesError && servicesData) {
      servicesData.forEach((svc) => {
        if (svc.name) {
          servicesDurationMap[svc.name.trim().toLowerCase()] = svc.duration_min || 60;
        }
      });
    }
  } catch (err) {
    console.error("Error loading today's schedule data:", err);
  }

  return (
    <TodayDetailedView
      initialReservations={reservations}
      servicesDurationMap={servicesDurationMap}
      todayDateFormatted={todayDateFormatted}
      todayStr={todayStr}
    />
  );
}

export default function AdminTodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <TodayDataLoader />
    </Suspense>
  );
}
