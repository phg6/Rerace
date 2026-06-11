import Link from "next/link";
import { ArrowRight, CalendarDays, Play, Trophy } from "lucide-react";
import { getEvents, getReplays, getMedia, getNews, getActivePoll, getStandings } from "@/lib/data/content";
import { eventStatus, eventStart, nextSession } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { MediaRow, RowItem } from "@/components/MediaRow";
import { MediaCard } from "@/components/MediaCard";
import { LivePill, LiveBar } from "@/components/LiveBadge";
import { SeriesTag } from "@/components/SeriesTag";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { Countdown } from "@/components/Countdown";
import { LocalTime, TimezoneNote } from "@/components/LocalTime";
import { PollWidget } from "@/components/PollWidget";
import { AdSlot } from "@/components/AdSlot";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 60;

export default async function HomePage() {
  const [events, replays, docs, videos, news, poll, standings] = await Promise.all([
    getEvents(),
    getReplays(),
    getMedia("documentary"),
    getMedia("video"),
    getNews(7),
    getActivePoll(),
    getStandings("f1"),
  ]);

  const live = events.filter((e) => eventStatus(e) === "live");
  const upcoming = events
    .filter((e) => eventStatus(e) === "upcoming")
    .sort((a, b) => eventStart(a) - eventStart(b));
  const hero = live.find((e) => e.featured) ?? live[0] ?? upcoming.find((e) => e.featured) ?? upcoming[0];
  const heroLive = hero ? eventStatus(hero) === "live" : false;
  const heroNext = hero ? nextSession(hero) : undefined;
  const drivers = standings.find((s) => s.kind === "drivers");

  return (
    <div className="space-y-16 pb-8">
      {/* ============ HERO ============ */}
      {hero ? (
        <section className="relative -mt-16 flex min-h-[82vh] items-end overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.image || seriesMeta(hero.series).poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-transparent to-transparent" />
          <div className="container-site relative pb-16 pt-40 animate-rise">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                {heroLive ? <LivePill /> : <SectionLabel>Up Next</SectionLabel>}
                <SeriesTag series={hero.series} />
              </div>
              <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              <p className="mt-3 text-sm text-zinc-300 sm:text-base">
                {hero.circuit} · {hero.country}
                {heroNext && !heroLive && (
                  <>
                    {" — "}
                    {heroNext.name}{" "}
                    <LocalTime iso={heroNext.startsAt} mode="weekday-time" className="font-semibold text-white" />
                  </>
                )}
              </p>
              {!heroLive && heroNext && <Countdown to={heroNext.startsAt} className="mt-6" />}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/watch/${hero.id}`} className="btn-race">
                  <Play className="h-4 w-4 fill-white" />
                  {heroLive ? "Watch Live" : "Go to event"}
                </Link>
                <Link href="/schedule" className="btn-glass">
                  <CalendarDays className="h-4 w-4" /> Full schedule
                </Link>
              </div>
              {heroLive && <LiveBar className="mt-8 max-w-md" />}
            </div>
          </div>
        </section>
      ) : (
        <section className="container-site pt-10">
          <EmptyState
            title="Red flag — nothing scheduled right now"
            message="No upcoming events found. Check back soon or browse the replay library."
            ctaHref="/replays"
            ctaLabel="Browse replays"
          />
        </section>
      )}

      {/* ============ LIVE NOW ============ */}
      {live.length > 0 && (
        <MediaRow label="On Air" title="Live now" viewAllHref="/live">
          {live.map((e) => (
            <RowItem key={e.id}>
              <MediaCard
                href={`/watch/${e.id}`}
                title={e.title}
                series={e.series}
                image={e.image}
                meta={`${e.circuit} · ${e.streams.length} streams`}
                description={e.description}
              />
              <LiveBar className="mt-2" />
            </RowItem>
          ))}
        </MediaRow>
      )}

      {/* ============ UPCOMING STRIP ============ */}
      <section className="container-site">
        <SectionHeading
          label="Next Up"
          title="Coming this week"
          action={
            <Link href="/schedule" className="btn-ghost text-xs">
              Full schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {upcoming.slice(0, 4).map((e) => {
            const next = nextSession(e);
            return (
              <Link key={e.id} href={`/watch/${e.id}`} className="glass group flex min-w-0 items-center gap-4 p-4 transition-all hover:border-race/50 hover:shadow-glow-red">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.image || seriesMeta(e.series).poster}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <SeriesTag series={e.series} className="mb-1.5" />
                  <p className="truncate text-sm font-semibold text-white">{e.title}</p>
                  {next && (
                    <p className="text-xs text-zinc-400">
                      {next.name} · <LocalTime iso={next.startsAt} mode="relative" className="text-race-bright" />
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          <TimezoneNote />
        </p>
      </section>

      {/* ============ F1 REPLAYS ============ */}
      <MediaRow label="Formula 1" title="Latest replays" viewAllHref="/replays">
        {replays.slice(0, 10).map((r) => (
          <RowItem key={r.id}>
            <MediaCard
              href={`/replays/${r.id}`}
              title={r.title}
              series="f1"
              image={r.image}
              meta={`Round ${r.round} · ${r.session}`}
              durationMin={r.durationMin}
              locked
            />
          </RowItem>
        ))}
      </MediaRow>

      <div className="container-site">
        <AdSlot slotKey="between-rows" />
      </div>

      {/* ============ DOCUMENTARIES ============ */}
      <MediaRow label="Watch" title="Documentaries" viewAllHref="/documentaries">
        {docs.slice(0, 10).map((m) => (
          <RowItem key={m.id}>
            <MediaCard
              href={`/documentaries/${m.id}`}
              title={m.title}
              series={m.series}
              image={m.image}
              description={m.description}
              year={m.year}
              durationMin={m.durationMin}
            />
          </RowItem>
        ))}
      </MediaRow>

      {/* ============ VIDEOS ============ */}
      <MediaRow label="Clips" title="Latest videos" viewAllHref="/videos">
        {videos.slice(0, 10).map((m) => (
          <RowItem key={m.id}>
            <MediaCard
              href={`/videos/${m.id}`}
              title={m.title}
              series={m.series}
              image={m.image}
              meta={m.source}
              durationMin={m.durationMin}
            />
          </RowItem>
        ))}
      </MediaRow>

      {/* ============ POLL + NEWS + STANDINGS ============ */}
      <section className="container-site grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {poll && <PollWidget poll={poll} />}
          {/* Standings teaser */}
          {drivers && (
            <div className="glass mt-6 p-6">
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel>F1 Standings</SectionLabel>
                <Trophy className="h-4 w-4 text-race-bright" />
              </div>
              <ol className="space-y-3">
                {drivers.rows.slice(0, 3).map((row) => (
                  <li key={row.position} className="flex items-center gap-3">
                    <span className="font-display w-6 text-lg text-zinc-500">{row.position}</span>
                    <span
                      className="h-8 w-1 rounded-full"
                      style={{ backgroundColor: row.teamColor ?? "#52525b" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                      <p className="truncate text-xs text-zinc-500">{row.team}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-zinc-200">{row.points}</span>
                  </li>
                ))}
              </ol>
              <Link href="/standings" className="btn-glass mt-5 w-full text-xs">
                Full standings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <SectionHeading
            label="Paddock"
            title="Latest news"
            action={
              <Link href="/news" className="btn-ghost text-xs">
                All news <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="space-y-3">
            {news.slice(0, 6).map((n) => (
              <Link
                key={n.id}
                href={n.url}
                target={n.isOriginal ? undefined : "_blank"}
                className="glass group flex items-center gap-4 p-3 transition-all hover:border-race/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image || seriesMeta(n.series).poster}
                  alt=""
                  className="h-16 w-28 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-race-bright">
                    {n.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {n.isOriginal ? (
                      <span className="font-display mr-1 text-[10px] uppercase tracking-widest text-race-bright">
                        Rerace
                      </span>
                    ) : (
                      `${n.source} · `
                    )}
                    <LocalTime iso={n.publishedAt} mode="relative" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
