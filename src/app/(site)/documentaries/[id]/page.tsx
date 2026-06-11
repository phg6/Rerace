import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getMedia, getMediaItem } from "@/lib/data/content";
import { formatDuration } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow, RowItem } from "@/components/MediaRow";
import { SeriesTag } from "@/components/SeriesTag";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getMediaItem(id);
  if (!item || item.kind !== "documentary") return { title: "Documentary not found" };
  const description =
    item.description ??
    `Watch the motorsport documentary ${item.title} free on Rerace.`;
  return {
    title: `${item.title} — Documentary`,
    description,
    openGraph: {
      title: `${item.title} — Documentary`,
      description,
      images: [{ url: item.image || seriesMeta(item.series).poster }],
    },
  };
}

export default async function DocumentaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getMediaItem(id);
  if (!item || item.kind !== "documentary") notFound();

  const related = (await getMedia("documentary"))
    .filter((m) => m.id !== item.id)
    .sort((a, b) => Number(b.series === item.series) - Number(a.series === item.series))
    .slice(0, 10);

  const thumb = item.image || seriesMeta(item.series).poster;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: item.title,
    description: item.description ?? `Motorsport documentary on ${SITE.name}.`,
    thumbnailUrl: thumb.startsWith("http") ? thumb : `${SITE.url}${thumb}`,
    url: `${SITE.url}/documentaries/${item.id}`,
  };

  return (
    <div className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-site">
        <Link href="/documentaries" className="btn-ghost -ml-3 mb-6 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> All documentaries
        </Link>

        {/* ============ PLAYER ============ */}
        <div className="animate-rise">
          <VideoPlayer url={item.url} kind={item.embedKind} title={item.title} poster={thumb} />
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

      {/* ============ RELATED ============ */}
      {related.length > 0 && (
        <div className="mt-14">
          <MediaRow label="Keep Watching" title="More documentaries" viewAllHref="/documentaries">
            {related.map((m) => (
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
        </div>
      )}
    </div>
  );
}
