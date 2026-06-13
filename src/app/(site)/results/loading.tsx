export default function ResultsLoading() {
  return (
    <div className="container-site space-y-10 pb-20 pt-10">
      <header>
        <div className="skeleton h-4 w-32" />
        <div className="skeleton mt-3 h-9 w-48" />
        <div className="skeleton mt-3 h-4 w-full max-w-xl" />
      </header>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
