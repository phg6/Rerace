import type { Metadata } from "next";
import { getMedia } from "@/lib/data/content";
import { MediaCard } from "@/components/MediaCard";
import { SectionLabel } from "@/components/SectionLabel";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Motorsport Documentaries",
  description:
    "Stream motorsport documentaries on Rerace — behind-the-scenes series and films from Formula 1, MotoGP, NASCAR, IndyCar, WEC and more. Free to watch, no account needed.",
  openGraph: {
    title: "Motorsport Documentaries",
    description:
      "Behind-the-scenes documentaries from Formula 1, MotoGP, NASCAR, IndyCar, WEC and more — free to watch on Rerace.",
    images: [{ url: "/img/series/general.svg" }],
  },
};

export default async function DocumentariesPage() {
  const docs = await getMedia("documentary");

  return (
    <div className="container-site py-12 sm:py-16">
      {/* ============ HEADER ============ */}
      <header className="max-w-3xl animate-rise">
        <SectionLabel className="mb-3">Watch</SectionLabel>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Documentaries</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Behind the visor: documentary series and films from every paddock we cover — free to watch,
          no account needed.
        </p>
      </header>

      {/* ============ GRID ============ */}
      {docs.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No documentaries yet"
          message="We are stocking the shelves. In the meantime, catch the latest clips in Videos."
          ctaHref="/videos"
          ctaLabel="Browse videos"
        />
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {docs.map((m) => (
            <MediaCard
              key={m.id}
              href={`/documentaries/${m.id}`}
              title={m.title}
              series={m.series}
              image={m.image}
              description={m.description}
              year={m.year}
              durationMin={m.durationMin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
