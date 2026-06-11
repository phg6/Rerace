import type { EventSession, RaceEvent, EventStatus } from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const LIVE_GRACE_MS = 30 * 60 * 1000; // sessions without endsAt count as live for 3h
const DEFAULT_SESSION_MS = 3 * 60 * 60 * 1000;

export function sessionStatus(s: EventSession, now = Date.now()): EventStatus {
  const start = Date.parse(s.startsAt);
  const end = s.endsAt ? Date.parse(s.endsAt) : start + DEFAULT_SESSION_MS;
  if (now < start - LIVE_GRACE_MS) return "upcoming";
  if (now >= start - LIVE_GRACE_MS && now < end) return now >= start ? "live" : "upcoming";
  return "finished";
}

export function eventStatus(e: RaceEvent, now = Date.now()): EventStatus {
  if (e.sessions.some((s) => sessionStatus(s, now) === "live")) return "live";
  if (e.sessions.some((s) => sessionStatus(s, now) === "upcoming")) return "upcoming";
  return "finished";
}

export function nextSession(e: RaceEvent, now = Date.now()): EventSession | undefined {
  return [...e.sessions]
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .find((s) => sessionStatus(s, now) !== "finished");
}

export function eventStart(e: RaceEvent): number {
  return Math.min(...e.sessions.map((s) => Date.parse(s.startsAt)));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDuration(min?: number): string | undefined {
  if (!min) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}
