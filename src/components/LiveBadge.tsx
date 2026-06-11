import { cn } from "@/lib/utils";

export function LivePill({ className }: { className?: string }) {
  return (
    <span className={cn("live-pill", className)}>
      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-white" />
      Live
    </span>
  );
}

/** Slim animated red progress bar shown under live content. */
export function LiveBar({ className }: { className?: string }) {
  return <div className={cn("live-bar", className)} aria-hidden />;
}
