import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/content";
import { eventStart } from "@/lib/utils";
import { seriesMeta } from "@/lib/series";
import { SITE } from "@/lib/site";
import type { RaceEvent } from "@/lib/types";
import { WatchView, SessionsList } from "@/components/watch/WatchView";
import { SectionLabel } from "@/components/SectionLabel";
import { TimezoneNote } from "@/components/LocalTime";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 30;

type Params = { params: Promise<{ eventId: string }> };

const DEFAULT_SESSION_MS = 3 * 60 * 60 * 1000;

function metaDescription(event: RaceEvent): string {
  return (
    event.description ??
    `Watch ${event.title} live and free on ${SITE.name} — ${event.circuit}, ${event.country}. Streams in multiple languages, live chat and session schedule in your timezone.`
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) return { title: "Event not found" };
  const description = metaDescription(event);
  return {
    title: `Watch ${event.title}`,
    description,
    alternates: { canonical: `/watch/${event.id}` },
    openGraph: {
      title: `Watch ${event.title} — ${SITE.name}`,
      description,
      url: `${SITE.url}/watch/${event.id}`,
      type: "video.other",
      siteName: SITE.name,
      images: [{ url: event.image || seriesMeta(event.series).poster }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Watch ${event.title} — ${SITE.name}`,
      description,
    },
  };
}

export default async function WatchPage({ params }: Params) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) notFound();

  const hasSessions = event.sessions.length > 0;
  const startDate = hasSessions ? new Date(eventStart(event)).toISOString() : undefined;
  const endDate = hasSessions
    ? new Date(
        Math.max(
          ...event.sessions.map((s) =>
            s.endsAt ? Date.parse(s.endsAt) : Date.parse(s.startsAt) + DEFAULT_SESSION_MS
          )
        )
      ).toISOString()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BroadcastEvent",
    name: `${event.title} — Live on ${SITE.name}`,
    description: metaDescription(event),
    isLiveBroadcast: true,
    videoFormat: "HD",
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    publishedOn: {
      "@type": "BroadcastService",
      name: SITE.name,
      url: SITE.url,
    },
    broadcastOfEvent: {
      "@type": "SportsEvent",
      name: event.title,
      sport: "Motorsport",
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      location: {
        "@type": "Place",
        name: event.circuit,
        address: { "@type": "PostalAddress", addressCountry: event.country },
      },
    },
  };

  return (
    <div className="container-site space-y-10 pb-16 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Theater-first player, selector, collapsible chat and mobile tabs. */}
      <WatchView event={event} />

      {/* Sessions + description are inside the mobile Info tab; on desktop they live here. */}
      <section className="hidden lg:block">
        <SectionLabel className="mb-4">Weekend Sessions</SectionLabel>
        <SessionsList event={event} />
        <p className="mt-3 text-xs text-zinc-500">
          <TimezoneNote />
        </p>
      </section>

      {event.description && (
        <section className="hidden lg:block">
          <SectionLabel className="mb-3">About This Event</SectionLabel>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-300">{event.description}</p>
        </section>
      )}

      <AdSlot slotKey="watch-below" />
    </div>
  );
}
