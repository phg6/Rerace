"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { SERIES, seriesMeta } from "@/lib/series";
import type { SeriesKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/TiltCard";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

/** Plain, serializable article shape passed from the server page. */
export interface NewsListArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  isOriginal: boolean;
  image?: string;
  excerpt?: string;
  series: SeriesKey;
  publishedAt: string;
  /** pinned Rerace original — rendered with the FEATURED marker */
  pinned?: boolean;
}

/** Gold badge marking Rerace original stories. */
export function ReraceBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-black",
        className
      )}
    >
      Rerace
    </span>
  );
}

/** Red pill marking the pinned original story. */
export function FeaturedPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-race px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-glow-red",
        className
      )}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      Featured
    </span>
  );
}

function NewsCard({ article }: { article: NewsListArticle }) {
  return (
    <Link
      href={article.url}
      className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
    >
      <TiltCard className={cn("flex h-full flex-col", article.pinned && "border-race/40")}>
        <div className="relative aspect-video w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image || seriesMeta(article.series).poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="img-overlay" />
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            {article.pinned && <FeaturedPill />}
            <SeriesTag series={article.series} />
            {article.isOriginal && <ReraceBadge />}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-race-bright">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-400">{article.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-zinc-500">
            <span className="truncate font-medium text-zinc-400">{article.source}</span>
            <LocalTime iso={article.publishedAt} mode="relative" className="shrink-0" />
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}

/** Filterable news grid — series chips + ad slot injected after the 6th card. */
export function NewsList({
  articles,
  adSlot,
}: {
  articles: NewsListArticle[];
  adSlot?: React.ReactNode;
}) {
  const [filter, setFilter] = useState<"all" | SeriesKey>("all");

  const presentSeries = useMemo(
    () => (Object.keys(SERIES) as SeriesKey[]).filter((key) => articles.some((a) => a.series === key)),
    [articles]
  );

  const filtered = filter === "all" ? articles : articles.filter((a) => a.series === filter);

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
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter news by series">
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
          title="No stories in this category yet"
          message="Try another series — fresh paddock news lands here around the clock."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article, i) => (
            <Fragment key={article.id}>
              <NewsCard article={article} />
              {i === 5 && adSlot && <div className="sm:col-span-2 xl:col-span-3">{adSlot}</div>}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
