import Link from "next/link";
import type { MediaKind, NewsArticle, SeriesKey } from "@/lib/types";
import { getMediaRecommendations, getNews, getUpNext, type UpNextItem } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/SectionLabel";
import { TiltCard } from "@/components/TiltCard";
import { MediaCard } from "@/components/MediaCard";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";

const MEDIA_PATH: Record<MediaKind, string> = {
  documentary: "/documentaries",
  movie: "/movies",
  video: "/videos",
};

/**
 * Sidebar rail for watch/detail pages: recommended media, latest news and the
 * next sessions on the schedule (viewer-timezone times). Server component —
 * sidebar on xl, stacked below the main column on smaller screens.
 */
export async function RelatedRail({
  currentId = "",
  kind = "video",
  series,
  className,
}: {
  currentId?: string;
  kind?: MediaKind;
  series?: SeriesKey;
  className?: string;
}) {
  const [recommended, news, upNext] = await Promise.all([
    getMediaRecommendations(currentId, kind, series, 4),
    getNews(12),
    getUpNext(4),
  ]);
  const newsItems = news.slice(0, 4);

  return (
    <aside className={cn("min-w-0 space-y-12", className)}>
      {recommended.length > 0 && (
        <section>
          <SectionHeading label="Keep Watching" title="Recommended" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {recommended.map((m) => (
              <MediaCard
                key={m.id}
                href={`${MEDIA_PATH[m.kind]}/${m.id}`}
                title={m.title}
                series={m.series}
                image={m.image}
                meta={m.source ? `via ${m.source}` : undefined}
                year={m.year}
                durationMin={m.durationMin}
                locked={m.kind === "movie" || m.requiresAccount}
              />
            ))}
          </div>
        </section>
      )}

      {newsItems.length > 0 && (
        <section>
          <SectionHeading label="Paddock" title="Latest news" />
          <ul className="space-y-3">
            {newsItems.map((n) => (
              <NewsRow key={n.id} article={n} />
            ))}
          </ul>
        </section>
      )}

      {upNext.length > 0 && (
        <section>
          <SectionHeading label="Schedule" title="Next on the schedule" />
          <ul className="space-y-3">
            {upNext.map((item) => (
              <UpNextRow key={`${item.event.id}-${item.session.key}`} item={item} />
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

function NewsRow({ article }: { article: NewsArticle }) {
  const img = article.image || seriesMeta(article.series).poster;
  return (
    <li>
      <Link
        href={article.url}
        className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
      >
        <TiltCard maxTilt={3} className="flex items-center gap-3 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            loading="lazy"
            className="h-14 w-24 shrink-0 rounded-xl object-cover"
          />
          <span className="min-w-0">
            <span className="line-clamp-2 text-xs font-semibold leading-snug text-white">
              {article.title}
            </span>
            <span className="mt-1 block truncate text-[11px] text-zinc-500">
              {article.source} · <LocalTime iso={article.publishedAt} mode="relative" />
            </span>
          </span>
        </TiltCard>
      </Link>
    </li>
  );
}

function UpNextRow({ item }: { item: UpNextItem }) {
  const { event, session } = item;
  return (
    <li>
      <Link
        href={`/watch/${event.id}`}
        className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
      >
        <TiltCard maxTilt={3} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <SeriesTag series={event.series} />
            <span className="shrink-0 text-[11px] font-semibold text-zinc-400">
              <LocalTime iso={session.startsAt} mode="relative" />
            </span>
          </div>
          <p className="mt-2 line-clamp-1 text-sm font-semibold text-white">{event.title}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {session.name} · <LocalTime iso={session.startsAt} mode="weekday-time" />
          </p>
        </TiltCard>
      </Link>
    </li>
  );
}
