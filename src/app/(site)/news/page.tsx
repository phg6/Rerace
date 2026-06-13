import type { Metadata } from "next";
import Link from "next/link";
import { getNews } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import type { NewsArticle } from "@/lib/types";
import { SectionLabel } from "@/components/SectionLabel";
import { SeriesTag } from "@/components/SeriesTag";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { AdSlot } from "@/components/AdSlot";
import { EmptyState } from "@/components/EmptyState";
import { NewsList, ReraceBadge, type NewsListArticle } from "@/components/news/NewsList";

export const revalidate = 300;

const description =
  "The latest motorsport news — Formula 1, F2, F3, MotoGP, NASCAR, IndyCar, WEC, WRC and Porsche Supercup. Rerace originals plus the best stories from around the paddock.";

export const metadata: Metadata = {
  title: "Motorsport News",
  description,
  alternates: { canonical: "/news" },
  openGraph: {
    type: "website",
    title: `Motorsport News — ${SITE.name}`,
    description,
    url: `${SITE.url}/news`,
  },
  twitter: { card: "summary_large_image" },
};

function isPinnedNow(n: NewsArticle): boolean {
  return Boolean(n.isOriginal && n.pinnedUntil && Date.parse(n.pinnedUntil) > Date.now());
}

function toPlain(n: NewsArticle): NewsListArticle {
  return {
    id: n.id,
    title: n.title,
    url: n.url,
    source: n.source,
    isOriginal: n.isOriginal,
    image: n.image,
    excerpt: n.excerpt,
    series: n.series,
    publishedAt: n.publishedAt,
    pinned: isPinnedNow(n),
  };
}

export default async function NewsPage() {
  const news = await getNews(60);
  const featured = news.find((n) => !isPinnedNow(n)) ?? news[0];
  const rest = news.filter((n) => n !== featured).map(toPlain);

  return (
    <div className="container-site space-y-10 pb-20 pt-10">
      <header>
        <SectionLabel className="mb-2">Paddock</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">News</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Rerace originals and the best stories from around the motorsport world, updated around the clock.
        </p>
      </header>

      {!featured ? (
        <EmptyState
          title="The newsroom is quiet"
          message="No stories right now — check back soon, or catch up on replays in the meantime."
          ctaHref="/replays"
          ctaLabel="Browse replays"
        />
      ) : (
        <>
          {/* ============ FEATURED TOP STORY ============ */}
          <Link
            href={featured.url}
            className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-race"
          >
            <TiltCard maxTilt={3}>
              <article>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured.image || seriesMeta(featured.series).poster}
                alt=""
                className="h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] sm:h-[440px]"
              />
              <div className="img-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <SectionLabel>Top Story</SectionLabel>
                  <SeriesTag series={featured.series} />
                  {featured.isOriginal && <ReraceBadge />}
                </div>
                <h2 className="max-w-3xl text-balance text-2xl font-extrabold leading-tight tracking-tight text-white group-hover:text-race-bright sm:text-4xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {featured.excerpt}
                  </p>
                )}
                <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">{featured.source}</span>
                  <span>·</span>
                  <LocalTime iso={featured.publishedAt} mode="relative" />
                </p>
              </div>
              </article>
            </TiltCard>
          </Link>

          {/* ============ THE REST — filterable grid ============ */}
          <NewsList articles={rest} adSlot={<AdSlot slotKey="news-feed" />} />
        </>
      )}
    </div>
  );
}
