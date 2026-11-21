export default function ServicesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rose/10">
        <div>
          <div className="w-48 h-8 rounded-lg bg-plum/10 mb-2" />
          <div className="w-64 h-4 rounded-md bg-plum/5" />
        </div>
        <div className="w-32 h-10 rounded-full bg-rose/15" />
      </div>
      <div className="rounded-3xl bg-white/60 dark:bg-surface/60 border border-rose/15 p-6 h-96" />
    </div>
  );
}
