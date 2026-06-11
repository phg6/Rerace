export type SeriesKey =
  | "f1"
  | "f2"
  | "f3"
  | "motogp"
  | "nascar"
  | "indycar"
  | "wec"
  | "wrc"
  | "supercup"
  | "general";

export interface StreamSource {
  id: string;
  label: string;
  language: string; // e.g. "English", "Dutch"
  source: string; // provider name shown to users
  url: string; // iframe embed URL or HLS manifest
  kind: "iframe" | "hls";
}

export interface EventSession {
  key: string; // e.g. "fp1", "quali", "race"
  name: string; // e.g. "Qualifying"
  startsAt: string; // ISO
  endsAt?: string;
}

export interface RaceEvent {
  id: string; // public event id used in URLs, e.g. "f1-canada-2026"
  title: string;
  series: SeriesKey;
  circuit: string;
  country: string;
  image?: string;
  sessions: EventSession[];
  streams: StreamSource[];
  featured?: boolean;
  description?: string;
}

export type EventStatus = "live" | "upcoming" | "finished";

export interface ReplayItem {
  id: string;
  title: string;
  series: "f1";
  season: number;
  round: number;
  eventName: string;
  session: string; // "FP1" | "FP2" | "FP3" | "Sprint" | "Qualifying" | "Race" ...
  url: string;
  kind: "iframe" | "hls";
  image?: string;
  durationMin?: number;
  airedAt: string;
}

export type MediaKind = "documentary" | "movie" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  description?: string;
  series: SeriesKey;
  year?: number;
  image?: string;
  url: string;
  embedKind: "iframe" | "hls";
  source?: string; // origin site for crawled videos
  durationMin?: number;
  /** movies (and replays) require a signed-in, verified account */
  requiresAccount?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string; // external URL for crawled, internal /news/[slug] for originals
  slug?: string;
  source: string; // "Rerace" for originals
  isOriginal: boolean;
  image?: string;
  excerpt?: string;
  series: SeriesKey;
  publishedAt: string;
  body?: unknown; // richtext for originals
  author?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  startsAt: string;
  endsAt: string;
}

export interface StandingRow {
  position: number;
  name: string;
  team?: string;
  nationality?: string;
  points: number;
  wins?: number;
  image?: string;
  teamColor?: string;
  positionChange?: number;
}

export interface StandingsTable {
  series: SeriesKey;
  kind: "drivers" | "constructors" | "teams" | "riders" | "manufacturers";
  season: number;
  rows: StandingRow[];
  updatedAt: string;
}

export interface Driver {
  id: string;
  slug: string;
  name: string;
  series: SeriesKey;
  team?: string;
  number?: number;
  country?: string;
  image?: string;
  bio?: string;
  stats?: { label: string; value: string }[];
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  series: SeriesKey;
  color?: string;
  base?: string;
  image?: string;
  bio?: string;
}

export interface ResultRow {
  position: number | string;
  driver: string;
  team?: string;
  time?: string;
  points?: number;
}

export interface SessionResult {
  series: SeriesKey;
  season: number;
  eventKey: string;
  eventName: string;
  sessionKey: string;
  sessionName: string;
  rows: ResultRow[];
  completedAt?: string;
}

export interface AdSlotContent {
  key: string;
  label?: string;
  mode: "code" | "banner";
  code?: string; // raw embed snippet (HilltopAds / AdMaven / partner)
  image?: string;
  link?: string;
  active: boolean;
}

export interface StatusIncident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  body?: string;
  startedAt: string;
  resolvedAt?: string;
}
