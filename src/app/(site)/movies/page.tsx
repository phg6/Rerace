import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { getMedia } from "@/lib/data/content";
import { MediaCard } from "@/components/MediaCard";
import { SectionLabel } from "@/components/SectionLabel";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Racing Movies",
  description:
    "Watch classic and modern racing movies on Rerace — from Formula 1 legends to Le Mans epics. Movies are free to watch with a Rerace account.",
  openGraph: {
    title: "Racing Movies",
    description:
      "Classic and modern racing movies, free to watch with a Rerace account.",
    images: [{ url: "/img/series/general.svg" }],
  },
};

export default async function MoviesPage() {
  const movies = await getMedia("movie");

  return (
    <div className="container-site py-12 sm:py-16">
      {/* ============ HEADER ============ */}
      <header className="max-w-3xl animate-rise">
        <SectionLabel className="mb-3">Watch</SectionLabel>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Movies</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Racing on the silver screen — title fights, rivalries and 24-hour epics.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-xs text-zinc-400">
          <Lock className="h-3 w-3 text-race-bright" /> Movies are free to watch with a Rerace account.
        </p>
      </header>

      {/* ============ GRID ============ */}
      {movies.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No movies yet"
          message="The projection room is being set up. Try a documentary while you wait."
          ctaHref="/documentaries"
          ctaLabel="Browse documentaries"
        />
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((m) => (
            <MediaCard
              key={m.id}
              href={`/movies/${m.id}`}
              title={m.title}
              series={m.series}
              image={m.image}
              description={m.description}
              year={m.year}
              durationMin={m.durationMin}
              locked
            />
          ))}
        </div>
      )}
    </div>
  );
}
