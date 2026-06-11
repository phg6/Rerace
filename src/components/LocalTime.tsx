"use client";

import { useEffect, useState } from "react";

/**
 * Renders an ISO timestamp in the viewer's own timezone.
 * Server renders UTC as a stable fallback, then hydrates to local time.
 */
export function LocalTime({
  iso,
  mode = "datetime",
  className,
}: {
  iso: string;
  mode?: "datetime" | "time" | "date" | "weekday-time" | "relative";
  className?: string;
}) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date(iso);
    if (mode === "relative") {
      setText(relative(d));
      const t = setInterval(() => setText(relative(d)), 30_000);
      return () => clearInterval(t);
    }
    const opts: Intl.DateTimeFormatOptions =
      mode === "time"
        ? { hour: "2-digit", minute: "2-digit" }
        : mode === "date"
          ? { weekday: "short", day: "numeric", month: "short" }
          : mode === "weekday-time"
            ? { weekday: "long", hour: "2-digit", minute: "2-digit" }
            : { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
    setText(new Intl.DateTimeFormat(undefined, opts).format(d));
  }, [iso, mode]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text ?? fallbackUtc(iso, mode)}
    </time>
  );
}

function fallbackUtc(iso: string, mode: string): string {
  const d = new Date(iso);
  if (mode === "relative") return "";
  const opts: Intl.DateTimeFormatOptions =
    mode === "time"
      ? { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }
      : { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-GB", opts).format(d) + " UTC";
}

function relative(d: Date): string {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60_000);
  const fmt = (v: number, unit: string) => (diff >= 0 ? `in ${v}${unit}` : `${v}${unit} ago`);
  if (min < 60) return fmt(Math.max(min, 1), "m");
  const h = Math.floor(min / 60);
  if (h < 48) return fmt(h, "h");
  return fmt(Math.floor(h / 24), "d");
}

/** "All times shown in your timezone" helper with detected zone name. */
export function TimezoneNote({ className }: { className?: string }) {
  const [zone, setZone] = useState<string | null>(null);
  useEffect(() => {
    setZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  return (
    <span className={className} suppressHydrationWarning>
      All times shown in your timezone{zone ? ` — ${zone.replace(/_/g, " ")}` : ""}.
    </span>
  );
}
