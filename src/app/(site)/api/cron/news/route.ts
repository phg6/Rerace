import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SeriesKey } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Feed {
  source: string;
  url: string;
  series: SeriesKey;
}

const FEEDS: Feed[] = [
  { source: "Motorsport.com", url: "https://www.motorsport.com/rss/all/news/", series: "general" },
  { source: "Autosport", url: "https://www.autosport.com/rss/feed/all", series: "general" },
  { source: "The Race", url: "https://www.the-race.com/feed/", series: "general" },
  { source: "RaceFans", url: "https://www.racefans.net/feed/", series: "f1" },
  { source: "Crash.net", url: "https://www.crash.net/rss/news", series: "general" },
  { source: "PlanetF1", url: "https://www.planetf1.com/feed", series: "f1" },
  { source: "RacingNews365", url: "https://racingnews365.com/feed/rss.xml", series: "f1" },
  { source: "BBC Sport F1", url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml", series: "f1" },
  { source: "Racer", url: "https://racer.com/feed/", series: "general" },
  { source: "Frontstretch", url: "https://frontstretch.com/feed/", series: "nascar" },
];

const MAX_ITEMS_PER_FEED = 40;

type CustomItem = {
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
  "content:encoded"?: string;
};

const parser: Parser<Record<string, unknown>, CustomItem> = new Parser({
  timeout: 15_000,
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["content:encoded", "content:encoded"],
    ],
  },
});

/** Refine the feed-level series hint using title keywords. */
function refineSeries(title: string, hint: SeriesKey): SeriesKey {
  const t = title.toLowerCase();
  if (/\bmotogp\b/.test(t)) return "motogp";
  if (/\bnascar\b/.test(t)) return "nascar";
  if (/\bindycar\b/.test(t)) return "indycar";
  if (/\bwrc\b|\brally\b/.test(t)) return "wrc";
  if (/\bformula 2\b|\bf2\b/.test(t)) return "f2";
  if (/\bformula 3\b|\bf3\b/.test(t)) return "f3";
  if (/\bwec\b|\ble mans\b|\bendurance\b/.test(t)) return "wec";
  if (/\bformula 1\b|\bf1\b|\bgrand prix\b/.test(t)) return "f1";
  return hint;
}

function extractImage(item: Parser.Item & CustomItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  const media = item["media:content"]?.$?.url;
  if (media) return media;
  const thumb = item["media:thumbnail"]?.$?.url;
  if (thumb) return thumb;
  const html = item["content:encoded"] ?? item.content ?? "";
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return match ? match[1] : null;
}

function truncate(text: string | undefined, max = 280): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const errors: string[] = [];
    let fetched = 0;
    let inserted = 0;

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items ?? []).slice(0, MAX_ITEMS_PER_FEED);

        const rows = items
          .filter((item) => item.title && item.link)
          .map((item) => {
            const publishedAt = item.isoDate ?? item.pubDate;
            return {
              source: feed.source,
              source_url: feed.url,
              title: item.title!.trim(),
              url: item.link!.trim(),
              image_url: extractImage(item),
              summary: truncate(item.contentSnippet),
              series: refineSeries(item.title!, feed.series),
              published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
            };
          });

        fetched += rows.length;
        if (rows.length === 0) continue;

        const { data, error } = await supabase
          .from("news_items")
          .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
          .select("id");
        if (error) {
          errors.push(`${feed.source}: ${error.message}`);
        } else {
          inserted += data?.length ?? 0;
        }
      } catch (err) {
        errors.push(`${feed.source}: ${err instanceof Error ? err.message : "fetch failed"}`);
      }
    }

    return NextResponse.json({ ok: true, feeds: FEEDS.length, fetched, inserted, errors });
  } catch (err) {
    console.error("[cron/news] run failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
