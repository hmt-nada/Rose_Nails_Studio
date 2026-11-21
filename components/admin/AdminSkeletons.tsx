export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-rose/15 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-rose/15" />
        <div className="w-14 h-5 rounded-full bg-rose/10" />
      </div>
      <div className="w-20 h-8 rounded-lg bg-plum/10 mb-2" />
      <div className="w-32 h-4 rounded-md bg-plum/5" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-rose/10 animate-pulse">
      <td className="py-4 px-4">
        <div className="w-28 h-4 rounded bg-plum/10 mb-1" />
        <div className="w-20 h-3 rounded bg-plum/5" />
      </td>
      <td className="py-4 px-4">
        <div className="w-24 h-4 rounded bg-plum/10" />
      </td>
      <td className="py-4 px-4">
        <div className="w-24 h-4 rounded bg-plum/10" />
      </td>
      <td className="py-4 px-4">
        <div className="w-16 h-4 rounded bg-plum/10" />
      </td>
      <td className="py-4 px-4">
        <div className="w-20 h-6 rounded-full bg-rose/15" />
      </td>
      <td className="py-4 px-4 text-right">
        <div className="w-16 h-8 rounded-lg bg-rose/10 ml-auto" />
      </td>
    </tr>
  );
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl bg-white/60 border border-rose/15 p-6 sm:p-8">
        <div className="w-48 h-8 rounded-lg bg-plum/10 mb-2" />
        <div className="w-72 h-4 rounded-md bg-plum/5" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white/60 border border-rose/15 p-6 h-80" />
        <div className="rounded-3xl bg-white/60 border border-rose/15 p-6 h-80" />
      </div>
    </div>
  );
}

export function ReservationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="w-48 h-8 rounded-lg bg-plum/10 mb-2" />
          <div className="w-64 h-4 rounded-md bg-plum/5" />
        </div>
        <div className="w-36 h-10 rounded-full bg-rose/15" />
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white/60 border border-rose/15 p-4 flex gap-3">
        <div className="w-64 h-10 rounded-xl bg-plum/5" />
        <div className="w-32 h-10 rounded-xl bg-plum/5" />
      </div>

      {/* Table Shell */}
      <div className="rounded-3xl bg-white/60 border border-rose/15 overflow-hidden p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rose/10">
              {["Client", "Service", "Date & Time", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left py-3 px-4">
                  <div className="w-16 h-3 rounded bg-plum/10" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
