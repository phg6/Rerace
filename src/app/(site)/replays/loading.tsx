export default function ReplaysLoading() {
  return (
    <div className="container-site pb-20 pt-10">
      <header className="max-w-3xl">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton mt-3 h-9 w-44" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
        <div className="skeleton mt-4 h-7 w-72 rounded-full" />
      </header>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="skeleton h-64 md:col-span-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-44" />
        ))}
      </div>
    </div>
  );
}
