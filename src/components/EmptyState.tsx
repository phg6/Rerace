import Link from "next/link";
import { cn } from "@/lib/utils";

/** Branded empty / error state: red-flag illustration + helpful CTA. */
export function EmptyState({
  title,
  message,
  ctaHref,
  ctaLabel,
  className,
}: {
  title: string;
  message?: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("glass flex flex-col items-center px-8 py-16 text-center", className)}>
      <svg viewBox="0 0 120 90" className="mb-6 h-20 w-28" aria-hidden>
        <rect x="14" y="8" width="4" height="74" rx="2" fill="#3f3f46" />
        <path d="M18 12 h66 a4 4 0 0 1 4 4 v26 a4 4 0 0 1 -4 4 h-66 z" fill="#e10600" opacity="0.9" />
        <path d="M18 12 h66 a4 4 0 0 1 4 4 v26 a4 4 0 0 1 -4 4 h-66 z" fill="url(#es-shine)" />
        <defs>
          <linearGradient id="es-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="84" rx="34" ry="3" fill="#18181b" />
      </svg>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-zinc-400">{message}</p>}
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="btn-glass mt-6">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
