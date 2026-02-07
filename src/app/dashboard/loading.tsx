export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-40 bg-[var(--border-subtle)] rounded animate-pulse" />
            <div className="h-4 w-64 bg-[var(--border-subtle)] rounded animate-pulse mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right space-y-1">
              <div className="h-4 w-24 bg-[var(--border-subtle)] rounded animate-pulse ml-auto" />
              <div className="h-3 w-36 bg-[var(--border-subtle)] rounded animate-pulse ml-auto" />
            </div>
            <div className="w-9 h-9 rounded-full bg-[var(--border-subtle)] animate-pulse" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <main className="p-6 space-y-6">
        {/* Filter bar skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-[var(--border-subtle)] rounded-lg animate-pulse" />
          <div className="h-10 w-48 bg-[var(--border-subtle)] rounded-lg animate-pulse" />
        </div>

        {/* Count skeleton */}
        <div className="h-3 w-36 bg-[var(--border-subtle)] rounded animate-pulse" />

        {/* Quiz card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5 space-y-3"
            >
              <div className="h-5 w-3/4 bg-[var(--border-subtle)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--border-subtle)] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--border-subtle)] rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-20 bg-[var(--border-subtle)] rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-[var(--border-subtle)] rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
