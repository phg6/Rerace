import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMediaItem } from "@/lib/data/content";
import { formatDuration } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { ReracePlayer } from "@/components/player/ReracePlayer";
import { RelatedRail } from "@/components/RelatedRail";
import { SeriesTag } from "@/components/SeriesTag";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getMediaItem(id);
  if (!item || item.kind !== "movie") return { title: "Movie not found" };
  const description =
    item.description ?? `Watch ${item.title} free with a Rerace account.`;
  return {
    title: `${item.title} — Movie`,
    description,
    alternates: { canonical: `/movies/${item.id}` },
    openGraph: {
      title: `${item.title} — Movie`,
      description,
      url: `${SITE.url}/movies/${item.id}`,
      images: [{ url: item.image || seriesMeta(item.series).poster }],
    },
  };
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/movies/${id}`);

  const item = await getMediaItem(id);
  if (!item || item.kind !== "movie") notFound();

  const thumb = item.image || seriesMeta(item.series).poster;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: item.title,
    description: item.description ?? `Motorsport movie on ${SITE.name}.`,
    thumbnailUrl: thumb.startsWith("http") ? thumb : `${SITE.url}${thumb}`,
    url: `${SITE.url}/movies/${item.id}`,
  };

  return (
    <div className="container-site py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/movies" className="btn-ghost -ml-3 mb-6 text-xs">
        <ArrowLeft className="h-3.5 w-3.5" /> All movies
      </Link>

      <div className="gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <div className="min-w-0">
          {/* ============ PLAYER ============ */}
          <div className="animate-rise">
            <ReracePlayer
              url={item.url}
              kind={item.embedKind}
              title={item.title}
              poster={thumb}
              videoId={item.videoId}
            />
          </div>

          {/* ============ TITLE + META ============ */}
          <div className="mt-8 max-w-4xl">
            <SeriesTag series={item.series} />
            <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
              {item.year && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-zinc-500" /> {item.year}
                </span>
              )}
              {item.durationMin ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" /> {formatDuration(item.durationMin)}
                </span>
              ) : null}
              <span className="text-zinc-500">{seriesMeta(item.series).name}</span>
            </div>
            {item.description && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                {item.description}
              </p>
            )}
          </div>

          <AdSlot slotKey="watch-below" className="mt-10" />
        </div>

        <RelatedRail
          currentId={item.id}
          kind="movie"
          series={item.series}
          className="mt-14 xl:mt-0"
        />
      </div>
    </div>
  );
}
