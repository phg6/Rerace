import { seriesMeta } from "@/lib/series";
import { cn } from "@/lib/utils";

/** Small per-series accent tag — subtle color coding, Rerace red stays primary. */
export function SeriesTag({ series, className }: { series: string; className?: string }) {
  const meta = seriesMeta(series);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-300",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.shortName}
    </span>
  );
}
