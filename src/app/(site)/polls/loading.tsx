export default function PollsLoading() {
  return (
    <div className="container-site space-y-12 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-28" />
        <div className="skeleton mt-3 h-9 w-52" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="max-w-2xl">
        <div className="skeleton h-72 w-full" />
      </div>
      <div className="max-w-3xl space-y-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
