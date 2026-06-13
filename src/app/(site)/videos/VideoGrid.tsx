"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { SERIES, seriesMeta } from "@/lib/series";
import type { SeriesKey } from "@/lib/types";
import { cn, formatDuration } from "@/lib/utils";
import { TiltCard } from "@/components/TiltCard";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

/** Plain, serializable video shape passed from the server page. */
export interface VideoGridItem {
  id: string;
  title: string;
  series: SeriesKey;
  image?: string;
  /** channel / origin site */
  source?: string;
  durationMin?: number;
  publishedAt?: string;
}

function VideoCard({ video }: { video: VideoGridItem }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
    >
      <TiltCard className="flex h-full flex-col">
        <div className="relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.image || seriesMeta(video.series).poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="img-overlay" />
          <div className="absolute left-3 top-3">
            <SeriesTag series={video.series} />
          </div>
          {video.durationMin ? (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur">
              <Clock className="h-3 w-3" />
              {formatDuration(video.durationMin)}
            </span>
          ) : null}
          {/* play affordance on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-race/90 shadow-glow-red">
              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-race-bright">
            {video.title}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-zinc-500">
            {video.source ? (
              <span className="inline-flex min-w-0 items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5">
                <span className="truncate font-medium text-zinc-300">{video.source}</span>
              </span>
            ) : (
              <span />
            )}
            {video.publishedAt && <LocalTime iso={video.publishedAt} mode="relative" className="shrink-0" />}
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}

/** Filterable video grid — series chips over TiltCard clips. */
export function VideoGrid({ videos }: { videos: VideoGridItem[] }) {
  const [filter, setFilter] = useState<"all" | SeriesKey>("all");

  const presentSeries = useMemo(
    () => (Object.keys(SERIES) as SeriesKey[]).filter((key) => videos.some((v) => v.series === key)),
    [videos]
  );

  const filtered = filter === "all" ? videos : videos.filter((v) => v.series === filter);

  const chip = (active: boolean) =>
    cn(
      "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race",
      active
        ? "border-race/70 bg-race/15 text-white shadow-glow-red"
        : "border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
    );

  return (
    <div className="space-y-6">
      {/* Series filter chips */}
      <div
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Filter videos by series"
      >
        <button type="button" onClick={() => setFilter("all")} className={chip(filter === "all")} aria-pressed={filter === "all"}>
          All
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

      {filtered.length === 0 ? (
        <EmptyState
          title="No clips in this category yet"
          message="Try another series — fresh clips land here automatically around the clock."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
