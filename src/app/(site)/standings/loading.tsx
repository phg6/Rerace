export default function StandingsLoading() {
  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-28" />
        <div className="skeleton mt-3 h-9 w-56" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-36 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 pt-5 sm:grid-cols-3 sm:items-end">
        <div className="skeleton h-64" />
        <div className="skeleton h-72" />
        <div className="skeleton h-64" />
      </div>
      <div className="skeleton h-96 w-full" />
    </div>
  );
}
