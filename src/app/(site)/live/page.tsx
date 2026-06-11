import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getEvents } from "@/lib/data/content";
import { eventStart, eventStatus, nextSession } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { MediaCard } from "@/components/MediaCard";
import { LiveBar } from "@/components/LiveBadge";
import { SeriesTag } from "@/components/SeriesTag";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { Countdown } from "@/components/Countdown";
import { LocalTime, TimezoneNote } from "@/components/LocalTime";
import { ReminderButton } from "@/components/ReminderButton";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 30;

const DESCRIPTION = `Watch live motorsport for free on ${SITE.name} — Formula 1, F2, F3, MotoGP, NASCAR, IndyCar, WEC, WRC and Porsche Supercup streams in multiple languages, all in one place.`;

export const metadata: Metadata = {
  title: "Live Now — Free Motorsport Streams",
  description: DESCRIPTION,
  alternates: { canonical: "/live" },
  openGraph: {
    title: `Live Now — ${SITE.name}`,
    description: DESCRIPTION,
    url: `${SITE.url}/live`,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `Live Now — ${SITE.name}`,
    description: DESCRIPTION,
  },
};

export default async function LivePage() {
  const events = await getEvents();
  const live = events.filter((e) => eventStatus(e) === "live");
  const upcoming = events
    .filter((e) => eventStatus(e) === "upcoming")
    .sort((a, b) => eventStart(a) - eventStart(b));

  return (
    <div className="container-site space-y-14 pb-16 pt-8">
      {/* ============ PAGE HEADER ============ */}
      <header className="animate-rise">
        <SectionLabel className="mb-2">Live Hub</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Live motorsport, right now
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Every session that is on air across our series — pick a stream and you are in.
        </p>
      </header>

      {/* ============ LIVE NOW ============ */}
      {live.length > 0 ? (
        <section>
          <SectionHeading label="On Air" title="Live now" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {live.map((e) => {
              const streamCount = e.streams.length;
              const languageCount = new Set(e.streams.map((s) => s.language)).size;
              return (
                <div key={e.id}>
                  <MediaCard
                    href={`/watch/${e.id}`}
                    title={e.title}
                    series={e.series}
                    image={e.image}
                    meta={`${e.circuit} · ${streamCount} stream${streamCount === 1 ? "" : "s"} · ${languageCount} language${languageCount === 1 ? "" : "s"}`}
                    description={e.description}
                  />
                  <LiveBar className="mt-2.5" />
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          title="Red flag — nothing live right now"
          message="No sessions are on air at the moment. Browse the full schedule to see what is coming up next."
          ctaHref="/schedule"
          ctaLabel="View full schedule"
        />
      )}

      {/* ============ STARTING SOON ============ */}
      {upcoming.length > 0 && (
        <section>
          <SectionHeading
            label="Next Up"
            title="Starting soon"
            action={
              <Link href="/schedule" className="btn-ghost text-xs">
                <CalendarDays className="h-3.5 w-3.5" /> Full schedule{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((e) => {
              const next = nextSession(e);
              return (
                <article key={e.id} className="glass overflow-hidden transition-all hover:border-race/50 hover:shadow-glow-red">
                  <Link href={`/watch/${e.id}`} className="relative block aspect-[21/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={e.image || seriesMeta(e.series).poster}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="img-overlay" />
                    <SeriesTag series={e.series} className="absolute left-3 top-3" />
                  </Link>
                  <div className="p-5">
                    <Link href={`/watch/${e.id}`}>
                      <h3 className="text-lg font-bold leading-snug text-white transition-colors hover:text-race-bright">
                        {e.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-zinc-400">
                      {e.circuit} · {e.country}
                    </p>
                    {next && (
                      <>
                        <p className="mt-3 text-xs text-zinc-400">
                          {next.name} ·{" "}
                          <LocalTime
                            iso={next.startsAt}
                            mode="weekday-time"
                            className="font-semibold text-zinc-200"
                          />
                        </p>
                        <Countdown to={next.startsAt} className="mt-3" />
                        <div className="mt-4">
                          <ReminderButton
                            eventId={e.id}
                            sessionKey={next.key}
                            sessionName={next.name}
                            startsAt={next.startsAt}
                            compact
                          />
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            <TimezoneNote />
          </p>
        </section>
      )}
    </div>
  );
}
