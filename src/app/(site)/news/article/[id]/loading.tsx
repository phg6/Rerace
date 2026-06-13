export default function ArticleLoading() {
  return (
    <div className="container-site pb-20 pt-10">
      <div className="mx-auto max-w-3xl">
        <div className="skeleton h-8 w-28 rounded-full" />
        <div className="mt-8 flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton mt-4 h-10 w-full" />
        <div className="skeleton mt-3 h-10 w-3/4" />
        <div className="skeleton mt-5 h-4 w-56" />
        <div className="skeleton mt-8 aspect-video w-full" />
        <div className="skeleton mt-8 h-14 w-full" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-4" style={{ width: `${100 - (i % 3) * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
