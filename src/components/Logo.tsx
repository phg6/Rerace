import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, asLink = true }: { className?: string; asLink?: boolean }) {
  const mark = (
    <span
      className={cn(
        "font-display select-none text-xl tracking-[0.08em] text-white transition-colors",
        className
      )}
    >
      Rerace
    </span>
  );
  if (!asLink) return mark;
  return (
    <Link href="/" aria-label="Rerace — home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}
