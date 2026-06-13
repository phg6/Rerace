import type { Metadata } from "next";
import { History } from "lucide-react";
import { getActivePoll, getPastPolls } from "@/lib/data/content";
import { SITE } from "@/lib/site";
import { SectionLabel, SectionHeading } from "@/components/SectionLabel";
import { TiltCard } from "@/components/TiltCard";
import { LocalTime } from "@/components/LocalTime";
import { PollWidget } from "@/components/PollWidget";
import { EmptyState } from "@/components/EmptyState";

export const revalidate = 300;

const description =
  "Vote in today's Rerace poll and see what the community thinks. A fresh motorsport question drops every 24 hours.";

export const metadata: Metadata = {
  title: "Daily Poll",
  description,
  alternates: { canonical: "/polls" },
  openGraph: {
    type: "website",
    title: `Daily Poll — ${SITE.name}`,
    description,
    url: `${SITE.url}/polls`,
  },
  twitter: { card: "summary_large_image" },
};

export default async function PollsPage() {
  const [poll, pastPolls] = await Promise.all([getActivePoll(), getPastPolls()]);

  return (
    <div className="container-site space-y-12 pb-20 pt-10">
      <header>
        <SectionLabel className="mb-2">Community</SectionLabel>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Daily poll</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          One question, the whole paddock&apos;s opinion — a new poll drops every 24 hours. Vote to see live
          results.
        </p>
      </header>

      {/* ============ TODAY'S POLL ============ */}
      <section className="max-w-2xl">
        {poll ? (
          <>
            <PollWidget poll={poll} />
            <p className="mt-3 text-xs text-zinc-500">
              Closes <LocalTime iso={poll.endsAt} mode="relative" className="text-zinc-400" />
            </p>
          </>
        ) : (
          <EmptyState
            title="No poll on the grid right now"
            message="The next question drops within 24 hours — check back soon."
            ctaHref="/news"
            ctaLabel="Read the news"
          />
        )}
      </section>

      {/* ============ PREVIOUS POLLS ============ */}
      <section className="max-w-3xl">
        <SectionHeading label="Archive" title="Previous polls" />
        {pastPolls.length === 0 ? (
          <EmptyState
            title="No past polls yet"
            message="The archive fills up as new questions roll through every day."
            ctaHref="/news"
            ctaLabel="Read the news"
          />
        ) : (
          <ul className="space-y-3">
            {pastPolls.map((p) => (
              <li key={p.id}>
                <TiltCard maxTilt={4} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <History className="h-4 w-4 shrink-0 text-zinc-500" />
                    <p className="min-w-0 text-sm font-semibold text-white">{p.question}</p>
                  </div>
                  <p className="shrink-0 text-xs text-zinc-500">
                    <LocalTime iso={p.startsAt} mode="date" /> — <LocalTime iso={p.endsAt} mode="date" />
                  </p>
                </TiltCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
