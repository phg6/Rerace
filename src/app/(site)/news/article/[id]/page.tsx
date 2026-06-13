import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getNewsItem } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 300;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) return { title: "Article not found" };
  const image = item.image || seriesMeta(item.series).poster;
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/article/${id}` },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.excerpt,
      url: `${SITE.url}/news/article/${id}`,
      siteName: SITE.name,
      publishedTime: item.publishedAt,
      authors: item.author ? [item.author] : [item.source],
      images: [{ url: image.startsWith("http") ? image : `${SITE.url}${image}` }],
    },
    twitter: { card: "summary_large_image" },
  };
}

const proseClasses = [
  "space-y-5 text-[15px] leading-relaxed text-zinc-300 sm:text-base",
  "[&_p]:leading-relaxed",
  "[&_a]:text-race-bright [&_a]:underline-offset-4 [&_a:hover]:underline",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_em]:italic",
  "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white",
  "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white",
  "[&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-white",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-race [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-zinc-400",
  "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6",
  "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6",
  "[&_li]:leading-relaxed",
  "[&_img]:w-full [&_img]:rounded-[var(--radius-card)] [&_img]:border [&_img]:border-white/[0.08]",
].join(" ");

/**
 * Split sanitized article HTML at the top-level block boundary nearest the
 * midpoint so an ad slot can sit between the halves. Tracks blockquote/ul/ol
 * nesting so we never cut inside a list or quote.
 */
function splitForAd(html: string): [string, string] {
  const re = /<\/?(blockquote|ul|ol)(?=[\s>])[^>]*>|<\/(?:p|h2|h3|h4)>/gi;
  let depth = 0;
  const cuts: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const tag = m[0];
    if (/^<(blockquote|ul|ol)/i.test(tag)) depth++;
    else if (/^<\/(blockquote|ul|ol)/i.test(tag)) {
      depth = Math.max(0, depth - 1);
      if (depth === 0) cuts.push(m.index + tag.length);
    } else if (depth === 0) cuts.push(m.index + tag.length);
  }
  if (cuts.length < 5) return [html, ""];
  const mid = html.length / 2;
  const cut = cuts.reduce((best, c) => (Math.abs(c - mid) < Math.abs(best - mid) ? c : best));
  return [html.slice(0, cut), html.slice(cut)];
}

function SourceCard({ source, href }: { source: string; href?: string }) {
  return (
    <div className="glass flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm text-zinc-400">
        Originally published by <span className="font-semibold text-white">{source}</span>
      </p>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-race-bright hover:underline"
        >
          Read the original <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export default async function CrawledArticlePage({ params }: Props) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) notFound();

  const image = item.image || seriesMeta(item.series).poster;
  const [firstHalf, secondHalf] = item.contentHtml ? splitForAd(item.contentHtml) : ["", ""];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt,
    image: [image.startsWith("http") ? image : `${SITE.url}${image}`],
    datePublished: item.publishedAt,
    author: { "@type": item.author ? "Person" : "Organization", name: item.author ?? item.source },
    publisher: { "@type": "Organization", name: item.source },
    ...(item.sourceUrl ? { isBasedOn: item.sourceUrl } : {}),
    mainEntityOfPage: `${SITE.url}/news/article/${id}`,
  };

  return (
    <div className="container-site pb-20 pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="mx-auto max-w-3xl animate-rise">
        <Link href="/news" className="btn-ghost -ml-4 mb-8 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> All news
        </Link>

        <header>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SeriesTag series={item.series} />
          </div>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {item.title}
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            {item.author && (
              <>
                By <span className="font-semibold text-zinc-200">{item.author}</span>
                {" · "}
              </>
            )}
            <span className="font-medium text-zinc-300">{item.source}</span>
            {" · "}
            <LocalTime iso={item.publishedAt} mode="datetime" />
          </p>
        </header>

        <div className="relative mt-8 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={item.title} className="aspect-video w-full object-cover" />
          <div className="img-overlay opacity-60" />
        </div>

        <div className="mt-8">
          <SourceCard source={item.source} href={item.sourceUrl} />
        </div>

        {item.contentHtml ? (
          <>
            <div className={`mt-10 ${proseClasses}`} dangerouslySetInnerHTML={{ __html: firstHalf }} />
            {secondHalf && (
              <>
                <AdSlot slotKey="news-feed" className="my-10" />
                <div className={proseClasses} dangerouslySetInnerHTML={{ __html: secondHalf }} />
              </>
            )}
          </>
        ) : (
          <div className="mt-10 space-y-8">
            {item.excerpt && <p className="text-base leading-relaxed text-zinc-300">{item.excerpt}</p>}
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-glass">
                Read at {item.source} <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <AdSlot slotKey="news-feed" />
          </div>
        )}

        <div className="mt-10">
          <SourceCard source={item.source} href={item.sourceUrl} />
        </div>
      </article>
    </div>
  );
}
