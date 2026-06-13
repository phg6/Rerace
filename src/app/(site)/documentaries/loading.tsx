export default function DocumentariesLoading() {
  return (
    <div className="container-site pb-20 pt-10">
      <header className="max-w-3xl">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton mt-3 h-9 w-64" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton">
            <div className="aspect-video w-full" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-full rounded bg-white/[0.06]" />
              <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
              <div className="h-3 w-1/3 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
