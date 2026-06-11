import type { Metadata } from "next";
import { getMedia } from "@/lib/data/content";
import { MediaCard } from "@/components/MediaCard";
import { SectionLabel } from "@/components/SectionLabel";
import { EmptyState } from "@/components/EmptyState";

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
  const videos = await getMedia("video");

  return (
    <div className="container-site py-12 sm:py-16">
      {/* ============ HEADER ============ */}
      <header className="max-w-3xl animate-rise">
        <SectionLabel className="mb-3">Clips</SectionLabel>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Videos</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Onboards, overtakes, impossible saves and highlight reels from across the motorsport world —
          free to watch, no account needed.
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
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((m) => (
            <MediaCard
              key={m.id}
              href={`/videos/${m.id}`}
              title={m.title}
              series={m.series}
              image={m.image}
              meta={m.source ? `via ${m.source}` : undefined}
              description={m.description}
              durationMin={m.durationMin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
