import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getNewsPost } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import { SeriesTag } from "@/components/SeriesTag";
import { LocalTime } from "@/components/LocalTime";
import { ReraceBadge } from "@/components/news/NewsList";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post || !post.isOriginal) {
    return { title: "Article not found" };
  }
  const image = post.image || seriesMeta(post.series).poster;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}/news/${slug}`,
      siteName: SITE.name,
      publishedTime: post.publishedAt,
      authors: [post.author ?? "Rerace Team"],
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image" },
  };
}

const proseClasses = [
  "space-y-5 text-[15px] leading-relaxed text-zinc-300 sm:text-base",
  "[&_p]:leading-relaxed",
  "[&_a]:text-race-bright [&_a]:underline-offset-4 [&_a:hover]:underline",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white",
  "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white",
  "[&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-white",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-race [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-zinc-400",
  "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6",
  "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6",
  "[&_li]:leading-relaxed",
  "[&_img]:rounded-[var(--radius-card)]",
  "[&_hr]:border-white/10",
  "[&_code]:rounded-md [&_code]:bg-white/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm",
].join(" ");

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsPost(slug);
  if (!post || !post.isOriginal) notFound();

  const image = post.image || seriesMeta(post.series).poster;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: [image.startsWith("http") ? image : `${SITE.url}${image}`],
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author ?? "Rerace Team" },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/news/${slug}`,
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
            <SeriesTag series={post.series} />
            <ReraceBadge />
          </div>
          <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-zinc-400">
            By <span className="font-semibold text-zinc-200">{post.author ?? "Rerace Team"}</span>
            {" · "}
            <LocalTime iso={post.publishedAt} mode="datetime" />
          </p>
        </header>

        <div className="relative mt-8 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={post.title} className="aspect-video w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/30 to-transparent" />
        </div>

        <div className={`mt-10 ${proseClasses}`}>
          {post.body ? (
            <RichText data={post.body as ComponentProps<typeof RichText>["data"]} />
          ) : (
            post.excerpt && <p>{post.excerpt}</p>
          )}
        </div>
      </article>
    </div>
  );
}
