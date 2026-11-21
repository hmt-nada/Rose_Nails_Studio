import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ReservationsManager, {
  type Reservation,
} from "@/components/admin/ReservationsManager";
import { ReservationsSkeleton } from "@/components/admin/AdminSkeletons";

async function ReservationsDataLoader() {
  // Signals to Next.js that this Suspense boundary requires request-time data
  await connection();

  let reservations: Reservation[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reservations")
      .select("id, name, phone, service, price, date, time, note, status, created_at")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (!error && data) {
      reservations = data as Reservation[];
    }
  } catch (err) {
    console.error("Error loading reservations in Server Component:", err);
  }

  return <ReservationsManager initialReservations={reservations} />;
}

export default function AdminReservationsPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-plum tracking-tight">
            Reservations Management
          </h1>
          <p className="text-sm text-plum/60 font-normal mt-1 leading-relaxed">
            Review live bookings, update appointment statuses, and connect with clients via phone, WhatsApp, or Telegram.
          </p>
        </div>
      </div>

      {/* ── Dynamic Data Loader with Suspense Skeleton ── */}
      <Suspense fallback={<ReservationsSkeleton />}>
        <ReservationsDataLoader />
      </Suspense>
    </div>
  );
}
