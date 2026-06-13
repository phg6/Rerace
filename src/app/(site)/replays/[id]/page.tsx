import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReplay, getReplays } from "@/lib/data/content";
import { formatDuration } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { ReracePlayer } from "@/components/player/ReracePlayer";
import { RelatedRail } from "@/components/RelatedRail";
import { MediaCard } from "@/components/MediaCard";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const replay = await getReplay(id);
  if (!replay) return { title: "Replay not found" };
  const description = `Full replay of the ${replay.eventName} ${replay.session} — Round ${replay.round} of the ${replay.season} Formula 1 season. Watch free with a Rerace account.`;
  return {
    title: `${replay.title} — F1 ${replay.season} Replay`,
    description,
    alternates: { canonical: `/replays/${replay.id}` },
    openGraph: {
      title: `${replay.title} — F1 ${replay.season} Replay`,
      description,
      url: `${SITE.url}/replays/${replay.id}`,
      images: [{ url: replay.image || seriesMeta("f1").poster }],
    },
  };
}

export default async function ReplayWatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/replays/${id}`);

  const replay = await getReplay(id);
  if (!replay) notFound();

  const sameWeekend = (await getReplays())
    .filter((r) => r.season === replay.season && r.round === replay.round && r.id !== replay.id)
    .sort((a, b) => Date.parse(a.airedAt) - Date.parse(b.airedAt));

  const thumb = replay.image || seriesMeta("f1").poster;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: replay.title,
    description: `Full replay of the ${replay.eventName} ${replay.session} on ${SITE.name}.`,
    thumbnailUrl: thumb.startsWith("http") ? thumb : `${SITE.url}${thumb}`,
    uploadDate: replay.airedAt,
    url: `${SITE.url}/replays/${replay.id}`,
  };

  return (
    <div className="container-site py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/replays" className="btn-ghost -ml-3 mb-6 text-xs">
        <ArrowLeft className="h-3.5 w-3.5" /> All replays
      </Link>

      <div className="gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0">
          {/* ============ PLAYER ============ */}
          <div className="animate-rise">
            <ReracePlayer url={replay.url} kind={replay.kind} title={replay.title} poster={thumb} />
          </div>

          {/* ============ TITLE + META ============ */}
          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <SeriesTag series="f1" />
              <span className="font-display inline-flex items-center rounded-full border border-race/40 bg-race/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-race-bright">
                Round {replay.round}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                {replay.session}
              </span>
            </div>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {replay.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
                Aired <LocalTime iso={replay.airedAt} mode="datetime" className="text-zinc-300" />
              </span>
              {replay.durationMin ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {formatDuration(replay.durationMin)}
                </span>
              ) : null}
              <span className="text-zinc-500">
                {replay.eventName} · {replay.season} season
              </span>
            </div>
          </div>

          <AdSlot slotKey="watch-below" className="mt-10" />

          {/* ============ MORE FROM THIS WEEKEND ============ */}
          {sameWeekend.length > 0 && (
            <section className="mt-14">
              <SectionHeading
                label="Race Weekend"
                title="More from this weekend"
                action={
                  <SectionLabel className="hidden sm:block">
                    Round {replay.round} · {replay.season}
                  </SectionLabel>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sameWeekend.map((r) => (
                  <MediaCard
                    key={r.id}
                    href={`/replays/${r.id}`}
                    title={r.title}
                    series="f1"
                    image={r.image}
                    meta={`Round ${r.round} · ${r.session}`}
                    durationMin={r.durationMin}
                    locked
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <RelatedRail kind="video" series="f1" className="mt-14 xl:mt-0" />
      </div>
    </div>
  );
}
