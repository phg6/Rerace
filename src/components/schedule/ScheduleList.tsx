"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Play } from "lucide-react";
import { useNow } from "@/lib/hooks";
import { SERIES, seriesMeta } from "@/lib/series";
import type { EventStatus, SeriesKey } from "@/lib/types";
import { cn, sessionStatus } from "@/lib/utils";
import { SectionLabel } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { LivePill, LiveBar } from "@/components/LiveBadge";
import { Countdown } from "@/components/Countdown";
import { ReminderButton } from "@/components/ReminderButton";
import { EmptyState } from "@/components/EmptyState";

/** Plain, serializable (event, session) pair passed from the server page. */
export interface ScheduleItem {
  eventId: string;
  eventTitle: string;
  series: SeriesKey;
  circuit: string;
  country: string;
  image?: string;
  sessionKey: string;
  sessionName: string;
  startsAt: string;
  endsAt?: string;
}

function statusOf(item: ScheduleItem, now: number): EventStatus {
  return sessionStatus(
    { key: item.sessionKey, name: item.sessionName, startsAt: item.startsAt, endsAt: item.endsAt },
    now
  );
}

function dayLabel(d: Date, now: number): string {
  const today = new Date(now);
  const tomorrow = new Date(now + 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function Row({ item, live }: { item: ScheduleItem; live: boolean }) {
  return (
    <TiltCard maxTilt={3} className={cn("p-4", live && "border-race/40")}>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image || seriesMeta(item.series).poster}
          alt=""
          loading="lazy"
          className="hidden h-14 w-24 shrink-0 rounded-xl object-cover sm:block"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeriesTag series={item.series} />
            <p className="truncate text-sm font-semibold text-white">{item.eventTitle}</p>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {item.sessionName}
            {" · "}
            <LocalTime iso={item.startsAt} mode="time" className="font-semibold text-zinc-200" />
            {!live && (
              <>
                {" · "}
                <LocalTime iso={item.startsAt} mode="relative" className="text-race-bright" />
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {live ? (
            <>
              <LivePill className="hidden sm:inline-flex" />
              <Link href={`/watch/${item.eventId}`} className="btn-race px-4 py-2 text-xs">
                <Play className="h-3.5 w-3.5 fill-white" /> Watch
              </Link>
            </>
          ) : (
            <>
              <ReminderButton
                eventId={item.eventId}
                sessionKey={item.sessionKey}
                sessionName={item.sessionName}
                startsAt={item.startsAt}
                compact
              />
              <Link href={`/watch/${item.eventId}`} className="btn-glass hidden h-8 px-3 text-xs md:inline-flex">
                Event page
              </Link>
            </>
          )}
        </div>
      </div>
      {live && <LiveBar className="mt-3" />}
    </TiltCard>
  );
}

/** Unified chronological schedule: series chips + day groups in the viewer's timezone. */
export function ScheduleList({ items }: { items: ScheduleItem[] }) {
  const [filter, setFilter] = useState<"all" | SeriesKey>("all");
  // null until mounted — day grouping must happen in the viewer's timezone only.
  const now = useNow(30_000);

  const presentSeries = useMemo(
    () => (Object.keys(SERIES) as SeriesKey[]).filter((key) => items.some((i) => i.series === key)),
    [items]
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="Red flag — nothing on the schedule"
        message="No upcoming sessions found right now. Check back soon or browse the replay library."
        ctaHref="/replays"
        ctaLabel="Browse replays"
      />
    );
  }

  const chip = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race",
      active
        ? "border-race/70 bg-race/15 text-white shadow-glow-red"
        : "border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
    );

  const chips = (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter schedule by series">
      <button type="button" onClick={() => setFilter("all")} className={chip(filter === "all")} aria-pressed={filter === "all"}>
        All series
      </button>
      {presentSeries.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setFilter(key)}
          className={chip(filter === key)}
          aria-pressed={filter === key}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SERIES[key].color }} />
          {SERIES[key].shortName}
        </button>
      ))}
    </div>
  );

  // Pre-hydration: skeletons (grouping depends on the viewer's clock + timezone).
  if (now === null) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-52 w-full" />
        {chips}
        <div className="space-y-3">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    );
  }

  const visible = (filter === "all" ? items : items.filter((i) => i.series === filter)).filter(
    (i) => statusOf(i, now) !== "finished"
  );
  const nextUp = visible.find((i) => statusOf(i, now) === "upcoming");

  const groups: { key: string; label: string; items: ScheduleItem[] }[] = [];
  for (const item of visible) {
    const d = new Date(item.startsAt);
    const key = d.toLocaleDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({ key, label: dayLabel(d, now), items: [item] });
    }
  }

  return (
    <div className="space-y-8">
      {/* ============ NEXT SESSION COUNTDOWN ============ */}
      {nextUp && (
        <div className="glass-strong relative overflow-hidden p-6 sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={nextUp.image || seriesMeta(nextUp.series).poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/75 to-night/30" />
          <div className="relative">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <SectionLabel>Next session</SectionLabel>
              <SeriesTag series={nextUp.series} />
            </div>
            <h2 className="text-balance text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {nextUp.eventTitle} — {nextUp.sessionName}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              {nextUp.circuit} · {nextUp.country} ·{" "}
              <LocalTime iso={nextUp.startsAt} mode="weekday-time" className="font-semibold text-zinc-200" />
            </p>
            <Countdown to={nextUp.startsAt} className="mt-5" />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={`/watch/${nextUp.eventId}`} className="btn-glass">
                <CalendarDays className="h-4 w-4" /> Event page
              </Link>
              <ReminderButton
                eventId={nextUp.eventId}
                sessionKey={nextUp.sessionKey}
                sessionName={nextUp.sessionName}
                startsAt={nextUp.startsAt}
              />
            </div>
          </div>
        </div>
      )}

      {chips}

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing upcoming for this series"
          message="No scheduled sessions match this filter right now — try another series."
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key}>
              <div className="sticky top-16 z-20 -mx-2 mb-3 bg-night/85 px-2 py-2 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">{group.label}</h3>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <Row key={`${item.eventId}-${item.sessionKey}`} item={item} live={statusOf(item, now) === "live"} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
