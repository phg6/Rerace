export default function NewsLoading() {
  return (
    <div className="container-site space-y-10 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-9 w-44" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>

      <div className="skeleton h-[340px] w-full sm:h-[440px]" />

      <div className="space-y-6">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
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
    </div>
  );
}
