import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { SERIES } from "@/lib/series";
import type { SeriesKey } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Channel {
  /** YouTube channel id (UC…) */
  id: string;
  series: SeriesKey;
}

/**
 * Verified official channels (IDs resolved from each handle and confirmed against the
 * youtube.com/feeds/videos.xml?channel_id=… RSS title on 2026-06-13). The VIDEO_CHANNELS
 * env var (JSON: [{"id":"UC…","series":"f1"}]) extends this list without a deploy.
 */
const CHANNELS: Channel[] = [
  { id: "UCB_qr75-ydFVKSF9Dmo6izg", series: "f1" }, // FORMULA 1
  { id: "UC8pYaQzbBBXg9GIOHRvTmDQ", series: "motogp" }, // MotoGP
  { id: "UCuN9hYw2RpoAW8rZ3VK3isA", series: "nascar" }, // NASCAR
  { id: "UCy1F61QvUUQXAXi2Voa_fUw", series: "indycar" }, // NTT INDYCAR SERIES
  { id: "UCwU7U7PiarcJKLjDJTnANjw", series: "wec" }, // FIA World Endurance Championship
  { id: "UC5G6kTnHXDz0WIBC2VGBOqg", series: "wrc" }, // FIA World Rally Championship
];

const MAX_ITEMS_PER_CHANNEL = 15;

type YtItem = {
  "yt:videoId"?: string;
  "media:group"?: {
    "media:thumbnail"?: Array<{ $?: { url?: string } }>;
  };
};

const parser: Parser<Record<string, unknown>, YtItem> = new Parser({
  timeout: 15_000,
  customFields: {
    item: [
      ["yt:videoId", "yt:videoId"],
      ["media:group", "media:group"],
    ],
  },
});

function isShort(title: string, url: string): boolean {
  return /#shorts\b/i.test(title) || /\/shorts\//i.test(url);
}

function envChannels(): Channel[] {
  const raw = process.env.VIDEO_CHANNELS;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Channel =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as Channel).id === "string" &&
        typeof (c as Channel).series === "string" &&
        (c as Channel).series in SERIES
    );
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const channels = [
      ...CHANNELS,
      ...envChannels().filter((c) => !CHANNELS.some((k) => k.id === c.id)),
    ];
    const errors: string[] = [];
    let fetched = 0;
    let inserted = 0;

    for (const channel of channels) {
      try {
        const feed = await parser.parseURL(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`
        );
        const channelName = feed.title?.trim() || "YouTube";

        const rows = (feed.items ?? [])
          .slice(0, MAX_ITEMS_PER_CHANNEL)
          .filter((item) => item.title && item["yt:videoId"])
          .map((item) => {
            const videoId = item["yt:videoId"]!;
            const url = item.link?.trim() || `https://www.youtube.com/watch?v=${videoId}`;
            const publishedAt = item.isoDate ?? item.pubDate;
            return {
              source: "YouTube",
              channel: channelName,
              title: item.title!.trim(),
              url,
              video_id: videoId,
              image_url:
                item["media:group"]?.["media:thumbnail"]?.[0]?.$?.url ??
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              series: channel.series,
              published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
            };
          })
          .filter((row) => !isShort(row.title, row.url));

        fetched += rows.length;
        if (rows.length === 0) continue;

        const { data, error } = await supabase
          .from("video_items")
          .upsert(rows, { onConflict: "url", ignoreDuplicates: true })
          .select("id");
        if (error) {
          errors.push(`${channel.id}: ${error.message}`);
        } else {
          inserted += data?.length ?? 0;
        }
      } catch (err) {
        errors.push(`${channel.id}: ${err instanceof Error ? err.message : "fetch failed"}`);
      }
    }

    return NextResponse.json({ ok: true, channels: channels.length, fetched, inserted, errors });
  } catch (err) {
    console.error("[cron/videos] run failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
