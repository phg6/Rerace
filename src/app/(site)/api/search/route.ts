import { NextResponse } from "next/server";
import { getEvents, getReplays, getMedia, getNews, getDrivers, getTeams } from "@/lib/data/content";
import { seriesMeta } from "@/lib/series";

export const dynamic = "force-dynamic";

interface Hit {
  type: "event" | "replay" | "media" | "news" | "driver" | "page";
  title: string;
  subtitle?: string;
  href: string;
  score: number;
}

const staticPages = [
  { title: "Schedule", href: "/schedule" },
  { title: "Standings", href: "/standings" },
  { title: "Results", href: "/results" },
  { title: "Daily poll", href: "/polls" },
  { title: "Predictions", href: "/predictions" },
  { title: "Contact", href: "/contact" },
  { title: "Status", href: "/status" },
];

function match(q: string, ...fields: (string | undefined)[]): number {
  let score = 0;
  for (const f of fields) {
    if (!f) continue;
    const v = f.toLowerCase();
    if (v === q) score += 100;
    else if (v.startsWith(q)) score += 40;
    else if (v.includes(q)) score += 20;
  }
  return score;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const [events, replays, media, news, drivers, teams] = await Promise.all([
    getEvents(),
    getReplays(),
    getMedia(),
    getNews(40),
    getDrivers(),
    getTeams(),
  ]);

  const hits: Hit[] = [];

  for (const e of events) {
    const s = match(q, e.title, e.circuit, e.country, seriesMeta(e.series).name);
    if (s > 0) hits.push({ type: "event", title: e.title, subtitle: `${e.circuit} · ${seriesMeta(e.series).shortName}`, href: `/watch/${e.id}`, score: s + 10 });
  }
  for (const r of replays) {
    const s = match(q, r.title, r.eventName, r.session);
    if (s > 0) hits.push({ type: "replay", title: r.title, subtitle: `Replay · ${r.season}`, href: `/replays/${r.id}`, score: s });
  }
  for (const m of media) {
    const s = match(q, m.title, m.description, m.source);
    if (s > 0) hits.push({ type: "media", title: m.title, subtitle: m.kind, href: `/${m.kind === "documentary" ? "documentaries" : m.kind === "movie" ? "movies" : "videos"}/${m.id}`, score: s });
  }
  for (const n of news) {
    const s = match(q, n.title, n.excerpt);
    if (s > 0) hits.push({ type: "news", title: n.title, subtitle: `News · ${n.source}`, href: n.url, score: s });
  }
  for (const d of drivers) {
    const s = match(q, d.name, d.team);
    if (s > 0) hits.push({ type: "driver", title: d.name, subtitle: d.team, href: `/drivers/${d.slug}`, score: s });
  }
  for (const t of teams) {
    const s = match(q, t.name);
    if (s > 0) hits.push({ type: "driver", title: t.name, subtitle: "Team", href: `/teams/${t.slug}`, score: s });
  }
  for (const p of staticPages) {
    const s = match(q, p.title);
    if (s > 0) hits.push({ type: "page", title: p.title, href: p.href, score: s });
  }

  hits.sort((a, b) => b.score - a.score);
  return NextResponse.json({
    hits: hits.slice(0, 12).map((h) => ({ type: h.type, title: h.title, subtitle: h.subtitle, href: h.href })),
  });
}
