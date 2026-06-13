import { getEvents } from "@/lib/data/content";
import { SITE } from "@/lib/site";
import type { EventSession, RaceEvent } from "@/lib/types";
import { sessionStatus } from "@/lib/utils";

const DEFAULT_SESSION_MS = 3 * 60 * 60 * 1000;

/** ISO timestamp → iCalendar UTC basic format, e.g. 20260611T140000Z. */
function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape iCalendar TEXT values (RFC 5545 §3.3.11). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function vevent(event: RaceEvent, session: EventSession, dtstamp: string): string[] {
  const start = Date.parse(session.startsAt);
  const endIso = session.endsAt ?? new Date(start + DEFAULT_SESSION_MS).toISOString();
  const watchUrl = `${SITE.url}/watch/${event.id}`;
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}-${session.key}@rerace.net`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${icsDate(session.startsAt)}`,
    `DTEND:${icsDate(endIso)}`,
    `SUMMARY:${escapeText(`${event.title} — ${session.name}`)}`,
    `DESCRIPTION:${escapeText(`Watch live on ${SITE.name}: ${watchUrl}`)}`,
    `LOCATION:${escapeText(`${event.circuit}, ${event.country}`)}`,
    `URL:${watchUrl}`,
    "END:VEVENT",
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event");
  const sessionKey = searchParams.get("session");

  const events = await getEvents({ all: true });
  const dtstamp = icsDate(new Date().toISOString());

  let eventLines: string[];
  if (eventId && sessionKey) {
    // Single session export
    const event = events.find((e) => e.id === eventId);
    const session = event?.sessions.find((s) => s.key === sessionKey);
    if (!event || !session) {
      return new Response("Event or session not found", { status: 404 });
    }
    eventLines = vevent(event, session, dtstamp);
  } else {
    // Full calendar of all upcoming (not finished) sessions
    eventLines = events.flatMap((event) =>
      event.sessions
        .filter((session) => sessionStatus(session) !== "finished")
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .flatMap((session) => vevent(event, session, dtstamp))
    );
  }

  const body =
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Rerace//Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeText(`${SITE.name} — Race schedule`)}`,
      ...eventLines,
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n";

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="rerace.ics"',
    },
  });
}
