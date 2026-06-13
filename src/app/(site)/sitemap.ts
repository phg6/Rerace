import type { MetadataRoute } from "next";
import { getEvents, getReplays, getMedia, getNews } from "@/lib/data/content";
import { SERIES_LIST } from "@/lib/series";
import { SITE } from "@/lib/site";
import type { MediaKind } from "@/lib/types";

const MEDIA_PATH: Record<MediaKind, string> = {
  documentary: "documentaries",
  movie: "movies",
  video: "videos",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, replays, media, news] = await Promise.all([
    getEvents({ all: true }),
    getReplays(),
    getMedia(),
    getNews(200),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE.url}/live`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE.url}/replays`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/videos`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/documentaries`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/movies`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/news`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE.url}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/standings`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/status`, lastModified: now, changeFrequency: "always", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const seriesRoutes: MetadataRoute.Sitemap = SERIES_LIST.map((s) => ({
    url: `${SITE.url}/series/${s.key}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE.url}/watch/${e.id}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const replayRoutes: MetadataRoute.Sitemap = replays.map((r) => ({
    url: `${SITE.url}/replays/${r.id}`,
    lastModified: new Date(r.airedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const mediaRoutes: MetadataRoute.Sitemap = media.map((m) => ({
    url: `${SITE.url}/${MEDIA_PATH[m.kind]}/${m.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news
    .filter((n) => n.isOriginal && n.slug)
    .map((n) => ({
      url: `${SITE.url}/news/${n.slug}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...seriesRoutes, ...eventRoutes, ...replayRoutes, ...mediaRoutes, ...newsRoutes];
}
