import type { Metadata } from "next";
import { getEvents } from "@/lib/data/content";
import { sessionStatus } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { SectionLabel } from "@/components/SectionLabel";
import { TimezoneNote } from "@/components/LocalTime";
import { ScheduleList, type ScheduleItem } from "@/components/schedule/ScheduleList";

export const revalidate = 60;

const description =
  "The unified motorsport schedule — every upcoming F1, F2, F3, MotoGP, NASCAR, IndyCar, WEC, WRC and Porsche Supercup session, shown in your timezone with live status and reminders.";

export const metadata: Metadata = {
  title: "Race Schedule",
  description,
  alternates: { canonical: "/schedule" },
  openGraph: {
    type: "website",
    title: `Race Schedule — ${SITE.name}`,
    description,
    url: `${SITE.url}/schedule`,
  },
  twitter: { card: "summary_large_image" },
};

export default async function SchedulePage() {
  const events = await getEvents();

  const items: ScheduleItem[] = events
    .flatMap((e) =>
      e.sessions
        .filter((s) => sessionStatus(s) !== "finished")
        .map((s) => ({
          eventId: e.id,
          eventTitle: e.title,
          series: e.series,
          circuit: e.circuit,
          country: e.country,
          image: e.image,
          sessionKey: s.key,
          sessionName: s.name,
          startsAt: s.startsAt,
          endsAt: s.endsAt,
        }))
    )
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming motorsport sessions",
    itemListElement: items.slice(0, 30).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsEvent",
        name: `${item.eventTitle} — ${item.sessionName}`,
        startDate: item.startsAt,
        ...(item.endsAt ? { endDate: item.endsAt } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: `${item.circuit}, ${item.country}` },
        url: `${SITE.url}/watch/${item.eventId}`,
        organizer: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
    })),
  };

  return (
    <div className="container-site space-y-8 pb-20 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header>
        <SectionLabel className="mb-2">Calendar</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Race schedule</h1>
        <p className="mt-2 text-sm text-zinc-400">
          <TimezoneNote />
        </p>
      </header>

      <ScheduleList items={items} />
    </div>
  );
}
