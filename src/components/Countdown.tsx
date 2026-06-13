"use client";

import { useNow } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function parts(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1_000) % 60,
    done: diff <= 0,
  };
}

/** Big animated countdown (hero / event pages). */
export function Countdown({ to, className }: { to: string; className?: string }) {
  const now = useNow(1000);

  if (now === null) {
    return <div className={cn("h-16", className)} aria-hidden />;
  }
  const t = parts(Date.parse(to), now);
  if (t.done) {
    return (
      <p className={cn("font-display text-2xl uppercase tracking-[0.2em] text-race-bright", className)}>
        Lights out
      </p>
    );
  }

  const cells = [
    { v: t.d, label: "days" },
    { v: t.h, label: "hrs" },
    { v: t.m, label: "min" },
    { v: t.s, label: "sec" },
  ].filter((c, i) => !(i === 0 && c.v === 0));

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} role="timer" aria-live="off">
      {cells.map((c) => (
        <div key={c.label} className="glass min-w-[64px] px-3 py-2 text-center">
          <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
            {String(c.v).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
