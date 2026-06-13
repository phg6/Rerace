import { NextResponse } from "next/server";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SeriesKey } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

/* ----------------------- Full-article enrichment ---------------------- */

const ENRICH_LIMIT = 25;
const ENRICH_CONCURRENCY = 5;
const ARTICLE_TIMEOUT_MS = 10_000;
/** Stop starting new article fetches after this much wall time. */
const RUN_DEADLINE_MS = 42_000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_CONTENT_CHARS = 100_000;
const MIN_CONTENT_CHARS = 300;

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** Known per-domain article body selectors (tried first). */
const DOMAIN_SELECTORS: Record<string, string[]> = {
  "motorsport.com": [".ms-article-content", ".article-content"],
  "autosport.com": [".ms-article-content", ".article-content"],
  "the-race.com": [".article__content", ".entry-content"],
  "racefans.net": [".entry-content"],
  "crash.net": [".c-article__body", ".article-body", ".field--name-body"],
  "planetf1.com": [".article-content", ".entry-content"],
  "racingnews365.com": [".article__body", ".article-content"],
  "bbc.co.uk": ["article"],
  "bbc.com": ["article"],
  "racer.com": [".entry-content"],
  "frontstretch.com": [".entry-content"],
};

const GENERIC_SELECTORS = [
  "[itemprop='articleBody']",
  "article",
  ".entry-content",
  ".article-content",
  ".article__content",
  ".article-body",
  ".post-content",
  ".story-body",
];

/** Tags kept as-is (attribute-stripped). Everything else is dropped or unwrapped. */
const KEEP_TAGS = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "em"]);
const DROP_TAGS = new Set([
  "script", "style", "iframe", "form", "noscript", "svg", "button", "input", "select",
  "textarea", "video", "audio", "source", "track", "object", "embed", "canvas", "template",
  "nav", "aside", "footer", "header", "figcaption", "dialog", "amp-ad",
]);
const HEADING_MAP: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4", b: "strong", i: "em" };
const JUNK_CLASS_RE =
  /(^|[\s_-])(share|sharing|social|related|newsletter|subscribe|signup|advert|ad-slot|adunit|promo|sponsor|comments?|breadcrumb|taglist|author-box|read-more|recommend|paywall|cookie|consent|widget|sidebar|outbrain|taboola)([\s_-]|$)/i;
const BOILERPLATE_HEADING_RE =
  /^(related( topics| articles| stories| news)?|more on this story|read (more|next)|you may also like|recommended( for you)?|latest news)$/i;

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

/* ------------------------------ Sanitizer ------------------------------ */

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function absoluteHttpUrl(raw: string | undefined, base: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim(), base);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

function imgSrc(el: Element, base: string): string | null {
  const attrs = el.attribs ?? {};
  if (attrs.width === "1" || attrs.height === "1") return null; // tracking pixel
  const candidate =
    attrs.src && !attrs.src.startsWith("data:")
      ? attrs.src
      : attrs["data-src"] ?? attrs["data-lazy-src"] ?? attrs["data-original"] ?? attrs.srcset?.split(",")[0]?.trim().split(/\s+/)[0];
  return absoluteHttpUrl(candidate, base);
}

function sanitizeChildren($: cheerio.CheerioAPI, nodes: AnyNode[], base: string): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") {
      out += escapeHtml($(node).text());
      continue;
    }
    if (node.type !== "tag") continue;
    const el = node as Element;
    const tag = HEADING_MAP[el.tagName?.toLowerCase()] ?? el.tagName?.toLowerCase();
    if (!tag || DROP_TAGS.has(tag)) continue;
    const cls = `${el.attribs?.class ?? ""} ${el.attribs?.id ?? ""}`;
    if (JUNK_CLASS_RE.test(cls)) continue;

    if (tag === "img") {
      const src = imgSrc(el, base);
      if (src) out += `<img src="${escapeHtml(src)}" alt="${escapeHtml(el.attribs?.alt ?? "")}"/>`;
      continue;
    }
    if (tag === "br") {
      out += "<br/>";
      continue;
    }
    const inner = sanitizeChildren($, el.children as AnyNode[], base);
    if (tag === "a") {
      const href = absoluteHttpUrl(el.attribs?.href, base);
      out += href ? `<a href="${escapeHtml(href)}" rel="noopener nofollow" target="_blank">${inner}</a>` : inner;
      continue;
    }
    if (KEEP_TAGS.has(tag)) {
      out += `<${tag}>${inner}</${tag}>`;
      continue;
    }
    out += inner; // unwrap div/span/section/figure/picture/table/…
  }
  return out;
}

/** Collapse empty blocks and cap total size at top-level block boundaries. */
function tidy(html: string): string | null {
  const $ = cheerio.load(`<div id="__root">${html}</div>`, undefined, false);
  const root = $("#__root");
  for (let pass = 0; pass < 3; pass++) {
    root.find("p, li, blockquote, h2, h3, h4, ul, ol, em, strong, a").each((_, el) => {
      const $el = $(el);
      if ($el.find("img").length === 0 && $el.text().trim() === "") $el.remove();
    });
  }
  // Drop trailing "Related topics" / "More on this story" style boilerplate.
  root.children("h2, h3, h4").each((_, el) => {
    const $el = $(el);
    if (BOILERPLATE_HEADING_RE.test($el.text().trim())) {
      $el.nextAll().remove();
      $el.remove();
    }
  });
  let out = "";
  for (const child of root.children().toArray()) {
    const chunk = $.html(child);
    if (out.length + chunk.length > MAX_CONTENT_CHARS) break;
    out += chunk;
  }
  out = out.trim();
  if (out.length < MIN_CONTENT_CHARS || $(`<div>${out}</div>`).text().trim().length < MIN_CONTENT_CHARS / 2) return null;
  return out;
}

function pickContainer($: cheerio.CheerioAPI, articleUrl: string): Element | null {
  let host = "";
  try {
    host = new URL(articleUrl).hostname.replace(/^www\./, "");
  } catch {
    /* keep generic */
  }
  const domainKey = Object.keys(DOMAIN_SELECTORS).find((d) => host === d || host.endsWith(`.${d}`));
  const selectors = [...(domainKey ? DOMAIN_SELECTORS[domainKey] : []), ...GENERIC_SELECTORS];
  for (const sel of selectors) {
    const found = $(sel).first();
    const el = found.get(0);
    if (el && el.type === "tag" && found.text().trim().length >= MIN_CONTENT_CHARS) return el as Element;
  }
  // Largest cluster of <p> under one parent.
  const counts = new Map<Element, { n: number; chars: number }>();
  $("p").each((_, p) => {
    const parent = p.parent;
    if (!parent || parent.type !== "tag") return;
    const entry = counts.get(parent as Element) ?? { n: 0, chars: 0 };
    entry.n += 1;
    entry.chars += $(p).text().length;
    counts.set(parent as Element, entry);
  });
  let best: Element | null = null;
  let bestScore = 0;
  for (const [el, { n, chars }] of counts) {
    const score = n * 100 + chars;
    if (n >= 3 && chars >= MIN_CONTENT_CHARS && score > bestScore) {
      best = el;
      bestScore = score;
    }
  }
  return best;
}

function extractAuthor($: cheerio.CheerioAPI): string | null {
  const candidates = [
    $("meta[name='author']").attr("content"),
    $("meta[property='article:author']").attr("content"),
    $("meta[name='parsely-author']").attr("content"),
    $("[itemprop='author'] [itemprop='name']").first().text(),
    $("[itemprop='author']").first().text(),
    $("[rel='author']").first().text(),
    $("[class*='byline'] a").first().text(),
    $("[class*='author-name']").first().text(),
  ];
  for (const raw of candidates) {
    const v = raw?.replace(/\s+/g, " ").trim().replace(/^by[:\s]+/i, "").trim();
    if (v && v.length >= 3 && v.length <= 100 && !/^https?:/i.test(v) && !v.includes("<")) return v;
  }
  return null;
}

function extractOgImage($: cheerio.CheerioAPI, base: string): string | null {
  const raw =
    $("meta[property='og:image:secure_url']").attr("content") ||
    $("meta[property='og:image']").attr("content") ||
    $("meta[name='twitter:image']").attr("content");
  return absoluteHttpUrl(raw ?? undefined, base);
}

interface PendingItem {
  id: number;
  url: string;
  image_url: string | null;
}

interface EnrichResult {
  content_html: string | null;
  author: string | null;
  image_url: string | null;
}

async function fetchArticle(item: PendingItem): Promise<EnrichResult> {
  const res = await fetch(item.url, {
    headers: {
      "user-agent": DESKTOP_UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(ARTICLE_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = (await res.text()).slice(0, MAX_HTML_BYTES);
  const $ = cheerio.load(raw);
  const base = res.url || item.url;

  const ogImage = extractOgImage($, base);
  const author = extractAuthor($);
  const container = pickContainer($, base);
  const contentHtml = container ? tidy(sanitizeChildren($, container.children as AnyNode[], base)) : null;

  return {
    content_html: contentHtml,
    author,
    image_url: ogImage && (contentHtml || !item.image_url) ? ogImage : null,
  };
}

async function enrichArticles(
  supabase: ReturnType<typeof createAdminClient>,
  startedAt: number,
  errors: string[]
): Promise<{ attempted: number; succeeded: number; failed: number }> {
  const { data, error } = await supabase
    .from("news_items")
    .select("id, url, image_url")
    .is("content_html", null)
    .is("content_fetched_at", null)
    .order("published_at", { ascending: false })
    .limit(ENRICH_LIMIT);
  if (error) {
    errors.push(`enrich-query: ${error.message}`);
    return { attempted: 0, succeeded: 0, failed: 0 };
  }
  const pending = (data ?? []) as PendingItem[];
  let cursor = 0;
  let attempted = 0;
  let succeeded = 0;
  let failed = 0;

  async function worker() {
    while (cursor < pending.length && Date.now() - startedAt < RUN_DEADLINE_MS) {
      const item = pending[cursor++];
      attempted++;
      const update: Record<string, string | null> = { content_fetched_at: new Date().toISOString() };
      try {
        const result = await fetchArticle(item);
        if (result.content_html) update.content_html = result.content_html;
        if (result.author) update.author = result.author;
        if (result.image_url) update.image_url = result.image_url;
        if (result.content_html) succeeded++;
        else failed++;
      } catch {
        failed++; // leave content_html null; content_fetched_at stops hourly retries
      }
      const { error: upErr } = await supabase.from("news_items").update(update).eq("id", item.id);
      if (upErr) errors.push(`enrich-update ${item.id}: ${upErr.message}`);
    }
  }

  await Promise.all(Array.from({ length: ENRICH_CONCURRENCY }, () => worker()));
  return { attempted, succeeded, failed };
}

/* -------------------------------- Route -------------------------------- */

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  try {
    const supabase = createAdminClient();
    const errors: string[] = [];
    let fetched = 0;
    let inserted = 0;

    await Promise.all(
      FEEDS.map(async (feed) => {
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
          if (rows.length === 0) return;

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
      })
    );

    const enrichment = await enrichArticles(supabase, startedAt, errors);

    return NextResponse.json({
      ok: true,
      feeds: FEEDS.length,
      fetched,
      inserted,
      enrichment,
      ms: Date.now() - startedAt,
      errors,
    });
  } catch (err) {
    console.error("[cron/news] run failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
