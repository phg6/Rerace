import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Film, Newspaper, Trophy } from "lucide-react";
import { SERIES_LIST, seriesMeta } from "@/lib/series";
import { getEvents, getMedia, getNews } from "@/lib/data/content";
import { eventStatus, eventStart, nextSession } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow, RowItem } from "@/components/MediaRow";
import { TiltCard } from "@/components/TiltCard";
import { LivePill, LiveBar } from "@/components/LiveBadge";
import { SectionHeading } from "@/components/SectionLabel";
import { LocalTime, TimezoneNote } from "@/components/LocalTime";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export function generateStaticParams() {
  return SERIES_LIST.map((s) => ({ series: s.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>;
}): Promise<Metadata> {
  const { series } = await params;
  if (!SERIES_LIST.some((s) => s.key === series)) return { title: "Series not found" };
  const meta = seriesMeta(series);
  const description = `${meta.name} on ${SITE.name} — live streams, upcoming sessions, latest news, videos and documentaries. ${SITE.tagline}`;
  return {
    title: `${meta.name} — Streams, Schedule & News`,
    description,
    openGraph: {
      title: `${meta.name} — Streams, Schedule & News`,
      description,
      images: [{ url: meta.poster }],
    },
  };
}

export default async function SeriesHubPage({
  params,
}: {
  params: Promise<{ series: string }>;
}) {
  const { series } = await params;
  if (!SERIES_LIST.some((s) => s.key === series)) notFound();
  const meta = seriesMeta(series);

  const [events, media, news] = await Promise.all([getEvents(), getMedia(), getNews(60)]);

  const seriesEvents = events
    .filter((e) => e.series === meta.key && eventStatus(e) !== "finished")
    .sort((a, b) => {
      const liveDiff = Number(eventStatus(b) === "live") - Number(eventStatus(a) === "live");
      return liveDiff !== 0 ? liveDiff : eventStart(a) - eventStart(b);
    });

  const seriesNews = news.filter((n) => n.series === meta.key).slice(0, 6);

  const seriesMedia = media.filter(
    (m) => m.series === meta.key && (m.kind === "video" || m.kind === "documentary")
  );

  const isF1 = meta.key === "f1";

  return (
    <div className="space-y-16 pb-8">
      {/* ============ HERO STRIP ============ */}
      <section className="relative -mt-16 flex min-h-[46vh] items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-transparent to-transparent" />
        <div className="container-site relative pb-12 pt-36 animate-rise">
          <p className="font-display mb-3 text-[11px] uppercase tracking-[0.28em] text-zinc-300 sm:text-xs">
            Series Hub
          </p>
          <h1 className="flex items-center gap-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            <span
              className="h-4 w-4 shrink-0 rounded-full sm:h-5 sm:w-5"
              style={{ backgroundColor: meta.color, boxShadow: `0 0 24px ${meta.color}` }}
              aria-hidden
            />
            {meta.name}
          </h1>
        </div>
      </section>

      {/* ============ UPCOMING & LIVE EVENTS ============ */}
      <section className="container-site">
        <SectionHeading
          label="On Track"
          title="Live & upcoming"
          action={
            <Link href="/schedule" className="btn-ghost text-xs">
              Full schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {seriesEvents.length === 0 ? (
          <EmptyState
            title={`No upcoming ${meta.shortName} events`}
            message="Nothing on the calendar right now — check the full schedule or catch up with videos below."
            ctaHref="/schedule"
            ctaLabel="View full schedule"
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {seriesEvents.map((e) => {
                const live = eventStatus(e) === "live";
                const next = nextSession(e);
                return (
                  <Link
                    key={e.id}
                    href={`/watch/${e.id}`}
                    className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
                  >
                    <TiltCard className="h-full">
                      <div className="relative aspect-[21/9] w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.image || meta.poster}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                        <div className="img-overlay" />
                        {live && <LivePill className="absolute left-3 top-3" />}
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-sm font-semibold text-white group-hover:text-race-bright">
                          {e.title}
                        </h3>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {e.circuit} · {e.country}
                        </p>
                        {next && (
                          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-400">
                            <CalendarDays className="h-3 w-3 text-zinc-500" />
                            {next.name} ·{" "}
                            <LocalTime iso={next.startsAt} mode="weekday-time" className="text-race-bright" />
                          </p>
                        )}
                        {live && <LiveBar className="mt-3" />}
                      </div>
                    </TiltCard>
                  </Link>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              <TimezoneNote />
            </p>
          </>
        )}
      </section>

      {/* ============ F1 EXTRAS ============ */}
      {isF1 && (
        <section className="container-site grid gap-4 sm:grid-cols-2">
          <Link
            href="/replays"
            className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
          >
            <TiltCard maxTilt={5} className="flex h-full items-center gap-5 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-race/15 text-race-bright">
                <Film className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white">Full session replays</h3>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Every F1 session of the season — free with an account.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-race-bright" />
            </TiltCard>
          </Link>
          <Link
            href="/standings"
            className="block h-full rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
          >
            <TiltCard maxTilt={5} className="flex h-full items-center gap-5 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-race/15 text-race-bright">
                <Trophy className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white">Championship standings</h3>
                <p className="mt-0.5 text-xs text-zinc-400">Drivers and constructors, updated all season.</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-race-bright" />
            </TiltCard>
          </Link>
        </section>
      )}

      {/* ============ NEWS ============ */}
      <section className="container-site">
        <SectionHeading
          label="Paddock"
          title={`${meta.shortName} news`}
          action={
            <Link href="/news" className="btn-ghost text-xs">
              All news <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {seriesNews.length === 0 ? (
          <EmptyState
            title="Quiet in the paddock"
            message={`No ${meta.shortName} headlines right now. Browse all motorsport news instead.`}
            ctaHref="/news"
            ctaLabel="All news"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {seriesNews.map((n) => (
              <Link
                key={n.id}
                href={n.url}
                target={n.isOriginal ? undefined : "_blank"}
                className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
              >
                <TiltCard maxTilt={4} className="flex items-center gap-4 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={n.image || meta.poster}
                    alt=""
                    loading="lazy"
                    className="h-16 w-28 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-race-bright">
                      {n.title}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                      <Newspaper className="h-3 w-3" />
                      {n.isOriginal ? (
                        <span className="font-display text-[10px] uppercase tracking-widest text-race-bright">
                          Rerace
                        </span>
                      ) : (
                        n.source
                      )}{" "}
                      · <LocalTime iso={n.publishedAt} mode="relative" />
                    </p>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ============ VIDEOS & DOCUMENTARIES ============ */}
      {seriesMedia.length === 0 ? (
        <section className="container-site">
          <SectionHeading label="Watch" title={`${meta.shortName} videos & documentaries`} />
          <EmptyState
            title="Nothing in the library yet"
            message={`No ${meta.shortName} videos or documentaries so far — explore the full catalogue.`}
            ctaHref="/videos"
            ctaLabel="Browse all videos"
          />
        </section>
      ) : (
        <MediaRow label="Watch" title={`${meta.shortName} videos & documentaries`} viewAllHref="/videos">
          {seriesMedia.map((m) => (
            <RowItem key={m.id}>
              <MediaCard
                href={m.kind === "documentary" ? `/documentaries/${m.id}` : `/videos/${m.id}`}
                title={m.title}
                series={m.series}
                image={m.image}
                meta={m.kind === "documentary" ? "Documentary" : m.source ? `via ${m.source}` : "Video"}
                description={m.description}
                year={m.year}
                durationMin={m.durationMin}
              />
            </RowItem>
          ))}
        </MediaRow>
      )}
    </div>
  );
}
