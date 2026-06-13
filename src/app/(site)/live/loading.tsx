export default function LiveLoading() {
  return (
    <div className="container-site space-y-14 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-20" />
        <div className="skeleton mt-3 h-9 w-80 max-w-full" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton">
            <div className="aspect-video w-full" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-full rounded bg-white/[0.06]" />
              <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
