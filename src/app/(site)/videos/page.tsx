import type { Metadata } from "next";
import { getMedia } from "@/lib/data/content";
import { SectionLabel } from "@/components/SectionLabel";
import { EmptyState } from "@/components/EmptyState";
import { VideoGrid, type VideoGridItem } from "./VideoGrid";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Motorsport Videos & Clips",
  description:
    "The best motorsport clips in one place — onboards, overtakes, saves and highlights from F1, MotoGP, NASCAR, WRC and more. Free to watch on Rerace.",
  openGraph: {
    title: "Motorsport Videos & Clips",
    description:
      "Onboards, overtakes, saves and highlights from every racing series — free to watch on Rerace.",
    images: [{ url: "/img/series/general.svg" }],
  },
};

export default async function VideosPage() {
  const media = await getMedia("video");
  const videos: VideoGridItem[] = media.map((m) => ({
    id: m.id,
    title: m.title,
    series: m.series,
    image: m.image,
    source: m.source,
    durationMin: m.durationMin,
    publishedAt: m.publishedAt,
  }));

  return (
    <div className="container-site pb-20 pt-10">
      {/* ============ HEADER ============ */}
      <header className="max-w-3xl animate-rise">
        <SectionLabel className="mb-2">Clips</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Videos</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Onboards, overtakes, impossible saves and highlight reels from across the motorsport world —
          updated automatically, free to watch, no account needed.
        </p>
      </header>

      {/* ============ GRID ============ */}
      {videos.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No videos yet"
          message="The clip reel is empty right now. Catch a full documentary instead."
          ctaHref="/documentaries"
          ctaLabel="Browse documentaries"
        />
      ) : (
        <div className="mt-12">
          <VideoGrid videos={videos} />
        </div>
      )}
    </div>
  );
}
