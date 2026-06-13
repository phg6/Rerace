export default function TeamsLoading() {
  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-28" />
        <div className="skeleton mt-3 h-9 w-72 max-w-full" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-80" />
        ))}
      </div>
    </div>
  );
}
