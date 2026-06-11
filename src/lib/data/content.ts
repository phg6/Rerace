import "server-only";
import type {
  RaceEvent,
  ReplayItem,
  MediaItem,
  MediaKind,
  NewsArticle,
  Poll,
  Driver,
  Team,
  StandingsTable,
  SessionResult,
  AdSlotContent,
  StatusIncident,
  SeriesKey,
} from "../types";
import {
  seedEvents,
  seedReplays,
  seedMedia,
  seedNews,
  seedPoll,
  seedDrivers,
  seedTeams,
  seedStandings,
  seedResults,
} from "./seed";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/* Payload client (lazy). Falls back to seed data when not configured. */
/* ------------------------------------------------------------------ */

const cmsEnabled = () => Boolean(process.env.DATABASE_URI);

async function payloadClient() {
  const { getPayload } = await import("payload");
  const config = (await import("@/payload.config")).default;
  return getPayload({ config });
}

async function fromCms<T>(fn: (p: Awaited<ReturnType<typeof payloadClient>>) => Promise<T>): Promise<T | null> {
  if (!cmsEnabled()) return null;
  try {
    const p = await payloadClient();
    return await fn(p);
  } catch (err) {
    console.error("[cms] falling back to seed data:", err);
    return null;
  }
}

/** Anonymous Supabase client for public cached data (news, standings, results). */
function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ------------------------------- Events ------------------------------- */

function mapEvent(doc: any): RaceEvent {
  return {
    id: doc.eventId,
    title: doc.title,
    series: doc.series,
    circuit: doc.circuit ?? "",
    country: doc.country ?? "",
    image: doc.image || undefined,
    description: doc.description || undefined,
    featured: Boolean(doc.featured),
    sessions: (doc.sessions ?? []).map((s: any) => ({
      key: s.key,
      name: s.name,
      startsAt: s.startsAt,
      endsAt: s.endsAt || undefined,
    })),
    streams: (doc.streams ?? []).map((st: any, i: number) => ({
      id: st.id ?? `${doc.eventId}-s${i}`,
      label: st.label,
      language: st.language,
      source: st.source,
      url: st.url,
      kind: st.kind,
    })),
  };
}

export async function getEvents(): Promise<RaceEvent[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "events", limit: 200, sort: "-featured" });
    return res.docs.map(mapEvent);
  });
  return cms && cms.length > 0 ? cms : seedEvents;
}

export async function getEvent(eventId: string): Promise<RaceEvent | null> {
  const events = await getEvents();
  return events.find((e) => e.id === eventId) ?? null;
}

/* ------------------------------- Replays ------------------------------ */

function mapReplay(doc: any): ReplayItem {
  return {
    id: String(doc.id),
    title: doc.title,
    series: "f1",
    season: doc.season,
    round: doc.round,
    eventName: doc.eventName,
    session: doc.session,
    url: doc.url,
    kind: doc.kind,
    image: doc.image || undefined,
    durationMin: doc.durationMin || undefined,
    airedAt: doc.airedAt,
  };
}

export async function getReplays(): Promise<ReplayItem[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "replays", limit: 1000, sort: "-airedAt" });
    return res.docs.map(mapReplay);
  });
  const list = cms && cms.length > 0 ? cms : seedReplays;
  return [...list].sort((a, b) => Date.parse(b.airedAt) - Date.parse(a.airedAt));
}

export async function getReplay(id: string): Promise<ReplayItem | null> {
  const replays = await getReplays();
  return replays.find((r) => r.id === id) ?? null;
}

/* -------------------------------- Media ------------------------------- */

function mapMedia(doc: any): MediaItem {
  return {
    id: String(doc.id),
    kind: doc.kind,
    title: doc.title,
    description: doc.description || undefined,
    series: doc.series ?? "general",
    year: doc.year || undefined,
    image: doc.image || undefined,
    url: doc.url,
    embedKind: doc.embedKind,
    source: doc.source || undefined,
    durationMin: doc.durationMin || undefined,
    requiresAccount: Boolean(doc.requiresAccount),
  };
}

export async function getMedia(kind?: MediaKind): Promise<MediaItem[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({
      collection: "media-items",
      limit: 1000,
      ...(kind ? { where: { kind: { equals: kind } } } : {}),
    });
    return res.docs.map(mapMedia);
  });
  const list = cms && cms.length > 0 ? cms : seedMedia.filter((m) => !kind || m.kind === kind);
  return kind ? list.filter((m) => m.kind === kind) : list;
}

export async function getMediaItem(id: string): Promise<MediaItem | null> {
  const all = await getMedia();
  return all.find((m) => m.id === id) ?? null;
}

/* -------------------------------- News -------------------------------- */

function mapNewsPost(doc: any): NewsArticle {
  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    url: `/news/${doc.slug}`,
    source: "Rerace",
    isOriginal: true,
    image: doc.image || undefined,
    excerpt: doc.excerpt || undefined,
    series: doc.series ?? "general",
    publishedAt: doc.publishedAt,
    body: doc.body ?? undefined,
    author: doc.author || "Rerace Team",
  };
}

/** Rerace original posts (Payload) merged with crawled items (Supabase). */
export async function getNews(limit = 60): Promise<NewsArticle[]> {
  const [originals, crawled] = await Promise.all([
    fromCms(async (p) => {
      const res = await p.find({ collection: "news-posts", limit: 100, sort: "-publishedAt" });
      return res.docs.map(mapNewsPost);
    }),
    (async (): Promise<NewsArticle[] | null> => {
      const sb = publicSupabase();
      if (!sb) return null;
      const { data, error } = await sb
        .from("news_items")
        .select("id, source, title, url, image_url, summary, series, published_at")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (error || !data) return null;
      return data.map((d) => ({
        id: `crawled-${d.id}`,
        title: d.title,
        url: d.url,
        source: d.source,
        isOriginal: false,
        image: d.image_url ?? undefined,
        excerpt: d.summary ?? undefined,
        series: (d.series ?? "general") as SeriesKey,
        publishedAt: d.published_at,
      }));
    })(),
  ]);

  let merged = [...(originals ?? []), ...(crawled ?? [])];
  if (merged.length === 0) merged = seedNews;
  return merged
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}

export async function getNewsPost(slug: string): Promise<NewsArticle | null> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "news-posts", where: { slug: { equals: slug } }, limit: 1 });
    return res.docs[0] ? mapNewsPost(res.docs[0]) : null;
  });
  if (cms) return cms;
  return seedNews.find((n) => n.slug === slug) ?? null;
}

/* -------------------------------- Polls ------------------------------- */

export async function getActivePoll(): Promise<Poll | null> {
  const nowIso = new Date().toISOString();
  const cms = await fromCms(async (p) => {
    const res = await p.find({
      collection: "polls",
      where: { and: [{ startsAt: { less_than_equal: nowIso } }, { endsAt: { greater_than: nowIso } }] },
      sort: "-startsAt",
      limit: 1,
    });
    const doc: any = res.docs[0];
    if (!doc) return null;
    return {
      id: String(doc.id),
      question: doc.question,
      options: (doc.options ?? []).map((o: any) => o.label),
      startsAt: doc.startsAt,
      endsAt: doc.endsAt,
    } as Poll;
  });
  return cms ?? seedPoll;
}

export async function getPastPolls(limit = 30): Promise<Poll[]> {
  const nowIso = new Date().toISOString();
  const cms = await fromCms(async (p) => {
    const res = await p.find({
      collection: "polls",
      where: { endsAt: { less_than_equal: nowIso } },
      sort: "-endsAt",
      limit,
    });
    return res.docs.map((doc: any) => ({
      id: String(doc.id),
      question: doc.question,
      options: (doc.options ?? []).map((o: any) => o.label),
      startsAt: doc.startsAt,
      endsAt: doc.endsAt,
    })) as Poll[];
  });
  return cms ?? [];
}

/* --------------------------- Drivers & Teams -------------------------- */

export async function getDrivers(): Promise<Driver[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "drivers", limit: 500 });
    return res.docs.map((d: any) => ({
      id: String(d.id),
      slug: d.slug,
      name: d.name,
      series: d.series,
      team: d.team || undefined,
      number: d.number || undefined,
      country: d.country || undefined,
      image: d.image || undefined,
      bio: d.bio || undefined,
      stats: d.stats ?? undefined,
    })) as Driver[];
  });
  return cms && cms.length > 0 ? cms : seedDrivers;
}

export async function getDriver(slug: string): Promise<Driver | null> {
  const drivers = await getDrivers();
  return drivers.find((d) => d.slug === slug) ?? null;
}

export async function getTeams(): Promise<Team[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "teams", limit: 200 });
    return res.docs.map((t: any) => ({
      id: String(t.id),
      slug: t.slug,
      name: t.name,
      series: t.series,
      color: t.color || undefined,
      base: t.base || undefined,
      image: t.image || undefined,
      bio: t.bio || undefined,
    })) as Team[];
  });
  return cms && cms.length > 0 ? cms : seedTeams;
}

export async function getTeam(slug: string): Promise<Team | null> {
  const teams = await getTeams();
  return teams.find((t) => t.slug === slug) ?? null;
}

/* --------------------------- Standings & Results ---------------------- */

export async function getStandings(series?: SeriesKey): Promise<StandingsTable[]> {
  const sb = publicSupabase();
  if (sb) {
    let q = sb.from("standings_cache").select("series, kind, season, data, updated_at");
    if (series) q = q.eq("series", series);
    const { data, error } = await q.order("season", { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        series: d.series as SeriesKey,
        kind: d.kind,
        season: d.season,
        rows: d.data as StandingsTable["rows"],
        updatedAt: d.updated_at,
      }));
    }
  }
  return series ? seedStandings.filter((s) => s.series === series) : seedStandings;
}

export async function getResults(series?: SeriesKey): Promise<SessionResult[]> {
  const sb = publicSupabase();
  if (sb) {
    let q = sb.from("results_cache").select("series, season, event_key, session_key, session_name, data, completed_at");
    if (series) q = q.eq("series", series);
    const { data, error } = await q.order("completed_at", { ascending: false }).limit(100);
    if (!error && data && data.length > 0) {
      return data.map((d) => {
        const payload = d.data as { eventName?: string; rows?: SessionResult["rows"] };
        return {
          series: d.series as SeriesKey,
          season: d.season,
          eventKey: d.event_key,
          eventName: payload.eventName ?? d.event_key,
          sessionKey: d.session_key,
          sessionName: d.session_name,
          rows: payload.rows ?? [],
          completedAt: d.completed_at ?? undefined,
        };
      });
    }
  }
  return series ? seedResults.filter((r) => r.series === series) : seedResults;
}

/* ------------------------------- Ad slots ----------------------------- */

export async function getAdSlot(key: string): Promise<AdSlotContent | null> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({
      collection: "ad-slots",
      where: { and: [{ key: { equals: key } }, { active: { equals: true } }] },
      limit: 1,
    });
    const doc: any = res.docs[0];
    if (!doc) return null;
    return {
      key: doc.key,
      label: doc.label || undefined,
      mode: doc.mode,
      code: doc.code || undefined,
      image: doc.image || undefined,
      link: doc.link || undefined,
      active: true,
    } as AdSlotContent;
  });
  return cms;
}

/* ------------------------------- Incidents ---------------------------- */

export async function getIncidents(limit = 20): Promise<StatusIncident[]> {
  const cms = await fromCms(async (p) => {
    const res = await p.find({ collection: "incidents", limit, sort: "-startedAt" });
    return res.docs.map((d: any) => ({
      id: String(d.id),
      title: d.title,
      status: d.status,
      severity: d.severity,
      body: d.body || undefined,
      startedAt: d.startedAt,
      resolvedAt: d.resolvedAt || undefined,
    })) as StatusIncident[];
  });
  return cms ?? [];
}
