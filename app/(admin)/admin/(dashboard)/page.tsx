import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeDashboardStats } from "@/lib/admin/stats";
import OverviewDashboardClient from "@/components/admin/OverviewDashboardClient";
import { OverviewSkeleton } from "@/components/admin/AdminSkeletons";

async function OverviewDataLoader() {
  // Signals request-time dynamic evaluation to avoid static prerender errors
  await connection();

  const supabase = await createClient();
  const stats = await computeDashboardStats(supabase);

  return <OverviewDashboardClient stats={stats} />;
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewDataLoader />
    </Suspense>
  );
}
