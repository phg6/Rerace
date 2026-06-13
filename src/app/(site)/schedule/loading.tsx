export default function ScheduleLoading() {
  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-9 w-64" />
        <div className="skeleton mt-3 h-4 w-72 max-w-full" />
      </header>
      <div className="skeleton h-52 w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
